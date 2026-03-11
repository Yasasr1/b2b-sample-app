import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getConfig } from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accessToken, meetingId } = req.body;
  if (!accessToken || !meetingId) {
    return res.status(400).json({ error: "Missing accessToken or meetingId" });
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
    const response = await axios.delete(`${meetingServiceUrl}/meetings/${meetingId}`,
      {
        headers
      }
    );
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to delete meeting" });
  }
}
