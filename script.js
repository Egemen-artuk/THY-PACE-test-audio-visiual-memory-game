class AudioVisualMemoryGame {
    constructor() {
        this.currentDifficulty = null;
        this.currentRound = 1;
        this.gameState = 'difficulty'; // difficulty, visual, audio, answer, results
        this.restrictedCorridors = [];
        this.targetCities = [];
        this.allAnnouncedCities = [];
        this.cityCorridorMapping = {};
        this.playerAnswers = [];
        this.roundResults = {};
        this.timers = {};
        
        // Exam mode properties
        this.isExamMode = false;
        this.examProgress = {
            currentDifficulty: 'easy',
            difficultiesOrder: ['easy', 'medium', 'hard'],
            currentIndex: 0,
            totalScore: { correct: 0, missed: 0, incorrect: 0 }
        };
        
        // New exam structure: 12 rounds with progression 2-2-3-3-4-4-5-5-6-6-7-7
        this.examRoundConfig = [
            { targetCities: 2, restrictedCities: 1, difficulty: 'easy' },    // Round 1
            { targetCities: 2, restrictedCities: 1, difficulty: 'easy' },    // Round 2
            { targetCities: 3, restrictedCities: 1, difficulty: 'easy' },    // Round 3
            { targetCities: 3, restrictedCities: 1, difficulty: 'easy' },    // Round 4
            { targetCities: 4, restrictedCities: 2, difficulty: 'medium' },  // Round 5
            { targetCities: 4, restrictedCities: 2, difficulty: 'medium' },  // Round 6
            { targetCities: 5, restrictedCities: 2, difficulty: 'medium' },  // Round 7
            { targetCities: 5, restrictedCities: 2, difficulty: 'medium' },  // Round 8
            { targetCities: 6, restrictedCities: 3, difficulty: 'hard' },    // Round 9
            { targetCities: 6, restrictedCities: 3, difficulty: 'hard' },    // Round 10
            { targetCities: 7, restrictedCities: 3, difficulty: 'hard' },    // Round 11
            { targetCities: 7, restrictedCities: 3, difficulty: 'hard' }     // Round 12
        ];
        
        // Total sections for leaderboard (always 12 in exam mode)
        this.examTotalSections = 12;
        
        // Audio paths - will be populated when audio files are provided
        this.audioPaths = {
            cities: 'audio/cities/',
            corridors: 'audio/corridors/'
        };
        
        // Leaderboard system for exam mode
        this.leaderboard = [];
        this.currentPlayerName = '';
        this.examSectionScores = []; // Track flawless sections
        this.firebaseInitialized = false;
        this.db = null;
        
        // Initialize Firebase and load leaderboard
        this.initializeFirebaseAndLoadLeaderboard();
        
        // Available cities list (in exact order from cities.png reference image)
        this.availableCities = [
            // Row 1
            'Amsterdam', 'Bishkek', 'Houston', 'Milan', 'Singapore',
            // Row 2  
            'Ankara', 'Bologna', 'Kathmandu', 'Montreal', 'Stockholm',
            // Row 3
            'Ashgabat', 'Bombay', 'Kiev', 'Moscow', 'Stuttgart',
            // Row 4
            'Baghdad', 'Boston', 'Lagos', 'Munich', 'Sydney',
            // Row 5
            'Bahrain', 'Bremen', 'Lisbon', 'Paris', 'Tashkent',
            // Row 6
            'Baku', 'Budapest', 'London', 'Phuket', 'Tokyo',
            // Row 7
            'Bangkok', 'Dallas', 'Lyon', 'Porto', 'Toronto',
            // Row 8
            'Basel', 'Delhi', 'Madrid', 'Prague', 'Tunis',
            // Row 9
            'Batumi', 'Doha', 'Malaga', 'Riyadh', 'Valencia',
            // Row 10
            'Beirut', 'Dubai', 'Malta', 'Rotterdam', 'Venice',
            // Row 11
            'Belgrade', 'Dublin', 'Manchester', 'Salzburg', 'Vienna',
            // Row 12
            'Berlin', 'Hamburg', 'Melbourne', 'Santiago', 'Zagreb',
            // Row 13
            'Bilbao', 'Havana', 'Miami', 'Shanghai', 'Zurich'
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.showDifficultyScreen();
    }
    
    setupEventListeners() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id === 'leaderboard-btn') {
                    this.showLeaderboard();
                } else {
                    this.selectDifficulty(e.target.dataset.difficulty);
                }
            });
        });
        
        // Submit answer button
        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // Next round button
        document.getElementById('next-round').addEventListener('click', () => {
            this.nextRound();
        });
        
        // Restart game button
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Exit button functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('exit-btn')) {
                this.exitToMenu();
            }
        });
    }
    
    selectDifficulty(difficulty) {
        if (difficulty === 'exam') {
            this.startExamMode();
        } else {
            this.isExamMode = false;
            this.currentDifficulty = difficulty;
            this.currentRound = 1;
            
            // Clean up any leftover exam results before starting new game
            this.cleanupExamResults();
            
            document.getElementById('difficulty-display').textContent = `(${difficulty.toUpperCase()})`;
            this.showGameScreen();
            this.startRound();
        }
    }
    
    startExamMode() {
        // Prompt for player name first
        if (!this.promptPlayerName()) {
            // User cancelled, return to menu
            return;
        }
        
        this.isExamMode = true;
        this.examProgress = {
            currentDifficulty: 'easy',
            difficultiesOrder: ['easy', 'medium', 'hard'],
            currentIndex: 0,
            totalScore: { correct: 0, missed: 0, incorrect: 0 }
        };
        
        // Reset exam tracking
        this.examSectionScores = [];
        
        // Clean up any leftover exam results before starting new exam
        this.cleanupExamResults();
        
        // Start with Round 1
        this.currentDifficulty = 'easy';
        this.currentRound = 1;
        document.getElementById('difficulty-display').textContent = '(EXAM MODE - Round 1/12 - EASY)';
        this.showGameScreen();
        this.startRound();
    }
    
    showDifficultyScreen() {
        this.hideAllScreens();
        document.getElementById('difficulty-screen').classList.add('active');
        this.gameState = 'difficulty';
    }
    
    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
    }
    
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    startRound() {
        this.gameState = 'visual';
        this.updateRoundDisplay();
        this.updatePhaseIndicator('Visual Phase');
        this.resetCorridors();
        this.hideGamePhases();
        document.getElementById('corridor-container').style.display = 'block';
        
        // In exam mode, ensure submit button is hidden and update display
        if (this.isExamMode) {
            const submitBtn = document.getElementById('submit-answer');
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
            
            // Update difficulty display to show round progress
            const currentConfig = this.examRoundConfig[this.currentRound - 1];
            if (currentConfig) {
                document.getElementById('difficulty-display').textContent = `(EXAM MODE - Round ${this.currentRound}/12 - ${currentConfig.difficulty.toUpperCase()})`;
            }
        }
        
        // Generate round data
        this.generateRoundData();
        
        // Show restricted corridors
        this.showRestrictedCorridors();
        
        // Start visual phase timer (5 seconds)
        this.timers.visual = setTimeout(() => {
            this.startAudioPhase();
        }, 5000);
    }
    
    generateRoundData() {
        const config = this.getDifficultyConfig();
        this.restrictedCorridors = this.selectRandomCorridors(2); // Always 2 restricted corridors (red corridors)
        this.targetCities = [];
        this.allAnnouncedCities = [];
        this.cityCorridorMapping = {};
        this.usedCities = new Set(); // Track used cities to ensure uniqueness
        
        const availableCorridors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(
            c => !this.restrictedCorridors.includes(c)
        );
        
        // For hard mode special cases
        if (this.currentDifficulty === 'hard') {
            this.generateHardModeData(config, availableCorridors);
        } else {
            this.generateNormalModeData(config, availableCorridors);
        }
        
        // Add restricted cities (ensuring no city is used twice)
        const restrictedCities = this.selectUniqueCities(config.restrictedCities);
        restrictedCities.forEach(city => {
            const corridor = this.restrictedCorridors[Math.floor(Math.random() * this.restrictedCorridors.length)];
            this.cityCorridorMapping[city] = corridor;
            this.allAnnouncedCities.push(city);
        });
        
        // Apply corridor spacing rule for Hard difficulty, then shuffle
        if (this.currentDifficulty === 'hard') {
            this.allAnnouncedCities = this.applyCorridorSpacingRule(this.allAnnouncedCities);
        } else {
            // For Easy and Medium, simple shuffle is fine
            this.allAnnouncedCities = this.shuffleArray(this.allAnnouncedCities);
        }
    }
    
    generateHardModeData(config, availableCorridors) {
        const targetCorridors = this.selectRandomCorridors(config.targetCorridors, availableCorridors);
        const allTargetCities = this.selectUniqueCities(config.totalCities);
        let cityIndex = 0;
        
        // Assign cities to corridors
        if (config.doubleCorridors > 0) {
            // Some corridors get 2 cities, both should be memorized
            const doubleCorridors = targetCorridors.slice(0, config.doubleCorridors);
            const singleCorridors = targetCorridors.slice(config.doubleCorridors);
            
            doubleCorridors.forEach(corridor => {
                const city1 = allTargetCities[cityIndex++];
                const city2 = allTargetCities[cityIndex++];
                
                this.cityCorridorMapping[city1] = corridor;
                this.cityCorridorMapping[city2] = corridor;
                this.targetCities.push(city1, city2); // Both cities should be memorized
                this.allAnnouncedCities.push(city1, city2);
            });
            
            singleCorridors.forEach(corridor => {
                const city = allTargetCities[cityIndex++];
                this.cityCorridorMapping[city] = corridor;
                this.targetCities.push(city);
                this.allAnnouncedCities.push(city);
            });
        } else {
            // Regular assignment
            targetCorridors.forEach(corridor => {
                const city = allTargetCities[cityIndex++];
                this.cityCorridorMapping[city] = corridor;
                this.targetCities.push(city);
                this.allAnnouncedCities.push(city);
            });
        }
    }
    
    generateNormalModeData(config, availableCorridors) {
        const targetCorridors = this.selectRandomCorridors(config.targetCities, availableCorridors);
        const targetCitiesList = this.selectUniqueCities(config.targetCities);
        
        targetCorridors.forEach((corridor, index) => {
            const city = targetCitiesList[index];
            this.cityCorridorMapping[city] = corridor;
            this.targetCities.push(city);
            this.allAnnouncedCities.push(city);
        });
    }
    
    getDifficultyConfig() {
        // In exam mode, use the new 12-round structure
        if (this.isExamMode) {
            const examRound = this.examRoundConfig[this.currentRound - 1];
            if (examRound) {
                return {
                    targetCities: examRound.targetCities,
                    restrictedCities: examRound.restrictedCities
                };
            }
        }
        
        // Regular mode - use original difficulty-based configs
        const configs = {
            easy: {
                // Rounds 1-3: 3 cities mentioned, 2 to remember (1 restricted)
                1: { targetCities: 2, restrictedCities: 1 },
                2: { targetCities: 2, restrictedCities: 1 },
                3: { targetCities: 2, restrictedCities: 1 },
                // Rounds 4-6: 4 cities mentioned, 3 to remember (1 restricted)
                4: { targetCities: 3, restrictedCities: 1 },
                5: { targetCities: 3, restrictedCities: 1 },
                6: { targetCities: 3, restrictedCities: 1 }
            },
            medium: {
                // Rounds 1-3: 6 cities mentioned, 4 to remember (2 restricted)
                1: { targetCities: 4, restrictedCities: 2 },
                2: { targetCities: 4, restrictedCities: 2 },
                3: { targetCities: 4, restrictedCities: 2 },
                // Rounds 4-6: 7 cities mentioned, 5 to remember (2 restricted)
                4: { targetCities: 5, restrictedCities: 2 },
                5: { targetCities: 5, restrictedCities: 2 },
                6: { targetCities: 5, restrictedCities: 2 }
            },
            hard: {
                // Rounds 1-3: 9 cities mentioned, 6 to remember (3 on 2 restricted corridors)
                1: { totalCities: 6, targetCorridors: 5, doubleCorridors: 1, restrictedCities: 3 },
                2: { totalCities: 6, targetCorridors: 5, doubleCorridors: 1, restrictedCities: 3 },
                3: { totalCities: 6, targetCorridors: 5, doubleCorridors: 1, restrictedCities: 3 },
                // Rounds 4-6: 10 cities mentioned, 7 to remember (3 on 2 restricted corridors)
                4: { totalCities: 7, targetCorridors: 5, doubleCorridors: 2, restrictedCities: 3 },
                5: { totalCities: 7, targetCorridors: 5, doubleCorridors: 2, restrictedCities: 3 },
                6: { totalCities: 7, targetCorridors: 5, doubleCorridors: 2, restrictedCities: 3 }
            }
        };
        
        return configs[this.currentDifficulty][this.currentRound];
    }
    
    selectRandomCorridors(count, availableCorridors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const shuffled = this.shuffleArray([...availableCorridors]);
        return shuffled.slice(0, count);
    }
    
    selectRandomCities(count) {
        const shuffled = this.shuffleArray([...this.availableCities]);
        return shuffled.slice(0, count);
    }
    
    selectUniqueCities(count) {
        const availableCities = this.availableCities.filter(city => !this.usedCities.has(city));
        const shuffled = this.shuffleArray([...availableCities]);
        const selectedCities = shuffled.slice(0, count);
        
        // Mark these cities as used
        selectedCities.forEach(city => this.usedCities.add(city));
        
        return selectedCities;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    applyCorridorSpacingRule(cities) {
        // For Hard difficulty: ensure at least 4 different corridors before repeating any corridor
        // Each corridor can only repeat once maximum per round (max 2 times total per corridor)
        const corridorSequence = [];
        const cityPool = [...cities];
        const recentCorridors = []; // Track last 4 corridors used
        const corridorUsageCount = {}; // Track how many times each corridor has been used
        const maxAttempts = 1000; // Prevent infinite loops
        
        // Initialize corridor usage count
        cities.forEach(city => {
            const corridor = this.cityCorridorMapping[city];
            corridorUsageCount[corridor] = (corridorUsageCount[corridor] || 0);
        });
        
        while (cityPool.length > 0 && corridorSequence.length < maxAttempts) {
            let validCityFound = false;
            let attempts = 0;
            
            // Try to find a city whose corridor meets the spacing and repeat rules
            while (!validCityFound && attempts < cityPool.length * 2) {
                const randomIndex = Math.floor(Math.random() * cityPool.length);
                const city = cityPool[randomIndex];
                const corridor = this.cityCorridorMapping[city];
                
                // Check corridor repeat limit (max 2 times per corridor per round)
                if (corridorUsageCount[corridor] >= 2) {
                    attempts++;
                    continue;
                }
                
                // Check if this corridor is allowed 
                // Rule: Need at least 4 different corridors before any can repeat
                let isSpacingValid = false;
                
                if (corridorUsageCount[corridor] === 0) {
                    // First time using this corridor - always allowed
                    isSpacingValid = true;
                } else {
                    // This corridor has been used before - check if enough different corridors have been used
                    const uniqueCorridorsUsed = Object.keys(corridorUsageCount).filter(c => corridorUsageCount[c] > 0).length;
                    
                    if (uniqueCorridorsUsed >= 4) {
                        // We have used at least 4 different corridors, now check recent spacing
                        isSpacingValid = !recentCorridors.includes(corridor);
                    } else {
                        // Haven't used 4 different corridors yet, can't repeat any
                        isSpacingValid = false;
                    }
                }
                
                if (isSpacingValid) {
                    // This corridor is allowed
                    corridorSequence.push(city);
                    cityPool.splice(randomIndex, 1);
                    
                    // Update recent corridors list (keep only last 4)
                    recentCorridors.push(corridor);
                    if (recentCorridors.length > 4) {
                        recentCorridors.shift(); // Remove oldest
                    }
                    
                    // Update usage count
                    corridorUsageCount[corridor]++;
                    
                    validCityFound = true;
                } else {
                    attempts++;
                }
            }
            
            // If no valid city found with spacing rule, try to find one that just meets the repeat limit
            if (!validCityFound && cityPool.length > 0) {
                let fallbackFound = false;
                for (let i = 0; i < cityPool.length; i++) {
                    const city = cityPool[i];
                    const corridor = this.cityCorridorMapping[city];
                    
                    if (corridorUsageCount[corridor] < 2) {
                        corridorSequence.push(city);
                        cityPool.splice(i, 1);
                        
                        recentCorridors.push(corridor);
                        if (recentCorridors.length > 4) {
                            recentCorridors.shift();
                        }
                        
                        corridorUsageCount[corridor]++;
                        fallbackFound = true;
                        break;
                    }
                }
                
                if (!fallbackFound) {
                    console.log('Could not place remaining cities due to corridor constraints');
                    break;
                }
            }
        }
        
        console.log('Corridor spacing applied:', corridorSequence.map(city => 
            `${city} (C${this.cityCorridorMapping[city]})`
        ).join(' → '));
        
        // Debug: Show corridor usage summary
        const usageSummary = {};
        corridorSequence.forEach(city => {
            const corridor = this.cityCorridorMapping[city];
            usageSummary[corridor] = (usageSummary[corridor] || 0) + 1;
        });
        console.log('Corridor usage summary:', usageSummary);
        
        return corridorSequence;
    }
    
    showRestrictedCorridors() {
        this.restrictedCorridors.forEach(corridor => {
            const corridorElement = document.querySelector(`[data-corridor="${corridor}"]`);
            corridorElement.classList.add('restricted');
            // Show airplane icon
            const airplaneIcon = corridorElement.querySelector('.airplane-icon');
            if (airplaneIcon) {
                airplaneIcon.classList.remove('hidden');
            }
        });
    }
    
    resetCorridors() {
        document.querySelectorAll('.corridor-item').forEach(corridor => {
            corridor.classList.remove('restricted');
            // Hide airplane icons
            const airplaneIcon = corridor.querySelector('.airplane-icon');
            if (airplaneIcon) {
                airplaneIcon.classList.add('hidden');
            }
        });
    }
    
    startAudioPhase() {
        this.gameState = 'audio';
        this.updatePhaseIndicator('Audio Phase');
        this.hideGamePhases();
        
        // Show corridor display AND audio phase together
        document.getElementById('corridor-container').style.display = 'block';
        document.getElementById('audio-phase').classList.remove('hidden');
        
        // Reset corridors to normal (remove all visual indicators)
        this.resetCorridors();
        
        // Start playing announcements
        this.currentAnnouncementIndex = 0;
        this.playNextAnnouncement();
    }
    
    playNextAnnouncement() {
        if (this.currentAnnouncementIndex >= this.allAnnouncedCities.length) {
            this.startAnswerPhase();
            return;
        }
        
        const city = this.allAnnouncedCities[this.currentAnnouncementIndex];
        const corridor = this.cityCorridorMapping[city];
        
        // Update display - NO visual clues, only listening phase indicator
        document.getElementById('current-city').textContent = 'Listening...';
        document.getElementById('current-corridor-audio').textContent = 'Pay attention to the audio';
        
        // NO progress bar - no visual assistance at all
        
        // Play audio files - players must rely only on hearing
        this.playAudioSequence(city, corridor, () => {
            // Schedule next announcement after 1.5 seconds pause
            this.timers.audio = setTimeout(() => {
                this.playNextAnnouncement();
            }, 1500); // 1.5 second pause
        });
        
        this.currentAnnouncementIndex++;
    }
    
    playAudioSequence(city, corridor, onCompleteCallback) {
        // Play the city audio file followed by corridor audio file
        console.log(`Playing: ${city}.opus then corridor_${corridor}.opus`);
        
        const cityAudio = new Audio(`${this.audioPaths.cities}${city}.opus`);
        const corridorAudio = new Audio(`${this.audioPaths.corridors}corridor_${corridor}.opus`);
        
        // Play city audio first, then corridor audio immediately after
        cityAudio.play().then(() => {
            cityAudio.addEventListener('ended', () => {
                corridorAudio.play().then(() => {
                    // Call the callback when corridor audio finishes
                    corridorAudio.addEventListener('ended', () => {
                        if (onCompleteCallback) {
                            onCompleteCallback();
                        }
                    });
                }).catch(error => {
                    console.error('Corridor audio playback error:', error);
                    // Call callback even if corridor audio fails
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                });
            });
        }).catch(error => {
            console.error('City audio playback error:', error);
            // If city audio fails, still try to play corridor audio
            corridorAudio.play().then(() => {
                corridorAudio.addEventListener('ended', () => {
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                });
            }).catch(corridorError => {
                console.error('Corridor audio playback error:', corridorError);
                // Call callback even if both audios fail
                if (onCompleteCallback) {
                    onCompleteCallback();
                }
            });
        });
    }
    
    startAnswerPhase() {
        this.gameState = 'answer';
        this.updatePhaseIndicator('Answer Phase');
        this.hideGamePhases();
        document.getElementById('answer-phase').classList.remove('hidden');
        
        this.populateCitiesList();
        this.startAnswerTimer();
        
        // In exam mode, hide the submit button
        if (this.isExamMode) {
            const submitBtn = document.getElementById('submit-answer');
            submitBtn.style.display = 'none';
        }
    }
    
    populateCitiesList() {
        const citiesList = document.getElementById('cities-list');
        citiesList.innerHTML = '';
        
        // Create checkboxes for all available cities in grid format
        this.availableCities.forEach(city => {
            const cityOption = document.createElement('div');
            cityOption.className = 'city-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `city-${city}`;
            checkbox.value = city;
            
            const label = document.createElement('label');
            label.htmlFor = `city-${city}`;
            label.textContent = city;
            
            // Make entire city box clickable
            cityOption.addEventListener('click', (e) => {
                // Don't trigger if already disabled (results phase)
                if (checkbox.disabled) return;
                
                // Prevent double-click when clicking directly on checkbox
                if (e.target === checkbox) return;
                
                // Toggle checkbox when clicking anywhere in the box
                checkbox.checked = !checkbox.checked;
            });
            
            cityOption.appendChild(checkbox);
            cityOption.appendChild(label);
            citiesList.appendChild(cityOption);
        });
        
        // In exam mode, ensure submit button is hidden
        if (this.isExamMode) {
            const submitBtn = document.getElementById('submit-answer');
            if (submitBtn) {
                submitBtn.style.display = 'none';
            }
        }
    }
    
    startAnswerTimer() {
        const timeLimit = this.getTimeLimit();
        let timeLeft = timeLimit;
        
        // Hide the timer display - no countdown shown to player
        const timerElement = document.getElementById('answer-timer');
        timerElement.style.display = 'none';
        
        // Timer still runs in background but invisible to player
        this.timers.answer = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(this.timers.answer);
                this.submitAnswer();
            }
        }, 1000);
    }
    
    getTimeLimit() {
        // Dynamic timing: 4 seconds per target city that needs to be selected
        const targetCitiesToSelect = this.getTargetCitiesToSelect();
        const timeLimit = targetCitiesToSelect * 4; // 4 seconds per city
        
        console.log(`Dynamic timing: ${targetCitiesToSelect} cities to select = ${timeLimit} seconds`);
        return timeLimit;
    }
    
    getTargetCitiesToSelect() {
        // Calculate how many cities the player needs to select (target cities NOT on restricted corridors)
        if (!this.targetCities || !this.cityCorridorMapping || !this.restrictedCorridors) {
            // Fallback during initialization
            return 2;
        }
        
        // Cities that should be memorized (target cities that are NOT on restricted corridors)
        const citiesToMemorize = this.targetCities.filter(city => 
            !this.restrictedCorridors.includes(this.cityCorridorMapping[city])
        );
        
        return Math.max(citiesToMemorize.length, 1); // Minimum 1 city (4 seconds)
    }
    
    submitAnswer() {
        clearInterval(this.timers.answer);
        
        // Collect selected cities
        this.playerAnswers = [];
        document.querySelectorAll('#cities-list input[type="checkbox"]:checked').forEach(checkbox => {
            this.playerAnswers.push(checkbox.value);
        });
        
        this.calculateResults();
        this.showResults();
    }
    
    calculateResults() {
        this.roundResults = {
            correct: [],
            missed: [],
            incorrect: []
        };
        
        // Get cities that are on restricted corridors (red corridors)
        const restrictedCities = this.allAnnouncedCities.filter(city => 
            this.restrictedCorridors.includes(this.cityCorridorMapping[city])
        );
        
        // Cities that should be memorized (target cities that are NOT on restricted corridors)
        const citiesToMemorize = this.targetCities.filter(city => 
            !this.restrictedCorridors.includes(this.cityCorridorMapping[city])
        );
        
        // Check each city that should be memorized
        citiesToMemorize.forEach(city => {
            if (this.playerAnswers.includes(city)) {
                this.roundResults.correct.push(city);
            } else {
                this.roundResults.missed.push(city);
            }
        });
        
        // Check for incorrect answers
        this.playerAnswers.forEach(city => {
            // Incorrect if:
            // 1. City is not in the cities to memorize list, OR
            // 2. City is on a restricted corridor (should be eliminated)
            if (!citiesToMemorize.includes(city)) {
                this.roundResults.incorrect.push(city);
            }
        });
    }
    
    showResults() {
        this.gameState = 'results';
        this.updatePhaseIndicator('Results');
        
        // Keep the cities interface visible but disable interaction
        const citiesList = document.getElementById('cities-list');
        const submitBtn = document.getElementById('submit-answer');
        
        // Disable submit button
        submitBtn.textContent = 'See Results Above';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        
        // Update city checkboxes to show results
        this.availableCities.forEach(city => {
            const checkbox = document.getElementById(`city-${city}`);
            const cityOption = checkbox.closest('.city-option');
            
            // Reset styles first
            cityOption.classList.remove('result-correct', 'result-missed', 'result-incorrect');
            
            if (this.roundResults.correct.includes(city)) {
                cityOption.classList.add('result-correct');
                checkbox.checked = true;
                checkbox.disabled = true;
            } else if (this.roundResults.missed.includes(city)) {
                cityOption.classList.add('result-missed');
                checkbox.checked = false;
                checkbox.disabled = true;
            } else if (this.roundResults.incorrect.includes(city)) {
                cityOption.classList.add('result-incorrect');
                checkbox.checked = true;
                checkbox.disabled = true;
            } else {
                // City not involved in this round
                checkbox.checked = false;
                checkbox.disabled = true;
                cityOption.style.opacity = '0.4';
            }
        });
        
        // In exam mode, auto-advance after showing results
        if (this.isExamMode) {
            this.startExamRoundTransition();
        } else {
            // Show next round button for regular mode
            this.showNextRoundButton();
        }
    }
    
    showNextRoundButton() {
        // Create or update next round button
        let nextRoundContainer = document.getElementById('next-round-container');
        if (!nextRoundContainer) {
            nextRoundContainer = document.createElement('div');
            nextRoundContainer.id = 'next-round-container';
            nextRoundContainer.className = 'next-round-container';
            document.querySelector('.cities-interface').appendChild(nextRoundContainer);
        }
        
        const maxRounds = this.getMaxRounds();
        nextRoundContainer.innerHTML = `
            <div class="results-summary">
                <span class="correct-count">✓ ${this.roundResults.correct.length} Correct</span>
                <span class="missed-count">? ${this.roundResults.missed.length} Missed</span>
                <span class="incorrect-count">✗ ${this.roundResults.incorrect.length} Incorrect</span>
            </div>
            <div class="round-actions">
                <button id="next-round-btn" class="action-btn">
                    ${this.currentRound >= maxRounds ? 'Game Complete - Restart' : 'Next Round'}
                </button>
                <button id="restart-game-btn" class="action-btn secondary">Restart Game</button>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('next-round-btn').addEventListener('click', () => {
            if (this.currentRound >= maxRounds) {
                this.restartGame();
            } else {
                this.nextRound();
            }
        });
        
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startExamRoundTransition() {
        // Phase 1: 5 seconds to review results (hidden timer)
        this.timers.examReview = setTimeout(() => {
            this.showExamCountdown();
        }, 5000);
    }
    
    showExamCountdown() {
        // Hide all game elements and show only countdown
        this.hideAllScreens();
        
        // Create countdown screen
        let countdownScreen = document.getElementById('countdown-screen');
        if (!countdownScreen) {
            countdownScreen = document.createElement('div');
            countdownScreen.id = 'countdown-screen';
            countdownScreen.className = 'screen';
            document.getElementById('app').appendChild(countdownScreen);
        }
        
        countdownScreen.classList.add('active');
        
        // Start 3-second countdown
        let countdown = 3;
        this.updateCountdownDisplay(countdownScreen, countdown);
        
        this.timers.countdown = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                this.updateCountdownDisplay(countdownScreen, countdown);
            } else {
                clearInterval(this.timers.countdown);
                this.advanceExamRound();
            }
        }, 1000);
    }
    
    updateCountdownDisplay(countdownScreen, count) {
        countdownScreen.innerHTML = `
            <div class="countdown-container">
                <div class="countdown-number">${count}</div>
                <div class="countdown-text">Next Round Starting...</div>
            </div>
        `;
    }
    
    advanceExamRound() {
        // Remove countdown screen
        const countdownScreen = document.getElementById('countdown-screen');
        if (countdownScreen) {
            countdownScreen.remove();
        }
        
        // Ensure game screen is visible
        this.showGameScreen();
        
        // Advance to next round automatically
        this.nextRound();
    }
    
    getMaxRounds() {
        // In exam mode, return 12 rounds
        if (this.isExamMode) {
            return 12;
        }
        
        // Regular mode - use original difficulty-based configs
        const maxRounds = {
            easy: 6,
            medium: 6,
            hard: 6
        };
        return maxRounds[this.currentDifficulty];
    }
    
    nextRound() {
        const maxRounds = this.getMaxRounds();
        
        if (this.isExamMode) {
            // Track section score for leaderboard (1 point for flawless section)
            this.trackSectionScore();
            
            // Add current round results to total score
            this.examProgress.totalScore.correct += this.roundResults.correct.length;
            this.examProgress.totalScore.missed += this.roundResults.missed.length;
            this.examProgress.totalScore.incorrect += this.roundResults.incorrect.length;
            
            if (this.currentRound >= maxRounds) {
                // Exam complete - show final results
                this.showExamResults();
                return;
            } else {
                // Continue with next round
                this.currentRound++;
                this.clearTimers();
                this.resetCitiesInterface();
                this.startRound();
            }
        } else {
            // Regular mode
            if (this.currentRound >= maxRounds) {
                this.restartGame();
                return;
            }
            
            this.currentRound++;
            this.clearTimers();
            this.resetCitiesInterface();
            this.startRound();
        }
    }
    

    

    

    
    showExamResults() {
        this.gameState = 'exam-complete';
        this.updatePhaseIndicator('Exam Complete');
        
        // Track the final section score
        this.trackSectionScore();
        
        // Calculate final leaderboard score and add to leaderboard
        const finalScore = this.calculateFinalExamScore();
        const playerRank = this.addToLeaderboard(this.currentPlayerName, finalScore);
        
        // Show final exam results briefly before redirecting to leaderboard
        const nextRoundContainer = document.getElementById('next-round-container');
        if (nextRoundContainer) {
            nextRoundContainer.remove();
        }
        
        // Check if this was an improvement
        const existingPlayerIndex = this.leaderboard.findIndex(existing => 
            existing.name.toLowerCase().trim() === this.currentPlayerName.toLowerCase().trim()
        );
        const isImprovement = existingPlayerIndex !== -1 && this.leaderboard[existingPlayerIndex].score < finalScore;
        
        const newContainer = document.createElement('div');
        newContainer.className = 'exam-results-container';
        newContainer.innerHTML = `
            <div class="exam-complete">
                <h2>🎓 EXAM COMPLETED</h2>
                <div class="exam-summary">
                    <div class="exam-score">
                        <div class="score-item correct">✓ ${this.examProgress.totalScore.correct} Correct</div>
                        <div class="score-item missed">? ${this.examProgress.totalScore.missed} Missed</div>
                        <div class="score-item incorrect">✗ ${this.examProgress.totalScore.incorrect} Incorrect</div>
                    </div>
                    <div class="leaderboard-score">
                        <div class="grade-text">Leaderboard Score: ${finalScore}/${this.examTotalSections} Flawless Sections</div>
                        <div class="grade-text">Your Rank: #${playerRank}</div>
                        ${isImprovement ? '<div class="improvement-text">🎉 New Personal Best!</div>' : ''}
                    </div>
                </div>
                <div class="redirect-message">
                    Redirecting to leaderboard in 3 seconds...
                </div>
            </div>
        `;
        
        document.querySelector('.cities-interface').appendChild(newContainer);
        
        // Redirect to leaderboard after 3 seconds
        setTimeout(() => {
            this.showLeaderboard(playerRank);
        }, 3000);
    }
    
    resetCitiesInterface() {
        // Reset all city options to normal state (only if they exist)
        this.availableCities.forEach(city => {
            const checkbox = document.getElementById(`city-${city}`);
            if (checkbox) {
                const cityOption = checkbox.closest('.city-option');
                if (cityOption) {
                    checkbox.checked = false;
                    checkbox.disabled = false;
                    cityOption.classList.remove('result-correct', 'result-missed', 'result-incorrect');
                    cityOption.style.opacity = '1';
                }
            }
        });
        
        // Reset submit button
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Answer';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            
            // In exam mode, keep submit button hidden
            if (this.isExamMode) {
                submitBtn.style.display = 'none';
            } else {
                submitBtn.style.display = 'inline-block';
            }
        }
        
        // Remove next round container
        const nextRoundContainer = document.getElementById('next-round-container');
        if (nextRoundContainer) {
            nextRoundContainer.remove();
        }
        
        // Remove exam results container (fixes bug where exam completion screen persists in other modes)
        const examResultsContainer = document.querySelector('.exam-results-container');
        if (examResultsContainer) {
            examResultsContainer.remove();
        }
    }
    
    cleanupExamResults() {
        // Remove any leftover exam results containers
        const examResultsContainer = document.querySelector('.exam-results-container');
        if (examResultsContainer) {
            examResultsContainer.remove();
        }
    }
    
    exitToMenu() {
        // Clear any running timers
        this.clearTimers();
        
        // Reset game state
        this.currentDifficulty = null;
        this.currentRound = 1;
        this.isExamMode = false;
        this.gameState = 'difficulty';
        
        // Reset exam progress
        this.examProgress = {
            currentDifficulty: 'easy',
            difficultiesOrder: ['easy', 'medium', 'hard'],
            currentIndex: 0,
            totalScore: { correct: 0, missed: 0, incorrect: 0 }
        };
        
        // Reset leaderboard tracking
        this.currentPlayerName = '';
        this.examSectionScores = [];
        
        // Clean up any leftover exam results UI
        this.cleanupExamResults();
        
        // Return to difficulty selection screen
        this.showDifficultyScreen();
    }
    
    restartGame() {
        this.exitToMenu();
    }
    
    clearTimers() {
        Object.values(this.timers).forEach(timer => {
            if (timer) {
                clearTimeout(timer);
                clearInterval(timer);
            }
        });
        this.timers = {};
    }
    
    hideGamePhases() {
        document.getElementById('corridor-container').style.display = 'none';
        document.getElementById('audio-phase').classList.add('hidden');
        document.getElementById('answer-phase').classList.add('hidden');
        document.getElementById('results-phase').classList.add('hidden');
    }
    
    updateRoundDisplay() {
        document.getElementById('current-round').textContent = `Round ${this.currentRound}`;
    }
    
    updatePhaseIndicator(phase) {
        document.getElementById('phase-indicator').textContent = phase;
    }
    
    // Firebase and Leaderboard Management Methods
    async initializeFirebaseAndLoadLeaderboard() {
        try {
            if (typeof window.initializeFirebase === 'function') {
                const firebaseApp = await window.initializeFirebase();
                this.db = firebaseApp.db;
                this.firebaseInitialized = true;
                console.log('Firebase initialized successfully');
                
                // Load leaderboard from Firebase
                await this.loadLeaderboardFromFirebase();
            } else {
                console.log('Firebase not available, falling back to local storage');
                this.loadLeaderboardFromLocal();
            }
        } catch (error) {
            console.error('Firebase initialization failed, using local storage:', error);
            this.firebaseInitialized = false;
            this.loadLeaderboardFromLocal();
        }
    }
    
    async loadLeaderboardFromFirebase() {
        if (!this.firebaseInitialized || !this.db) {
            this.loadLeaderboardFromLocal();
            return;
        }
        
        try {
            // Import Firestore functions
            const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Get leaderboard data from Firestore
            const leaderboardRef = collection(this.db, 'leaderboard');
            const q = query(leaderboardRef, orderBy('score', 'desc'), orderBy('timestamp', 'asc'), limit(100));
            const querySnapshot = await getDocs(q);
            
            this.leaderboard = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                this.leaderboard.push({
                    id: doc.id,
                    name: data.name,
                    score: data.score,
                    date: data.date,
                    totalSections: data.totalSections,
                    timestamp: data.timestamp
                });
            });
            
            console.log('Leaderboard loaded from Firebase:', this.leaderboard.length, 'entries');
            
            // Also save to local storage as backup
            this.saveLeaderboardToLocal();
            
        } catch (error) {
            console.error('Failed to load leaderboard from Firebase:', error);
            // Fallback to local storage
            this.loadLeaderboardFromLocal();
        }
    }
    
    loadLeaderboardFromLocal() {
        const saved = localStorage.getItem('audioVisualGameLeaderboard');
        this.leaderboard = saved ? JSON.parse(saved) : [];
        console.log('Leaderboard loaded from local storage:', this.leaderboard.length, 'entries');
    }
    
    saveLeaderboardToLocal() {
        localStorage.setItem('audioVisualGameLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    promptPlayerName() {
        let name = '';
        while (!name || name.trim().length === 0) {
            name = prompt('Enter your name + first 3 letters of surname:\n(Example: John Smi, Sarah Joh, Mike And)');
            if (name === null) {
                // User cancelled, return to menu
                return false;
            }
            name = name.trim();
            
            // Validate format (should have at least 4 characters and a space)
            if (name.length < 4) {
                alert('Please enter at least your first name + 3 letters of surname\n(Example: John Smi)');
                name = '';
                continue;
            }
            
            if (!name.includes(' ')) {
                alert('Please include a space and your surname letters\n(Example: John Smi, not JohnSmi)');
                name = '';
                continue;
            }
            
            if (name.length > 20) {
                alert('Name must be 20 characters or less');
                name = '';
                continue;
            }
            
            // Check if this name already exists on the leaderboard
            const existingPlayer = this.leaderboard.find(entry => 
                entry.name.toLowerCase().trim() === name.toLowerCase().trim()
            );
            
            if (existingPlayer) {
                // Show their actual score for confirmation
                const isReturningPlayer = confirm(
                    `"${existingPlayer.name}" already exists on the leaderboard.\n\n` +
                    `🏆 Current best score: ${existingPlayer.score}/${existingPlayer.totalSections} flawless sections\n` +
                    `📅 Achieved on: ${existingPlayer.date}\n\n` +
                    `Is this your account?\n\n` +
                    `• Click OK if this is your score (you can try to improve it)\n` +
                    `• Click Cancel if this is NOT you (choose a different name)`
                );
                
                if (!isReturningPlayer) {
                    // They say it's not them - ask for different name
                    alert('Please enter a different name to avoid confusion.\n\nTry adding middle initial or different surname letters\n(Example: John A Smi, John Smy)');
                    name = ''; // Reset to ask again
                    continue;
                }
                // If they clicked OK, proceed with the existing name
            }
        }
        this.currentPlayerName = name;
        return true;
    }
    
    generateNameSuggestions(baseName) {
        const suggestions = [];
        const cleanName = baseName.trim();
        
        // Suggestion 1: Add numbers
        for (let i = 2; i <= 5; i++) {
            const suggestion = `${cleanName}${i}`;
            if (!this.leaderboard.some(entry => 
                entry.name.toLowerCase() === suggestion.toLowerCase())) {
                suggestions.push(suggestion);
                break;
            }
        }
        
        // Suggestion 2: Add common initials
        const initials = ['A', 'B', 'C', 'D', 'E', 'J', 'M', 'S'];
        for (const initial of initials) {
            const suggestion = `${cleanName} ${initial}`;
            if (suggestion.length <= 20 && !this.leaderboard.some(entry => 
                entry.name.toLowerCase() === suggestion.toLowerCase())) {
                suggestions.push(suggestion);
                if (suggestions.length >= 3) break;
            }
        }
        
        return suggestions.slice(0, 3); // Max 3 suggestions
    }
    
    trackSectionScore() {
        // Calculate if this section was flawless (no missed or incorrect answers)
        const isFlawless = this.roundResults.missed.length === 0 && this.roundResults.incorrect.length === 0;
        this.examSectionScores.push(isFlawless ? 1 : 0);
        
        console.log(`Section ${this.examSectionScores.length}: ${isFlawless ? 'Flawless' : 'Has errors'}`);
    }
    
    calculateFinalExamScore() {
        return this.examSectionScores.reduce((total, score) => total + score, 0);
    }
    
    async addToLeaderboard(playerName, score) {
        const entry = {
            name: playerName,
            score: score,
            date: new Date().toLocaleDateString(),
            totalSections: this.examTotalSections,
            timestamp: Date.now()
        };
        
        try {
            // First, try to submit to Firebase
            const firebaseSuccess = await this.submitScoreToFirebase(entry);
            
            if (firebaseSuccess) {
                // If Firebase submission was successful, reload the leaderboard to get updated rankings
                await this.loadLeaderboardFromFirebase();
            } else {
                // Fallback to local storage if Firebase fails
                this.addToLocalLeaderboard(entry);
            }
        } catch (error) {
            console.error('Error adding to leaderboard:', error);
            // Fallback to local storage
            this.addToLocalLeaderboard(entry);
        }
        
        // Return the player's current rank
        return this.leaderboard.findIndex(existing => 
            existing.name.toLowerCase().trim() === playerName.toLowerCase().trim()
        ) + 1;
    }
    
    addToLocalLeaderboard(entry) {
        // Check if player already exists (case-insensitive)
        const existingIndex = this.leaderboard.findIndex(existing => 
            existing.name.toLowerCase().trim() === entry.name.toLowerCase().trim()
        );
        
        if (existingIndex === -1) {
            // New player - add to leaderboard
            this.leaderboard.push(entry);
        } else {
            // Player exists - only update if new score is better
            if (entry.score > this.leaderboard[existingIndex].score) {
                this.leaderboard[existingIndex] = entry;
                console.log(`${entry.name} improved their score: ${this.leaderboard[existingIndex].score} → ${entry.score}`);
            } else {
                console.log(`${entry.name} didn't improve their best score of ${this.leaderboard[existingIndex].score}`);
            }
        }
        
        // Sort by score descending, then by date for tie-breaking
        this.leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Higher score first
            }
            return new Date(a.date) - new Date(b.date); // Earlier date first for same score
        });
        
        this.saveLeaderboardToLocal();
    }
    
    async submitScoreToFirebase(entry) {
        if (!this.firebaseInitialized || !this.db) {
            console.log('Firebase not available, using local storage');
            return false;
        }
        
        try {
            // Import Firestore functions
            const { collection, doc, setDoc, getDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Create a unique document ID based on player name (normalized)
            const playerId = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const playerDocRef = doc(this.db, 'leaderboard', playerId);
            
            // Check if player already exists
            const existingDoc = await getDoc(playerDocRef);
            
            if (existingDoc.exists()) {
                const existingData = existingDoc.data();
                if (entry.score <= existingData.score) {
                    console.log(`${entry.name} didn't improve their best score of ${existingData.score}`);
                    return true; // Return true because Firebase is working, just no update needed
                }
                console.log(`${entry.name} improved their score: ${existingData.score} → ${entry.score}`);
            }
            
            // Add server timestamp for better sorting
            const firestoreEntry = {
                ...entry,
                timestamp: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            // Save to Firestore (this will overwrite if player exists)
            await setDoc(playerDocRef, firestoreEntry);
            
            console.log('Score successfully submitted to Firebase:', entry);
            return true;
            
        } catch (error) {
            console.error('Failed to submit score to Firebase:', error);
            return false;
        }
    }
    
    showLeaderboard(playerRank = null) {
        this.hideAllScreens();
        
        // Create leaderboard screen if it doesn't exist
        let leaderboardScreen = document.getElementById('leaderboard-screen');
        if (!leaderboardScreen) {
            leaderboardScreen = document.createElement('div');
            leaderboardScreen.id = 'leaderboard-screen';
            leaderboardScreen.className = 'screen';
            document.getElementById('app').appendChild(leaderboardScreen);
        }
        
        leaderboardScreen.classList.add('active');
        
        const top10 = this.leaderboard.slice(0, 10);
        const currentPlayerEntry = playerRank ? this.leaderboard[playerRank - 1] : null;
        
        leaderboardScreen.innerHTML = `
            <div class="leaderboard-container">
                <h1>🏆 LEADERBOARD</h1>
                <div class="leaderboard-subtitle">Top Exam Performers</div>
                <div class="leaderboard-info">
                    <span class="connection-status ${this.firebaseInitialized ? 'connected' : 'offline'}">
                        ${this.firebaseInitialized ? '🟢 Live Leaderboard' : '🔴 Offline Mode'}
                    </span>
                    <span class="last-updated">Updated: ${new Date().toLocaleString()}</span>
                    <button id="refresh-leaderboard-btn" class="refresh-btn">🔄 Refresh</button>
                </div>
                
                <div class="leaderboard-list">
                    ${top10.map((entry, index) => `
                        <div class="leaderboard-entry ${currentPlayerEntry && entry.name === currentPlayerEntry.name && entry.score === currentPlayerEntry.score ? 'current-player' : ''}">
                            <div class="rank">#${index + 1}</div>
                            <div class="player-info">
                                <div class="player-name">${entry.name}</div>
                                <div class="player-date">${entry.date}</div>
                            </div>
                            <div class="player-score">${entry.score}/${entry.totalSections}</div>
                        </div>
                    `).join('')}
                    
                    ${this.leaderboard.length === 0 ? '<div class="no-scores">No scores yet. Be the first to complete the exam!</div>' : ''}
                </div>
                
                ${playerRank && playerRank > 10 ? `
                    <div class="player-rank-section">
                        <h3>Your Ranking</h3>
                        <div class="leaderboard-entry current-player">
                            <div class="rank">#${playerRank}</div>
                            <div class="player-info">
                                <div class="player-name">${currentPlayerEntry.name}</div>
                                <div class="player-date">${currentPlayerEntry.date}</div>
                            </div>
                            <div class="player-score">${currentPlayerEntry.score}/${currentPlayerEntry.totalSections}</div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="leaderboard-actions">
                    <button id="take-exam-btn" class="action-btn">Take Exam</button>
                    <button id="back-to-menu-btn" class="action-btn secondary">Back to Menu</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('take-exam-btn').addEventListener('click', () => {
            this.selectDifficulty('exam');
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showDifficultyScreen();
        });
        
        document.getElementById('refresh-leaderboard-btn').addEventListener('click', async () => {
            // Show loading state
            const refreshBtn = document.getElementById('refresh-leaderboard-btn');
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '🔄 Loading...';
            refreshBtn.disabled = true;
            
            try {
                if (this.firebaseInitialized) {
                    await this.loadLeaderboardFromFirebase();
                } else {
                    // Try to reinitialize Firebase if it wasn't available before
                    await this.initializeFirebaseAndLoadLeaderboard();
                }
                this.showLeaderboard(playerRank);
            } catch (error) {
                console.error('Failed to refresh leaderboard:', error);
                // Show error message briefly
                refreshBtn.innerHTML = '❌ Error';
                setTimeout(() => {
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                }, 2000);
                return;
            }
            
            // Reset button state
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AudioVisualMemoryGame();
});
