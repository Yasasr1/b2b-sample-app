"use client"

// Add immediate console log to verify the file is loaded
console.log("StatusPanel.tsx file is being loaded");

import { useState, useEffect } from "react"
import { Calendar, CheckCircle, Info, Key } from "lucide-react"
import { useStateStore } from "./state-store"

// Define the Scenario type as it is in the chat component
interface Scenario {
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  state?: string;
  matchStates?: string[];
  priority?: number;
}

// Define proper type for stateInfo
interface StateInfo {
  state?: string;
  states?: string[];
  [key: string]: unknown;
}

// Component to display the scenario card
function ScenarioCard({ scenario }: { scenario: Scenario }) {
  // Log when ScenarioCard renders
  console.log("ScenarioCard rendering", scenario.title);
  
  // Format the details text to properly render bold markdown for all formatting types
  const formatDetails = (text: string) => {
    // Split by double newlines and filter out empty strings
    const points = text.split('\n\n').filter(point => point.trim().length > 0);
    
    return points.map((point, index) => {
      // Clean up the point text
      const cleanPoint = point.trim();
      
      // Extract bold title (between ** **) and description, now ignoring the bullet point
      const titleMatch = cleanPoint.match(/^(?:• )?\*\*(.*?)\*\*([\s\S]*)/);
      
      if (!titleMatch) {
        console.warn('Could not parse point:', cleanPoint);
        return null;
      }
      
      const [, title, description] = titleMatch;
      
      return (
        <div key={index} className="mb-4 last:mb-0">
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">
              {title.trim()}
            </div>
            <div className="text-gray-600 mt-1 text-xs">
              {description.trim()}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 flex flex-col flex-grow">
        <div>
          <h3 className="font-semibold text-xl text-gray-900 mb-2">{scenario.title}</h3>
          <p className="text-base text-gray-600">{scenario.description}</p>
        </div>
        
        <div className="mt-5 border-t border-gray-100 pt-4 flex-grow">
          <h4 className="font-medium text-base text-gray-900 mb-4">How it works:</h4>
          <div className="space-y-3">
            {formatDetails(scenario.details)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusPanel() {
  // Immediate log to confirm component mount
  console.log("StatusPanel component function called");
  
  const { currentState, currentThreadId, isStatusPanelVisible } = useStateStore()
  const [scenarioToShow, setScenarioToShow] = useState<Scenario | null>(null)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)
  
  // Debugging log
  useEffect(() => {
    console.log("StatusPanel useEffect render", { 
      currentThreadId, 
      isStatusPanelVisible, 
      currentState,
      hasState: currentState && currentState.length > 0 
    });
  }, [currentThreadId, currentState, isStatusPanelVisible]);

  // Define scenarios with priority - same as in StateInfoButton
  const scenarios: Scenario[] = [
    {
      title: "Adding Booking to Calendar",
      description:
        "Upon completing a booking, the agent offers to add the reservation details directly to the user's Google Calendar for their convenience. Following the user's confirmation and authorization, the agent automatically creates a calendar event with the booking information on the user's behalf.",
      details:
        "• **Google Calendar Integration**\n  Once the booking is finalized, the agent offers the user the option to automatically add the booking details to their Google Calendar.\n\n" +
        "• **User Confirmation for Calendar Integration**\n  The user confirms their desire to have the booking added to their Google Calendar.\n\n" +
        "• **Authorization Request for Calendar Access**\n  The user is prompted to grant the necessary permissions for the agent to access their Google Calendar. This is typically done through a secure OAuth flow through the Identity Server.\n\n" +
        "• **Secure Access Token Retrieval**\n  Upon the user granting permission, the agent securely receives an access token from Google's authentication service through the Identity Server. This token allows the agent to interact with the Google Calendar API on the user's behalf.\n\n" +
        "• **Calendar Event Creation**\n  Leveraging the OAuth access token and the Google Calendar API, the agent automatically creates a new calendar event containing all relevant booking details in the user's Google Calendar.",
      icon: <Calendar className="w-6 h-6 text-red-600" />,
      state: "CALENDAR_STATE",
      matchStates: ["ADDED_TO_CALENDAR"],
      priority: 2
    },
    {
      title: "User Authorization for Booking",
      description:
        "Prior to finalizing a hotel booking, the agent ensures explicit consent is obtained from the user. This step is crucial to confirm the user's agreement to the booking details and to authorize the agent to proceed with the booking on their behalf.",
      details:
        "• **Booking Details Submission**\n  The user selects their desired room and submits their booking details to the agent for review and confirmation.\n\n" +
        "• **Consent Request and Token Acquisition**\n  Upon the user confirming the booking details, the agent securely receives an access token from the identity server. This token signifies the user's authenticated consent and authorizes the agent to proceed with the booking process.\n\n" +
        "• **Booking Finalization**\n  Utilizing the access token, the agent securely finalizes the booking with the hotel system on behalf of the user.",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      state: "BOOKING_STATE",
      matchStates: ["BOOKING_COMPLETED"],
      priority: 3
    },
    {
      title: "Hotel Suggestions",
      description:
        "When a user initiates a search for hotel accommodations, the agent retrieves up-to-date data to present a relevant selection of options.",
      details:
        "• **User Requests Suggestions**\n  The user specifies their desired travel dates and location to initiate a search for available hotel rooms.\n\n" +
        "• **Agent Authentication and Token Acquisition**\n  The agent utilizes its own secure credentials to authenticate with the Identity Server. Upon successful authentication, the WSO2 Identity Server issues an access token to the agent.\n\n" +
        "• **Hotel Data Retrieval**\n  The agent leverages the access token to make a secure request to the Hotel API.",
      icon: <Key className="w-6 h-6 text-blue-600" />,
      state: "FETCH_HOTELS_STATE",
      matchStates: ["FETCHED_HOTELS", "FETCHED_HOTEL", "FETCHED_ROOM"],
      priority: 4
    },
    {
      title: "Booking Upgrade",
      description:
        "When a user wishes to upgrade their existing hotel booking to a superior room category, the agent initiates a process involving scheduled monitoring of availability and managed execution of the upgrade.",
      details:
        "• **User Upgrade Request**\n  The user informs the agent of their desire to upgrade their current hotel booking to a different, typically higher-tier, room type.\n\n" +
        "• **Availability Monitoring**\n  The agent schedules a recurring background task to query the Hotel API at regular intervals. This task specifically monitors the availability of the requested superior room type for the user's existing booking dates.\n\n" +
        "• **User Notification and Consent via Client-Initiated Backchannel**\n  When a suitable room becomes available, the agent promptly notifies the user of this availability. Leveraging a Client-Initiated Backchannel communication within the Identity Server, the agent securely requests and obtains the user's explicit consent to proceed with the upgrade.\n\n" +
        "• **Booking Upgrade and Confirmation**\n  Upon receiving the user's approval, the agent interacts with the Hotel API to modify the existing booking, updating it with the details of the newly selected superior room. Following a successful upgrade, the agent sends a detailed confirmation email to the user, outlining the updated booking information.",
      icon: <Key className="w-6 h-6 text-blue-600" />,
      state: "UPGRADE_STATE",
      matchStates: ["PROCCESING_UPGRADE"],
      priority: 1
    }
  ];

  // Check for state info whenever currentThreadId, currentState, or visibility changes
  useEffect(() => {
    if (!currentThreadId || !currentState) {
      console.log("No thread ID or state available, skipping fetch");
      return;
    }
    
    const matchedScenario = findScenarioForState({ states: currentState });
    console.log("Matched scenario:", matchedScenario);
    setScenarioToShow(matchedScenario);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThreadId, currentState, isStatusPanelVisible]);

  // Helper function to find the appropriate scenario based on state with priority
  const findScenarioForState = (stateInfo: StateInfo): Scenario | null => {
    // If state is empty or undefined, return null (no scenario)
    if (!stateInfo.states) return null;
    
    // Get the current state
    const currentState = stateInfo.states as string[]
    
    // First sort scenarios by priority
    const sortedScenarios = [...scenarios].sort((a, b) => 
      (a.priority || 999) - (b.priority || 999)
    );
    
    // Check each scenario in priority order to see if its matchStates includes the current state
    for (const scenario of sortedScenarios) {
      // Skip scenarios without matchStates
      if (!scenario.matchStates || scenario.matchStates.length === 0) continue;
      
      // Check if ANY of the matchStates appear in the current state
      // We only need ONE match for the scenario to be valid
      const hasMatch = scenario.matchStates.some(matchState => 
        currentState.includes(matchState)
      );
      
      if (hasMatch) {
        return scenario;
      }
    }
    
    // If no matching scenario is found
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto px-3 py-2 h-full">
        {isLoading && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading status information...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 h-full flex items-center justify-center min-h-[300px]">
            <div className="bg-red-50 p-4 rounded-lg w-full">
              <p className="font-medium mb-2">Error Loading Status</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && scenarioToShow && (
          <div className="h-full py-2">
            <ScenarioCard scenario={scenarioToShow} />
          </div>
        )}
        
        {!isLoading && !error && !scenarioToShow && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center py-6 px-4 w-full">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Status</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                When you start booking a hotel room, status information will appear here.
              </p>
              
              {currentState && currentState.length > 0 && (
                <div className="mt-6 bg-gray-50 p-3 rounded-lg text-left">
                  <p className="text-xs font-medium text-gray-700 mb-1">Current state:</p>
                  <p className="text-xs text-gray-600">{currentState.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
