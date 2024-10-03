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
          100: "#843F3F",
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
      },
      height: {
        "4/3" : "133.333333%",
        "2x": "200%",
        "3x": "300%",
        "4x": "400%"
      }
    }
  },
  safelist: [
    'bg-rainbow-100', 'bg-rainbow-300', 'bg-rainbow-500', 'bg-rainbow-700', 'bg-rainbow-900',
    'bg-rainbow-dark-100', 'bg-rainbow-dark-300', 'bg-rainbow-dark-500', 'bg-rainbow-dark-700', 'bg-rainbow-dark-900',
    'text-rainbow-light-100', 'text-rainbow-light-300', 'text-rainbow-light-500', 'text-rainbow-light-700', 'text-rainbow-light-900'
  ]
};
export default config;
