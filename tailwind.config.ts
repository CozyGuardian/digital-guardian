import type { Config } from "tailwindcss";

export default {
  content: ["./frontend/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
