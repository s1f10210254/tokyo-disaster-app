import { QDRANT_URL } from "@/utils/envKey";
import { QdrantClient } from "@qdrant/js-client-rest";

export const client = new QdrantClient({ url: QDRANT_URL });
