// import { useEffect, useState } from "react";
// import { EvacuationSite } from "./types/Evacuation";

// export default function Information() {
//   const [userLocation, setUserLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   const [evacuationSites, setEvacuationSites] = useState<EvacuationSite[]>([]);
//   const [question, setQuestion] = useState("");
//   const [disasterEvacuationSites, setDisasterEvacuationSites] = useState<
//     EvacuationSite[]
//   >([]);

//   // ユーザーの現在地を取得する
//   const getLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition((position) => {
//         setUserLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       });
//     } else {
//       alert("位置情報が取得できませんでした");
//     }
//   };

//   // useEffectを使ってユーザーの現在地を取得する
//   useEffect(() => {
//     getLocation();
//   }, []);

//   // ユーザーから近い避難所を取得
//   const getNearEvacuationSites = async () => {
//     if (userLocation) {
//       try {
//         const evacuationResponse = await fetch(
//           `/api/evacuation/evacuationSites?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
//         );
//         const evacuationSites = await evacuationResponse.json();
//         setEvacuationSites(evacuationSites);
//       } catch (error) {
//         console.error("Error fetching evacuation sites", error);
//       }
//     }
//   };

//   // 質問から災害に適した避難所を取得
//   const getDisasterEvacuationSites = async () => {
//     if (userLocation && question) {
//       try {
//         const response = await fetch("/api/evacuation/filterEvacuationSites", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             latitude: userLocation.latitude,
//             longitude: userLocation.longitude,
//             question,
//           }),
//         });
//         const evacuationSites = await response.json();
//         setDisasterEvacuationSites(evacuationSites);
//       } catch (error) {
//         console.error("Error fetching evacuation sites", error);
//       }
//     }
//   };

//   return (
//     <div>
//       {/* <h1 className="text-4xl" style={{ fontWeight: "bold" }}>
//         Information
//       </h1> */}
//       <div>
//         <h1 className="text-2xl">ユーザーの現在地</h1>
//         {userLocation && (
//           <div>
//             <p>緯度: {userLocation.latitude}</p>
//             <p>経度: {userLocation.longitude}</p>
//           </div>
//         )}
//       </div>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(2, 1fr)",
//           gap: "20px",
//         }}
//       >
//         <div>
//           <button
//             onClick={getNearEvacuationSites}
//             style={{
//               padding: "10px",
//               backgroundColor: "#0070f3",
//               color: "white",
//               cursor: "pointer",
//               borderRadius: "5px",
//               marginBottom: "20px",
//               fontWeight: "bold",
//             }}
//           >
//             近くの避難所を取得する
//           </button>

//           <h2
//             className="text-2xl"
//             style={{ marginBottom: "20px", fontWeight: "bold" }}
//           >
//             近くの避難所リスト
//           </h2>

//           <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
//             {evacuationSites.map((site: EvacuationSite, index: number) => (
//               <li
//                 key={index}
//                 style={{
//                   marginBottom: "20px",
//                   padding: "15px",
//                   border: "1px solid #ccc",
//                   borderRadius: "8px",
//                   backgroundColor: "#f9f9f9",
//                 }}
//               >
//                 <strong
//                   style={{
//                     fontSize: "18px",
//                     display: "block",
//                     marginBottom: "5px",
//                   }}
//                 >
//                   {site.facilityName}
//                 </strong>
//                 <p style={{ marginBottom: "5px" }}>
//                   <strong>住所:</strong> {site.address}
//                 </p>
//                 <p style={{ marginBottom: "10px" }}>
//                   <strong>緯度:</strong> {site.latitude}, <strong>経度:</strong>{" "}
//                   {site.longitude}
//                 </p>
//                 <div style={{ marginBottom: "10px" }}>
//                   <strong>対応する災害タイプ:</strong>
//                   <ul
//                     style={{
//                       listStyleType: "disc",
//                       paddingLeft: "20px",
//                       marginTop: "5px",
//                     }}
//                   >
//                     {site.flood && <li>洪水</li>}
//                     {site.landslide && <li>崖崩れ・土石流・地滑り</li>}
//                     {site.stormSurge && <li>高潮</li>}
//                     {site.earthquake && <li>地震</li>}
//                     {site.tsunami && <li>津波</li>}
//                     {site.largeFire && <li>大規模火災</li>}
//                     {site.inlandFlooding && <li>内水氾濫</li>}
//                     {site.volcanicPhenomenon && <li>火山現象</li>}
//                     {site.elevatorOrGroundFloor && (
//                       <li>エレベーター/避難スペース1階</li>
//                     )}
//                     {site.slope && <li>スロープ</li>}
//                     {site.tactilePaving && <li>点字ブロック</li>}
//                     {site.accessibleToilet && <li>車椅子使用者対応トイレ</li>}
//                   </ul>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault(); // デフォルトのフォーム送信動作を防ぐ
//               getDisasterEvacuationSites(); // POST リクエストを送信
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
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="災害に関する質問を入力してください"
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

//           <h2
//             className="text-2xl"
//             style={{ marginBottom: "20px", fontWeight: "bold" }}
//           >
//             災害に対応する避難所リスト
//           </h2>

//           <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
//             {disasterEvacuationSites.map(
//               (site: EvacuationSite, index: number) => (
//                 <li
//                   key={index}
//                   style={{
//                     marginBottom: "20px",
//                     padding: "15px",
//                     border: "1px solid #ccc",
//                     borderRadius: "8px",
//                     backgroundColor: "#f9f9f9",
//                   }}
//                 >
//                   <strong
//                     style={{
//                       fontSize: "18px",
//                       display: "block",
//                       marginBottom: "5px",
//                     }}
//                   >
//                     {site.facilityName}
//                   </strong>
//                   <p style={{ marginBottom: "5px" }}>
//                     <strong>住所:</strong> {site.address}
//                   </p>
//                   <p style={{ marginBottom: "10px" }}>
//                     <strong>緯度:</strong> {site.latitude},{" "}
//                     <strong>経度:</strong> {site.longitude}
//                   </p>
//                   <div style={{ marginBottom: "10px" }}>
//                     <strong>対応する災害タイプ:</strong>
//                     <ul
//                       style={{
//                         listStyleType: "disc",
//                         paddingLeft: "20px",
//                         marginTop: "5px",
//                       }}
//                     >
//                       {site.flood && <li>洪水</li>}
//                       {site.landslide && <li>崖崩れ・土石流・地滑り</li>}
//                       {site.stormSurge && <li>高潮</li>}
//                       {site.earthquake && <li>地震</li>}
//                       {site.tsunami && <li>津波</li>}
//                       {site.largeFire && <li>大規模火災</li>}
//                       {site.inlandFlooding && <li>内水氾濫</li>}
//                       {site.volcanicPhenomenon && <li>火山現象</li>}
//                       {site.elevatorOrGroundFloor && (
//                         <li>エレベーター/避難スペース1階</li>
//                       )}
//                       {site.slope && <li>スロープ</li>}
//                       {site.tactilePaving && <li>点字ブロック</li>}
//                       {site.accessibleToilet && <li>車椅子使用者対応トイレ</li>}
//                     </ul>
//                   </div>
//                 </li>
//               )
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }
