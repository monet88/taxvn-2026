/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#f9fafb",
        primary: "#059669",
        destructive: "#dc2626",
        "text-primary": "#1a1a1a",
        border: "#e5e7eb",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      fontSize: {
        label: ["14px", "1.5"],
        body: ["16px", "1.5"],
        heading: ["24px", "1.2"],
        display: ["32px", "1.2"],
      },
    },
  },
  plugins: [],
};
