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
        
        // Audio paths - will be populated when audio files are provided
        this.audioPaths = {
            cities: 'audio/cities/',
            corridors: 'audio/corridors/'
        };
        
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
                this.selectDifficulty(e.target.dataset.difficulty);
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
            document.getElementById('difficulty-display').textContent = `(${difficulty.toUpperCase()})`;
            this.showGameScreen();
            this.startRound();
        }
    }
    
    startExamMode() {
        this.isExamMode = true;
        this.examProgress = {
            currentDifficulty: 'easy',
            difficultiesOrder: ['easy', 'medium', 'hard'],
            currentIndex: 0,
            totalScore: { correct: 0, missed: 0, incorrect: 0 }
        };
        
        // Start with Easy difficulty
        this.currentDifficulty = 'easy';
        this.currentRound = 1;
        document.getElementById('difficulty-display').textContent = '(EXAM MODE - EASY)';
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
                6: { totalCities: 7, targetCorridors: 5, doubleCorridors: 2, restrictedCities: 3 },
                // Rounds 7-9: 11 cities mentioned, 8 to remember (3 on 2 restricted corridors)
                7: { totalCities: 8, targetCorridors: 6, doubleCorridors: 2, restrictedCities: 3 },
                8: { totalCities: 8, targetCorridors: 6, doubleCorridors: 2, restrictedCities: 3 },
                9: { totalCities: 8, targetCorridors: 6, doubleCorridors: 2, restrictedCities: 3 }
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
        ).join(' â†’ '));
        
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
        const timeLimits = {
            easy: 8,
            medium: 15,
            hard: 25
        };
        return timeLimits[this.currentDifficulty];
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
        
        // Show next round button
        this.showNextRoundButton();
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
                <span class="correct-count">✓“ ${this.roundResults.correct.length} Correct</span>
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
    
    getMaxRounds() {
        const maxRounds = {
            easy: 6,
            medium: 6,
            hard: 9
        };
        return maxRounds[this.currentDifficulty];
    }
    
    nextRound() {
        const maxRounds = this.getMaxRounds();
        
        if (this.isExamMode) {
            // Add current round results to total score
            this.examProgress.totalScore.correct += this.roundResults.correct.length;
            this.examProgress.totalScore.missed += this.roundResults.missed.length;
            this.examProgress.totalScore.incorrect += this.roundResults.incorrect.length;
            
            if (this.currentRound >= maxRounds) {
                // Move to next difficulty or finish exam
                this.progressExamDifficulty();
                return;
            } else {
                // Continue with next round in current difficulty
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
    
    progressExamDifficulty() {
        this.examProgress.currentIndex++;
        
        if (this.examProgress.currentIndex >= this.examProgress.difficultiesOrder.length) {
            // Exam complete - show final results
            this.showExamResults();
            return;
        }
        
        // Move to next difficulty
        const nextDifficulty = this.examProgress.difficultiesOrder[this.examProgress.currentIndex];
        this.currentDifficulty = nextDifficulty;
        this.currentRound = 1;
        
        document.getElementById('difficulty-display').textContent = `(EXAM MODE - ${nextDifficulty.toUpperCase()})`;
        
        this.clearTimers();
        this.resetCitiesInterface();
        this.startRound();
    }
    
    showExamResults() {
        this.gameState = 'exam-complete';
        this.updatePhaseIndicator('Exam Complete');
        
        // Show final exam results
        const nextRoundContainer = document.getElementById('next-round-container');
        if (nextRoundContainer) {
            nextRoundContainer.remove();
        }
        
        const newContainer = document.createElement('div');
        newContainer.className = 'exam-results-container';
        newContainer.innerHTML = `
            <div class="exam-complete">
                <h2>ğŸ“ EXAM COMPLETED</h2>
                <div class="exam-summary">
                    <div class="exam-score">
                        <div class="score-item correct">âœ“ ${this.examProgress.totalScore.correct} Correct</div>
                        <div class="score-item missed">? ${this.examProgress.totalScore.missed} Missed</div>
                        <div class="score-item incorrect">âœ— ${this.examProgress.totalScore.incorrect} Incorrect</div>
                    </div>
                    <div class="exam-grade">
                        <div class="grade-text">Total Score: ${this.examProgress.totalScore.correct}/${this.examProgress.totalScore.correct + this.examProgress.totalScore.missed}</div>
                        <div class="grade-percentage">${Math.round((this.examProgress.totalScore.correct / (this.examProgress.totalScore.correct + this.examProgress.totalScore.missed)) * 100)}%</div>
                    </div>
                </div>
                <div class="exam-actions">
                    <button id="retake-exam-btn" class="action-btn">Retake Exam</button>
                    <button id="back-to-menu-btn" class="action-btn secondary">Back to Menu</button>
                </div>
            </div>
        `;
        
        document.querySelector('.cities-interface').appendChild(newContainer);
        
        // Add event listeners
        document.getElementById('retake-exam-btn').addEventListener('click', () => {
            this.startExamMode();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    resetCitiesInterface() {
        // Reset all city options to normal state
        this.availableCities.forEach(city => {
            const checkbox = document.getElementById(`city-${city}`);
            const cityOption = checkbox.closest('.city-option');
            
            if (checkbox && cityOption) {
                checkbox.checked = false;
                checkbox.disabled = false;
                cityOption.classList.remove('result-correct', 'result-missed', 'result-incorrect');
                cityOption.style.opacity = '1';
            }
        });
        
        // Reset submit button
        const submitBtn = document.getElementById('submit-answer');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Answer';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
        
        // Remove next round container
        const nextRoundContainer = document.getElementById('next-round-container');
        if (nextRoundContainer) {
            nextRoundContainer.remove();
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
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AudioVisualMemoryGame();
});

