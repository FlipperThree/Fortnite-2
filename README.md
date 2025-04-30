# Fortnite Three.js

A simple Fortnite-like game built with Three.js, featuring building mechanics, weapons, and a 3D environment.

## Features

- 3D environment with trees and terrain
- Player movement with WASD keys
- Third-person camera controls
- Building system with different structure types
- Weapon system (pickaxe and pistol)
- Resource management
- Health system

## Controls

- **Movement**: WASD keys
- **Camera**: Mouse look
- **Building Mode**: Press 'B' to toggle
- **Switch Weapons**: 
  - '1' for pickaxe
  - '2' for pistol
- **Cycle Build Types**: Press 'Q'
- **Build/Shoot**: Left click

## Building Types

- Wall
- Floor
- Ramp

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:5173`

## Technologies Used

- Three.js for 3D rendering
- Vite for development and building
- JavaScript ES6+

## Development

The game is built using modern JavaScript and Three.js. The main game logic is contained in `main.js`, while the UI is handled through HTML and CSS.

### Project Structure

- `index.html` - Main HTML file
- `main.js` - Game logic and Three.js implementation
- `style.css` - UI styling
- `package.json` - Project dependencies and scripts

## Future Improvements

- Add multiplayer support
- Implement resource gathering
- Add more weapons and items
- Create a storm circle mechanic
- Add character customization
- Implement more detailed environment
- Add sound effects and music

## License

MIT License 