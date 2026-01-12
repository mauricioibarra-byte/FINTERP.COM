import { create } from 'zustand';

export type AppContext = 'dashboard' | 'financials' | 'operations' | 'hr' | 'intelligence' | 'settings';

interface NavigationState {
    activeContext: AppContext;
    isSidebarCollapsed: boolean;
    setContext: (context: AppContext) => void;
    toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    activeContext: 'dashboard',
    isSidebarCollapsed: false,
    setContext: (context) => set({ activeContext: context }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
