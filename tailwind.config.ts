import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cinema: {
                    950: "#000000", // Background - Pure Black
                    900: "#121212", // Surface - Material Dark
                    800: "#1e1e1e", // Card Surface
                    500: "#d4af37", // Primary - Premium Gold (User requested Gold buttons)
                    gold: "#d4af37", // Explicit Gold
                    "gold-light": "#f3e5ab",
                    "gold-dark": "#aa8c2c",
                    red: "#8a0000", // Classic Cinema Red (Accents)
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "cinema-gradient": "linear-gradient(to bottom, #000000 0%, #1a1a1a 100%)",
            },
        },
    },
    plugins: [],
};
export default config;
