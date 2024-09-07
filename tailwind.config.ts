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
        accent: "#4D1D82",
        "soft-dark": {
          500: "#212168",
          700: "#222244",
          900: "#13133A"
        },
        rainbow: {
          100: "#13133A",
          300: "#84543F",
          500: "#3F8452",
          700: "#3F6784",
          900: "#7E3F84"
        },
        "rainbow-light": {
          100: "#FFCCCC",
          300: "#FFCEB9",
          500: "#D1FFDE",
          700: "#CCFFFE",
          900: "#FAC7FF"
        },
        "rainbow-dark": {
          100: "#4D0000",
          300: "#6F2100",
          500: "#005117",
          700: "#00528D",
          900: "#500057"
        },
      }
    }
  }
};
export default config;
