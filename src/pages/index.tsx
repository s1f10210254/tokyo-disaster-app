// Home.tsx
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");

  useEffect(() => {
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

  return (
    <div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="質問する"
            style={{
              width: "100%",
              height: "100px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              fontSize: "16px",
            }}
          />
          <Link
            href={{
              pathname: "/result",
              query: {
                latitude: userLocation?.latitude,
                longitude: userLocation?.longitude,
                question: userQuestion,
              },
            }}
            passHref
          >
            <button
              type="button"
              style={{
                padding: "10px",
                backgroundColor: "#0070f3",
                color: "white",
                cursor: "pointer",
                borderRadius: "5px",
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              避難行動を確認する
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
