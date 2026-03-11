import type { NextApiRequest, NextApiResponse } from 'next';
import {getConfig} from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chatServiceUrl = getConfig().BusinessAdminAppConfig.resourceServerURLs.chatService
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  console.log('Received messages:', messages); // Log the received messages for debugging
  const authHeader = req.headers.authorization;
  if (!messages) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  try {
    const response = await fetch(`${chatServiceUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        messages
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to OpenAI' });
  }
}
