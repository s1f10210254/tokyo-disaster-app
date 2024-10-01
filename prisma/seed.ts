import fs from "fs";
import { PrismaClient, EvacuationSite } from "@prisma/client"; // EvacuationSite 型をインポート
import path from "path";
import { parse } from "fast-csv";

const prisma = new PrismaClient();
const csvFilePath = path.resolve(__dirname, "evacuation_area.csv");

async function main() {
  const results: Omit<EvacuationSite, "id">[] = []; // EvacuationSite 型に基づいた results 配列の定義（idは除外）

  fs.createReadStream(csvFilePath)
    .pipe(parse({ headers: true })) // ヘッダー行を認識
    .on("data", (row) => {
      // 緯度や経度が存在し、数値に変換可能か確認
      const latitude = parseFloat(row["緯度"]);
      const longitude = parseFloat(row["経度"]);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        // 緯度と経度がnullでない場合のみ処理
        const evacuationSite: Omit<EvacuationSite, "id"> = {
          localGovernmentCode: row["区市町村コード"] || "00000", // デフォルト値
          facilityName: row["施設名"],
          address: row["所在地住所"],
          latitude: latitude, // 緯度
          longitude: longitude, // 経度
          flood: row["洪水"] === "1" ? true : row["洪水"] === "" ? null : false,
          landslide:
            row["崖崩れ土石流および地滑り"] === "1"
              ? true
              : row["崖崩れ土石流および地滑り"] === ""
              ? null
              : false,
          stormSurge:
            row["高潮"] === "1" ? true : row["高潮"] === "" ? null : false,
          earthquake:
            row["地震"] === "1" ? true : row["地震"] === "" ? null : false,
          tsunami:
            row["津波"] === "1" ? true : row["津波"] === "" ? null : false,
          largeFire:
            row["大規模な火事"] === "1"
              ? true
              : row["大規模な火事"] === ""
              ? null
              : false,
          inlandFlooding:
            row["内水氾濫"] === "1"
              ? true
              : row["内水氾濫"] === ""
              ? null
              : false,
          volcanicPhenomenon:
            row["火山現象"] === "1"
              ? true
              : row["火山現象"] === ""
              ? null
              : false,
          elevatorOrGroundFloor:
            row["エレベーター有り避難スペースが1"] === "1"
              ? true
              : row["エレベーター有り避難スペースが1"] === ""
              ? null
              : false,
          slope:
            row["スロープ等"] === "1"
              ? true
              : row["スロープ等"] === ""
              ? null
              : false,
          tactilePaving:
            row["点字ブロック"] === "1"
              ? true
              : row["点字ブロック"] === ""
              ? null
              : false,
          accessibleToilet:
            row["車椅子使用者対応トイレ"] === "1"
              ? true
              : row["車椅子使用者対応トイレ"] === ""
              ? null
              : false,
          other: row["その他（具体的に）"] || null, // その他の具体的な情報
        };
        results.push(evacuationSite);
      }
    })
    .on("end", async () => {
      console.log("results", results); // 確認用

      for (const result of results) {
        try {
          await prisma.evacuationSite.create({
            data: result,
          });
        } catch (error) {
          console.error("Error inserting record:", error);
        }
      }

      await prisma.$disconnect();
    });
}

main().catch((error) => {
  console.error("Error:", error);
});
