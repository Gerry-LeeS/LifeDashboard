/* ============================================
   LIFE DASHBOARD - COMPLETE JAVASCRIPT WITH ALL FEATURES
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
	todos: [],
	habits: [],
	journal: '',
	journalEntries: [],
	moods: [],
	energyLevels: [],
	gratitudes: [],
	xp: 0,
	level: 1,
	longestStreak: 0,
	currentStreak: 0,
	lastActiveDate: null,
	theme: 'light',
	currentPage: 'overview',
	customWidgets: [],
	goals: [],
};

// ============================================
// STATE PERSISTENCE
// ============================================
function saveState() {
	const dataToSave = {
		todos: state.todos,
		habits: state.habits,
		journal: state.journal,
		journalEntries: state.journalEntries,
		moods: state.moods,
		energyLevels: state.energyLevels,
		gratitudes: state.gratitudes,
		xp: state.xp,
		level: state.level,
		longestStreak: state.longestStreak,
		currentStreak: state.currentStreak,
		lastActiveDate: state.lastActiveDate,
		theme: state.theme,
		currentPage: state.currentPage,
		goals: state.goals,
	};

	Object.keys(dataToSave).forEach((key) => {
		try {
			localStorage.setItem(`lifeDB_${key}`, JSON.stringify(dataToSave[key]));
		} catch (e) {
			console.warn('Storage not available:', e);
		}
	});
}

function loadState() {
	const keys = [
		'todos',
		'habits',
		'journal',
		'journalEntries',
		'moods',
		'energyLevels',
		'gratitudes',
		'xp',
		'level',
		'longestStreak',
		'currentStreak',
		'lastActiveDate',
		'theme',
		'currentPage',
		'goals',
	];

	keys.forEach((key) => {
		try {
			const item = localStorage.getItem(`lifeDB_${key}`);
			if (item) {
				state[key] = JSON.parse(item);
			}
		} catch (e) {
			console.warn('Could not load state:', e);
		}
	});

	// Set defaults if not loaded
	if (!state.xp) state.xp = 0;
	if (!state.level) state.level = 1;
	if (!state.longestStreak) state.longestStreak = 0;
	if (!state.currentStreak) state.currentStreak = 0;
	if (!state.journalEntries) state.journalEntries = [];
	if (!state.gratitudes) state.gratitudes = [];
	if (!state.goals) state.goals = [];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

function getDateString(date = new Date()) {
	return date.toISOString().split('T')[0];
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
	loadState();
	initializeApp();
});

function initializeApp() {
	updateDate();
	setupNavigation();
	setupThemeSystem();
	setupTodoList();
	setupHabits();
	setupJournal();
	setupMoodTracker();
	setupEnergyTracker();
	setupGratitude();
	setupMiniCalendar();
	setupDailyPrompt();
	setupInsights();
	setupGoals();
	setupStatCardNavigation();
	setupDataManagement();
	updateXPDisplay();
	updateStreaks();
	checkDailyLogin();
	updateStats();
	renderAll();
	createThemeDecorations();
	fetchDailyQuote();
}

// ============================================
// DATE DISPLAY
// ============================================
function updateDate() {
	const dateEl = document.getElementById('currentDate');
	const now = new Date();
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	dateEl.textContent = now.toLocaleDateString('en-US', options);

	const hour = now.getHours();
	let greeting = 'Good Morning ☀️';
	if (hour >= 12 && hour < 17) {
		greeting = 'Good Afternoon 🌤️';
	} else if (hour >= 17) {
		greeting = 'Good Evening 🌙';
	}

	const titleEl = document.querySelector('#overview .page-title');
	if (titleEl) {
		titleEl.textContent = greeting;
	}
}

// ============================================
// NAVIGATION SYSTEM
// ============================================
function setupNavigation() {
	const navItems = document.querySelectorAll('.nav-item');
	const pages = document.querySelectorAll('.page');

	navItems.forEach((item) => {
		item.addEventListener('click', () => {
			const targetPage = item.dataset.page;

			navItems.forEach((nav) => nav.classList.remove('active'));
			item.classList.add('active');

			pages.forEach((page) => page.classList.remove('active'));
			const activePage = document.getElementById(targetPage);
			if (activePage) {
				activePage.classList.add('active');
				state.currentPage = targetPage;
				saveState();

				// Refresh insights when viewing that page
				if (targetPage === 'insights') {
					renderInsights();
				}
			}
		});
	});
}

function setupStatCardNavigation() {
	const statCards = document.querySelectorAll('.stat-card[data-page]');

	statCards.forEach((card) => {
		card.addEventListener('click', () => {
			const targetPage = card.getAttribute('data-page');

			// Hide all pages
			document.querySelectorAll('.page').forEach((page) => {
				page.classList.remove('active');
			});

			// Show target page
			document.getElementById(targetPage).classList.add('active');

			// Update sidebar navigation
			document.querySelectorAll('.nav-item').forEach((navItem) => {
				navItem.classList.remove('active');
			});
			document
				.querySelector(`.nav-item[data-page="${targetPage}"]`)
				.classList.add('active');

			// Update state
			state.currentPage = targetPage;
			saveState();
		});
	});
}

// ============================================
// THEME SYSTEM
// ============================================
function setupThemeSystem() {
	const settingsBtn = document.getElementById('settingsBtn');
	const settingsModal = document.getElementById('settingsModal');
	const closeSettings = document.getElementById('closeSettings');
	const themeCards = document.querySelectorAll('.theme-card');

	settingsBtn.addEventListener('click', () => {
		settingsModal.classList.add('active');
		updateActiveThemeCard();
	});

	closeSettings.addEventListener('click', () => {
		settingsModal.classList.remove('active');
	});

	settingsModal.addEventListener('click', (e) => {
		if (e.target === settingsModal) {
			settingsModal.classList.remove('active');
		}
	});

	themeCards.forEach((card) => {
		card.addEventListener('click', () => {
			const theme = card.dataset.theme;
			applyTheme(theme);
			updateActiveThemeCard();
		});
	});

	applyTheme(state.theme);
}

function applyTheme(theme) {
	state.theme = theme;

	document.body.classList.remove(
		'theme-dark',
		'theme-ocean',
		'theme-sunset',
		'theme-midnight',
		'theme-galaxy',
		'theme-glass'
	);

	if (theme !== 'light') {
		document.body.classList.add(`theme-${theme}`);
	}

	createThemeDecorations();

	saveState();
}

function updateActiveThemeCard() {
	const themeCards = document.querySelectorAll('.theme-card');
	themeCards.forEach((card) => {
		card.classList.remove('active');
		if (card.dataset.theme === state.theme) {
			card.classList.add('active');
		}
	});
}

// ============================================
// STREAK SYSTEM
// ============================================
function updateStreaks() {
	const today = getDateString();
	const yesterday = getDateString(new Date(Date.now() - 86400000));

	// Check if user was active today
	const activeToday =
		state.todos.some(
			(t) => t.completed && getDateString(new Date(t.createdAt)) === today
		) ||
		state.habits.some((h) => h.completedToday) ||
		state.journalEntries.some(
			(j) => getDateString(new Date(j.date)) === today
		) ||
		state.moods.some((m) => m.date === today);

	if (activeToday) {
		if (state.lastActiveDate === yesterday) {
			// Continuing streak
			state.currentStreak++;
		} else if (state.lastActiveDate !== today) {
			// Starting new streak
			state.currentStreak = 1;
		}

		state.lastActiveDate = today;

		// Update longest streak
		if (state.currentStreak > state.longestStreak) {
			state.longestStreak = state.currentStreak;
		}

		saveState();
	} else if (state.lastActiveDate === yesterday) {
		// User was active yesterday but not today yet
		// Don't break streak, just don't increment
	} else if (state.lastActiveDate && state.lastActiveDate < yesterday) {
		// Streak broken
		state.currentStreak = 0;
		saveState();
	}
}

// ============================================
// THEME DECORATIONS & ANIMATIONS
// ============================================
function createThemeDecorations() {
	document
		.querySelectorAll(
			'.firefly, .bubble, .sun, .bird, .moon, .star, .nebula-cloud, .galaxy-particle, .galaxy-arm, .star-cluster'
		)
		.forEach((el) => el.remove());

	const theme = state.theme;

	if (theme === 'ocean') {
		createBubbles();
	} else if (theme === 'sunset') {
		createSun();
		createBirds();
	} else if (theme === 'midnight') {
		createMoon();
		createStars(30);
	} else if (theme === 'dark') {
		createStars(20);
	} else if (theme === 'galaxy') {
		createStars(50);
		createNebulaClouds();
		createGalaxyParticles();
		createGalaxyArms();
		createStarClusters();
	}
}

function createBubbles() {
	for (let i = 0; i < 10; i++) {
		const bubble = document.createElement('div');
		bubble.className = 'bubble';
		bubble.style.left = Math.random() * 100 + '%';
		const size = Math.random() * 40 + 20;
		bubble.style.width = size + 'px';
		bubble.style.height = size + 'px';
		bubble.style.animationDelay = Math.random() * 15 + 's';
		bubble.style.animationDuration = Math.random() * 10 + 10 + 's';
		document.body.appendChild(bubble);
	}
}

function createSun() {
	const sun = document.createElement('div');
	sun.className = 'sun';
	sun.innerHTML = `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 120px; height: 120px;">
            <defs>
                <radialGradient id="sunGradient">
                    <stop offset="0%" style="stop-color:rgba(255, 193, 7, 0.6);stop-opacity:1" />
                    <stop offset="50%" style="stop-color:rgba(255, 152, 0, 0.4);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(255, 87, 34, 0.2);stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#sunGradient)"/>
            <circle cx="100" cy="100" r="45" fill="rgba(255, 193, 7, 0.5)"/>
        </svg>
    `;
	document.body.appendChild(sun);
}

function createBirds() {
	for (let i = 0; i < 6; i++) {
		const bird = document.createElement('div');
		bird.className = 'bird';
		bird.style.top = Math.random() * 30 + 10 + '%';
		bird.style.animationDelay = i * 4 + 's';
		bird.style.animationDuration = Math.random() * 5 + 12 + 's';
		bird.innerHTML = `
            <svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg" style="width: 40px; height: 20px;">
                <path d="M5 10 Q10 5 15 10 Q20 5 25 10 Q30 5 35 10" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      fill="none" 
                      opacity="0.5"/>
            </svg>
        `;
		document.body.appendChild(bird);
	}
}

function createMoon() {
	const moon = document.createElement('div');
	moon.className = 'moon';
	moon.innerHTML = `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width: 100px; height: 100px;">
            <defs>
                <radialGradient id="moonGlow">
                    <stop offset="0%" style="stop-color:rgba(240, 240, 255, 0.4);stop-opacity:1" />
                    <stop offset="70%" style="stop-color:rgba(200, 200, 255, 0.2);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:rgba(200, 200, 255, 0);stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#moonGlow)"/>
            <circle cx="100" cy="100" r="45" fill="rgba(240, 240, 255, 0.4)"/>
            <circle cx="110" cy="90" r="8" fill="rgba(200, 200, 230, 0.3)"/>
            <circle cx="85" cy="105" r="6" fill="rgba(200, 200, 230, 0.3)"/>
            <circle cx="105" cy="115" r="5" fill="rgba(200, 200, 230, 0.3)"/>
        </svg>
    `;
	document.body.appendChild(moon);
}

function createStars(count) {
	for (let i = 0; i < count; i++) {
		const star = document.createElement('div');
		star.className = 'star';
		star.style.left = Math.random() * 100 + '%';
		star.style.top = Math.random() * 100 + '%';
		star.style.animationDelay = Math.random() * 3 + 's';
		star.style.animationDuration = Math.random() * 2 + 2 + 's';

		const size = Math.random() * 3 + 2;
		star.innerHTML = `
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: ${size}px; height: ${size}px;">
                <circle cx="10" cy="10" r="2" fill="white" opacity="0.9"/>
            </svg>
        `;
		document.body.appendChild(star);
	}
}

function createNebulaClouds() {
	const colors = [
		'rgba(138, 43, 226, 0.4)',
		'rgba(147, 51, 234, 0.3)',
		'rgba(168, 85, 247, 0.35)',
		'rgba(192, 132, 252, 0.3)',
	];

	for (let i = 0; i < 4; i++) {
		const cloud = document.createElement('div');
		cloud.className = 'nebula-cloud';
		cloud.style.left = Math.random() * 100 + '%';
		cloud.style.top = Math.random() * 100 + '%';
		cloud.style.width = Math.random() * 200 + 150 + 'px';
		cloud.style.height = Math.random() * 200 + 150 + 'px';
		cloud.style.background = colors[i];
		cloud.style.animationDelay = i * 7.5 + 's';
		document.body.appendChild(cloud);
	}
}

function createGalaxyParticles() {
	for (let i = 0; i < 20; i++) {
		const particle = document.createElement('div');
		particle.className = 'galaxy-particle';
		particle.style.left = Math.random() * 100 + '%';
		particle.style.top = Math.random() * 100 + '%';
		particle.style.animationDelay = Math.random() * 15 + 's';
		particle.style.animationDuration = Math.random() * 10 + 10 + 's';
		document.body.appendChild(particle);
	}
}

function createGalaxyArms() {
	for (let i = 0; i < 3; i++) {
		const arm = document.createElement('div');
		arm.className = 'galaxy-arm';
		arm.style.left = 30 + i * 20 + '%';
		arm.style.top = 20 + i * 15 + '%';
		arm.style.animationDelay = i * 20 + 's';
		arm.style.opacity = 0.3 - i * 0.1;
		document.body.appendChild(arm);
	}
}

function createStarClusters() {
	for (let i = 0; i < 10; i++) {
		const cluster = document.createElement('div');
		cluster.className = 'star-cluster';
		cluster.style.left = Math.random() * 100 + '%';
		cluster.style.top = Math.random() * 100 + '%';
		cluster.style.animationDelay = Math.random() * 4 + 's';
		cluster.style.animationDuration = Math.random() * 3 + 3 + 's';
		document.body.appendChild(cluster);
	}
}

// ============================================
// GAMIFICATION SYSTEM
// ============================================
const XP_REWARDS = {
	TODO_COMPLETE: 10,
	HABIT_COMPLETE: 15,
	JOURNAL_SAVE: 20,
	MOOD_LOG: 5,
	ENERGY_LOG: 5,
	GRATITUDE_LOG: 15,
	DAILY_LOGIN: 25,
};

const LEVELS = [
	{ level: 1, title: 'Novice', xpRequired: 0 },
	{ level: 2, title: 'Beginner', xpRequired: 100 },
	{ level: 3, title: 'Apprentice', xpRequired: 250 },
	{ level: 4, title: 'Skilled', xpRequired: 500 },
	{ level: 5, title: 'Disciplined', xpRequired: 1000 },
	{ level: 6, title: 'Focused', xpRequired: 2000 },
	{ level: 7, title: 'Dedicated', xpRequired: 3500 },
	{ level: 8, title: 'Consistent', xpRequired: 5500 },
	{ level: 9, title: 'Master', xpRequired: 8000 },
	{ level: 10, title: 'Legendary', xpRequired: 12000 },
];

function awardXP(amount, reason) {
	const oldXP = state.xp;
	const oldLevel = state.level;

	state.xp += amount;

	const newLevelData = LEVELS.reverse().find((l) => state.xp >= l.xpRequired);
	LEVELS.reverse();

	if (newLevelData && newLevelData.level > oldLevel) {
		state.level = newLevelData.level;
		showLevelUp(newLevelData);
	}

	updateXPDisplay();
	showXPNotification(amount, reason);
	saveState();
}

function updateXPDisplay() {
	const levelNumber = document.getElementById('levelNumber');
	const levelTitle = document.getElementById('levelTitle');
	const xpBar = document.getElementById('xpBar');
	const xpText = document.getElementById('xpText');

	if (!levelNumber) return;

	const currentLevelData = LEVELS.find((l) => l.level === state.level);
	const nextLevelData = LEVELS.find((l) => l.level === state.level + 1);

	levelNumber.textContent = state.level;
	levelTitle.textContent = currentLevelData.title;

	if (nextLevelData) {
		const xpInCurrentLevel = state.xp - currentLevelData.xpRequired;
		const xpNeededForNext =
			nextLevelData.xpRequired - currentLevelData.xpRequired;
		const percentage = (xpInCurrentLevel / xpNeededForNext) * 100;

		xpBar.style.width = percentage + '%';
		xpText.textContent = `${state.xp} / ${nextLevelData.xpRequired} XP`;
	} else {
		xpBar.style.width = '100%';
		xpText.textContent = `${state.xp} XP - Max Level!`;
	}
}

function showXPNotification(amount, reason) {
	const notification = document.createElement('div');
	notification.className = 'xp-notification';
	notification.textContent = `+${amount} XP - ${reason}`;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'fadeOut 0.3s ease-out';
		setTimeout(() => notification.remove(), 300);
	}, 2500);
}

function showLevelUp(levelData) {
	const levelBadge = document.querySelector('.level-badge');
	if (levelBadge) {
		levelBadge.classList.add('level-up-animation');
		setTimeout(() => levelBadge.classList.remove('level-up-animation'), 600);
	}

	const notification = document.createElement('div');
	notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: white;
        padding: 40px 60px;
        border-radius: 20px;
        font-size: 32px;
        font-weight: 700;
        box-shadow: 0 20px 60px rgba(251, 191, 36, 0.5);
        z-index: 10001;
        text-align: center;
        animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
	notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
        <div>LEVEL UP!</div>
        <div style="font-size: 24px; margin-top: 10px; opacity: 0.9;">Level ${levelData.level} - ${levelData.title}</div>
    `;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'fadeOut 0.5s ease-out';
		setTimeout(() => notification.remove(), 500);
	}, 3000);
}

function checkDailyLogin() {
	const today = new Date().toDateString();
	const lastLogin = localStorage.getItem('lastLogin');

	if (lastLogin !== today) {
		localStorage.setItem('lastLogin', today);
		awardXP(XP_REWARDS.DAILY_LOGIN, 'Daily Login');
	}
}

// ============================================
// DAILY PROMPTS
// ============================================
const DAILY_PROMPTS = [
	"What's one thing you're grateful for today?",
	'What did you learn about yourself this week?',
	'If today was a movie, what would the title be?',
	"What's something that made you smile recently?",
	"What's one thing you'd like to let go of?",
	'What does success look like for you today?',
	"What's a fear you'd like to overcome?",
	'How do you want to feel at the end of today?',
	"What's the ONE thing you must accomplish today?",
	"What's been distracting you lately? How can you minimize it?",
	'What would make today feel productive?',
	'What task have you been avoiding? Why?',
	'How can you make your workspace more inspiring?',
	'Take 3 deep breaths. How do you feel right now?',
	'What does your body need today? Rest, movement, or nourishment?',
	'Name 3 things you can see, hear, and feel right now.',
	"What's one kind thing you can do for yourself today?",
	'How can you be more present in this moment?',
	'Drink a full glass of water right now.',
	'Do 10 jumping jacks or stretch for 1 minute.',
	'Send a message to someone you appreciate.',
	'Clean one small area of your space.',
	'Write down 3 things that went well yesterday.',
	'If you could master any skill instantly, what would it be?',
	'Describe your ideal day from start to finish.',
	"What would you do if you knew you couldn't fail?",
	"What's a problem you'd love to solve?",
	'What brings you energy and what drains it?',
];

function getDailyPrompt() {
	const today = new Date().toDateString();
	const savedPrompt = localStorage.getItem('dailyPrompt');
	const savedDate = localStorage.getItem('promptDate');

	if (savedPrompt && savedDate === today) {
		return savedPrompt;
	}

	const dayOfYear = Math.floor(
		(new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
	);
	const promptIndex = dayOfYear % DAILY_PROMPTS.length;
	const prompt = DAILY_PROMPTS[promptIndex];

	localStorage.setItem('dailyPrompt', prompt);
	localStorage.setItem('promptDate', today);

	return prompt;
}

function setupDailyPrompt() {
	const promptEl = document.getElementById('dailyPrompt');
	const newPromptBtn = document.getElementById('newPromptBtn');

	if (!promptEl) return;

	promptEl.textContent = getDailyPrompt();

	if (newPromptBtn) {
		newPromptBtn.addEventListener('click', () => {
			const randomPrompt =
				DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
			promptEl.textContent = randomPrompt;
			promptEl.style.animation = 'none';
			setTimeout(() => (promptEl.style.animation = 'fadeIn 0.5s ease-out'), 10);
		});
	}
}

// ============================================
// QUOTE API
// ============================================
async function fetchDailyQuote() {
	const quoteEl = document.getElementById('dailyQuote');
	const authorEl = document.querySelector('.quote-author');

	if (!quoteEl) return;

	const today = new Date().toDateString();
	const savedQuote = localStorage.getItem('dailyQuote');
	const savedDate = localStorage.getItem('quoteDate');

	if (savedQuote && savedDate === today) {
		const quote = JSON.parse(savedQuote);
		quoteEl.textContent = `"${quote.text}"`;
		authorEl.textContent = `— ${quote.author}`;
		return;
	}

	try {
		const response = await fetch('https://zenquotes.io/api/random');

		if (!response.ok) {
			throw new Error('API request failed');
		}

		const data = await response.json();

		if (data && data[0]) {
			const quote = {
				text: data[0].q,
				author: data[0].a,
			};

			quoteEl.textContent = `"${quote.text}"`;
			authorEl.textContent = `— ${quote.author}`;

			localStorage.setItem('dailyQuote', JSON.stringify(quote));
			localStorage.setItem('quoteDate', today);
		} else {
			throw new Error('Invalid response format');
		}
	} catch (error) {
		console.error('Failed to fetch quote:', error);

		const fallbackQuotes = [
			{
				text: 'The secret of getting ahead is getting started.',
				author: 'Mark Twain',
			},
			{
				text: "Believe you can and you're halfway there.",
				author: 'Theodore Roosevelt',
			},
			{
				text: 'The only way to do great work is to love what you do.',
				author: 'Steve Jobs',
			},
			{
				text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
				author: 'Winston Churchill',
			},
			{
				text: "Don't watch the clock; do what it does. Keep going.",
				author: 'Sam Levenson',
			},
			{
				text: 'The future depends on what you do today.',
				author: 'Mahatma Gandhi',
			},
			{
				text: 'You are never too old to set another goal or to dream a new dream.',
				author: 'C.S. Lewis',
			},
			{
				text: 'It does not matter how slowly you go as long as you do not stop.',
				author: 'Confucius',
			},
			{
				text: "Everything you've ever wanted is on the other side of fear.",
				author: 'George Addair',
			},
			{ text: 'Dream big and dare to fail.', author: 'Norman Vaughan' },
			{
				text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
				author: 'Chinese Proverb',
			},
			{
				text: "Your limitation—it's only your imagination.",
				author: 'Unknown',
			},
			{
				text: 'Great things never come from comfort zones.',
				author: 'Unknown',
			},
			{
				text: "Success doesn't just find you. You have to go out and get it.",
				author: 'Unknown',
			},
			{
				text: "The harder you work for something, the greater you'll feel when you achieve it.",
				author: 'Unknown',
			},
		];

		const dayOfYear = Math.floor(
			(new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
		);
		const quoteIndex = dayOfYear % fallbackQuotes.length;
		const quote = fallbackQuotes[quoteIndex];

		quoteEl.textContent = `"${quote.text}"`;
		authorEl.textContent = `— ${quote.author}`;

		localStorage.setItem('dailyQuote', JSON.stringify(quote));
		localStorage.setItem('quoteDate', today);
	}
}
// ============================================
// JOURNAL SYSTEM (CONTINUED FROM PART 1)
// ============================================
let currentJournalId = null;

function setupJournal() {
	const newJournalBtn = document.getElementById('newJournalBtn');
	const journalModal = document.getElementById('journalModal');
	const closeJournalModal = document.getElementById('closeJournalModal');
	const saveJournalModalBtn = document.getElementById('saveJournalModalBtn');
	const deleteJournalBtn = document.getElementById('deleteJournalBtn');
	const journalModalText = document.getElementById('journalModalText');

	if (!newJournalBtn) return;

	newJournalBtn.addEventListener('click', () => {
		openJournalModal();
	});

	closeJournalModal.addEventListener('click', () => {
		journalModal.classList.remove('active');
		currentJournalId = null;
	});

	journalModal.addEventListener('click', (e) => {
		if (e.target === journalModal) {
			journalModal.classList.remove('active');
			currentJournalId = null;
		}
	});

	saveJournalModalBtn.addEventListener('click', () => {
		const text = journalModalText.value.trim();
		if (text) {
			if (currentJournalId) {
				// Update existing entry
				const entry = state.journalEntries.find(
					(e) => e.id === currentJournalId
				);
				if (entry) {
					entry.text = text;
					entry.updatedAt = new Date().toISOString();
				}
			} else {
				// Create new entry
				state.journalEntries.push({
					id: Date.now(),
					text: text,
					date: new Date().toISOString(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});
				awardXP(XP_REWARDS.JOURNAL_SAVE, 'Journal Entry');
			}

			renderJournalEntries();
			updateStreaks();
			saveState();
			journalModal.classList.remove('active');
			currentJournalId = null;
			journalModalText.value = '';
			showNotification('Journal entry saved! 📝');
		}
	});

	deleteJournalBtn.addEventListener('click', () => {
		if (
			currentJournalId &&
			confirm('Are you sure you want to delete this journal entry?')
		) {
			state.journalEntries = state.journalEntries.filter(
				(e) => e.id !== currentJournalId
			);
			renderJournalEntries();
			saveState();
			journalModal.classList.remove('active');
			currentJournalId = null;
			showNotification('Journal entry deleted');
		}
	});

	renderJournalEntries();
}

function openJournalModal(entryId = null) {
	const modal = document.getElementById('journalModal');
	const modalTitle = document.getElementById('journalModalTitle');
	const modalDate = document.getElementById('journalModalDate');
	const modalText = document.getElementById('journalModalText');
	const deleteBtn = document.getElementById('deleteJournalBtn');

	currentJournalId = entryId;

	if (entryId) {
		const entry = state.journalEntries.find((e) => e.id === entryId);
		if (entry) {
			modalTitle.textContent = 'Edit Journal Entry';
			modalDate.textContent = formatDate(entry.date);
			modalText.value = entry.text;
			deleteBtn.style.display = 'block';
		}
	} else {
		modalTitle.textContent = 'New Journal Entry';
		modalDate.textContent = formatDate(new Date());
		modalText.value = '';
		deleteBtn.style.display = 'none';
	}

	modal.classList.add('active');
	modalText.focus();
}

function renderJournalEntries() {
	const grid = document.getElementById('journalEntriesGrid');
	if (!grid) return;

	if (state.journalEntries.length === 0) {
		grid.innerHTML =
			'<p class="empty-state">No journal entries yet. Click "New Entry" to start!</p>';
		return;
	}

	grid.innerHTML = '';

	// Sort by date, newest first
	const sortedEntries = [...state.journalEntries].sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	);

	sortedEntries.forEach((entry) => {
		const card = document.createElement('div');
		card.className = 'journal-entry-card';

		const date = new Date(entry.date);
		const dateStr = date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});

		const preview = entry.text.substring(0, 200);
		const wordCount = entry.text.split(/\s+/).length;

		card.innerHTML = `
            <div class="journal-entry-date">${dateStr}</div>
            <div class="journal-entry-preview">${escapeHtml(preview)}${
			entry.text.length > 200 ? '...' : ''
		}</div>
            <div class="journal-entry-wordcount">${wordCount} words</div>
        `;

		card.addEventListener('click', () => openJournalModal(entry.id));

		grid.appendChild(card);
	});
}

// ============================================
// GRATITUDE JOURNAL
// ============================================
function setupGratitude() {
	const saveBtn = document.getElementById('saveGratitude');
	const input1 = document.getElementById('gratitude1');
	const input2 = document.getElementById('gratitude2');
	const input3 = document.getElementById('gratitude3');

	if (!saveBtn) return;

	// Load today's gratitudes if they exist
	const today = getDateString();
	const todayGratitude = state.gratitudes.find((g) => g.date === today);
	if (todayGratitude) {
		input1.value = todayGratitude.items[0] || '';
		input2.value = todayGratitude.items[1] || '';
		input3.value = todayGratitude.items[2] || '';
	}

	saveBtn.addEventListener('click', () => {
		const items = [
			input1.value.trim(),
			input2.value.trim(),
			input3.value.trim(),
		].filter((item) => item !== '');

		if (items.length === 0) {
			showNotification('Please add at least one gratitude');
			return;
		}

		const today = getDateString();

		// Remove today's gratitude if exists
		state.gratitudes = state.gratitudes.filter((g) => g.date !== today);

		// Add new gratitude
		state.gratitudes.push({
			date: today,
			items: items,
			timestamp: new Date().toISOString(),
		});

		// Keep only last 90 days
		state.gratitudes = state.gratitudes.slice(-90);

		renderGratitudeHistory();
		updateStreaks();
		saveState();
		awardXP(XP_REWARDS.GRATITUDE_LOG, 'Gratitude Logged');
		showNotification('Gratitudes saved! 🙏');
	});

	renderGratitudeHistory();
}

function renderGratitudeHistory() {
	const historyEl = document.getElementById('gratitudeHistory');
	if (!historyEl) return;

	if (state.gratitudes.length === 0) {
		historyEl.innerHTML =
			'<p class="empty-state">No gratitudes yet. Start by listing 3 things above!</p>';
		return;
	}

	historyEl.innerHTML = '';

	// Show last 30 gratitude entries
	const recentGratitudes = [...state.gratitudes].reverse().slice(0, 30);

	recentGratitudes.forEach((gratitude) => {
		const entry = document.createElement('div');
		entry.className = 'gratitude-entry';

		const dateStr = formatDate(gratitude.date);

		const itemsHTML = gratitude.items
			.map((item) => `<div class="gratitude-item">${escapeHtml(item)}</div>`)
			.join('');

		entry.innerHTML = `
            <div class="gratitude-entry-date">${dateStr}</div>
            <div class="gratitude-entry-list">
                ${itemsHTML}
            </div>
        `;

		historyEl.appendChild(entry);
	});
}

// ============================================
// GOALS SYSTEM
// ============================================

let editingGoalId = null;

function setupGoals() {
	renderGoals();
	updateGoalStats();

	// Add goal button
	const addGoalBtn = document.getElementById('addGoalBtn');
	if (addGoalBtn) {
		addGoalBtn.addEventListener('click', () => {
			editingGoalId = null;
			document.getElementById('goalModalTitle').textContent = 'Create New Goal';
			document.getElementById('saveGoalBtn').textContent = 'Create Goal';
			clearGoalForm();
			document.getElementById('goalModal').classList.add('active');
		});
	}

	// Goal type change handler
	const goalType = document.getElementById('goalType');
	if (goalType) {
		goalType.addEventListener('change', (e) => {
			const type = e.target.value;
			const targetGroup = document.getElementById('targetGroup');
			const unitGroup = document.getElementById('unitGroup');
			const deadlineGroup = document.getElementById('deadlineGroup');
			const weeklyTargetGroup = document.getElementById('weeklyTargetGroup');
			const milestonesGroup = document.getElementById('milestonesGroup');
			const targetLabel = document.getElementById('targetLabel');
			const targetInput = document.getElementById('goalTarget');

			// Hide all first
			targetGroup.style.display = 'none';
			unitGroup.style.display = 'none';
			deadlineGroup.style.display = 'none';
			if (weeklyTargetGroup) weeklyTargetGroup.style.display = 'none';
			if (milestonesGroup) milestonesGroup.style.display = 'none';

			// Show based on type and update labels
			if (type === 'numeric') {
				targetGroup.style.display = 'block';
				unitGroup.style.display = 'block';
				deadlineGroup.style.display = 'block';
				targetLabel.textContent = 'Target Amount';
				targetInput.placeholder = 'e.g., 12';
			} else if (type === 'habit') {
				targetGroup.style.display = 'block';
				unitGroup.style.display = 'none';
				deadlineGroup.style.display = 'block';
				targetLabel.textContent = 'Target Days';
				targetInput.placeholder = 'e.g., 30';
				document.getElementById('goalUnit').value = 'days';
			} else if (type === 'deadline') {
				targetGroup.style.display = 'none';
				unitGroup.style.display = 'none';
				deadlineGroup.style.display = 'block';
			} else if (type === 'weekly') {
				if (weeklyTargetGroup) weeklyTargetGroup.style.display = 'block';
				unitGroup.style.display = 'block';
				deadlineGroup.style.display = 'block';
				// Weekly doesn't show target field, only weeklyTarget
			} else if (type === 'yes-no') {
				targetGroup.style.display = 'block';
				targetLabel.textContent = 'Target Days in a Row';
				targetInput.placeholder = 'e.g., 30';
				targetInput.value = 30; // Default 30 days
				unitGroup.style.display = 'none';
				document.getElementById('goalUnit').value = 'days';
				deadlineGroup.style.display = 'block';
			} else if (type === 'percentage') {
				targetGroup.style.display = 'block';
				targetLabel.textContent = 'Target Percentage';
				targetInput.placeholder = '100';
				targetInput.value = 100;
				unitGroup.style.display = 'none';
				document.getElementById('goalUnit').value = '%';
				deadlineGroup.style.display = 'block';
			} else if (type === 'milestone') {
				if (milestonesGroup) milestonesGroup.style.display = 'block';
				deadlineGroup.style.display = 'block';
			}
		});
	}

	// Save goal
	const saveGoalBtn = document.getElementById('saveGoalBtn');
	if (saveGoalBtn) {
		saveGoalBtn.addEventListener('click', () => {
			const title = document.getElementById('goalTitle').value.trim();
			const description = document
				.getElementById('goalDescription')
				.value.trim();
			const type = document.getElementById('goalType').value;
			let target = parseInt(document.getElementById('goalTarget').value) || 0;
			const unit = document.getElementById('goalUnit').value.trim();
			const deadline = document.getElementById('goalDeadline').value;
			const category = document.getElementById('goalCategory').value;

			// NEW: Handle weekly target
			const weeklyTargetEl = document.getElementById('weeklyTarget');
			const weeklyTarget = weeklyTargetEl
				? parseInt(weeklyTargetEl.value) || 0
				: 0;

			// NEW: Handle milestones
			const milestonesEl = document.getElementById('milestones');
			const milestonesText = milestonesEl ? milestonesEl.value : '';
			const milestonesList = milestonesText
				.split('\n')
				.map((m) => m.trim())
				.filter((m) => m.length > 0);

			if (!title) {
				showNotification('Please enter a goal title');
				return;
			}

			// Validation based on type
			if (type === 'weekly' && !weeklyTarget) {
				showNotification('Please enter times per week');
				return;
			}

			if (type === 'milestone' && milestonesList.length === 0) {
				showNotification('Please add at least one milestone');
				return;
			}

			if (!['deadline', 'milestone', 'weekly'].includes(type) && !target) {
				showNotification('Please enter a target');
				return;
			}

			// Set defaults based on type
			if (type === 'deadline') target = 1;
			if (type === 'milestone') target = milestonesList.length;
			if (type === 'yes-no') target = target || 30;
			if (type === 'percentage') target = 100;

			const goalData = {
				id: editingGoalId || Date.now(),
				title,
				description,
				type,
				target,
				unit,
				deadline,
				category,
				currentProgress: 0,
				completed: false,
				createdAt: editingGoalId
					? state.goals.find((g) => g.id === editingGoalId).createdAt
					: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				// NEW fields
				weeklyTarget: weeklyTarget || null,
				milestones: milestonesList.length > 0 ? milestonesList : null,
				completedMilestones: [],
				weeklyProgress: [],
			};

			if (editingGoalId) {
				const index = state.goals.findIndex((g) => g.id === editingGoalId);
				if (index !== -1) {
					goalData.currentProgress = state.goals[index].currentProgress;
					goalData.completedMilestones =
						state.goals[index].completedMilestones || [];
					goalData.weeklyProgress = state.goals[index].weeklyProgress || [];
					state.goals[index] = goalData;
				}
				showNotification('Goal updated!');
				awardXP(5, 'Goal Updated');
			} else {
				state.goals.push(goalData);
				showNotification('Goal created! 🎯');
				awardXP(10, 'Goal Created');
			}

			saveState();
			renderGoals();
			updateGoalStats();
			document.getElementById('goalModal').classList.remove('active');
		});
	}

	// Close modals
	const closeGoalModal = document.getElementById('closeGoalModal');
	if (closeGoalModal) {
		closeGoalModal.addEventListener('click', () => {
			document.getElementById('goalModal').classList.remove('active');
		});
	}

	const cancelGoalBtn = document.getElementById('cancelGoalBtn');
	if (cancelGoalBtn) {
		cancelGoalBtn.addEventListener('click', () => {
			document.getElementById('goalModal').classList.remove('active');
		});
	}

	const closeProgressModal = document.getElementById('closeProgressModal');
	if (closeProgressModal) {
		closeProgressModal.addEventListener('click', () => {
			document.getElementById('progressModal').classList.remove('active');
		});
	}

	const cancelProgressBtn = document.getElementById('cancelProgressBtn');
	if (cancelProgressBtn) {
		cancelProgressBtn.addEventListener('click', () => {
			document.getElementById('progressModal').classList.remove('active');
		});
	}

	// Save progress
	const saveProgressBtn = document.getElementById('saveProgressBtn');
	if (saveProgressBtn) {
		saveProgressBtn.addEventListener('click', () => {
			const increment =
				parseFloat(document.getElementById('progressIncrement').value) || 0;

			if (increment <= 0) {
				showNotification('Please enter a valid amount');
				return;
			}

			const goal = state.goals.find((g) => g.id === editingGoalId);
			if (!goal) return;

			goal.currentProgress = (goal.currentProgress || 0) + increment;
			goal.updatedAt = new Date().toISOString();

			// Check if goal is now complete
			if (goal.currentProgress >= goal.target && !goal.completed) {
				goal.completed = true;
				showNotification(`🎉 Goal completed: ${goal.title}!`);
				awardXP(50, 'Goal Completed');
			} else {
				showNotification('Progress updated! 📈');
				awardXP(5, 'Progress Updated');
			}

			saveState();
			renderGoals();
			updateGoalStats();
			document.getElementById('progressModal').classList.remove('active');
		});
	}

	// Filter buttons
	document.querySelectorAll('.filter-btn').forEach((btn) => {
		btn.addEventListener('click', () => {
			document
				.querySelectorAll('.filter-btn')
				.forEach((b) => b.classList.remove('active'));
			btn.classList.add('active');
			const filter = btn.getAttribute('data-filter');
			renderGoals(filter);
		});
	});
}

function setupDataManagement() {
	const exportBtn = document.getElementById('exportDataBtn');
	const importBtn = document.getElementById('importDataBtn');
	const importInput = document.getElementById('importDataInput');
	const clearBtn = document.getElementById('clearDataBtn');

	// Export Data
	if (exportBtn) {
		exportBtn.addEventListener('click', exportData);
	}

	// Import Data
	if (importBtn) {
		importBtn.addEventListener('click', () => {
			importInput.click();
		});
	}

	if (importInput) {
		importInput.addEventListener('change', importData);
	}

	// Clear All Data
	if (clearBtn) {
		clearBtn.addEventListener('click', clearAllData);
	}

	// Update data stats when settings modal opens
	const settingsBtn = document.getElementById('settingsBtn');
	if (settingsBtn) {
		settingsBtn.addEventListener('click', updateDataStats);
	}
}

function exportData() {
	try {
		// Gather all data
		const exportData = {
			version: '1.0',
			exportDate: new Date().toISOString(),
			data: {
				todos: state.todos,
				habits: state.habits,
				journalEntries: state.journalEntries,
				moods: state.moods,
				energyLevels: state.energyLevels,
				gratitudes: state.gratitudes,
				goals: state.goals,
				xp: state.xp,
				level: state.level,
				longestStreak: state.longestStreak,
				currentStreak: state.currentStreak,
				lastActiveDate: state.lastActiveDate,
				theme: state.theme,
			},
		};

		// Convert to JSON
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });

		// Create download link
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;

		// Generate filename with date
		const date = new Date().toISOString().split('T')[0];
		link.download = `lyfocus-backup-${date}.json`;

		// Trigger download
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		showNotification('✅ Data exported successfully!');
		awardXP(10, 'Data Backup');
	} catch (error) {
		console.error('Export failed:', error);
		showNotification('❌ Export failed. Please try again.');
	}
}

function importData(event) {
	const file = event.target.files[0];
	if (!file) return;

	// Confirm import (will overwrite current data)
	if (
		!confirm(
			'⚠️ This will replace ALL your current data with the backup. Continue?'
		)
	) {
		event.target.value = ''; // Reset input
		return;
	}

	const reader = new FileReader();

	reader.onload = function (e) {
		try {
			const importedData = JSON.parse(e.target.result);

			// Validate data structure
			if (!importedData.version || !importedData.data) {
				throw new Error('Invalid backup file format');
			}

			// Restore data
			state.todos = importedData.data.todos || [];
			state.habits = importedData.data.habits || [];
			state.journalEntries = importedData.data.journalEntries || [];
			state.moods = importedData.data.moods || [];
			state.energyLevels = importedData.data.energyLevels || [];
			state.gratitudes = importedData.data.gratitudes || [];
			state.goals = importedData.data.goals || [];
			state.xp = importedData.data.xp || 0;
			state.level = importedData.data.level || 1;
			state.longestStreak = importedData.data.longestStreak || 0;
			state.currentStreak = importedData.data.currentStreak || 0;
			state.lastActiveDate = importedData.data.lastActiveDate || null;
			state.theme = importedData.data.theme || 'light';

			// Save to localStorage
			saveState();

			// Refresh UI
			renderAll();
			updateXPDisplay();
			updateStats();
			applyTheme(state.theme);

			showNotification('✅ Data imported successfully!');

			// Reload page to ensure everything is fresh
			setTimeout(() => {
				location.reload();
			}, 1000);
		} catch (error) {
			console.error('Import failed:', error);
			showNotification('❌ Import failed. Invalid backup file.');
		}
	};

	reader.readAsText(file);
	event.target.value = ''; // Reset input
}

function clearAllData() {
	// Triple confirmation for safety
	const confirm1 = confirm(
		'⚠️ WARNING: This will delete ALL your data permanently. Are you sure?'
	);
	if (!confirm1) return;

	const confirm2 = confirm(
		'🚨 LAST CHANCE: This action cannot be undone. Delete everything?'
	);
	if (!confirm2) return;

	const confirm3 = prompt('Type "DELETE" to confirm permanent deletion:');
	if (confirm3 !== 'DELETE') {
		showNotification('Deletion cancelled.');
		return;
	}

	try {
		// Clear all localStorage
		localStorage.clear();

		// Reset state
		state = {
			todos: [],
			habits: [],
			journal: '',
			journalEntries: [],
			moods: [],
			energyLevels: [],
			gratitudes: [],
			xp: 0,
			level: 1,
			longestStreak: 0,
			currentStreak: 0,
			lastActiveDate: null,
			theme: 'light',
			currentPage: 'overview',
			customWidgets: [],
			goals: [],
		};

		showNotification('🗑️ All data cleared.');

		// Reload page
		setTimeout(() => {
			location.reload();
		}, 1000);
	} catch (error) {
		console.error('Clear failed:', error);
		showNotification('❌ Failed to clear data.');
	}
}

function updateDataStats() {
	// Update counts
	const totalTasksCount = document.getElementById('totalTasksCount');
	const totalHabitsCount = document.getElementById('totalHabitsCount');
	const totalGoalsCount = document.getElementById('totalGoalsCount');
	const totalJournalCount = document.getElementById('totalJournalCount');
	const storageUsed = document.getElementById('storageUsed');

	if (totalTasksCount) totalTasksCount.textContent = state.todos.length;
	if (totalHabitsCount) totalHabitsCount.textContent = state.habits.length;
	if (totalGoalsCount) totalGoalsCount.textContent = state.goals.length;
	if (totalJournalCount)
		totalJournalCount.textContent = state.journalEntries.length;

	// Calculate storage used
	if (storageUsed) {
		let total = 0;
		for (let key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				total += localStorage[key].length + key.length;
			}
		}
		const kb = (total / 1024).toFixed(2);
		storageUsed.textContent = `${kb} KB`;
	}
}

function renderGoals(filter = 'all') {
	const goalsGrid = document.getElementById('goalsGrid');
	if (!goalsGrid) return;

	let filteredGoals = state.goals;
	if (filter === 'active') {
		filteredGoals = state.goals.filter((g) => !g.completed);
	} else if (filter === 'completed') {
		filteredGoals = state.goals.filter((g) => g.completed);
	}

	if (filteredGoals.length === 0) {
		goalsGrid.innerHTML =
			'<p class="empty-state">No goals found. Create your first goal!</p>';
		return;
	}

	goalsGrid.innerHTML = filteredGoals
		.map((goal) => createGoalCard(goal))
		.join('');

	// Attach event listeners
	filteredGoals.forEach((goal) => {
		const card = document.querySelector(`[data-goal-id="${goal.id}"]`);
		if (!card) return;

		const updateBtn = card.querySelector('.update-progress-btn');
		const completeBtn = card.querySelector('.complete-goal-btn');
		const editBtn = card.querySelector('.edit-goal-btn');
		const deleteBtn = card.querySelector('.delete-goal-btn');

		if (updateBtn) {
			updateBtn.addEventListener('click', () => openProgressModal(goal.id));
		}
		if (completeBtn) {
			completeBtn.addEventListener('click', () =>
				toggleGoalCompletion(goal.id)
			);
		}
		if (editBtn) {
			editBtn.addEventListener('click', () => openEditGoalModal(goal.id));
		}
		if (deleteBtn) {
			deleteBtn.addEventListener('click', () => deleteGoal(goal.id));
		}
	});
}

function getGoalTypeDisplay(goal) {
	const progress = calculateProgress(goal);

	switch (goal.type) {
		case 'weekly':
			const currentWeek = getCurrentWeekProgress(goal);
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${currentWeek}/${goal.weeklyTarget}</span>
						<span class="goal-stat-label">Completed This Week</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.weeklyTarget}</span>
						<span class="goal-stat-label">Times Per Week Goal</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Overall Progress</span>
					</div>
				</div>
			`;

		case 'yes-no':
			const streak = goal.currentProgress || 0;
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${streak}</span>
						<span class="goal-stat-label">Days in a Row</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target Days</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Complete</span>
					</div>
				</div>
			`;

		case 'milestone':
			const completed = goal.completedMilestones?.length || 0;
			return `
				<div class="goal-milestones-display">
					${goal.milestones
						.map(
							(milestone, index) => `
						<div class="milestone-item ${
							goal.completedMilestones?.includes(index) ? 'completed' : ''
						}">
							<span class="milestone-checkbox">${
								goal.completedMilestones?.includes(index) ? '✓' : '○'
							}</span>
							<span class="milestone-text">${escapeHtml(milestone)}</span>
						</div>
					`
						)
						.join('')}
				</div>
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${completed} of ${goal.milestones.length}</span>
						<span class="goal-stat-label">Milestones Completed</span>
					</div>
				</div>
			`;

		case 'percentage':
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}%</span>
						<span class="goal-stat-label">Current Progress</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}%</span>
						<span class="goal-stat-label">Target Percentage</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Complete</span>
					</div>
				</div>
			`;

		case 'numeric':
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}</span>
						<span class="goal-stat-label">Current ${
							goal.unit ? capitalizeFirst(goal.unit) : 'Count'
						}</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target ${
							goal.unit ? capitalizeFirst(goal.unit) : 'Goal'
						}</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Progress</span>
					</div>
				</div>
			`;

		case 'habit':
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}</span>
						<span class="goal-stat-label">Days in a Row</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target Days</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Complete</span>
					</div>
				</div>
			`;

		default:
			return `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}</span>
						<span class="goal-stat-label">Current</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Progress</span>
					</div>
				</div>
			`;
	}
}

function getCurrentWeekProgress(goal) {
	if (!goal.weeklyProgress) return 0;

	const now = new Date();
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
	startOfWeek.setHours(0, 0, 0, 0);

	return goal.weeklyProgress.filter((date) => {
		const progressDate = new Date(date);
		return progressDate >= startOfWeek;
	}).length;
}

function createGoalCard(goal) {
	const progress = calculateProgress(goal);
	const deadline = goal.deadline ? new Date(goal.deadline) : null;
	const daysRemaining = deadline
		? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))
		: null;

	let deadlineClass = '';
	let deadlineText = '';
	if (deadline) {
		if (daysRemaining < 0) {
			deadlineClass = 'overdue';
			deadlineText = `⚠️ Overdue by ${Math.abs(daysRemaining)} days`;
		} else if (daysRemaining <= 7) {
			deadlineClass = 'urgent';
			deadlineText = `⏰ ${daysRemaining} days left`;
		} else {
			deadlineText = `📅 Due ${deadline.toLocaleDateString()}`;
		}
	}

	const categoryEmojis = {
		health: '🏃',
		learning: '📚',
		career: '💼',
		relationships: '❤️',
		creativity: '🎨',
		personal: '✨',
		other: '📌',
	};

	return `
		<div class="goal-card ${goal.completed ? 'completed' : ''}" data-goal-id="${
		goal.id
	}" data-type="${goal.type}">
			<div class="goal-header">
				<span class="goal-category-badge">${
					categoryEmojis[goal.category] || '📌'
				} ${capitalizeFirst(goal.category)}</span>
			</div>
			
			<h3 class="goal-title">${escapeHtml(goal.title)}</h3>
			${
				goal.description
					? `<p class="goal-description">${escapeHtml(goal.description)}</p>`
					: ''
			}
			
			${
				goal.type === 'numeric'
					? `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}</span>
						<span class="goal-stat-label">Current</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Progress</span>
					</div>
				</div>
			`
					: ''
			}
			
			${
				goal.type === 'habit'
					? `
				<div class="goal-stats">
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.currentProgress || 0}</span>
						<span class="goal-stat-label">Current Streak</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${goal.target}</span>
						<span class="goal-stat-label">Target Days</span>
					</div>
					<div class="goal-stat">
						<span class="goal-stat-value">${progress}%</span>
						<span class="goal-stat-label">Progress</span>
					</div>
				</div>
			`
					: ''
			}
			
			<div class="goal-progress-section">
				<div class="goal-progress-bar">
					<div class="goal-progress-fill ${
						progress >= 100 ? 'completed' : ''
					}" style="width: ${Math.min(progress, 100)}%"></div>
				</div>
				<div class="goal-progress-text">
					<span class="goal-progress-current">${goal.currentProgress || 0} ${
		goal.unit ? `${goal.unit}` : ''
	} / ${goal.target} ${goal.unit || ''}</span>
					<span class="goal-progress-percentage">${progress}%</span>
				</div>
			</div>
			
			${
				deadline
					? `<div class="goal-deadline ${deadlineClass}">${deadlineText}</div>`
					: ''
			}
			
			<div class="goal-actions">
				${
					!goal.completed
						? `
					<button class="goal-action-btn update-progress-btn">+ Update</button>
					${
						progress >= 100
							? `<button class="goal-action-btn complete-goal-btn complete">✓ Complete</button>`
							: ''
					}
				`
						: `
					<div class="goal-completed-badge">
						<span>✓</span>
						<span>Completed!</span>
					</div>
				`
				}
			</div>
			
			<div style="display: flex; gap: 8px; margin-top: 12px;">
				<button class="goal-action-btn edit-goal-btn" style="font-size: 12px;">Edit</button>
				<button class="goal-action-btn delete-goal-btn" style="font-size: 12px; color: var(--danger);">Delete</button>
			</div>
		</div>
	`;
}

function calculateProgress(goal) {
	if (!goal.target || goal.target === 0) return 0;
	const current = goal.currentProgress || 0;
	return Math.round((current / goal.target) * 100);
}

function openProgressModal(goalId) {
	const goal = state.goals.find((g) => g.id === goalId);
	if (!goal) return;

	editingGoalId = goalId;

	const current = goal.currentProgress || 0;
	const target = goal.target;
	const unit = goal.unit || '';

	document.getElementById(
		'currentProgressValue'
	).textContent = `${current} / ${target} ${unit}`;
	document.getElementById('progressIncrement').value = '';
	document.getElementById('progressNote').value = '';

	document.getElementById('progressModal').classList.add('active');
}

function toggleGoalCompletion(goalId) {
	const goal = state.goals.find((g) => g.id === goalId);
	if (!goal) return;

	goal.completed = !goal.completed;
	goal.updatedAt = new Date().toISOString();

	if (goal.completed) {
		showNotification(`🎉 Goal completed: ${goal.title}!`);
		awardXP(50, 'Goal Completed');
	}

	saveState();
	renderGoals();
	updateGoalStats();
}

function openEditGoalModal(goalId) {
	const goal = state.goals.find((g) => g.id === goalId);
	if (!goal) return;

	editingGoalId = goalId;
	document.getElementById('goalModalTitle').textContent = 'Edit Goal';
	document.getElementById('saveGoalBtn').textContent = 'Save Changes';

	document.getElementById('goalTitle').value = goal.title;
	document.getElementById('goalDescription').value = goal.description || '';
	document.getElementById('goalType').value = goal.type;
	document.getElementById('goalTarget').value = goal.target;
	document.getElementById('goalUnit').value = goal.unit || '';
	document.getElementById('goalDeadline').value = goal.deadline || '';
	document.getElementById('goalCategory').value = goal.category;

	// Trigger type change to show/hide fields
	document.getElementById('goalType').dispatchEvent(new Event('change'));

	document.getElementById('goalModal').classList.add('active');
}

function deleteGoal(goalId) {
	if (!confirm('Are you sure you want to delete this goal?')) return;

	state.goals = state.goals.filter((g) => g.id !== goalId);
	saveState();
	renderGoals();
	updateGoalStats();
	showNotification('Goal deleted');
}

function clearGoalForm() {
	document.getElementById('goalTitle').value = '';
	document.getElementById('goalDescription').value = '';
	document.getElementById('goalType').value = 'numeric';
	document.getElementById('goalTarget').value = '';
	document.getElementById('goalUnit').value = '';
	document.getElementById('goalDeadline').value = '';
	document.getElementById('goalCategory').value = 'health';
	document.getElementById('goalType').dispatchEvent(new Event('change'));
}

function updateGoalStats() {
	const totalGoals = state.goals.length;
	const activeGoals = state.goals.filter((g) => !g.completed).length;
	const completedGoals = state.goals.filter((g) => g.completed).length;

	console.log('Goal Stats:', { totalGoals, activeGoals, completedGoals });
}

function capitalizeFirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// INSIGHTS & ANALYTICS
// ============================================
function setupInsights() {
	renderInsights();
}

function renderInsights() {
	updateInsightStats();
	renderWeeklyReview();
	renderSmartInsights();
	renderActivityHeatmap();
	renderMoodChart();
	renderEnergyChart();
	renderProductivityChart();
	renderGoalsProgress();
	renderPerformanceStats();
}

function updateInsightStats() {
	// Current Streak
	const currentStreakEl = document.getElementById('currentStreakValue');
	if (currentStreakEl) {
		currentStreakEl.textContent = state.currentStreak;
	}

	// Longest Streak
	const longestStreakEl = document.getElementById('longestStreakValue');
	if (longestStreakEl) {
		longestStreakEl.textContent = state.longestStreak;
	}

	// Total Tasks Completed
	const totalTasksEl = document.getElementById('totalTasksValue');
	if (totalTasksEl) {
		const completedTasks = state.todos.filter((t) => t.completed).length;
		totalTasksEl.textContent = completedTasks;
	}

	// Weekly Progress
	const weeklyProgressEl = document.getElementById('weeklyProgressValue');
	if (weeklyProgressEl) {
		const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
		const weeklyTodos = state.todos.filter(
			(t) => new Date(t.createdAt) >= sevenDaysAgo
		);
		const completedWeekly = weeklyTodos.filter((t) => t.completed).length;
		const percentage =
			weeklyTodos.length > 0
				? Math.round((completedWeekly / weeklyTodos.length) * 100)
				: 0;
		weeklyProgressEl.textContent = percentage + '%';
	}
}

function renderWeeklyReview() {
	const reviewCard = document.getElementById('weeklyReviewCard');
	if (!reviewCard) return;

	// Need at least 7 days of data
	const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
	const hasEnoughData =
		state.todos.length > 0 ||
		state.habits.length > 0 ||
		state.moods.length >= 3;

	if (!hasEnoughData) {
		reviewCard.innerHTML =
			'<p class="empty-state">Complete at least 7 days of activity to see your weekly review</p>';
		return;
	}

	// Calculate weekly stats
	const weeklyTodos = state.todos.filter(
		(t) => new Date(t.createdAt) >= sevenDaysAgo
	);
	const completedWeekly = weeklyTodos.filter((t) => t.completed).length;

	const weeklyHabits = state.habits.filter(
		(h) => h.lastCompleted && new Date(h.lastCompleted) >= sevenDaysAgo
	);
	const avgHabitCompletion =
		state.habits.length > 0
			? Math.round((weeklyHabits.length / (state.habits.length * 7)) * 100)
			: 0;

	const weeklyMoods = state.moods.filter(
		(m) => new Date(m.date) >= sevenDaysAgo
	);
	const avgMood =
		weeklyMoods.length > 0
			? (
					(weeklyMoods.filter((m) => ['amazing', 'good'].includes(m.mood))
						.length /
						weeklyMoods.length) *
					100
			  ).toFixed(0)
			: 0;

	const weeklyEnergy = state.energyLevels.filter(
		(e) => new Date(e.timestamp) >= sevenDaysAgo
	);
	const avgEnergy =
		weeklyEnergy.length > 0
			? (
					weeklyEnergy.reduce((sum, e) => sum + e.level, 0) /
					weeklyEnergy.length
			  ).toFixed(1)
			: 0;

	// Previous week for comparison
	const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
	const prevWeekTodos = state.todos.filter((t) => {
		const date = new Date(t.createdAt);
		return date >= fourteenDaysAgo && date < sevenDaysAgo;
	});
	const prevCompletedWeekly = prevWeekTodos.filter((t) => t.completed).length;
	const todoTrend =
		completedWeekly > prevCompletedWeekly
			? '↑'
			: completedWeekly < prevCompletedWeekly
			? '↓'
			: '→';
	const todoTrendClass =
		completedWeekly > prevCompletedWeekly
			? 'trend-up'
			: completedWeekly < prevCompletedWeekly
			? 'trend-down'
			: '';

	reviewCard.innerHTML = `
        <div class="review-stat">
            <span class="review-stat-label">Tasks Completed</span>
            <span class="review-stat-value ${todoTrendClass}">${completedWeekly} ${todoTrend}</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-label">Habit Consistency</span>
            <span class="review-stat-value">${avgHabitCompletion}%</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-label">Positive Mood Days</span>
            <span class="review-stat-value">${avgMood}%</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-label">Average Energy</span>
            <span class="review-stat-value">${avgEnergy}/10</span>
        </div>
        <div class="review-stat">
            <span class="review-stat-label">Current Streak</span>
            <span class="review-stat-value">${state.currentStreak} days 🔥</span>
        </div>
    `;
}

function renderSmartInsights() {
	const insightsList = document.getElementById('insightsList');
	if (!insightsList) return;

	const insights = generateSmartInsights();

	if (insights.length === 0) {
		insightsList.innerHTML =
			'<p class="empty-state">Keep logging your activities to unlock personalized insights!</p>';
		return;
	}

	insightsList.innerHTML = '';

	insights.forEach((insight) => {
		const item = document.createElement('div');
		item.className = 'insight-item';
		item.innerHTML = `
            <div class="insight-item-title">${insight.title}</div>
            <div class="insight-item-text">${insight.text}</div>
        `;
		insightsList.appendChild(item);
	});
}

// Activity Heatmap
function renderActivityHeatmap() {
	const heatmapEl = document.getElementById('activityHeatmap');
	if (!heatmapEl) return;

	// Get last 28 days (4 weeks)
	const days = [];
	const today = new Date();

	for (let i = 27; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		days.push(date);
	}

	// Calculate activity level for each day
	const activityData = days.map((date) => {
		const dateStr = getDateString(date);

		let activity = 0;

		// Count completed tasks
		activity += state.todos.filter(
			(t) => t.completed && getDateString(new Date(t.createdAt)) === dateStr
		).length;

		// Count completed habits
		activity += state.habits.filter((h) => h.lastCompleted === dateStr).length;

		// Check if journaled
		if (
			state.journalEntries.some(
				(j) => getDateString(new Date(j.date)) === dateStr
			)
		) {
			activity += 2;
		}

		// Check if logged mood/energy
		if (state.moods.some((m) => m.date === dateStr)) activity += 1;
		if (state.energyLevels.some((e) => e.date === dateStr)) activity += 1;

		return { date, activity };
	});

	if (activityData.every((d) => d.activity === 0)) {
		heatmapEl.innerHTML =
			'<p class="empty-state">Track your activity for 7+ days to see the heatmap!</p>';
		return;
	}

	heatmapEl.innerHTML = '';

	activityData.forEach(({ date, activity }) => {
		const day = document.createElement('div');

		// Determine level (0-4)
		let level = 0;
		if (activity >= 8) level = 4;
		else if (activity >= 6) level = 3;
		else if (activity >= 4) level = 2;
		else if (activity >= 1) level = 1;

		day.className = `heatmap-day level-${level}`;
		day.innerHTML = `
			<div class="heatmap-day-name">${date.toLocaleDateString('en-US', {
				weekday: 'short',
			})}</div>
			<div class="heatmap-day-number">${date.getDate()}</div>
		`;
		day.title = `${date.toLocaleDateString()}: ${activity} activities`;

		heatmapEl.appendChild(day);
	});
}

// Mood Chart (Pie Chart)
let moodChartInstance = null;

function renderMoodChart() {
	const canvas = document.getElementById('moodChart');
	if (!canvas) return;

	if (state.moods.length === 0) {
		const parent = canvas.parentElement;
		parent.innerHTML =
			'<p class="empty-state">Log moods to see distribution</p>';
		return;
	}

	// Destroy existing chart
	if (moodChartInstance) {
		moodChartInstance.destroy();
	}

	// Count moods
	const moodCounts = {
		amazing: 0,
		good: 0,
		okay: 0,
		bad: 0,
		terrible: 0,
	};

	state.moods.forEach((m) => {
		moodCounts[m.mood]++;
	});

	const ctx = canvas.getContext('2d');
	moodChartInstance = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Amazing', 'Good', 'Okay', 'Bad', 'Terrible'],
			datasets: [
				{
					data: [
						moodCounts.amazing,
						moodCounts.good,
						moodCounts.okay,
						moodCounts.bad,
						moodCounts.terrible,
					],
					backgroundColor: [
						'#10b981',
						'#6366f1',
						'#f59e0b',
						'#ef4444',
						'#7f1d1d',
					],
				},
			],
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: 'bottom',
				},
			},
		},
	});
}

// Energy Chart (Line Chart)
let energyChartInstance = null;

function renderEnergyChart() {
	const canvas = document.getElementById('energyChart');
	if (!canvas) return;

	if (state.energyLevels.length === 0) {
		const parent = canvas.parentElement;
		parent.innerHTML =
			'<p class="empty-state">Log energy levels to see trends</p>';
		return;
	}

	// Destroy existing chart
	if (energyChartInstance) {
		energyChartInstance.destroy();
	}

	// Get last 7 days
	const last7Days = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		last7Days.push(getDateString(date));
	}

	const energyData = last7Days.map((date) => {
		const entry = state.energyLevels.find((e) => e.date === date);
		return entry ? entry.level : null;
	});

	const ctx = canvas.getContext('2d');
	energyChartInstance = new Chart(ctx, {
		type: 'line',
		data: {
			labels: last7Days.map((d) =>
				new Date(d).toLocaleDateString('en-US', { weekday: 'short' })
			),
			datasets: [
				{
					label: 'Energy Level',
					data: energyData,
					borderColor: '#6366f1',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
					tension: 0.4,
					fill: true,
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				y: {
					beginAtZero: true,
					max: 10,
				},
			},
			plugins: {
				legend: {
					display: false,
				},
			},
		},
	});
}

// Productivity Chart (Bar Chart)
let productivityChartInstance = null;

function renderProductivityChart() {
	const canvas = document.getElementById('productivityChart');
	if (!canvas) return;

	// Destroy existing chart
	if (productivityChartInstance) {
		productivityChartInstance.destroy();
	}

	// Get last 30 days
	const last30Days = [];
	for (let i = 29; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		last30Days.push(getDateString(date));
	}

	const tasksData = last30Days.map((date) => {
		return state.todos.filter(
			(t) => t.completed && getDateString(new Date(t.createdAt)) === date
		).length;
	});

	const habitsData = last30Days.map((date) => {
		return state.habits.filter((h) => h.lastCompleted === date).length;
	});

	const ctx = canvas.getContext('2d');
	productivityChartInstance = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: last30Days.map((d) => new Date(d).getDate()),
			datasets: [
				{
					label: 'Tasks',
					data: tasksData,
					backgroundColor: '#6366f1',
				},
				{
					label: 'Habits',
					data: habitsData,
					backgroundColor: '#f59e0b',
				},
			],
		},
		options: {
			responsive: true,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						stepSize: 1,
					},
				},
			},
		},
	});
}

// Goals Progress Overview
function renderGoalsProgress() {
	const grid = document.getElementById('goalsProgressGrid');
	if (!grid) return;

	const activeGoals = state.goals.filter((g) => !g.completed);

	if (activeGoals.length === 0) {
		grid.innerHTML =
			'<p class="empty-state">No active goals. Create goals to see progress!</p>';
		return;
	}

	grid.innerHTML = '';

	activeGoals.forEach((goal) => {
		const progress = calculateProgress(goal);
		const card = document.createElement('div');
		card.className = 'goal-progress-card';
		card.innerHTML = `
			<div class="goal-progress-title">${escapeHtml(goal.title)}</div>
			<div class="goal-progress-bar-mini">
				<div class="goal-progress-fill-mini" style="width: ${progress}%"></div>
			</div>
			<div class="goal-progress-text-mini">${progress}% complete</div>
		`;
		grid.appendChild(card);
	});
}

// Performance Stats
function renderPerformanceStats() {
	// Best Day
	const completedByDay = {};
	state.todos
		.filter((t) => t.completed)
		.forEach((todo) => {
			const date = new Date(todo.createdAt);
			const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
			completedByDay[dayName] = (completedByDay[dayName] || 0) + 1;
		});

	const days = Object.keys(completedByDay);
	let bestDay = '-';
	if (days.length > 0) {
		bestDay = days.reduce((a, b) =>
			completedByDay[a] > completedByDay[b] ? a : b
		);
	}

	const bestDayEl = document.getElementById('bestDayValue');
	if (bestDayEl) bestDayEl.textContent = bestDay;

	// Average tasks per day
	const totalDays =
		state.todos.length > 0
			? Math.ceil(
					(Date.now() - new Date(state.todos[0].createdAt)) /
						(1000 * 60 * 60 * 24)
			  )
			: 0;
	const avgTasks =
		totalDays > 0
			? (state.todos.filter((t) => t.completed).length / totalDays).toFixed(1)
			: 0;

	const avgTasksEl = document.getElementById('avgTasksValue');
	if (avgTasksEl) avgTasksEl.textContent = avgTasks;

	// Completion rate
	const completionRate =
		state.todos.length > 0
			? Math.round(
					(state.todos.filter((t) => t.completed).length / state.todos.length) *
						100
			  )
			: 0;

	const completionRateEl = document.getElementById('completionRateValue');
	if (completionRateEl) completionRateEl.textContent = completionRate + '%';
}

function generateSmartInsights() {
	const insights = [];

	// Mood vs Energy correlation
	if (state.moods.length >= 5 && state.energyLevels.length >= 5) {
		const moodEnergyPairs = [];
		state.moods.forEach((mood) => {
			const energy = state.energyLevels.find(
				(e) => getDateString(new Date(e.timestamp)) === mood.date
			);
			if (energy) {
				const moodScore = { amazing: 5, good: 4, okay: 3, bad: 2, terrible: 1 }[
					mood.mood
				];
				moodEnergyPairs.push({ mood: moodScore, energy: energy.level });
			}
		});

		if (moodEnergyPairs.length >= 3) {
			const highEnergyDays = moodEnergyPairs.filter((p) => p.energy >= 7);
			const lowEnergyDays = moodEnergyPairs.filter((p) => p.energy <= 4);

			if (highEnergyDays.length >= 2) {
				const avgHighEnergyMood =
					highEnergyDays.reduce((sum, p) => sum + p.mood, 0) /
					highEnergyDays.length;
				const avgLowEnergyMood =
					lowEnergyDays.length > 0
						? lowEnergyDays.reduce((sum, p) => sum + p.mood, 0) /
						  lowEnergyDays.length
						: avgHighEnergyMood - 1;

				const improvement = (
					((avgHighEnergyMood - avgLowEnergyMood) / avgLowEnergyMood) *
					100
				).toFixed(0);

				if (improvement > 10) {
					insights.push({
						title: '⚡ Energy Impact',
						text: `On days when your energy is 7+, your mood is ${improvement}% better. Prioritize sleep and exercise!`,
					});
				}
			}
		}
	}

	// Best productivity day
	const completedByDay = {};
	state.todos
		.filter((t) => t.completed)
		.forEach((todo) => {
			const date = new Date(todo.createdAt);
			const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
			completedByDay[dayName] = (completedByDay[dayName] || 0) + 1;
		});

	const days = Object.keys(completedByDay);
	if (days.length >= 3) {
		const bestDay = days.reduce((a, b) =>
			completedByDay[a] > completedByDay[b] ? a : b
		);
		const bestDayCount = completedByDay[bestDay];
		const avgOtherDays =
			days
				.filter((d) => d !== bestDay)
				.reduce((sum, d) => sum + completedByDay[d], 0) /
			(days.length - 1);

		if (bestDayCount > avgOtherDays * 1.3) {
			insights.push({
				title: '📊 Peak Performance',
				text: `${bestDay} is your most productive day! You complete ${(
					(bestDayCount / avgOtherDays - 1) *
					100
				).toFixed(0)}% more tasks. Schedule important work on ${bestDay}s.`,
			});
		}
	}

	// Habit streak prediction
	const activeHabits = state.habits.filter((h) => h.streak > 0);
	if (activeHabits.length > 0) {
		const bestHabit = activeHabits.reduce((a, b) =>
			a.streak > b.streak ? a : b
		);
		if (bestHabit.streak >= 7) {
			const milestone =
				bestHabit.streak >= 30 ? 60 : bestHabit.streak >= 14 ? 30 : 14;
			const daysToGo = milestone - bestHabit.streak;
			insights.push({
				title: '🔥 Streak Master',
				text: `You're ${daysToGo} days away from a ${milestone}-day streak on "${bestHabit.name}"! Keep it up!`,
			});
		}
	}

	// Consistency insight
	const last7Days = Array.from({ length: 7 }, (_, i) => {
		const date = new Date(Date.now() - i * 86400000);
		return getDateString(date);
	});

	const activeDays = last7Days.filter((date) => {
		return (
			state.todos.some(
				(t) => t.completed && getDateString(new Date(t.createdAt)) === date
			) ||
			state.habits.some((h) => h.lastCompleted === date) ||
			state.moods.some((m) => m.date === date)
		);
	});

	const consistency = ((activeDays.length / 7) * 100).toFixed(0);
	if (consistency >= 70) {
		insights.push({
			title: '⭐ Consistency Champion',
			text: `You've been active ${activeDays.length} out of 7 days this week (${consistency}%). Amazing consistency!`,
		});
	} else if (consistency < 50 && consistency > 0) {
		insights.push({
			title: '💪 Room to Grow',
			text: `You've been active ${activeDays.length} out of 7 days. Try to log something daily to build momentum!`,
		});
	}

	// Gratitude streak
	const gratitudeStreak = calculateGratitudeStreak();
	if (gratitudeStreak >= 3) {
		insights.push({
			title: '🙏 Gratitude Streak',
			text: `You've logged gratitudes for ${gratitudeStreak} days in a row! Research shows daily gratitude improves wellbeing by up to 25%.`,
		});
	}

	// Journal consistency
	const last30Days = 30;
	const journalCount = state.journalEntries.filter((e) => {
		const daysSince = (Date.now() - new Date(e.date)) / 86400000;
		return daysSince <= last30Days;
	}).length;

	if (journalCount >= 10) {
		insights.push({
			title: '📝 Reflection Master',
			text: `You've written ${journalCount} journal entries in the past month. Regular journaling reduces stress and increases self-awareness.`,
		});
	}

	return insights;
}

function calculateGratitudeStreak() {
	if (state.gratitudes.length === 0) return 0;

	const sortedGratitudes = [...state.gratitudes].sort(
		(a, b) => new Date(b.date) - new Date(a.date)
	);
	let streak = 0;
	let expectedDate = getDateString();

	for (const gratitude of sortedGratitudes) {
		if (gratitude.date === expectedDate) {
			streak++;
			const date = new Date(expectedDate);
			date.setDate(date.getDate() - 1);
			expectedDate = getDateString(date);
		} else {
			break;
		}
	}

	return streak;
}

// ============================================
// ENERGY TRACKER
// ============================================
function setupEnergyTracker() {
	const energySlider = document.getElementById('energySlider');
	const energyValue = document.getElementById('energyValue');

	if (!energySlider) return;

	energySlider.addEventListener('input', (e) => {
		energyValue.textContent = e.target.value;
		energyValue.style.animation = 'none';
		setTimeout(() => (energyValue.style.animation = 'pulse 0.3s ease-out'), 10);
	});

	energySlider.addEventListener('change', (e) => {
		const level = parseInt(e.target.value);
		const today = new Date().toDateString();

		state.energyLevels = state.energyLevels.filter((e) => e.date !== today);

		state.energyLevels.push({
			date: today,
			level: level,
			timestamp: new Date().toISOString(),
		});

		state.energyLevels = state.energyLevels.slice(-30);

		renderEnergyHistory();
		updateStreaks();
		saveState();
		awardXP(XP_REWARDS.ENERGY_LOG, 'Energy Logged');
		showNotification('Energy level logged! ⚡');
	});

	const today = new Date().toDateString();
	const todayEnergy = state.energyLevels.find((e) => e.date === today);
	if (todayEnergy) {
		energySlider.value = todayEnergy.level;
		energyValue.textContent = todayEnergy.level;
	}

	renderEnergyHistory();
}

function renderEnergyHistory() {
	const historyEl = document.getElementById('energyHistory');
	if (!historyEl) return;

	if (state.energyLevels.length === 0) {
		historyEl.innerHTML =
			'<p class="empty-state">No energy entries yet. Use the slider above!</p>';
		return;
	}

	historyEl.innerHTML = '';

	const recentEnergy = state.energyLevels.slice().reverse().slice(0, 7);

	recentEnergy.forEach((energy) => {
		const entry = document.createElement('div');
		entry.className = 'energy-entry';
		const date = new Date(energy.date);
		const dateStr = date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric',
		});

		const percentage = (energy.level / 10) * 100;

		entry.innerHTML = `
            <div class="energy-entry-info">
                <div class="energy-entry-date">${dateStr}</div>
                <div class="energy-entry-level">${energy.level}/10</div>
            </div>
            <div class="energy-bar">
                <div class="energy-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
		historyEl.appendChild(entry);
	});
}

// ============================================
// TO-DO LIST
// ============================================
function setupTodoList() {
	const addTaskBtn = document.getElementById('addTaskBtn');
	const taskInputCard = document.getElementById('taskInputCard');
	const todoInput = document.getElementById('todoInput');
	const saveTaskBtn = document.getElementById('saveTaskBtn');
	const cancelTaskBtn = document.getElementById('cancelTaskBtn');

	addTaskBtn.addEventListener('click', () => {
		taskInputCard.style.display = 'block';
		todoInput.focus();
	});

	cancelTaskBtn.addEventListener('click', () => {
		taskInputCard.style.display = 'none';
		todoInput.value = '';
	});

	const addTodo = () => {
		const text = todoInput.value.trim();
		if (text) {
			state.todos.push({
				id: Date.now(),
				text: text,
				completed: false,
				createdAt: new Date().toISOString(),
			});
			todoInput.value = '';
			taskInputCard.style.display = 'none';
			renderTodos();
			updateStats();
			saveState();
		}
	};

	saveTaskBtn.addEventListener('click', addTodo);
	todoInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') addTodo();
	});
}

function renderTodos() {
	const todoList = document.getElementById('todoList');
	const quickTodos = document.getElementById('quickTodos');

	if (state.todos.length === 0) {
		todoList.innerHTML =
			'<p class="empty-state">No tasks yet. Click "New Task" to add one!</p>';
		quickTodos.innerHTML =
			'<p class="empty-state">No tasks yet. Add some in the Tasks page!</p>';
		return;
	}

	todoList.innerHTML = '';
	state.todos.forEach((todo) => {
		const div = document.createElement('div');
		div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
		div.innerHTML = `
            <input type="checkbox" ${
							todo.completed ? 'checked' : ''
						} onchange="toggleTodo(${todo.id})">
            <span>${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${
							todo.id
						})">×</button>
        `;
		todoList.appendChild(div);
	});

	quickTodos.innerHTML = '';
	const incompleteTodos = state.todos.filter((t) => !t.completed).slice(0, 3);

	if (incompleteTodos.length === 0) {
		quickTodos.innerHTML = '<p class="empty-state">All tasks completed! 🎉</p>';
	} else {
		incompleteTodos.forEach((todo) => {
			const div = document.createElement('div');
			div.className = 'todo-item';
			div.innerHTML = `
                <input type="checkbox" onchange="toggleTodo(${todo.id})">
                <span>${escapeHtml(todo.text)}</span>
            `;
			quickTodos.appendChild(div);
		});
	}
}

function toggleTodo(id) {
	const todo = state.todos.find((t) => t.id === id);
	if (todo) {
		todo.completed = !todo.completed;
		if (todo.completed) {
			awardXP(XP_REWARDS.TODO_COMPLETE, 'Task Completed');
			updateStreaks();
		}
		renderTodos();
		updateStats();
		saveState();
	}
}

function deleteTodo(id) {
	state.todos = state.todos.filter((t) => t.id !== id);
	renderTodos();
	updateStats();
	saveState();
}

// ============================================
// HABITS
// ============================================
function setupHabits() {
	const addHabitBtn = document.getElementById('addHabitBtn');
	const habitInputCard = document.getElementById('habitInputCard');
	const habitInput = document.getElementById('habitInput');
	const saveHabitBtn = document.getElementById('saveHabitBtn');
	const cancelHabitBtn = document.getElementById('cancelHabitBtn');

	addHabitBtn.addEventListener('click', () => {
		habitInputCard.style.display = 'block';
		habitInput.focus();
	});

	cancelHabitBtn.addEventListener('click', () => {
		habitInputCard.style.display = 'none';
		habitInput.value = '';
	});

	const addHabit = () => {
		const text = habitInput.value.trim();
		if (text) {
			state.habits.push({
				id: Date.now(),
				name: text,
				streak: 0,
				lastCompleted: null,
				completedToday: false,
				createdAt: new Date().toISOString(),
			});
			habitInput.value = '';
			habitInputCard.style.display = 'none';
			renderHabits();
			updateStats();
			saveState();
		}
	};

	saveHabitBtn.addEventListener('click', addHabit);
	habitInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') addHabit();
	});
}

function renderHabits() {
	const habitsList = document.getElementById('habitsList');

	if (state.habits.length === 0) {
		habitsList.innerHTML =
			'<p class="empty-state">No habits yet. Click "New Habit" to add one!</p>';
		return;
	}

	const today = new Date().toDateString();
	state.habits.forEach((habit) => {
		if (habit.lastCompleted !== today) {
			habit.completedToday = false;
		}
	});

	habitsList.innerHTML = '';
	state.habits.forEach((habit) => {
		const div = document.createElement('div');
		div.className = 'habit-card';
		div.innerHTML = `
            <div class="habit-header">
                <span class="habit-name">${escapeHtml(habit.name)}</span>
<div style="display: flex; gap: 8px; align-items: center;">
<span class="habit-streak">🔥 ${habit.streak}</span>
<button class="habit-delete" onclick="deleteHabit(${
			habit.id
		})" title="Delete habit">×</button>
</div>
</div>
<button class="habit-check ${
			habit.completedToday ? 'completed' : ''
		}" onclick="completeHabit(${habit.id})">
${habit.completedToday ? '✓ Completed Today' : 'Mark Complete'}
</button>
`;
		habitsList.appendChild(div);
	});
}
function completeHabit(id) {
	const habit = state.habits.find((h) => h.id === id);
	if (habit && !habit.completedToday) {
		const today = new Date().toDateString();
		const yesterday = new Date(Date.now() - 86400000).toDateString();
		if (habit.lastCompleted === yesterday) {
			habit.streak++;
		} else if (habit.lastCompleted !== today) {
			habit.streak = 1;
		}
		habit.completedToday = true;
		habit.lastCompleted = today;
		renderHabits();
		updateStats();
		updateStreaks();
		saveState();
		awardXP(XP_REWARDS.HABIT_COMPLETE, 'Habit Completed');
		showNotification('Great job! Keep it up! 🎉');
	}
}
function deleteHabit(id) {
	if (confirm('Are you sure you want to delete this habit?')) {
		state.habits = state.habits.filter((h) => h.id !== id);
		renderHabits();
		updateStats();
		saveState();
		showNotification('Habit deleted');
	}
} // ============================================
// MOOD TRACKER
// ============================================
function setupMoodTracker() {
	const moodBtns = document.querySelectorAll('.mood-btn');
	moodBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const mood = btn.dataset.mood;
			const today = new Date().toDateString();
			state.moods = state.moods.filter((m) => m.date !== today);
			state.moods.push({
				date: today,
				mood: mood,
				emoji: btn.querySelector('.mood-emoji').textContent,
				timestamp: new Date().toISOString(),
			});
			state.moods = state.moods.slice(-30);
			moodBtns.forEach((b) => b.classList.remove('selected'));
			btn.classList.add('selected');
			renderMoodHistory();
			updateStreaks();
			saveState();
			awardXP(XP_REWARDS.MOOD_LOG, 'Mood Logged');
			showNotification('Mood logged! 💭');
		});
	});
	const today = new Date().toDateString();
	const todayMood = state.moods.find((m) => m.date === today);
	if (todayMood) {
		moodBtns.forEach((btn) => {
			if (btn.dataset.mood === todayMood.mood) {
				btn.classList.add('selected');
			}
		});
	}
	renderMoodHistory();
}
function renderMoodHistory() {
	const historyEl = document.getElementById('moodHistory');
	if (state.moods.length === 0) {
		historyEl.innerHTML =
			'<p class="empty-state">No mood entries yet. Log your first mood above!</p>';
		return;
	}
	historyEl.innerHTML = '';
	const recentMoods = state.moods.slice().reverse().slice(0, 7);
	recentMoods.forEach((mood) => {
		const entry = document.createElement('div');
		entry.className = 'mood-entry';
		const date = new Date(mood.date);
		const dateStr = date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric',
		});
		entry.innerHTML = `
        <div class="mood-entry-emoji">${mood.emoji}</div>
        <div class="mood-entry-info">
            <div class="mood-entry-date">${dateStr}</div>
            <div class="mood-entry-mood">${mood.mood}</div>
        </div>
    `;
		historyEl.appendChild(entry);
	});
} // ============================================
// MINI CALENDAR
// ============================================
function setupMiniCalendar() {
	renderMiniCalendar();
}
function renderMiniCalendar() {
	const calendarEl = document.getElementById('miniCalendar');
	if (!calendarEl) return;
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const today = now.getDate();
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	calendarEl.innerHTML = '';
	for (let i = 0; i < firstDay; i++) {
		const day = document.createElement('div');
		day.className = 'calendar-day-mini';
		day.style.opacity = '0';
		calendarEl.appendChild(day);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		const day = document.createElement('div');
		day.className = 'calendar-day-mini';
		if (i === today) {
			day.classList.add('today');
		}
		day.textContent = i;
		calendarEl.appendChild(day);
	}
} // ============================================
// STATS UPDATE
// ============================================
function updateStats() {
	const incompleteTodos = state.todos.filter((t) => !t.completed).length;
	const statTodos = document.getElementById('statTodos');
	if (statTodos) {
		statTodos.textContent = incompleteTodos;
	}
	const completedHabits = state.habits.filter((h) => h.completedToday).length;
	const statHabits = document.getElementById('statHabits');
	if (statHabits) {
		statHabits.textContent = `${completedHabits}/${state.habits.length}`;
	}
	let maxStreak = 0;
	state.habits.forEach((habit) => {
		if (habit.streak > maxStreak) {
			maxStreak = habit.streak;
		}
	});
	const statStreak = document.getElementById('statStreak');
	if (statStreak) {
		statStreak.textContent = maxStreak;
	}
}

// ============================================
// RENDER ALL
// ============================================
function renderAll() {
	renderTodos();
	renderHabits();
	renderMoodHistory();
	renderMiniCalendar();
	renderJournalEntries();
	renderGratitudeHistory();
	renderEnergyHistory();
	updateStats();
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message) {
	const notification = document.createElement('div');
	notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: var(--accent);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
	notification.textContent = message;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'fadeOut 0.3s ease-out';
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}
// Add animations
const styleElement = document.createElement('style');
styleElement.textContent = `
@keyframes fadeOut {
from {
opacity: 1;
transform: translateY(0);
}
to {
opacity: 0;
transform: translateY(-20px);
}
}.habit-delete {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: var(--transition);
}.habit-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
    transform: scale(1.2);
}
`;
document.head.appendChild(styleElement);
