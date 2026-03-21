import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAdminUiStore = create(
  persist<{
    sidebarCollapsed: boolean
    rightPanelOpen: boolean
    setSidebarCollapsed: (v: boolean) => void
    toggleSidebar: () => void
    setRightPanelOpen: (v: boolean) => void
    toggleRightPanel: () => void
  }>(
    (set, get) => ({
      sidebarCollapsed: false,
      rightPanelOpen: true,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setRightPanelOpen: (v) => set({ rightPanelOpen: v }),
      toggleRightPanel: () => set({ rightPanelOpen: !get().rightPanelOpen }),
    }),
    { name: 'exam-platform-admin-ui' },
  ),
)
