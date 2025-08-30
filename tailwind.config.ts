// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#254635",
        secondary:"#fdf6e4ff",
        accent:"#d1ccb6ff"
      },
    },
  },
  plugins: [],
}
