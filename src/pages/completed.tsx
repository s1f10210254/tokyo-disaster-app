import { useEffect, useState } from "react";

export default function Completed() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [userQuestion, setUserQuestion] = useState<string>("");

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        });
      } else {
        alert("位置情報が取得できませんでした");
      }
    };

    getLocation();
  }, []);

  // ユーザーの質問から災害に適した避難所を取得

  return <div>Completed</div>;
}
