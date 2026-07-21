import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#1D4ED8",
        success: "#16A34A",
        locked: "#9CA3AF",
        sandbox: "#F59E0B",
      },
    },
  },
  plugins: [],
};

export default config;
