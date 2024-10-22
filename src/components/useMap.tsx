import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { useCallback, useEffect, useRef, useState } from "react";
import { NEXT_PUBLIC_MAPBOX_API_KEY } from "@/utils/envKey";
import { EvacuationSite } from "@prisma/client";

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_API_KEY as string;

// userLocationの型定義
type address = {
  latitude: number;
  longitude: number;
};
export const useMap = (userLocation: address, userQuestion: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  //   const [destination, setDestination] = useState<address | null>(null);
  const [route, setRoute] = useState<GeoJSON.FeatureCollection | null>(null);
  const [disasterEvacuationSites, setDisasterEvacuationSites] = useState<
    EvacuationSite[]
  >([]);

  const [evacuationManual, setEvacuationManual] = useState<string | null>(null);

  // マップを初期化
  useEffect(() => {
    if (mapContainerRef.current && userLocation) {
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
        preserveDrawingBuffer: true,
      });

      // MAPBOX APIを日本語に設定
      const language = new MapboxLanguage({ defaultLanguage: "ja" });
      map.current.addControl(language);

      //　ナビゲーションコントロールを追加
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      return () => {
        map.current?.remove();
      };
    }
  }, [userLocation]);

  const addRouteToMap = useCallback(() => {
    console.log("route", route);
    if (map.current && route) {
      if (map.current.getSource("route")) {
        // 既存のルートソースを更新
        (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData(
          route
        );
      } else {
        // 新しくルートソースを追加
        map.current.addSource("route", {
          type: "geojson",
          data: route,
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#888",
            "line-width": 6,
          },
        });
      }
    }
  }, [route]);

  // ルートを表示
  useEffect(() => {
    if (route && map.current) {
      // マップがロード済みであるかを確認
      if (!map.current.isStyleLoaded()) {
        map.current.once("load", () => {
          addRouteToMap();
        });
      } else {
        addRouteToMap();
      }
    }
  }, [route, addRouteToMap]);

  // マップの表示範囲を調整する関数
  const fitMapToBounds = (start: [number, number], end: [number, number]) => {
    if (map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      // 順序を [longitude, latitude] に修正
      bounds.extend([start[0], start[1]]);
      bounds.extend([end[0], end[1]]);
      map.current.fitBounds(bounds, {
        padding: 50,
      });
    }
  };

  // Directions APIを使用してルートを取得（現在地から目的地)
  const getRoute = async (end: [number, number]) => {
    console.log("userLocation", userLocation);

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.routes && data.routes.length > 0) {
      const routeData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: data.routes[0].geometry,
            properties: {},
          },
        ],
      };
      setRoute(routeData);
      console.log("routeData", routeData);
      fitMapToBounds([userLocation.longitude, userLocation.latitude], end);
    } else {
      console.error("Failed to fetch route:", data);

      alert("ルートの取得に失敗しました。");
    }
  };

  // 避難地を取得する
  const getEvacuationSite = async () => {
    if (userLocation && userQuestion) {
      try {
        const response = await fetch("/api/evacuation/filterEvacuationSites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            question: userQuestion,
          }),
        });
        const evacuationSites = await response.json();
        setDisasterEvacuationSites(evacuationSites);
        if (evacuationSites.length > 0) {
          const destination: [number, number] = [
            evacuationSites[0].longitude,
            evacuationSites[0].latitude,
          ];
          console.log("destination", destination);

          await getRoute(destination);
          const ragResponse = await fetch("/api/rag/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userQuestion }),
          });
          const ragResponseData = await ragResponse.json();
          console.log("ragResponseData", ragResponseData);
          setEvacuationManual(ragResponseData.answer);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching evacuation sites", error);
      }
    }
  };

  return {
    loading,
    mapContainerRef,
    getEvacuationSite,
    disasterEvacuationSites,
    evacuationManual,
  };
};
