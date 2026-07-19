import { create } from "zustand";
import { Settings, WeekStart } from "@/lib/types";
import { persist, createJSONStorage } from "zustand/middleware";

interface TrackerState {
  selectedDate: string; // YYYY-MM-DD
  currentMonth: string; // YYYY-MM
  settings: Settings;

  // actions
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: string) => void;
  setWeekStart: (weekStart: WeekStart) => void;
  toggleDarkMode: () => void;
}

const today = new Date().toISOString().slice(0, 10);

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      selectedDate: today,
      currentMonth: today.slice(0, 7),
      settings: { weekStart: 0, darkMode: false },

      setSelectedDate: (date) => set({ selectedDate: date }),
      setCurrentMonth: (month) => set({ currentMonth: month }),
      setWeekStart: (weekStart) =>
        set((state) => ({ settings: { ...state.settings, weekStart } })),
      toggleDarkMode: () =>
        set((state) => ({
          settings: { ...state.settings, darkMode: !state.settings.darkMode },
        })),
    }),
    {
      name: "habit-tracker-settings", //localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the settings slice - not selectedDate, currentMonth, or server date
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);