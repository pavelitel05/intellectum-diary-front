import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

function applyDomTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    document.body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    document.body.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",

      toggle: () => {
        const next = get().theme === "light" ? "dark" : "light";
        applyDomTheme(next);
        set({ theme: next });
      },

      setTheme: (theme) => {
        applyDomTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "intellectum-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyDomTheme(state.theme);
      },
    }
  )
);
