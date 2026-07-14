/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5ea8d7",
          dark: "#4a8bb8",
        },
        secondary: {
          DEFAULT: "#93d0d5",
          dark: "#6fb8bf",
        },
        accent: {
          DEFAULT: "#ffee78",
          dark: "#e6d65c",
        },
        surface: {
          DEFAULT: "#fffffd",
          dark: "#1e1f22",
        },
        ink: {
          DEFAULT: "#28292b",
          dark: "#e8e9eb",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(40, 41, 43, 0.06)",
        "soft-lg": "0 8px 32px rgba(40, 41, 43, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
