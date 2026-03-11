import { useState } from "react";
import {getConfig} from "@teamspace-app/util-application-config-util";

interface SchedulingConfirmationCardProps {
  authorizationUrl: string
  onContinueBooking: () => void;
  threadId: string;
}

export function SchedulingConfirmationCard({ authorizationUrl, onContinueBooking, threadId }: SchedulingConfirmationCardProps) {
  const chatServiceUrl = getConfig().BusinessAdminAppConfig.resourceServerURLs.chatService
  const [hasClicked, setHasClicked] = useState(false)
  const handleAuthorize = async () => {
    window.open(authorizationUrl, "_blank");
    setHasClicked(true)

    let attempts = 0;
    const maxAttempts = 12; // 12 attempts for 1 minute (5 seconds interval)
    const intervalId = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        console.error('Authorization check timed out');
        return;
      }

      try {
        const response = await fetch(`${chatServiceUrl}/state/${threadId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          const states = data.states || [];

          if (states.includes('BOOKING_AUTHORIZED')) {
            clearInterval(intervalId);
            onContinueBooking();
          }
        } else {
          console.error('Failed to complete authorization');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }, 5000); // Call every 5 seconds
  }
  return (
    <div className="w-full mt-8">
      {
        !hasClicked ? (
          <button
            type="button"
            onClick={handleAuthorize}
            style={{
              width: '100%',
              marginTop: 10,
              background: '#ffc171', // lighter orange
              color: '#090909',
              fontWeight: 'bold',
              padding: '4px 0', // even smaller height
              borderRadius: 0, // square corners
              fontSize: 14,
              border: '2px solid #ffa726', // match lighter orange
              letterSpacing: '0.03em',
              transition: 'all 0.15s',
              outline: 'none',
              cursor: 'pointer',
              display: 'block',
              boxShadow: 'none',
            }}
          >
            🗓️ Confirm Schedule
          </button>
        ) : (
          <div></div>
        )
      }
    </div>
  );
}
