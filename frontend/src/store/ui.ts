import { create } from "zustand";

/** UI-only state — auth state lives in the httpOnly cookie session. */
interface UiState {
  openNodeId: string | null;
  chatOpen: boolean;
  toast: string | null;
  openNode: (id: string) => void;
  closeNode: () => void;
  setChatOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useUi = create<UiState>((set) => ({
  openNodeId: null,
  chatOpen: false,
  toast: null,
  openNode: (id) => set({ openNodeId: id }),
  closeNode: () => set({ openNodeId: null }),
  setChatOpen: (open) => set({ chatOpen: open }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}));
