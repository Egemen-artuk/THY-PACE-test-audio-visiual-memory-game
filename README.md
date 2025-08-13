# Audio Visual Memory Game

A web-based memory game that tests players' ability to remember city announcements and their corridor assignments while avoiding restricted corridors.

## How to Play

1. **Select Difficulty**: Choose from Easy, Medium, or Hard difficulty levels
2. **Visual Phase**: Study the corridor layout and note which corridors are painted red (restricted)
3. **Audio Phase**: Listen to city and corridor announcements
4. **Answer Phase**: Select the cities you remember that were NOT announced for restricted corridors
5. **Results**: See your performance and continue to the next round

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

## Development

To run the game locally:

1. Place all files in a directory
2. Add .opus audio files to the `audio/` subdirectories
3. Serve the files through a local web server (due to CORS restrictions)
4. Open `index.html` in a modern web browser

The game will work without audio files but will log audio attempts to the console for testing purposes. 

