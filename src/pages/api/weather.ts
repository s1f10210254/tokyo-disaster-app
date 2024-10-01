import { NextApiRequest, NextApiResponse } from "next";

// サーバーサイドで気象庁APIにリクエストを送る
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { type } = req.query;

  let url = "";

  switch (type) {
    case "earthquake":
      url = "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml";
      break;
    case "tsunami":
      url = "https://www.data.jma.go.jp/developer/xml/feed/tsunami.xml";
      break;
    case "volcano":
      url = "https://www.data.jma.go.jp/developer/xml/feed/volcano.xml";
      break;
    default:
      res.status(400).json({ error: "Invalid type" });
      return;
  }

  try {
    const response = await fetch(url);
    const data = await response.text(); // XMLデータを取得する場合は `.text()`
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
