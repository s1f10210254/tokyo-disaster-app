import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMap } from "@/components/useMap";
import { Loading } from "@/components/loading/Loading";

export default function Result() {
  const router = useRouter();
  const { latitude, longitude, question } = router.query;

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (latitude && longitude && question) {
      setUserLocation({
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      setUserQuestion(String(question));
    }
  }, [latitude, longitude, question]);

  const {
    loading,
    mapContainerRef,
    getEvacuationSite,
    disasterEvacuationSites,
    evacuationManual,
  } = useMap(
    userLocation ?? { latitude: 35.681236, longitude: 139.767125 },
    userQuestion
  );

  useEffect(() => {
    // userLocationとuserQuestionがセットされていて、かつまだデータを取得していない場合に実行
    if (userLocation && userQuestion && !hasFetchedData.current) {
      getEvacuationSite();
      hasFetchedData.current = true; // 実行後にフラグを立てる
    }
  }, [userLocation, userQuestion, getEvacuationSite]);

  return (
    <div>
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
          style={{ width: "100%", height: "400px", border: "1px solid black" }}
        >
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "2rem",
            padding: "2rem",
          }}
        >
          {/* 左側：避難の目的地 */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "2px solid #0070f3",
              borderRadius: "8px",
              padding: "20px",
              width: "45%",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                color: "#0070f3",
                marginBottom: "15px",
              }}
            >
              <span role="img" aria-label="flag">
                🚩
              </span>{" "}
              避難の目的地
            </h2>
            {disasterEvacuationSites.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li>
                  <strong style={{ fontSize: "20px", color: "#333" }}>
                    {disasterEvacuationSites[0].facilityName}
                  </strong>
                  <p style={{ margin: "10px 0", color: "#666" }}>
                    <span role="img" aria-label="location">
                      📍
                    </span>{" "}
                    住所: {disasterEvacuationSites[0].address}
                  </p>
                  <p style={{ margin: "10px 0", color: "#666" }}>
                    緯度: {disasterEvacuationSites[0].latitude}, 経度:{" "}
                    {disasterEvacuationSites[0].longitude}
                  </p>
                  <div style={{ marginTop: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "10px" }}>
                      <span role="img" aria-label="alert">
                        ⚠️
                      </span>{" "}
                      対応する災害タイプ
                    </strong>
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      {disasterEvacuationSites[0].flood && (
                        <li
                          style={{
                            backgroundColor: "#e0f7fa",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#00796b",
                          }}
                        >
                          洪水
                        </li>
                      )}
                      {disasterEvacuationSites[0].earthquake && (
                        <li
                          style={{
                            backgroundColor: "#ffebee",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#d32f2f",
                          }}
                        >
                          地震
                        </li>
                      )}
                      {disasterEvacuationSites[0].tsunami && (
                        <li
                          style={{
                            backgroundColor: "#e3f2fd",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#1976d2",
                          }}
                        >
                          津波
                        </li>
                      )}
                      {disasterEvacuationSites[0].largeFire && (
                        <li
                          style={{
                            backgroundColor: "#fbe9e7",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#bf360c",
                          }}
                        >
                          火災
                        </li>
                      )}
                      {disasterEvacuationSites[0].inlandFlooding && (
                        <li
                          style={{
                            backgroundColor: "#f1f8e9",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#388e3c",
                          }}
                        >
                          内水氾濫
                        </li>
                      )}
                      {disasterEvacuationSites[0].volcanicPhenomenon && (
                        <li
                          style={{
                            backgroundColor: "#f3e5f5",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#8e24aa",
                          }}
                        >
                          火山現象
                        </li>
                      )}
                      {disasterEvacuationSites[0].landslide && (
                        <li
                          style={{
                            backgroundColor: "#e0f2f1",
                            borderRadius: "5px",
                            padding: "5px 10px",
                            color: "#004d40",
                          }}
                        >
                          崖崩れ・土石流・地滑り
                        </li>
                      )}
                    </ul>
                  </div>
                </li>
              </ul>
            ) : (
              <p>避難所が見つかりませんでした</p>
            )}
          </div>

          {/* 右側：避難マニュアル */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "2px solid #28a745",
              borderRadius: "8px",
              padding: "20px",
              width: "45%",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                color: "#28a745",
                marginBottom: "15px",
              }}
            >
              <span role="img" aria-label="book">
                📖
              </span>{" "}
              避難マニュアル
            </h2>
            {evacuationManual ? (
              <div
                style={{
                  textAlign: "left",
                  color: "#333",
                }}
              >
                <p>{evacuationManual}</p>
              </div>
            ) : (
              <p>避難マニュアルが見つかりませんでした</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
