import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const evacuationSites = await prisma.evacuationSite.findMany({
      take: 5,
    });

    res.status(200).json(evacuationSites);
  } catch (error) {
    console.error("Error fetching evacuation sites", error);
    res.status(500).json({ error: "Error fetching evacuation sites" });
  }
}
