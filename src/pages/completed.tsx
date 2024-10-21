import { Loading } from "@/components/loading/Loading";
import { useMap } from "@/components/useMap";
import { useEffect, useState } from "react";

export default function Completed() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");

  useEffect(() => {
    // ユーザーの現在地を取得
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => {
        console.error("現在地の取得に失敗しました:", error);
      }
    );
  }, []);

  const {
    loading,
    mapContainerRef,
    getEvacuationSite,
    disasterEvacuationSites,
  } = useMap(
    // userLocationがnullの場合は東京駅を初期値として設定
    userLocation ?? { latitude: 35.681236, longitude: 139.767125 },
    userQuestion
  );

  return (
    <div
      style={{
        // minHeight: "100vh",
        // display: "flex",
        // flexDirection: "column",
        // alignItems: "center",
        // justifyContent: "center",
        backgroundColor: "#f8f8f8",
      }}
    >
      <Loading visible={loading} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5rem",
          height: "100vh",
        }}
      >
        <div
          style={{ width: "100%", height: "50%", border: "2px solid black" }}
        >
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div>
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="質問を入力してください"
          />
          <button onClick={getEvacuationSite}>避難所を探す</button>
          {/* {disasterEvacuationSites.length > 0 && (
            <div>
              <h2>避難所リスト</h2>
              <ul>
                {disasterEvacuationSites.map((site, index) => (
                  <li key={index}>
                    <strong>{site.facilityName}</strong>
                    <p>住所: {site.address}</p>
                    <p>
                      緯度: {site.latitude}, 経度: {site.longitude}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )} */}
          {/*避難所リスト上位1件表示 */}
          {disasterEvacuationSites.length > 0 && (
            <div>
              <h2>避難所リスト</h2>
              <ul>
                <li>
                  <strong>{disasterEvacuationSites[0].facilityName}</strong>
                  <p>住所: {disasterEvacuationSites[0].address}</p>
                  <p>
                    緯度: {disasterEvacuationSites[0].latitude}, 経度:{" "}
                    {disasterEvacuationSites[0].longitude}
                  </p>
                  <strong>対応する災害タイプ</strong>
                  {disasterEvacuationSites[0].flood && <li>洪水</li>}
                  {disasterEvacuationSites[0].earthquake && <li>地震</li>}
                  {disasterEvacuationSites[0].tsunami && <li>津波</li>}
                  {disasterEvacuationSites[0].largeFire && <li>火災</li>}
                  {disasterEvacuationSites[0].inlandFlooding && (
                    <li>内水氾濫</li>
                  )}
                  {disasterEvacuationSites[0].volcanicPhenomenon && (
                    <li>火山現象</li>
                  )}
                  {disasterEvacuationSites[0].landslide && (
                    <li>崖崩れ・土石流・地滑り</li>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
