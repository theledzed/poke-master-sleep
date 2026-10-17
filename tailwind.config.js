/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        poke: {
          red: '#EE1515',
          darkRed: '#A30D0D',
          blue: '#2A75BB',
          darkBlue: '#1B4772',
          yellow: '#FFCB05',
          gold: '#D6A600',
          night: '#080C16',
          nightCard: '#121727',
          nightCardHover: '#182035',
          nightBorder: 'rgba(255, 255, 255, 0.08)',
          grass: '#4ADE80',
          fire: '#FB923C',
          water: '#38BDF8',
          electric: '#FACC15',
          psychic: '#F472B6',
          ghost: '#A855F7',
          dragon: '#818CF8'
        },
        sleep: {
          bg: '#080C16',
          card: '#121727',
          cardHover: '#182035',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#FFCB05',
          accent: '#F59E0B',
          snorlax: '#1E3A8A',
          berry: '#EC4899',
          ingredient: '#10B981',
          skill: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
