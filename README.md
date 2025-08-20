# 🎮 Audio Visual Memory Game

A web-based memory game that tests players' ability to remember city announcements and their corridor assignments while avoiding restricted corridors. Features a **global leaderboard system** powered by GitHub for worldwide competition!

## 🚀 Quick Start

### For Players
1. Visit the game website
2. Choose **"Exam"** mode to compete on the global leaderboard
3. Enter your name and complete all 12 rounds
4. See your score appear on the worldwide leaderboard!

### For Developers/Publishers
1. **Clone this repository**
2. **Run setup**: `npm run setup` (configures your GitHub repo)
3. **Push to GitHub** and enable Actions
4. **Deploy** to any static hosting platform
5. **Players worldwide** can now compete on your leaderboard!

## 🎯 How to Play

### Game Modes
- **🏆 Exam Mode**: 12 rounds (Easy→Medium→Hard) - compete globally!
- **📚 Practice Modes**: Easy, Medium, or Hard - practice individual difficulties

### Gameplay
1. **Visual Phase**: Study the corridor layout and note which corridors are red (restricted)
2. **Audio Phase**: Listen to city and corridor announcements
3. **Answer Phase**: Select cities you remember that were NOT on restricted corridors
4. **Results**: See your performance and continue to the next round

### 🏆 Leaderboard System
- **Global Competition**: All players see the same real-time leaderboard
- **Flawless Scoring**: Get 1 point for each perfect round (max 12 points)
- **Automatic Updates**: Scores update instantly via GitHub Actions
- **Persistent Storage**: Leaderboard stored in GitHub, accessible worldwide

## Difficulty Levels

### Easy (6 rounds)
- **Rounds 1-3**: 2 target cities + 1 restricted city
- **Rounds 4-6**: 3 target cities + 1 restricted city
- **Answer time**: 8 seconds

### Medium (6 rounds)
- **Rounds 1-3**: 4 target cities + 2 restricted cities
- **Rounds 4-6**: 5 target cities + 2 restricted cities
- **Answer time**: 15 seconds

### Hard (9 rounds)
- **Rounds 1-3**: 6 cities (1 corridor gets 2 cities, only first counts) + 2 restricted cities
- **Rounds 4-6**: 7 cities (2 corridors get 2 cities each, only first counts) + 2 restricted cities
- **Rounds 7-9**: 8 cities (same as rounds 4-6)
- **Answer time**: 25 seconds

## Audio File Setup

To enable audio functionality, you need to provide .opus audio files in the following structure:

```
audio/
├── cities/
│   ├── Amsterdam.opus
│   ├── Barcelona.opus
│   ├── Berlin.opus
│   ├── Brussels.opus
│   ├── Budapest.opus
│   ├── Copenhagen.opus
│   ├── Dublin.opus
│   ├── Edinburgh.opus
│   ├── Florence.opus
│   ├── Frankfurt.opus
│   ├── Geneva.opus
│   ├── Hamburg.opus
│   ├── Istanbul.opus
│   ├── Lisbon.opus
│   ├── London.opus
│   ├── Madrid.opus
│   ├── Manchester.opus
│   ├── Milan.opus
│   ├── Munich.opus
│   ├── Naples.opus
│   ├── Oslo.opus
│   ├── Paris.opus
│   ├── Prague.opus
│   ├── Rome.opus
│   ├── Stockholm.opus
│   ├── Vienna.opus
│   ├── Warsaw.opus
│   └── Zurich.opus
└── corridors/
    ├── corridor_1.opus
    ├── corridor_2.opus
    ├── corridor_3.opus
    ├── corridor_4.opus
    ├── corridor_5.opus
    ├── corridor_6.opus
    ├── corridor_7.opus
    ├── corridor_8.opus
    ├── corridor_9.opus
    └── corridor_10.opus
```

### Audio File Requirements

1. **City Files**: Named exactly as listed above with .opus extension
2. **Corridor Files**: Named as `corridor_X.opus` where X is the corridor number (1-10)
3. **Format**: .opus format for web compatibility
4. **Playback**: City audio plays first, immediately followed by corridor audio (no gap)

## Game Features

- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Clear corridor highlighting for restricted areas
- **Progress Tracking**: Round counter and phase indicators
- **Comprehensive Scoring**: Shows correct, missed, and incorrect answers
- **Random Generation**: Randomized city assignments and corridor restrictions each round

## Technical Implementation

- **HTML5**: Semantic structure with accessibility considerations
- **CSS3**: Modern styling with gradients and transitions
- **Vanilla JavaScript**: No external dependencies required
- **Audio API**: Uses HTML5 Audio API for .opus file playback

## Files

- `index.html`: Main game interface
- `styles.css`: All styling and responsive design
- `script.js`: Complete game logic and audio handling
- `audio/`: Directory for .opus audio files (to be populated)

## Browser Compatibility

- Modern browsers with .opus audio support
- HTML5 Audio API support required
- Local file serving recommended for development

## 🛠️ Setup & Development

### Initial Setup
1. **Clone the repository**
2. **Configure for your GitHub repo**:
   ```bash
   npm run setup
   ```
   This will prompt you for:
   - GitHub username
   - Repository name  
   - Your name (for package.json)

3. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure repository for leaderboard system"
   git push origin main
   ```

4. **Enable GitHub Actions**:
   - Go to your repository on GitHub
   - Click the "Actions" tab
   - Click "Enable Actions" if prompted

### Local Development
1. Place all files in a directory
2. Add .opus audio files to the `audio/` subdirectories
3. Serve files through a local web server (due to CORS restrictions)
4. Open `index.html` in a modern web browser

### 🌐 Deployment Options
- **Netlify**: Automatic deployment with `netlify.toml` config
- **Vercel**: Automatic deployment with `vercel.json` config  
- **GitHub Pages**: Enable in repository settings
- **Any static host**: Just upload all files

### 🏆 Leaderboard Architecture
- **GitHub Actions**: Automatically processes new scores
- **JSON Storage**: Leaderboard stored as `leaderboard.json` in repo
- **Real-time Updates**: Players see latest scores immediately
- **Global Access**: Anyone can view/refresh the leaderboard

The game will work without audio files but will log audio attempts to the console for testing purposes.

## 📁 File Structure
```
audio-visual-project/
├── 📂 .github/workflows/     # GitHub Actions for leaderboard
├── 📂 audio/                 # Audio files (.opus format)
├── 📂 leaderboard-submissions/ # Temporary score submissions
├── 📂 scripts/               # Leaderboard update scripts
├── 🎮 index.html             # Main game interface
├── 🎨 styles.css             # Game styling
├── ⚙️ script.js              # Game logic + leaderboard
├── 📊 leaderboard.json       # Global leaderboard data
├── 🚀 setup-repository.js    # Auto-configuration script
└── 📖 LEADERBOARD_SETUP.md   # Detailed setup guide
```

## 🎯 Key Features
- ✅ **Global Leaderboard** - Real-time worldwide competition
- ✅ **GitHub-Powered** - No server required, runs on GitHub
- ✅ **Automatic Updates** - Scores sync automatically  
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Audio Support** - Immersive .opus audio playback
- ✅ **Zero Dependencies** - Pure HTML/CSS/JavaScript
