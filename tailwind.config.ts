import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "jr-yamanote": "#9acd32",
        "jr-saikyo": "#00ac9a",
        "jr-shonan": "#e75b12",
        "metro-ginza": "#f39700",
        "metro-hanzomon": "#8b76d0",
        "metro-fukutoshin": "#bb641d",
        "tokyu-toyoko": "#da0442",
        "tokyu-dento": "#da0442",
        "keio-inokashira": "#b8417a",
      },
    },
  },
  plugins: [],
};

export default config;
