// import { Loading } from "@/components/loading/Loading";
// import { useMap } from "@/components/useMap";
// import { useEffect, useState } from "react";

// export default function Completed() {
//   const [userLocation, setUserLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [userQuestion, setUserQuestion] = useState<string>("");

//   useEffect(() => {
//     // ユーザーの現在地を取得
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setUserLocation({ latitude, longitude });
//       },
//       (error) => {
//         console.error("現在地の取得に失敗しました:", error);
//       }
//     );
//   }, []);

//   const {
//     loading,
//     mapContainerRef,
//     getEvacuationSite,
//     disasterEvacuationSites,
//   } = useMap(
//     // userLocationがnullの場合は東京駅を初期値として設定
//     userLocation ?? { latitude: 35.681236, longitude: 139.767125 },
//     userQuestion
//   );

//   return (
//     <div
//       style={{
//         // minHeight: "100vh",
//         // display: "flex",
//         // flexDirection: "column",
//         // alignItems: "center",
//         // justifyContent: "center",
//         backgroundColor: "#f8f8f8",
//       }}
//     >
//       <Loading visible={loading} />
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           gap: "5rem",
//           height: "100vh",
//         }}
//       >
//         <div
//           style={{ width: "100%", height: "50%", border: "2px solid black" }}
//         >
//           <div
//             ref={mapContainerRef}
//             style={{ width: "100%", height: "100%" }}
//           />
//         </div>
//         <div>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault(); // デフォルトのフォーム送信動作を防ぐ
//               getEvacuationSite(); // POST リクエストを送信
//             }}
//           >
//             <button
//               type="submit"
//               style={{
//                 padding: "10px",
//                 backgroundColor: "#0070f3",
//                 color: "white",
//                 cursor: "pointer",
//                 borderRadius: "5px",
//                 marginBottom: "20px",
//                 fontWeight: "bold",
//               }}
//             >
//               災害に相性が良い避難所を取得する
//             </button>
//             <textarea
//               value={userQuestion}
//               onChange={(e) => setUserQuestion(e.target.value)}
//               placeholder="質問する"
//               style={{
//                 width: "100%",
//                 height: "100px",
//                 marginBottom: "20px",
//                 border: "1px solid #ccc",
//                 borderRadius: "5px",
//                 padding: "10px",
//                 fontSize: "16px",
//               }}
//             />
//           </form>
//           {disasterEvacuationSites.length > 0 && (
//             <div>
//               <h2>避難所リスト</h2>
//               <ul>
//                 <li>
//                   <strong>{disasterEvacuationSites[0].facilityName}</strong>
//                   <p>住所: {disasterEvacuationSites[0].address}</p>
//                   <p>
//                     緯度: {disasterEvacuationSites[0].latitude}, 経度:
//                     {disasterEvacuationSites[0].longitude}
//                   </p>
//                   <strong>対応する災害タイプ</strong>
//                   {disasterEvacuationSites[0].flood && <li>洪水</li>}
//                   {disasterEvacuationSites[0].earthquake && <li>地震</li>}
//                   {disasterEvacuationSites[0].tsunami && <li>津波</li>}
//                   {disasterEvacuationSites[0].largeFire && <li>火災</li>}
//                   {disasterEvacuationSites[0].inlandFlooding && (
//                     <li>内水氾濫</li>
//                   )}
//                   {disasterEvacuationSites[0].volcanicPhenomenon && (
//                     <li>火山現象</li>
//                   )}
//                   {disasterEvacuationSites[0].landslide && (
//                     <li>崖崩れ・土石流・地滑り</li>
//                   )}
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
