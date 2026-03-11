import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getConfig } from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accessToken, meetingData } = req.body;
  if (!accessToken || !meetingData) {
    return res.status(400).json({ error: "Missing accessToken or meetingData" });
  }

  try {
    const meetingServiceUrl = getConfig().BusinessAdminAppConfig.resourceServerURLs.meetingService;
    const apiKey = getConfig().BusinessAdminAppConfig.resourceServerURLs.meetingApiKey;
    const headers: Record<string, string> = {
      "x-jwt-assertion": accessToken
    };
    if (apiKey) {
      headers["api-key"] = apiKey;
    }
    const response = await axios.post(`${meetingServiceUrl}/meetings`, meetingData, {
      headers
    });
    return res.status(201).json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create meeting" });
  }
}
