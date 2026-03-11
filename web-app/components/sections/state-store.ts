import { create } from 'zustand';

interface StateStore {
  // Current thread ID from the chat
  currentThreadId: string | null;
  // Current state of the conversation
  currentState: string[] | null;
  // Status panel visibility
  isStatusPanelVisible: boolean;
  // Actions
  setThreadId: (threadId: string) => void;
  setState: (state: string[]) => void;
  toggleStatusPanel: (visible?: boolean) => void;
  reset: () => void;
}

export const useStateStore = create<StateStore>((set) => ({
  currentThreadId: null,
  currentState: null,
  isStatusPanelVisible: false,
  
  setThreadId: (threadId) => set({ currentThreadId: threadId }),
  setState: (state) => set({ currentState: state }),
  toggleStatusPanel: (visible) => {
    console.log("Toggle status panel called with:", visible);
    set((state) => ({ 
      isStatusPanelVisible: visible !== undefined ? visible : !state.isStatusPanelVisible 
    }));
  },
  reset: () => set({ currentThreadId: null, currentState: null, isStatusPanelVisible: false }),
})); 
