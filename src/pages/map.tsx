import { useState } from "react";

export default function Map() {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(
    null
  );

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(position);
      },
      (error) => {
        alert(error.message);
      }
    );
  };

  //一番近い避難地を取得する
  const getNearestEvacuationSite = () => {
    if (!userLocation) {
      alert("User location not available");
      return;
    }

    const { latitude, longitude } = userLocation.coords;
    fetch(`/api/evacuation?latitude=${latitude}&longitude=${longitude}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        alert(
          `Nearest evacuation site: ${data.facilityName}, Latitude: ${data.latitude}, Longitude: ${data.longitude}`
        );
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div>
      <h1>Map</h1>
      <button
        onClick={getUserLocation}
        style={{
          padding: "10px",
          backgroundColor: "blue",
          color: "white",
          borderRadius: "5px",
        }}
      >
        Get User Location
      </button>
      <p>
        {userLocation
          ? `Latitude: ${userLocation.coords.latitude}, Longitude: ${userLocation.coords.longitude}`
          : "User location not available"}
      </p>
    </div>
  );
}
