import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FAF7F2",
          100: "#F5EFEB",
          200: "#EFE6DD",
          300: "#E4D7C8",
          400: "#D3BFAB",
          500: "#BF9F84",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          light: "#FDFBF7",
          dark: "#EFE8DC",
        },
        warmbeige: {
          light: "#F5EFEB",
          DEFAULT: "#EFE6DD",
          dark: "#DFD2C2",
        },
        burntorange: {
          light: "#E06D28",
          DEFAULT: "#C85A17",
          hover: "#B84E10",
          dark: "#9E3E0E",
        },
        darkbrown: {
          light: "#42281D",
          DEFAULT: "#2C1810",
          dark: "#1A0E09",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "Cambria", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(44, 24, 16, 0.08), 0 2px 6px -1px rgba(44, 24, 16, 0.04)",
        warmelevated: "0 10px 30px -3px rgba(44, 24, 16, 0.12), 0 4px 10px -2px rgba(44, 24, 16, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;

