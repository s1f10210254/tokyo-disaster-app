import { processUrls } from "@/tasks/processUrlsTask";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    processUrls();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error Processing URLs", error });
  }
}
