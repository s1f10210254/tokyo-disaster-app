import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [route, setRoute] = useState<GeoJSON.FeatureCollection | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    // ユーザーの現在地を取得
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error("現在地の取得に失敗しました:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (userLocation && map.current === null) {
      // マップがまだ作成されていない場合に初期化
      map.current = new mapboxgl.Map({
        container: mapContainer.current || "", // マップを表示する要素
        style: "mapbox://styles/mapbox/streets-v11", // マップのスタイル
        center: [userLocation[1], userLocation[0]], // ユーザーの現在地を中心に設定
        zoom: 13, // 初期のズームレベル
      });
      const language = new MapboxLanguage({ defaultLanguage: "ja" });
      map.current.addControl(language);
    }
  }, [userLocation]);

  // addRouteToMap関数をuseCallbackでメモ化
  const addRouteToMap = useCallback(() => {
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

  // Directions APIを使用してルートを取得
  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    // start と end は [経度, 緯度] の形式で指定する必要があります
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

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

      fitMapToBounds(start, end);
    } else {
      console.error("Failed to fetch route:", data);
      alert("ルートの取得に失敗しました。");
    }
  };

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

  // 一番近い避難地を取得する
  const getNearestEvacuationSite = async () => {
    if (!userLocation) {
      alert("User location not available");
      return;
    }

    const [latitude, longitude] = userLocation;
    const res = await fetch(
      `/api/evacuation/evacuationSites?latitude=${latitude}&longitude=${longitude}`
    );
    const data = await res.json();

    if (data.length > 0) {
      // destinationの型を[number, number]として明示
      const destination: [number, number] = [
        data[0].longitude,
        data[0].latitude,
      ];
      // fetchRouteに[経度, 緯度]の順で渡す
      await fetchRoute([longitude, latitude], destination);
    }
  };

  return (
    <div>
      <button onClick={getNearestEvacuationSite}>避難所を探す</button>
      <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />
      <p>
        {userLocation
          ? `Your current location: ${userLocation[0]}, ${userLocation[1]}`
          : "Fetching user location..."}
      </p>
    </div>
  );
}
