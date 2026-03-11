import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getConfig } from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orgId } = req.body;

  try {
    const personalizationServiceUrl = getConfig().BusinessAdminAppConfig.resourceServerURLs.personalizationService;
    const apiKey = getConfig().BusinessAdminAppConfig.resourceServerURLs.personalizationApiKey;
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["api-key"] = apiKey;
    }
    const response = await axios.get(`${personalizationServiceUrl}/personalization/org/${orgId}`, {
      headers
    });
    return res.status(200).json(response.data);
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: error.message || "Personalization data not found" });
    }
    return res.status(500).json({ error: error.message || "Failed to fetch personalization data" });
  }
}
