// Habit Manager Pro - Main JavaScript with Epic Features

// Global State Management
class HabitManager {
    constructor() {
        this.habits = this.loadData('habits') || [];
        this.goals = this.loadData('goals') || [];
        this.tasks = this.loadData('tasks') || [];
        this.moods = this.loadData('moods') || [];
        this.user = this.loadData('user') || {
            level: 1,
            totalPoints: 0,
            joinDate: moment().format('YYYY-MM-DD'),
            achievements: []
        };
        this.currentTab = 'dashboard';
        this.pomodoroTimer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            isBreak: false,
            interval: null
        };
        this.habitTemplates = this.getHabitTemplates();
        
        // Chart instances to prevent multiple chart creation
        this.chartInstances = {
            completion: null,
            category: null,
            streak: null,
            monthly: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.generateHeatmap();
        this.updateProgressRings();
        this.updateStats();
        this.generateAIInsights();
        this.setupReminders();
        this.updateDailyQuote();
    }

    // Data Management
    loadData(key) {
        try {
            const data = localStorage.getItem(`habitManager_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(`habitManager_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            this.showToast('Storage error. Data may not be saved.', 'error');
            return false;
        }
    }

    // Enhanced Event Listeners
    setupEventListeners() {
        this.setupBasicListeners();
        this.setupMoodTracker();
        this.setupPomodoroTimer();
        this.setupHabitTemplates();
        this.setupPhotoCapture();
        this.setupAdvancedFilters();
    }

    setupBasicListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.closest('.modal'));
            });
        });

        // Habit form
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            this.openHabitModal();
        });

        document.getElementById('habit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHabit();
        });

        document.getElementById('cancel-habit').addEventListener('click', () => {
            this.closeModal(document.getElementById('habit-modal'));
        });

        // Goal form
        document.getElementById('add-goal-btn').addEventListener('click', () => {
            this.openGoalModal();
        });

        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGoal();
        });

        document.getElementById('cancel-goal').addEventListener('click', () => {
            this.closeModal(document.getElementById('goal-modal'));
        });

        // Task form
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeModal(document.getElementById('task-modal'));
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openModal(document.getElementById('settings-modal'));
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('reset-data').addEventListener('click', () => {
            this.resetData();
        });

        // Goal type change
        document.getElementById('goal-type').addEventListener('change', (e) => {
            this.toggleGoalTypeFields(e.target.value);
        });

        // Filters
        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterHabits();
        });

        document.getElementById('habit-search').addEventListener('input', () => {
            this.filterHabits();
        });

        document.getElementById('goal-filter').addEventListener('change', () => {
            this.filterGoals();
        });

        // Analytics period
        document.getElementById('analytics-period').addEventListener('change', () => {
            this.renderCharts();
        });

        // Task filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterTasks(btn.dataset.filter);
            });
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    setupMoodTracker() {
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.recordMood(btn.dataset.mood);
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupPomodoroTimer() {
        document.getElementById('start-pomodoro').addEventListener('click', () => {
            this.openModal(document.getElementById('pomodoro-modal'));
        });

        document.getElementById('start-timer').addEventListener('click', () => {
            this.startPomodoro();
        });

        document.getElementById('pause-timer').addEventListener('click', () => {
            this.pausePomodoro();
        });

        document.getElementById('reset-timer').addEventListener('click', () => {
            this.resetPomodoro();
        });
    }

    setupHabitTemplates() {
        document.getElementById('habit-templates-btn').addEventListener('click', () => {
            this.openHabitTemplatesModal();
        });
    }

    setupPhotoCapture() {
        document.getElementById('take-photo').addEventListener('click', () => {
            document.getElementById('photo-input').click();
        });

        document.getElementById('photo-input').addEventListener('change', (e) => {
            this.handlePhotoCapture(e.target.files[0]);
        });

        document.getElementById('confirm-photo').addEventListener('click', () => {
            this.confirmPhotoCompletion();
        });

        document.getElementById('cancel-photo').addEventListener('click', () => {
            this.closeModal(document.getElementById('photo-modal'));
        });
    }

    setupAdvancedFilters() {
        document.getElementById('difficulty-filter').addEventListener('change', () => {
            this.filterHabits();
        });
    }

    // Mood Tracking
    recordMood(mood) {
        const today = moment().format('YYYY-MM-DD');
        this.moods = this.moods.filter(m => m.date !== today);
        this.moods.push({
            date: today,
            mood: parseInt(mood),
            timestamp: moment().toISOString()
        });
        this.saveData('moods', this.moods);
        this.generateAIInsights();
    }

    // Pomodoro Timer
    startPomodoro() {
        if (this.pomodoroTimer.isRunning) return;
        
        this.pomodoroTimer.isRunning = true;
        document.getElementById('start-timer').textContent = 'Running...';
        document.getElementById('start-timer').disabled = true;
        
        this.pomodoroTimer.interval = setInterval(() => {
            this.updatePomodoroTimer();
        }, 1000);
    }

    pausePomodoro() {
        this.pomodoroTimer.isRunning = false;
        clearInterval(this.pomodoroTimer.interval);
        document.getElementById('start-timer').textContent = 'Start';
        document.getElementById('start-timer').disabled = false;
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroTimer.minutes = parseInt(document.getElementById('work-duration').value);
        this.pomodoroTimer.seconds = 0;
        this.pomodoroTimer.isBreak = false;
        this.updatePomodoroDisplay();
    }

    updatePomodoroTimer() {
        if (this.pomodoroTimer.seconds > 0) {
            this.pomodoroTimer.seconds--;
        } else if (this.pomodoroTimer.minutes > 0) {
            this.pomodoroTimer.minutes--;
            this.pomodoroTimer.seconds = 59;
        } else {
            this.pomodoroCompleted();
            return;
        }
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        document.getElementById('timer-minutes').textContent = 
            this.pomodoroTimer.minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = 
            this.pomodoroTimer.seconds.toString().padStart(2, '0');
    }

    pomodoroCompleted() {
        this.pausePomodoro();
        
        if (!this.pomodoroTimer.isBreak) {
            this.showToast('Work session completed! Take a break.', 'success');
            this.pomodoroTimer.isBreak = true;
            this.pomodoroTimer.minutes = parseInt(document.getElementById('break-duration').value);
            this.user.totalPoints += 5;
            this.saveData('user', this.user);
            this.updateUserInfo();
        } else {
            this.showToast('Break time over! Ready for another session?', 'success');
            this.pomodoroTimer.isBreak = false;
            this.pomodoroTimer.minutes = parseInt(document.getElementById('work-duration').value);
        }
        
        this.pomodoroTimer.seconds = 0;
        this.updatePomodoroDisplay();
        
        // Play notification sound if possible
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: this.pomodoroTimer.isBreak ? 'Break time!' : 'Work session completed!',
                icon: '/favicon.ico'
            });
        }
    }

    // Habit Templates
    getHabitTemplates() {
        return [
            {
                id: 'morning-routine',
                title: 'Morning Routine',
                description: 'Start your day with healthy habits',
                habits: ['Drink water', 'Exercise', 'Meditate', 'Plan day']
            },
            {
                id: 'fitness-journey',
                title: 'Fitness Journey',
                description: 'Build a strong, healthy body',
                habits: ['Morning run', 'Strength training', 'Yoga', 'Track calories']
            },
            {
                id: 'learning-path',
                title: 'Learning Path',
                description: 'Continuous skill development',
                habits: ['Read 30 minutes', 'Practice coding', 'Watch tutorials', 'Take notes']
            },
            {
                id: 'mindfulness',
                title: 'Mindfulness Journey',
                description: 'Mental health and well-being',
                habits: ['Meditate', 'Gratitude journal', 'Deep breathing', 'Digital detox']
            },
            {
                id: 'productivity',
                title: 'Productivity Master',
                description: 'Get things done efficiently',
                habits: ['Time blocking', 'Inbox zero', 'Daily review', 'Single tasking']
            },
            {
                id: 'creativity',
                title: 'Creative Flow',
                description: 'Unlock your creative potential',
                habits: ['Daily sketching', 'Writing practice', 'Music practice', 'Photo walk']
            }
        ];
    }

    openHabitTemplatesModal() {
        const modal = document.getElementById('habit-templates-modal');
        const container = document.getElementById('templates-grid');
        container.innerHTML = '';
        
        this.habitTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.innerHTML = `
                <div class="template-title">${template.title}</div>
                <div class="template-description">${template.description}</div>
                <div class="template-habits">
                    ${template.habits.map(habit => 
                        `<span class="template-habit">${habit}</span>`
                    ).join('')}
                </div>
            `;
            
            templateCard.addEventListener('click', () => {
                this.applyTemplate(template);
            });
            
            container.appendChild(templateCard);
        });
        
        this.openModal(modal);
    }

    applyTemplate(template) {
        const categories = {
            'Morning Routine': 'health',
            'Fitness Journey': 'fitness',
            'Learning Path': 'learning',
            'Mindfulness Journey': 'mindfulness',
            'Productivity Master': 'productivity',
            'Creative Flow': 'creativity'
        };
        
        template.habits.forEach(habitName => {
            const habit = {
                id: this.generateId(),
                name: habitName,
                category: categories[template.title] || 'health',
                description: `Part of ${template.title} template`,
                target: 'daily',
                difficulty: 'medium',
                streak: 0,
                completions: [],
                points: 0,
                created: moment().format('YYYY-MM-DD'),
                reminderTime: null,
                dependencies: [],
                requiresPhoto: false
            };
            this.habits.push(habit);
        });
        
        this.saveData('habits', this.habits);
        this.closeModal(document.getElementById('habit-templates-modal'));
        this.renderHabits();
        this.updateDashboard();
        this.showToast(`Applied ${template.title} template!`, 'success');
    }

    // Photo Capture
    handlePhotoCapture(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Habit proof">`;
            document.getElementById('confirm-photo').style.display = 'block';
            document.getElementById('confirm-photo').dataset.photoData = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    confirmPhotoCompletion() {
        const photoData = document.getElementById('confirm-photo').dataset.photoData;
        const habitId = document.getElementById('photo-modal').dataset.habitId;
        
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const today = moment().format('YYYY-MM-DD');
        if (!habit.completions.includes(today)) {
            habit.completions.push(today);
            habit.streak = this.calculateStreak(habit.completions);
            habit.points += 15; // More points for photo proof
            
            // Store photo proof
            if (!habit.proofPhotos) habit.proofPhotos = {};
            habit.proofPhotos[today] = photoData;
            
            this.user.totalPoints += 15;
            this.checkAchievements(habit);
            this.updateUserLevel();
            
            this.saveData('habits', this.habits);
            this.saveData('user', this.user);
            this.renderHabits();
            this.updateDashboard();
            this.showToast('Habit completed with photo proof! +15 points', 'success');
        }
        
        this.closeModal(document.getElementById('photo-modal'));
    }

    // AI Insights Generation
    generateAIInsights() {
        const insights = [];
        const recentMoods = this.moods.slice(-7);
        const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
        
        // Mood-based insights
        if (avgMood >= 4) {
            insights.push({
                icon: 'fas fa-smile',
                text: 'Your mood has been excellent! Keep up the great work.',
                type: 'positive'
            });
        } else if (avgMood <= 2) {
            insights.push({
                icon: 'fas fa-heart',
                text: 'Consider adding more mindfulness habits to improve your mood.',
                type: 'suggestion'
            });
        }
        
        // Streak-based insights
        const longestStreak = Math.max(...this.habits.map(h => h.streak), 0);
        if (longestStreak >= 21) {
            insights.push({
                icon: 'fas fa-fire',
                text: 'Amazing! You\'ve built a strong habit foundation.',
                type: 'celebration'
            });
        }
        
        // Completion rate insights
        const today = moment().format('YYYY-MM-DD');
        const todayCompletions = this.habits.filter(h => h.completions.includes(today)).length;
        const completionRate = this.habits.length > 0 ? (todayCompletions / this.habits.length) * 100 : 0;
        
        if (completionRate === 100) {
            insights.push({
                icon: 'fas fa-trophy',
                text: 'Perfect day! All habits completed.',
                type: 'celebration'
            });
        } else if (completionRate >= 75) {
            insights.push({
                icon: 'fas fa-thumbs-up',
                text: 'Great progress today! You\'re on track.',
                type: 'positive'
            });
        }
        
        // Render insights
        const container = document.getElementById('ai-insights');
        container.innerHTML = '';
        
        insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.className = 'insight-item';
            insightItem.innerHTML = `
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-text">${insight.text}</div>
            `;
            container.appendChild(insightItem);
        });
        
        // Update AI score
        const aiScore = Math.round(avgMood * 20 + completionRate * 0.8);
        document.getElementById('ai-score').textContent = aiScore;
        
        if (aiScore >= 80) {
            document.getElementById('ai-score').classList.add('ai-score-animation');
        }
    }

    // Inspirational Quotes
    getInspirationalQuotes() {
        return [
            {
                quote: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                quote: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                quote: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle"
            },
            {
                quote: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins"
            },
            {
                quote: "Your limitation—it's only your imagination.",
                author: "Unknown"
            },
            {
                quote: "Push yourself, because no one else is going to do it for you.",
                author: "Unknown"
            },
            {
                quote: "Great things never come from comfort zones.",
                author: "Unknown"
            },
            {
                quote: "Dream it. Wish it. Do it.",
                author: "Unknown"
            },
            {
                quote: "Success doesn't just find you. You have to go out and get it.",
                author: "Unknown"
            },
            {
                quote: "The harder you work for something, the greater you'll feel when you achieve it.",
                author: "Unknown"
            },
            {
                quote: "Don't stop when you're tired. Stop when you're done.",
                author: "Unknown"
            },
            {
                quote: "Wake up with determination. Go to bed with satisfaction.",
                author: "Unknown"
            },
            {
                quote: "Do something today that your future self will thank you for.",
                author: "Sean Patrick Flanery"
            },
            {
                quote: "Little things make big days.",
                author: "Unknown"
            },
            {
                quote: "It's going to be hard, but hard does not mean impossible.",
                author: "Unknown"
            },
            {
                quote: "Don't wait for opportunity. Create it.",
                author: "Unknown"
            },
            {
                quote: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
                author: "Unknown"
            },
            {
                quote: "The key to success is to focus on goals, not obstacles.",
                author: "Unknown"
            },
            {
                quote: "Dream bigger. Do bigger.",
                author: "Unknown"
            },
            {
                quote: "A year from now you may wish you had started today.",
                author: "Karen Lamb"
            },
            {
                quote: "You are never too old to set another goal or to dream a new dream.",
                author: "C.S. Lewis"
            },
            {
                quote: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney"
            },
            {
                quote: "If you really look closely, most overnight successes took a long time.",
                author: "Steve Jobs"
            },
            {
                quote: "The secret of getting ahead is getting started.",
                author: "Mark Twain"
            }
        ];
    }

    updateDailyQuote() {
        const quotesInfo = document.getElementById('quotes-info');
        const quotes = this.getInspirationalQuotes();
        
        // Get a random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        quotesInfo.innerHTML = `
            <div class="quote-container">
                <div class="quote-icon">💭</div>
                <div class="quote-content">
                    <blockquote class="quote-text">"${randomQuote.quote}"</blockquote>
                    <cite class="quote-author">— ${randomQuote.author}</cite>
                </div>
            </div>
        `;
    }

    // UI Management
    switchTab(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.updateTabContent();
    }

    updateTabContent() {
        switch(this.currentTab) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'habits':
                this.renderHabits();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'tasks':
                this.renderTasks();
                break;
            case 'analytics':
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    this.renderCharts();
                }, 100);
                break;
            case 'achievements':
                this.renderAchievements();
                break;
        }
    }

    updateUI() {
        this.updateUserInfo();
        this.updateCurrentDate();
        this.updateTabContent();
    }

    updateUserInfo() {
        document.getElementById('user-level').textContent = this.user.level;
        document.getElementById('total-points').textContent = this.user.totalPoints;
        document.getElementById('achievement-level').textContent = this.user.level;
        document.getElementById('achievement-points').textContent = this.user.totalPoints;
    }

    updateCurrentDate() {
        document.getElementById('current-date').textContent = moment().format('MMMM Do, YYYY');
    }

    // Modal Management
    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    openHabitModal(habit = null) {
        const modal = document.getElementById('habit-modal');
        const title = document.getElementById('habit-modal-title');
        const form = document.getElementById('habit-form');
        
        // Populate dependencies dropdown
        const dependenciesSelect = document.getElementById('habit-dependencies');
        dependenciesSelect.innerHTML = '<option value="">No dependencies</option>';
        this.habits.forEach(h => {
            if (!habit || h.id !== habit.id) {
                const option = document.createElement('option');
                option.value = h.id;
                option.textContent = h.name;
                dependenciesSelect.appendChild(option);
            }
        });
        
        if (habit) {
            title.textContent = 'Edit Habit';
            document.getElementById('habit-name').value = habit.name;
            document.getElementById('habit-category').value = habit.category;
            document.getElementById('habit-difficulty').value = habit.difficulty || 'medium';
            document.getElementById('habit-description').value = habit.description || '';
            document.getElementById('habit-target').value = habit.target;
            document.getElementById('habit-reminder').value = habit.reminderTime || '';
            document.getElementById('habit-photo-proof').checked = habit.requiresPhoto || false;
            
            // Set dependencies
            if (habit.dependencies) {
                Array.from(dependenciesSelect.options).forEach(option => {
                    option.selected = habit.dependencies.includes(option.value);
                });
            }
            
            form.dataset.editId = habit.id;
        } else {
            title.textContent = 'Add New Habit';
            form.reset();
            delete form.dataset.editId;
        }
        
        this.openModal(modal);
    }

    openGoalModal(goal = null) {
        const modal = document.getElementById('goal-modal');
        const title = document.getElementById('goal-modal-title');
        const form = document.getElementById('goal-form');
        
        if (goal) {
            title.textContent = 'Edit Goal';
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-type').value = goal.type;
            document.getElementById('goal-description').value = goal.description || '';
            document.getElementById('goal-deadline').value = goal.deadline || '';
            if (goal.url) document.getElementById('youtube-url').value = goal.url;
            form.dataset.editId = goal.id;
        } else {
            title.textContent = 'Add New Goal';
            form.reset();
            delete form.dataset.editId;
        }
        
        this.toggleGoalTypeFields(document.getElementById('goal-type').value);
        this.openModal(modal);
    }

    openTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('task-modal-title');
        const form = document.getElementById('task-form');
        
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-date').value = task.date;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category;
            form.dataset.editId = task.id;
        } else {
            title.textContent = 'Add New Task';
            form.reset();
            document.getElementById('task-date').value = moment().format('YYYY-MM-DD');
            delete form.dataset.editId;
        }
        
        this.openModal(modal);
    }

    toggleGoalTypeFields(type) {
        const youtubeGroup = document.getElementById('youtube-group');
        const fileGroup = document.getElementById('file-group');
        
        youtubeGroup.style.display = type === 'youtube' ? 'block' : 'none';
        fileGroup.style.display = type === 'file' ? 'block' : 'none';
    }

    // Enhanced Habit Management
    saveHabit() {
        const form = document.getElementById('habit-form');
        const editId = form.dataset.editId;
        
        const habitData = {
            id: editId || this.generateId(),
            name: document.getElementById('habit-name').value,
            category: document.getElementById('habit-category').value,
            difficulty: document.getElementById('habit-difficulty').value,
            description: document.getElementById('habit-description').value,
            target: document.getElementById('habit-target').value,
            reminderTime: document.getElementById('habit-reminder').value,
            requiresPhoto: document.getElementById('habit-photo-proof').checked,
            dependencies: Array.from(document.getElementById('habit-dependencies').selectedOptions)
                .map(option => option.value).filter(v => v),
            streak: 0,
            completions: [],
            points: 0,
            created: moment().format('YYYY-MM-DD'),
            proofPhotos: {}
        };

        if (editId) {
            const index = this.habits.findIndex(h => h.id === editId);
            if (index !== -1) {
                this.habits[index] = { ...this.habits[index], ...habitData };
            }
        } else {
            this.habits.push(habitData);
        }

        this.saveData('habits', this.habits);
        this.closeModal(document.getElementById('habit-modal'));
        this.renderHabits();
        this.updateDashboard();
        this.showToast('Habit saved successfully!', 'success');
    }

    completeHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = moment().format('YYYY-MM-DD');
        if (habit.completions.includes(today)) {
            this.showToast('Habit already completed today!', 'error');
            return;
        }

        // Check dependencies
        if (habit.dependencies && habit.dependencies.length > 0) {
            const uncompletedDeps = habit.dependencies.filter(depId => {
                const depHabit = this.habits.find(h => h.id === depId);
                return depHabit && !depHabit.completions.includes(today);
            });
            
            if (uncompletedDeps.length > 0) {
                this.showToast('Complete dependent habits first!', 'error');
                return;
            }
        }

        // Check if photo proof is required
        if (habit.requiresPhoto) {
            document.getElementById('photo-modal').dataset.habitId = id;
            this.openModal(document.getElementById('photo-modal'));
            return;
        }

        // Regular completion
        habit.completions.push(today);
        habit.streak = this.calculateStreak(habit.completions);
        
        // Points based on difficulty
        const difficultyPoints = {
            easy: 5,
            medium: 10,
            hard: 15
        };
        const points = difficultyPoints[habit.difficulty] || 10;
        
        habit.points += points;
        this.user.totalPoints += points;
        
        this.checkAchievements(habit);
        this.updateUserLevel();
        
        this.saveData('habits', this.habits);
        this.saveData('user', this.user);
        this.renderHabits();
        this.updateDashboard();
        this.showToast(`Habit completed! +${points} points`, 'success');
    }

    // Enhanced habit card creation
    createHabitCard(habit) {
        const card = document.createElement('div');
        card.className = 'habit-card';
        
        const today = moment().format('YYYY-MM-DD');
        const isCompletedToday = habit.completions.includes(today);
        
        const dependencyTags = habit.dependencies ? habit.dependencies.map(depId => {
            const depHabit = this.habits.find(h => h.id === depId);
            return depHabit ? `<span class="dependency-tag">${depHabit.name}</span>` : '';
        }).join('') : '';
        
        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-category">${habit.category}</div>
                <div class="habit-difficulty ${habit.difficulty}">${habit.difficulty}</div>
            </div>
            <div class="habit-streak">
                <i class="fas fa-fire"></i>
                <span class="streak-number">${habit.streak}</span>
                <span>day streak</span>
            </div>
            ${habit.reminderTime ? `<div class="habit-reminder">
                <i class="fas fa-bell"></i>
                <span>${habit.reminderTime}</span>
            </div>` : ''}
            ${dependencyTags ? `<div class="habit-dependencies">${dependencyTags}</div>` : ''}
            ${habit.requiresPhoto ? '<div class="habit-photo-proof">📸 Photo Required</div>' : ''}
            <div class="habit-description">${habit.description || ''}</div>
            <div class="habit-actions">
                <button class="complete-btn ${isCompletedToday ? 'completed' : ''}" 
                        onclick="habitManager.completeHabit('${habit.id}')"
                        ${isCompletedToday ? 'disabled' : ''}>
                    <i class="fas fa-check"></i>
                    ${isCompletedToday ? 'Completed' : 'Complete'}
                </button>
                <button class="icon-btn" onclick="habitManager.openHabitModal(habitManager.habits.find(h => h.id === '${habit.id}'))">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="habitManager.deleteHabit('${habit.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                ${habit.proofPhotos && habit.proofPhotos[today] ? `
                    <button class="icon-btn" onclick="habitManager.viewProofPhoto('${habit.id}', '${today}')">
                        <i class="fas fa-camera"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    viewProofPhoto(habitId, date) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !habit.proofPhotos || !habit.proofPhotos[date]) return;
        
        const modal = document.getElementById('photo-modal');
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${habit.proofPhotos[date]}" alt="Habit proof for ${date}">`;
        document.getElementById('confirm-photo').style.display = 'none';
        document.getElementById('take-photo').style.display = 'none';
        
        this.openModal(modal);
    }

    // Enhanced filtering
    getFilteredHabits() {
        const category = document.getElementById('category-filter').value;
        const difficulty = document.getElementById('difficulty-filter').value;
        const search = document.getElementById('habit-search').value.toLowerCase();
        
        return this.habits.filter(habit => {
            const matchesCategory = !category || habit.category === category;
            const matchesDifficulty = !difficulty || habit.difficulty === difficulty;
            const matchesSearch = !search || habit.name.toLowerCase().includes(search);
            return matchesCategory && matchesDifficulty && matchesSearch;
        });
    }

    // Reminder System
    setupReminders() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
        
        setInterval(() => {
            this.checkReminders();
        }, 60000); // Check every minute
    }

    checkReminders() {
        const now = moment();
        const currentTime = now.format('HH:mm');
        
        this.habits.forEach(habit => {
            if (habit.reminderTime === currentTime) {
                const today = moment().format('YYYY-MM-DD');
                if (!habit.completions.includes(today)) {
                    this.showReminder(habit);
                }
            }
        });
    }

    showReminder(habit) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Habit Reminder', {
                body: `Time to: ${habit.name}`,
                icon: '/favicon.ico'
            });
        }
        
        this.showToast(`Reminder: ${habit.name}`, 'info');
    }

    // Enhanced dashboard update
    updateDashboard() {
        this.updateStats();
        this.renderTodayHabits();
        this.updateProgressRings();
        this.generateHeatmap();
        this.generateAIInsights();
        this.updateDailyQuote();
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveData('habits', this.habits);
            this.renderHabits();
            this.updateDashboard();
            this.showToast('Habit deleted successfully!', 'success');
        }
    }

    calculateStreak(completions) {
        if (completions.length === 0) return 0;
        
        const sortedDates = completions.sort((a, b) => moment(b).diff(moment(a)));
        let streak = 0;
        let currentDate = moment();
        
        for (const completion of sortedDates) {
            const completionDate = moment(completion);
            if (currentDate.diff(completionDate, 'days') <= 1) {
                streak++;
                currentDate = completionDate;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderHabits() {
        const container = document.getElementById('habits-grid');
        container.innerHTML = '';

        const filteredHabits = this.getFilteredHabits();

        filteredHabits.forEach(habit => {
            const habitCard = this.createHabitCard(habit);
            container.appendChild(habitCard);
        });
    }

    filterHabits() {
        this.renderHabits();
    }

    // Goal Management
    saveGoal() {
        const form = document.getElementById('goal-form');
        const editId = form.dataset.editId;
        const fileInput = document.getElementById('goal-file');
        
        const goalData = {
            id: editId || this.generateId(),
            title: document.getElementById('goal-title').value,
            type: document.getElementById('goal-type').value,
            description: document.getElementById('goal-description').value,
            deadline: document.getElementById('goal-deadline').value,
            completed: false,
            points: 20,
            created: moment().format('YYYY-MM-DD')
        };

        if (goalData.type === 'youtube') {
            goalData.url = document.getElementById('youtube-url').value;
        } else if (goalData.type === 'file' && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > 20 * 1024 * 1024) { // 20MB limit
                this.showToast('File size exceeds 20MB limit!', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                goalData.file = {
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                };
                this.saveGoalData(goalData, editId);
            };
            reader.readAsDataURL(file);
            return;
        }

        this.saveGoalData(goalData, editId);
    }

    saveGoalData(goalData, editId) {
        if (editId) {
            const index = this.goals.findIndex(g => g.id === editId);
            if (index !== -1) {
                this.goals[index] = { ...this.goals[index], ...goalData };
            }
        } else {
            this.goals.push(goalData);
        }

        this.saveData('goals', this.goals);
        this.closeModal(document.getElementById('goal-modal'));
        this.renderGoals();
        this.showToast('Goal saved successfully!', 'success');
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveData('goals', this.goals);
            this.renderGoals();
            this.showToast('Goal deleted successfully!', 'success');
        }
    }

    toggleGoalCompletion(id) {
        const goal = this.goals.find(g => g.id === id);
        if (!goal) return;

        goal.completed = !goal.completed;
        
        if (goal.completed) {
            this.user.totalPoints += goal.points;
            this.updateUserLevel();
            this.showToast(`Goal completed! +${goal.points} points`, 'success');
        } else {
            this.user.totalPoints -= goal.points;
            this.showToast(`Goal uncompleted. -${goal.points} points`, 'error');
        }

        this.saveData('goals', this.goals);
        this.saveData('user', this.user);
        this.renderGoals();
        this.updateUserInfo();
    }

    renderGoals() {
        const container = document.getElementById('goals-grid');
        container.innerHTML = '';

        const filteredGoals = this.getFilteredGoals();

        filteredGoals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            container.appendChild(goalCard);
        });
    }

    getFilteredGoals() {
        const filter = document.getElementById('goal-filter').value;
        const today = moment();
        
        return this.goals.filter(goal => {
            if (!filter) return true;
            
            switch (filter) {
                case 'completed':
                    return goal.completed;
                case 'pending':
                    return !goal.completed;
                case 'overdue':
                    return !goal.completed && goal.deadline && moment(goal.deadline).isBefore(today);
                default:
                    return true;
            }
        });
    }

    createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = 'goal-card';
        
        const isOverdue = goal.deadline && moment(goal.deadline).isBefore(moment()) && !goal.completed;
        
        let contentHtml = '';
        if (goal.type === 'youtube' && goal.url) {
            const videoId = this.extractYouTubeId(goal.url);
            if (videoId) {
                contentHtml = `
                    <div class="youtube-embed">
                        <iframe src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            }
        } else if (goal.type === 'file' && goal.file) {
            contentHtml = `
                <div class="file-preview">
                    <i class="fas fa-file"></i>
                    <span>${goal.file.name}</span>
                    <button onclick="habitManager.downloadFile('${goal.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-type">${goal.type}</div>
            </div>
            ${contentHtml}
            <div class="goal-description">${goal.description || ''}</div>
            ${goal.deadline ? `<div class="goal-deadline ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-calendar"></i>
                Due: ${moment(goal.deadline).format('MMM DD, YYYY')}
            </div>` : ''}
            <div class="goal-actions">
                <button class="complete-btn ${goal.completed ? 'completed' : ''}" 
                        onclick="habitManager.toggleGoalCompletion('${goal.id}')">
                    <i class="fas fa-${goal.completed ? 'undo' : 'check'}"></i>
                    ${goal.completed ? 'Completed' : 'Complete'}
                </button>
                <button onclick="habitManager.openGoalModal(habitManager.goals.find(g => g.id === '${goal.id}'))">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="habitManager.deleteGoal('${goal.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return card;
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    downloadFile(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal || !goal.file) return;
        
        const link = document.createElement('a');
        link.href = goal.file.data;
        link.download = goal.file.name;
        link.click();
    }

    filterGoals() {
        this.renderGoals();
    }

    // Task Management
    saveTask() {
        const form = document.getElementById('task-form');
        const editId = form.dataset.editId;
        
        const taskData = {
            id: editId || this.generateId(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            date: document.getElementById('task-date').value,
            priority: document.getElementById('task-priority').value,
            category: document.getElementById('task-category').value,
            completed: false,
            created: moment().format('YYYY-MM-DD')
        };

        if (editId) {
            const index = this.tasks.findIndex(t => t.id === editId);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData };
            }
        } else {
            this.tasks.push(taskData);
        }

        this.saveData('tasks', this.tasks);
        this.closeModal(document.getElementById('task-modal'));
        this.renderTasks();
        this.showToast('Task saved successfully!', 'success');
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveData('tasks', this.tasks);
            this.renderTasks();
            this.showToast('Task deleted successfully!', 'success');
        }
    }

    toggleTaskCompletion(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        task.completed = !task.completed;
        
        if (task.completed) {
            this.user.totalPoints += 5;
            this.updateUserLevel();
            this.showToast('Task completed! +5 points', 'success');
        } else {
            this.user.totalPoints -= 5;
            this.showToast('Task uncompleted. -5 points', 'error');
        }

        this.saveData('tasks', this.tasks);
        this.saveData('user', this.user);
        this.renderTasks();
        this.updateUserInfo();
    }

    renderTasks() {
        this.renderTaskList();
        this.renderTaskCalendar();
    }

    renderTaskList() {
        const container = document.getElementById('tasks-list');
        container.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        filteredTasks.forEach(task => {
            const taskItem = this.createTaskItem(task);
            container.appendChild(taskItem);
        });
    }

    getFilteredTasks() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const today = moment();
        
        return this.tasks.filter(task => {
            const taskDate = moment(task.date);
            
            switch (activeFilter) {
                case 'today':
                    return taskDate.isSame(today, 'day');
                case 'week':
                    return taskDate.isSame(today, 'week');
                case 'month':
                    return taskDate.isSame(today, 'month');
                default:
                    return true;
            }
        }).sort((a, b) => moment(a.date).diff(moment(b.date)));
    }

    createTaskItem(task) {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="task-header">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="habitManager.toggleTaskCompletion('${task.id}')">
                <div class="task-title">${task.title}</div>
                <div class="task-priority ${task.priority}">${task.priority}</div>
            </div>
            <div class="task-description">${task.description || ''}</div>
            <div class="task-meta">
                <span class="task-date">
                    <i class="fas fa-calendar"></i>
                    ${moment(task.date).format('MMM DD, YYYY')}
                </span>
                <span class="task-category">${task.category}</span>
            </div>
            <div class="task-actions">
                <button onclick="habitManager.openTaskModal(habitManager.tasks.find(t => t.id === '${task.id}'))">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="habitManager.deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return item;
    }

    renderTaskCalendar() {
        const container = document.getElementById('task-calendar');
        container.innerHTML = '';
        
        const calendar = document.createElement('div');
        calendar.className = 'calendar-grid';
        
        const currentMonth = moment().startOf('month');
        const daysInMonth = currentMonth.daysInMonth();
        const firstDay = currentMonth.day();
        
        // Add month header
        const monthHeader = document.createElement('div');
        monthHeader.className = 'calendar-header';
        monthHeader.innerHTML = `
            <h3>${currentMonth.format('MMMM YYYY')}</h3>
        `;
        container.appendChild(monthHeader);
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-day-headers';
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            headerRow.appendChild(dayHeader);
        });
        container.appendChild(headerRow);
        
        // Add calendar days
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            const date = moment(currentMonth).date(day);
            const tasksOnDay = this.tasks.filter(task => 
                moment(task.date).isSame(date, 'day')
            );
            
            dayCell.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-tasks">
                    ${tasksOnDay.slice(0, 3).map(task => 
                        `<div class="calendar-task ${task.priority}">${task.title}</div>`
                    ).join('')}
                    ${tasksOnDay.length > 3 ? `<div class="calendar-task-more">+${tasksOnDay.length - 3} more</div>` : ''}
                </div>
            `;
            
            if (date.isSame(moment(), 'day')) {
                dayCell.classList.add('today');
            }
            
            calendarGrid.appendChild(dayCell);
        }
        
        container.appendChild(calendarGrid);
    }

    filterTasks(filter) {
        this.renderTaskList();
    }

    // Dashboard
    updateStats() {
        const longestStreak = Math.max(...this.habits.map(h => h.streak), 0);
        const totalCompletions = this.habits.reduce((sum, h) => sum + h.completions.length, 0);
        const totalPossible = this.habits.length * moment().diff(moment(this.user.joinDate), 'days');
        const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
        
        document.getElementById('longest-streak').textContent = longestStreak;
        document.getElementById('total-completions').textContent = totalCompletions;
        document.getElementById('completion-rate').textContent = completionRate + '%';
    }

    renderTodayHabits() {
        const container = document.getElementById('today-habits-list');
        container.innerHTML = '';
        
        const today = moment().format('YYYY-MM-DD');
        
        this.habits.forEach(habit => {
            const isCompleted = habit.completions.includes(today);
            const habitItem = document.createElement('div');
            habitItem.className = `today-habit ${isCompleted ? 'completed' : ''}`;
            
            habitItem.innerHTML = `
                <div class="habit-check">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                           onchange="habitManager.completeHabit('${habit.id}')"
                           ${isCompleted ? 'disabled' : ''}>
                </div>
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-streak">
                        <i class="fas fa-fire"></i>
                        ${habit.streak} days
                    </div>
                </div>
            `;
            
            container.appendChild(habitItem);
        });
    }

    updateProgressRings() {
        const today = moment().format('YYYY-MM-DD');
        const thisWeek = moment().startOf('week').format('YYYY-MM-DD');
        const thisMonth = moment().startOf('month').format('YYYY-MM-DD');
        
        const dailyCompleted = this.habits.filter(h => h.completions.includes(today)).length;
        const dailyTotal = this.habits.length;
        const dailyProgress = dailyTotal > 0 ? (dailyCompleted / dailyTotal) * 100 : 0;
        
        const weeklyCompleted = this.habits.filter(h => 
            h.completions.some(c => moment(c).isSameOrAfter(thisWeek))
        ).length;
        const weeklyProgress = dailyTotal > 0 ? (weeklyCompleted / dailyTotal) * 100 : 0;
        
        const monthlyCompleted = this.habits.filter(h => 
            h.completions.some(c => moment(c).isSameOrAfter(thisMonth))
        ).length;
        const monthlyProgress = dailyTotal > 0 ? (monthlyCompleted / dailyTotal) * 100 : 0;
        
        this.setProgressRing('daily-progress', dailyProgress);
        this.setProgressRing('weekly-progress', weeklyProgress);
        this.setProgressRing('monthly-progress', monthlyProgress);
    }

    setProgressRing(id, progress) {
        const ring = document.getElementById(id);
        if (!ring) return;
        
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;
        
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
    }

    generateHeatmap() {
        const container = document.getElementById('heatmap-container');
        container.innerHTML = '';
        
        const startDate = moment().subtract(365, 'days');
        const endDate = moment();
        
        for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
            const dateStr = date.format('YYYY-MM-DD');
            const completions = this.habits.filter(h => h.completions.includes(dateStr)).length;
            
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.title = `${date.format('MMM DD, YYYY')}: ${completions} completions`;
            
            if (completions > 0) {
                const level = Math.min(Math.ceil(completions / 2), 4);
                cell.classList.add(`level-${level}`);
            }
            
            container.appendChild(cell);
        }
    }

    // Analytics
    renderCharts() {
        // Only render charts if we're on the analytics tab
        if (this.currentTab !== 'analytics') {
            return;
        }
        
        this.renderCompletionChart();
        this.renderCategoryChart();
        this.renderStreakChart();
        this.renderMonthlyChart();
    }

    // Destroy existing chart if it exists
    destroyChart(chartKey) {
        if (this.chartInstances[chartKey]) {
            this.chartInstances[chartKey].destroy();
            this.chartInstances[chartKey] = null;
        }
    }

    renderCompletionChart() {
        const ctx = document.getElementById('completion-chart');
        if (!ctx) return;
        
        this.destroyChart('completion');
        
        const period = document.getElementById('analytics-period').value;
        const data = this.getCompletionData(period);
        
        this.chartInstances.completion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Completions',
                    data: data.values,
                    borderColor: 'rgb(0, 102, 255)',
                    backgroundColor: 'rgba(0, 102, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disable animations
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;
        
        this.destroyChart('category');
        
        const categories = {};
        this.habits.forEach(habit => {
            categories[habit.category] = (categories[habit.category] || 0) + habit.completions.length;
        });
        
        // Only render if there's data
        if (Object.keys(categories).length === 0) {
            return;
        }
        
        this.chartInstances.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        'rgb(0, 102, 255)',
                        'rgb(64, 169, 255)',
                        'rgb(66, 133, 244)',
                        'rgb(105, 192, 255)',
                        'rgb(0, 59, 179)',
                        'rgb(41, 121, 255)',
                        'rgb(25, 85, 180)',
                        'rgb(55, 145, 255)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disable animations
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    renderStreakChart() {
        const ctx = document.getElementById('streak-chart');
        if (!ctx) return;
        
        this.destroyChart('streak');
        
        const data = this.habits.map(habit => ({
            name: habit.name,
            streak: habit.streak
        })).sort((a, b) => b.streak - a.streak).slice(0, 10); // Limit to top 10
        
        // Only render if there's data
        if (data.length === 0) {
            return;
        }
        
        this.chartInstances.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'Streak (days)',
                    data: data.map(d => d.streak),
                    backgroundColor: 'rgba(0, 102, 255, 0.8)',
                    borderColor: 'rgb(0, 102, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disable animations
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderMonthlyChart() {
        const ctx = document.getElementById('monthly-chart');
        if (!ctx) return;
        
        this.destroyChart('monthly');
        
        const monthlyData = {};
        this.habits.forEach(habit => {
            habit.completions.forEach(completion => {
                const month = moment(completion).format('YYYY-MM');
                monthlyData[month] = (monthlyData[month] || 0) + 1;
            });
        });
        
        const sortedMonths = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
        
        // Only render if there's data
        if (sortedMonths.length === 0) {
            return;
        }
        
        this.chartInstances.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMonths.map(month => moment(month).format('MMM YYYY')),
                datasets: [{
                    label: 'Monthly Completions',
                    data: sortedMonths.map(month => monthlyData[month] || 0),
                    backgroundColor: 'rgba(64, 169, 255, 0.8)',
                    borderColor: 'rgb(64, 169, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disable animations
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    getCompletionData(period) {
        const now = moment();
        let startDate, format;
        
        switch (period) {
            case 'week':
                startDate = now.clone().subtract(7, 'days');
                format = 'MMM DD';
                break;
            case 'month':
                startDate = now.clone().subtract(30, 'days');
                format = 'MMM DD';
                break;
            case 'quarter':
                startDate = now.clone().subtract(90, 'days');
                format = 'MMM DD';
                break;
            case 'year':
                startDate = now.clone().subtract(365, 'days');
                format = 'MMM';
                break;
            default:
                startDate = now.clone().subtract(7, 'days');
                format = 'MMM DD';
        }
        
        const labels = [];
        const values = [];
        
        for (let date = startDate.clone(); date.isSameOrBefore(now); date.add(1, 'day')) {
            const dateStr = date.format('YYYY-MM-DD');
            const completions = this.habits.filter(h => h.completions.includes(dateStr)).length;
            
            labels.push(date.format(format));
            values.push(completions);
        }
        
        return { labels, values };
    }

    // Achievements
    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';
        
        const achievements = this.getAchievements();
        
        achievements.forEach(achievement => {
            const achievementCard = this.createAchievementCard(achievement);
            container.appendChild(achievementCard);
        });
    }

    getAchievements() {
        const achievements = [
            {
                id: 'first_habit',
                title: 'First Steps',
                description: 'Create your first habit',
                icon: 'fas fa-plus',
                points: 10,
                unlocked: this.habits.length > 0
            },
            {
                id: 'week_streak',
                title: 'Week Warrior',
                description: 'Maintain a 7-day streak',
                icon: 'fas fa-fire',
                points: 50,
                unlocked: this.habits.some(h => h.streak >= 7)
            },
            {
                id: 'month_streak',
                title: 'Monthly Master',
                description: 'Maintain a 30-day streak',
                icon: 'fas fa-trophy',
                points: 200,
                unlocked: this.habits.some(h => h.streak >= 30)
            },
            {
                id: 'hundred_completions',
                title: 'Century Club',
                description: 'Complete 100 habits',
                icon: 'fas fa-star',
                points: 100,
                unlocked: this.habits.reduce((sum, h) => sum + h.completions.length, 0) >= 100
            },
            {
                id: 'five_habits',
                title: 'Multi-Tasker',
                description: 'Create 5 different habits',
                icon: 'fas fa-tasks',
                points: 30,
                unlocked: this.habits.length >= 5
            },
            {
                id: 'perfect_week',
                title: 'Perfect Week',
                description: 'Complete all habits for 7 days straight',
                icon: 'fas fa-crown',
                points: 100,
                unlocked: this.checkPerfectWeek()
            },
            {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Complete habits before 8 AM',
                icon: 'fas fa-sun',
                points: 25,
                unlocked: false // This would require time tracking
            },
            {
                id: 'consistency_king',
                title: 'Consistency King',
                description: 'Maintain streaks for all habits',
                icon: 'fas fa-medal',
                points: 150,
                unlocked: this.habits.length > 0 && this.habits.every(h => h.streak > 0)
            }
        ];
        
        return achievements;
    }

    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : ''}`;
        
        card.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-points">${achievement.points} points</div>
            ${achievement.unlocked ? '<div class="achievement-unlocked">Unlocked!</div>' : ''}
        `;
        
        return card;
    }

    checkPerfectWeek() {
        if (this.habits.length === 0) return false;
        
        const today = moment();
        for (let i = 0; i < 7; i++) {
            const date = today.clone().subtract(i, 'days').format('YYYY-MM-DD');
            if (!this.habits.every(h => h.completions.includes(date))) {
                return false;
            }
        }
        return true;
    }

    checkAchievements(habit) {
        const achievements = this.getAchievements();
        const newAchievements = [];
        
        achievements.forEach(achievement => {
            if (achievement.unlocked && !this.user.achievements.includes(achievement.id)) {
                this.user.achievements.push(achievement.id);
                this.user.totalPoints += achievement.points;
                newAchievements.push(achievement);
            }
        });
        
        if (newAchievements.length > 0) {
            newAchievements.forEach(achievement => {
                this.showToast(`Achievement unlocked: ${achievement.title}! +${achievement.points} points`, 'success');
            });
        }
    }

    updateUserLevel() {
        const newLevel = Math.floor(this.user.totalPoints / 100) + 1;
        if (newLevel > this.user.level) {
            this.user.level = newLevel;
            this.showToast(`Level up! You are now level ${newLevel}!`, 'success');
        }
    }

    // Data Import/Export
    exportData() {
        const data = {
            habits: this.habits,
            goals: this.goals,
            tasks: this.tasks,
            user: this.user,
            exportDate: moment().format(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habit-manager-backup-${moment().format('YYYY-MM-DD')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.version && data.habits && data.goals && data.tasks && data.user) {
                    this.habits = data.habits;
                    this.goals = data.goals;
                    this.tasks = data.tasks;
                    this.user = data.user;
                    
                    this.saveData('habits', this.habits);
                    this.saveData('goals', this.goals);
                    this.saveData('tasks', this.tasks);
                    this.saveData('user', this.user);
                    
                    this.updateUI();
                    this.showToast('Data imported successfully!', 'success');
                } else {
                    this.showToast('Invalid backup file format!', 'error');
                }
            } catch (error) {
                this.showToast('Error importing data!', 'error');
            }
        };
        reader.readAsText(file);
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('habitManager_habits');
            localStorage.removeItem('habitManager_goals');
            localStorage.removeItem('habitManager_tasks');
            localStorage.removeItem('habitManager_user');
            
            this.habits = [];
            this.goals = [];
            this.tasks = [];
            this.user = {
                level: 1,
                totalPoints: 0,
                joinDate: moment().format('YYYY-MM-DD'),
                achievements: []
            };
            
            this.updateUI();
            this.showToast('All data has been reset!', 'success');
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
const habitManager = new HabitManager();