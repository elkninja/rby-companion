<div align="center">
  <img src="public/vite.svg" alt="RBY Companion Logo" width="120" height="auto" />
  <h1>🔴 FireRed & 🟢 LeafGreen Companion</h1>
  <p><em>"Welcome to the world of Pokémon! My name is Oak. People call me the Pokémon Prof!"</em></p>
</div>

---

A full-featured, nostalgically-styled web companion application for your **Pokémon FireRed** and **Pokémon LeafGreen** adventures! Whether you are trying to find exactly where to catch that elusive Chansey, decipher whether your newly caught Pikachu has good IVs, or just want to chat with your very own interactive **Dexter**, this companion has you covered!

## ✨ Features

- **📺 Retro Game Boy Advance Aesthetics**: A lovingly crafted, CSS-driven UI that feels like you're holding a real GBA. 
- **🗺️ Interactive Route Map**: A full interactive map of Kanto. Click any route or city to see exactly what Pokémon spawn there, what levels they are, and your percentage chance of encountering them.
- **💯 Built-in IV Calculator**: Instantly calculate the potential Individual Values (IVs) of your Pokémon the moment you catch them to see if they're worth adding to your Hall of Fame team.
- **🤖 Dexter AI Integration**: Chat directly with Dexter! Powered by the Gemini AI, Dexter can answer your deepest gameplay questions. *Bonus: Add an ElevenLabs API key in the settings to hear Dexter speak in a retro text-to-speech voice!*
- **📖 Complete Kanto Pokédex**: Complete stats, typing, version exclusivity, evolution lines, and move-sets for all original 151 Pokémon.
- **💾 PC Box Storage**: Save your best catches to your local "PC Box" so you can keep track of their IVs and stats for your playthrough.

---

## 🚀 Getting Started

*"Your very own Pokémon legend is about to unfold! A world of dreams and adventures with Pokémon awaits! Let's go!"* 

### Prerequisites

To run this repository locally, you will need to have **Node.js** and **npm** installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elkninja/rby-companion.git
   cd rby-companion
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start your adventure!**
   Boot up the local development server:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173/` and prepare to catch 'em all!

---

## ⚙️ Configuration (Optional)

If you want to use the **Dexter AI** companion, you will need an API key from Google Gemini. 

1. Click on the Poké Ball icon in the bottom right corner of the application to open the AI chat.
2. Click the ⚙️ Settings gear icon in the Dexter header.
3. Enter your Gemini API key (and optionally, an ElevenLabs API key / Voice ID for audio generation).

> **🛡️ Privacy Notice:** All API keys are saved exclusively inside your browser's local storage. They are never transmitted to any third-party server besides Google/ElevenLabs directly. 

---

## 📜 License

This project is licensed under the **Apache 2.0 License**. See the `LICENSE` file for more details.

## ⚖️ Legal Disclaimer

Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK Inc.

This project is a non-profit fan-made tool created for educational and community purposes and is not affiliated with, endorsed, or sponsored by Nintendo or The Pokémon Company. 

All Pokémon statistics, locations, and sprite data are generously provided by [PokéAPI](https://pokeapi.co/).
