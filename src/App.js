import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button as UIButton } from './components/ui/Button'; // Renamed to avoid conflict
import { Card as UICard, CardHeader as UICardHeader, CardTitle as UICardTitle, CardContent as UICardContent } from './components/ui/Card'; // Renamed
import TaskFormC from './components/TaskForm'; // Renamed
import TaskListC from './components/TaskList'; // Renamed
import { Toaster } from './components/Toaster';
import { toast } from './hooks/use-toast';
import confetti from 'canvas-confetti';
import { PromptDialog } from './components/ui/PromptDialog';
import SpiralFormC from './components/SpiralForm'; // Renamed
import SpiralListC from './components/SpiralList'; // Renamed
import DashboardViewC from './components/DashboardView'; // Renamed
import * as statsHistory from './lib/statsHistory';
import { Timer, CheckCircle, Award, Coffee, AlertTriangle, Play, Moon, Sun, Volume2, VolumeX, BrainCircuit, Clock, Plus, Pause, ChevronDown, ChevronRight, ListChecks, SlidersHorizontal, PieChart, AlertCircle } from 'lucide-react'; // Removed unused icons
import TaskShortcut from './components/TaskShortcut'; // New component for quick task creation

// Different quote categories
const quoteCategories = {
  Annoying: [
    "Are you still sitting there? Your tasks are collecting dust!",
    "Hello? Your to-do list is screaming for attention!",
    "Stop staring at the screen—your work isn't going to do itself!",
    "Tick-tock, time's running out while you do… nothing!",
    "Your tasks are piling up, and they're not happy about it!",
    "Seriously, are you glued to that chair? Move already!",
    "Your procrastination is making your to-do list cry!",
    "Yo, your deadlines are waving at you. Wave back with action!",
    "What's that? Another minute wasted? Keep it up, champ!",
    "Your tasks are begging for mercy. Give them some attention!",
    "Oh, look, another second of doing zilch. Impressive!",
    "Your to-do list is judging you right now. Just saying.",
    "Still not working? Your tasks are forming a protest!",
    "Hey, your goals called. They're tired of waiting!",
    "You're really committed to this \"do nothing\" vibe, huh?",
    "Your work is tapping its foot impatiently. Get to it!",
    "Procrastination called; it says you're its MVP!",
    "Your tasks are staging a sit-in until you start!",
    "What's the hold-up? Your to-do list is getting cranky!",
    "Are you practicing for the World Procrastination Championships?"
  ],
  Motivational: [
    "Every step you take now brings you closer to crushing it!",
    "You've got this—start now and watch success unfold!",
    "One task at a time, and you'll conquer the world!",
    "Your dreams are waiting. Start working to meet them!",
    "Small actions today lead to massive wins tomorrow!",
    "You're a powerhouse—unleash your productivity!",
    "Keep going; every effort builds your empire!",
    "Start now, and future you will thank you big time!",
    "You're unstoppable when you put your mind to it!",
    "Each task you tackle is a victory in the making!",
    "Rise up and make today your masterpiece!",
    "Your potential is limitless—start tapping into it!",
    "One Pomodoro at a time, you're building greatness!",
    "Seize this moment—your success story starts now!",
    "You're stronger than procrastination. Prove it!",
    "Every task completed is a step toward your goals!",
    "Shine bright—your hard work lights the way!",
    "You're on the path to greatness. Keep moving!",
    "Turn your to-do list into a done list—start now!",
    "The world is waiting for your brilliance. Get to work!"
  ],
  Nagging: [
    "Come on, you know you should've started that task already. Let's go!",
    "Really? Still not working? Don't make me ask again!",
    "You're not actually going to ignore that task, are you?",
    "Hey, your to-do list isn't going to check itself off!",
    "I'm not leaving until you start that task. Chop-chop!",
    "You've been \"about to start\" for ages. Now, please!",
    "Don't make your deadlines beg—get moving already!",
    "You're better than this procrastination nonsense. Start!",
    "What's the hold-up? Your tasks need you now!",
    "Stop dilly-dallying—your work is waiting!",
    "You're not fooling anyone with that \"I'll do it later\" excuse!",
    "Come on, don't keep your to-do list hanging!",
    "You know you'll feel better once you start. So, start!",
    "Your tasks are getting lonely. Give them some love!",
    "I'm going to keep bugging you until you work. Ready?",
    "Don't make me nag again—start that task already!",
    "Your goals are counting on you. Don't let them down!",
    "Seriously, get to work before I start repeating myself!",
    "You're not that busy scrolling. Start your tasks!",
    "I'll wait… but your deadlines won't. Get going!"
  ],
  Rude: [
    "Wow, nice job doing nothing. Want a medal for that?",
    "Your to-do list called. It's embarrassed for you.",
    "Are you allergic to work or just lazy today?",
    "Great, another masterpiece of procrastination. Bravo!",
    "Your tasks are laughing at your lack of effort.",
    "What's that? You're still not working? Pathetic.",
    "Congrats on mastering the art of doing zilch!",
    "Your deadlines are rolling their eyes at you.",
    "Keep slacking, and your goals will ghost you.",
    "Oh, you're so busy doing nothing. Impressive.",
    "Your to-do list is judging you harder than I am.",
    "Nice try, but scrolling isn't a personality trait.",
    "Your work's waiting, but I guess you're too cool for it.",
    "Procrastination looks good on you. Not.",
    "Your tasks are begging, but you're ignoring them. Classy.",
    "What's the plan? Avoid work forever? Bold move.",
    "Your goals are crying, and you're just chilling. Nice.",
    "Keep stalling, and you'll win at losing.",
    "Your to-do list is unimpressed with your excuses.",
    "Doing nothing isn't a flex. Get to work already!"
  ],
  Sarcastic: [
    "Oh, sure, scrolling social media is definitely getting you closer to your goals.",
    "Brilliant plan—ignore your tasks, and they'll vanish!",
    "Wow, you're killing it at… absolutely nothing.",
    "Procrastination? Nailed it. Productivity? Not so much.",
    "Keep refreshing that feed; it's totally productive.",
    "Your to-do list loves being ignored. Great job!",
    "Oh, you're \"thinking about starting\"? How noble.",
    "Sure, take your time. Deadlines are just suggestions.",
    "Scrolling is basically the same as working, right?",
    "Your tasks are thrilled to be on the back burner.",
    "Amazing how you make doing nothing look so busy.",
    "Bet your goals are proud of all this… inaction.",
    "Keep stalling—world records don't set themselves!",
    "Oh, you'll start \"soon\"? That's adorable.",
    "Your to-do list is so impressed by your nap skills.",
    "Sure, keep scrolling. That's how legends are made.",
    "Procrastination champion of the year, anyone?",
    "Your tasks are loving this quality neglect time.",
    "Wow, you're really committed to not starting.",
    "Bet you're setting a personal best for doing nada."
  ],
  Dramatic: [
    "The fate of your to-do list hangs in the balance! Will you rise or fall?",
    "Behold! Your tasks await a hero—will it be you?",
    "The clock ticks like a doomsday device. Act now!",
    "Your deadlines loom like a storm on the horizon!",
    "The world trembles as your tasks remain undone!",
    "Arise, brave soul, and conquer your to-do list!",
    "Your goals weep in the shadows of your inaction!",
    "The epic saga of your productivity begins… NOW!",
    "A dark cloud of procrastination threatens your destiny!",
    "Your tasks are a dragon to slay. Draw your sword!",
    "The universe demands your action. Will you answer?",
    "Your to-do list is a battlefield—charge into glory!",
    "Time is a thief, stealing your dreams. Fight back!",
    "The gods of productivity watch. Don't disappoint!",
    "Your tasks cry out for a champion. Step up!",
    "A tidal wave of deadlines approaches. Act or drown!",
    "Your legacy hangs on this moment. Seize it!",
    "The cosmos pauses, awaiting your next move!",
    "Your to-do list is an epic quest. Embark now!",
    "The hour is nigh—save your goals from oblivion!"
  ],
  Guilty: [
    "Your future self is begging you to start now. Don't let them down.",
    "Think of all the people counting on you. Get moving!",
    "Your goals are sad, wondering why you've abandoned them.",
    "Don't make your dreams wait—they deserve better.",
    "Every minute you waste is a minute your future regrets.",
    "Your team is relying on you. Don't drop the ball!",
    "Imagine how proud you'll be if you start now.",
    "Your to-do list feels neglected. Show it some love!",
    "Don't let procrastination steal your potential.",
    "Your future self is shaking their head right now.",
    "Those tasks are counting on you. Don't disappoint!",
    "You're better than this. Prove it to yourself!",
    "Your dreams are fading with every second you stall.",
    "Don't make your goals cry harder than they already are.",
    "Someone out there believes in you. Don't let them down.",
    "Your to-do list is lonely without your attention.",
    "Think of the progress you're missing. Start now!",
    "Your future is watching—make it proud!",
    "Don't let your hard work so far go to waste.",
    "Your goals deserve your effort. Give it to them!"
  ],
  Cheerful: [
    "Yay! Another minute of not working! Let's make today AWESOME and start, okay?",
    "Woo-hoo! You're so close to starting! Let's do this!",
    "Hooray! Your tasks are SO excited for you to begin!",
    "Let's make today SUPER productive! Start now, please!",
    "Oh my gosh, you're gonna rock this! Start already!",
    "Yippee! Your to-do list is cheering for you! Go, go, go!",
    "You're a star! Shine bright by starting your tasks!",
    "Woo! Let's make magic happen with your to-do list!",
    "Your tasks are doing a happy dance! Join them!",
    "Yay, you're SO ready to crush it! Start now!",
    "Oh boy, your goals are SO pumped for you! Let's go!",
    "Hooray! Time to be a productivity superhero!",
    "You're AMAZING! Let's get those tasks done, yay!",
    "Woo-hoo! Your to-do list is ready for some love!",
    "Let's make today the BEST day by starting now!",
    "Your tasks are SO excited, they can't wait! Go!",
    "Yay! You're one step away from being awesome!",
    "Oh, happy day! Let's tackle those tasks together!",
    "You're a ROCKSTAR! Start shining with your work!",
    "Woo! Let's make your to-do list smile today!"
  ],
  Quotable: [
    "As Confucius might say, \"A journey of a thousand tasks begins with one Pomodoro.\"",
    "\"Do or do not. There is no try,\" said Yoda. So, start!",
    "Per Aristotle: \"We are what we repeatedly do. Start now!\"",
    "\"The only way to do great work is to love what you do.\" – Steve Jobs. Begin!",
    "As Einstein might note, \"Time is relative, but your deadlines aren't.\"",
    "\"Seize the day!\" – Horace. Your tasks await!",
    "\"The future depends on what you do today.\" – Gandhi. Act now!",
    "Per da Vinci: \"It's easier to act than to wish.\" Get to it!",
    "\"You miss 100% of the shots you don't take.\" – Wayne Gretzky. Start!",
    "As Plato might say, \"Begin, and the task is half done.\"",
    "\"Action is the foundational key to success.\" – Picasso. Move!",
    "\"The best time to plant a tree was 20 years ago. The second best is now.\" – Proverb.",
    "\"Don't wait for opportunity. Create it.\" – George Bernard Shaw.",
    "As Churchill might urge, \"Keep calm and start your tasks!\"",
    "\"A goal without a plan is just a wish.\" – Antoine de Saint-Exupéry. Act!",
    "\"Success is the sum of small efforts.\" – Robert Collier. Begin now!",
    "\"It always seems impossible until it's done.\" – Nelson Mandela. Start!",
    "As Socrates might say, \"Know thyself, and know thy tasks!\"",
    "\"The secret of getting ahead is getting started.\" – Mark Twain.",
    "\"You don't have to be great to start, but you have to start to be great.\" – Zig Ziglar."
  ],
  Geeky: [
    "Channel your inner Jedi and force those tasks into submission!",
    "Your to-do list is a dungeon boss. Time to grind!",
    "Debug your procrastination—run the productivity script now!",
    "Like Mario, grab that power-up and smash your tasks!",
    "Your tasks are a glitch in the Matrix. Fix them!",
    "Beam up your productivity, Captain—tasks await!",
    "Your to-do list is a raid boss. Assemble and attack!",
    "Code your success: start with while (tasks > 0) { work(); }!",
    "Like Link, draw your sword and slay that to-do list!",
    "Your deadlines are incoming Klingons. Fire torpedoes!",
    "Level up your life—start questing through your tasks!",
    "Your to-do list is a Dark Souls boss. Git gud!",
    "Hack your procrastination with a Pomodoro power-up!",
    "Like Tony Stark, suit up and tackle your tasks!",
    "Your goals are the One Ring. Forge them in action!",
    "Reboot your productivity—your tasks need an update!",
    "Your to-do list is a Pokémon. Catch it with effort!",
    "Like Spider-Man, swing into action and web those tasks!",
    "Overclock your brain—process those tasks now!",
    "Your work is a TARDIS—step in and make time work for you!"
  ]
};

// Moved helper functions before their usage in useCallback hooks
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatDurationToHoursMinutes = (totalSecondsInput) => {
  const totalSeconds = Math.floor(totalSecondsInput);
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0 min";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  if (minutes > 0) return `${minutes} min`;
  return "0 min";
};

const tutorialSteps = [
  {
    title: "Welcome to <span class=\"text-orange-400\">Annoying</span> Pomodoro!", // Reverted title
    content: "Let's take a quick tour. Click 'Next' to see how things work, or 'Skip' to start right away.", // Reverted content
    // No targetView, app remains in its initial state (likely 'focus')
  },
  {
    title: "1. Plan Your Day",
    targetView: 'plan',
    content: "This is the 'Plan' view. Here, you can add tasks with names and estimated durations. Take a look around!"
  },
  {
    title: "2. The Focus View",
    targetView: 'focus',
    content: "Here's your timer. Start tasks, using the <span class=\"bg-blue-600/30 px-1 rounded\">Start</span> button, and control your session with <span class=\"bg-blue-600/30 px-1 rounded\">Pause</span>, <span class=\"bg-amber-600/30 px-1 rounded\">Extend</span>, and <span class=\"bg-green-600/30 px-1 rounded\">Done!</span>."
  },
  {
    title: "3. Quick Add Task",
    targetView: 'focus', // Ensure we are still/back in focus view
    content: "Still in the Focus view, spot the <span class=\"bg-gray-600/30 px-1 rounded\">+</span> button at the top-right corner. It's a shortcut to quickly add tasks."
  },
  {
    title: "4. Spirals for Ideas",
    targetView: 'spirals',
    content: "Use Spirals for ideas or tasks that pop up while you're focused. Jot them down here to deal with later." 
  },
  {
    title: "5. Track Your Progress",
    targetView: 'dashboard',
    content: "This is the 'Stats' view. It shows your productivity dashboard with daily data. Click 'Next'."
  },
  {
    title: "6. Settings",
    targetView: 'settings',
    content: "Welcome to 'Settings'. Here, you can customize themes, quote types, sounds, break times, and more. Click 'Next'."
  },
  {
    title: "You're Ready!",
    targetView: 'focus', // Ensure they land on focus view
    content: "That's the overview! Click 'Finish' to begin. Remember, the goal is to be productively annoyed!"
  }
];

function App() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640); // Tailwind 'sm' breakpoint
  const [isExtraSmallScreen, setIsExtraSmallScreen] = useState(window.innerWidth < 350); // Extra small screen detection, adjusted threshold

  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false); // New state to control quote visibility
  const [tasks, setTasks] = useState([]);
  const [spirals, setSpirals] = useState([]); // For spirals feature
  
  const focusCardRef = useRef(null); // Ref for the Focus view card
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1); // Index of the active task in the tasks array
  const [timeRemaining, setTimeRemaining] = useState(0); // In seconds
  const [isTimerActive, setIsTimerActive] = useState(false); // Is the countdown interval running?
  const [isBreakTime, setIsBreakTime] = useState(false);
  const timerIntervalId = useRef(null); // Using useRef to hold interval ID to avoid re-renders causing issues
  
  const [score, setScore] = useState(0);
  const notificationSound = useRef(null);
  const quoteIntervalId = useRef(null);

  // New state for progress bar total time
  const [initialTimeForProgress, setInitialTimeForProgress] = useState(0);

  // Settings state
  const [quoteType, setQuoteType] = useState("Annoying"); // Default quote type
  const [soundEnabled, setSoundEnabled] = useState(true); // Default sound setting
  const [theme, setTheme] = useState("dark"); // Default theme setting
  const [breakDuration, setBreakDuration] = useState(5); // Default break duration in minutes
  const [allowExtendBreak, setAllowExtendBreak] = useState(true); // Default setting for extending breaks
  const [dailyResetTime, setDailyResetTime] = useState("00:00"); // Default daily reset time
  const [lastResetTimestamp, setLastResetTimestamp] = useState(null); // When the last daily reset occurred (timestamp)
  const [customFinishTime, setCustomFinishTime] = useState(null); // Custom finish time for today
  const [isLoaded, setIsLoaded] = useState(false); // To prevent saves before loads complete
  const [activeView, setActiveView] = useState('focus'); // 'focus', 'plan', 'spirals', 'settings', 'dashboard'
  const [sessionStartTime, setSessionStartTime] = useState(null); // Timestamp when the first task of the session started
  const [displayedIdleTime, setDisplayedIdleTime] = useState(0); // Idle time in seconds
  const [isSessionEndTimeExpanded, setIsSessionEndTimeExpanded] = useState(false);

  // State for PromptDialog
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    title: '',
    message: '',
    inputLabel: '',
    defaultValue: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    placeholder: '',
  });

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  // New state for Quick Task button visibility
  const [isQuickTaskEnabled, setIsQuickTaskEnabled] = useState(true);

  const navItems = [
    { id: 'focus', label: 'Focus', icon: Timer, color: 'violet-500', activeColor: 'violet-500' },
    { id: 'plan', label: 'Plan', icon: ListChecks, color: 'emerald-500', activeColor: 'emerald-500' },
    { id: 'spirals', label: 'Spirals', icon: BrainCircuit, color: 'sky-400', activeColor: 'indigo-500' },
    { id: 'dashboard', label: 'Stats', icon: PieChart, color: 'amber-500', activeColor: 'yellow-500' }, // Moved Stats/Dashboard up
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal, color: 'slate-400', activeColor: 'gray-400' } // Moved Settings down
  ];

  const getIconClass = useCallback((isActive, itemColor) => {
    if (isActive) {
      if (itemColor === 'violet-500') return 'text-violet-500';
      if (itemColor === 'sky-400') return 'text-sky-400';
      if (itemColor === 'orange-500') return 'text-orange-500';
      if (itemColor === 'cyanAccent') return 'text-cyanAccent';
      if (itemColor === 'emerald-500') return 'text-emerald-500';
      if (itemColor === 'rose-500') return 'text-rose-500';
      if (itemColor === 'emerald-600') return 'text-emerald-600';
      if (itemColor === 'slate-400') return 'text-slate-400';
      if (itemColor === 'amber-500') return 'text-amber-500';
      if (itemColor === 'black-600') return 'text-gray-600'; // Assuming black-600 should be gray when inactive
      return 'text-white'; // Default fallback
    }
    return 'text-subtleText group-hover:text-subtleText/70';
  }, []);

  // Calculate total focus time from completed tasks - Wrapped in useCallback
  // DEFINED HERE, INSIDE App and BEFORE its usage in other hooks/functions
  const calculateFocusTime = useCallback(() => {
    return tasks.reduce((total, task) => {
      if (task.completed) {
        return total + (task.timeSpentSeconds || 0);
      } else if (task.id === (tasks[currentTaskIndex] && tasks[currentTaskIndex].id) && !task.completed && !isBreakTime && isTimerActive) {
        const now = Date.now();
        const timeElapsedSinceStart = task.timerStartTime ? Math.floor((now - task.timerStartTime) / 1000) : 0; // Added check for timerStartTime
        return total + (task.timeSpentSeconds || 0) + timeElapsedSinceStart;
      }
      return total + (task.timeSpentSeconds || 0);
    }, 0);
  }, [tasks, currentTaskIndex, isBreakTime, isTimerActive]);

  // Effect to handle viewport height and mobile view detection
  useEffect(() => {
    const updateIsMobileView = () => {
      setIsMobileView(window.innerWidth < 640);
      setIsExtraSmallScreen(window.innerWidth < 350); // Update extra small screen state, adjusted threshold
    };

    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    // Initial setup
    updateIsMobileView();
    updateViewportHeight(); // Set initial height for mobile

    // Update isMobileView on general resize
    window.addEventListener('resize', updateIsMobileView);
    
    // Update both height and isMobileView on orientation change
    const handleOrientationChange = () => {
      updateIsMobileView();
      updateViewportHeight();
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', updateIsMobileView);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Load settings from localStorage on initial render
  useEffect(() => { 
    // Check for tutorial flag
    const hasSeenTutorial = localStorage.getItem('annoyingPomodoroTutorial_v1_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      setCurrentTutorialStep(0);
    } // else, tutorial has been seen, do nothing

    // --- Original settings and daily reset logic continues below ---
    const savedQuoteType = localStorage.getItem('quoteType');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedTheme = localStorage.getItem('theme');
    const savedBreakDuration = localStorage.getItem('breakDuration');
    const savedAllowExtendBreak = localStorage.getItem('allowExtendBreak');
    const initialDailyResetTime = localStorage.getItem('dailyResetTime') || "00:00"; // Get saved or default
    setDailyResetTime(initialDailyResetTime);
    
    // Load other settings
    if (savedQuoteType) setQuoteType(savedQuoteType);
    if (savedSoundEnabled !== null) setSoundEnabled(savedSoundEnabled === 'true');
    if (savedTheme) setTheme(savedTheme);
    if (savedBreakDuration) setBreakDuration(parseInt(savedBreakDuration, 10));
    if (savedAllowExtendBreak !== null) setAllowExtendBreak(savedAllowExtendBreak === 'true');

    // Load new setting: Quick Task Enabled
    const savedIsQuickTaskEnabled = localStorage.getItem('isQuickTaskEnabled');
    if (savedIsQuickTaskEnabled !== null) {
      setIsQuickTaskEnabled(savedIsQuickTaskEnabled === 'true');
    } else {
      setIsQuickTaskEnabled(true); // Default to enabled if not found
    }

    // --- Daily Reset Logic ---
    const now = Date.now();
    const [resetHour, resetMinute] = initialDailyResetTime.split(':').map(Number);
    
    const todayDateObj = new Date(now);
    const todaysResetDateTime = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth(), todayDateObj.getDate(), resetHour, resetMinute, 0, 0).getTime();
    
    const yesterdayDateObj = new Date(now);
    yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
    const yesterdaysResetDateTime = new Date(yesterdayDateObj.getFullYear(), yesterdayDateObj.getMonth(), yesterdayDateObj.getDate(), resetHour, resetMinute, 0, 0).getTime();

    const savedLastResetTs = localStorage.getItem('lastResetTimestamp');
    let currentLastResetTs = savedLastResetTs ? parseInt(savedLastResetTs, 10) : null;
    let performReset = false;

    if (currentLastResetTs === null) {
      // First run or cleared storage. Establish baseline. States are already at defaults from useState.
      currentLastResetTs = (now >= todaysResetDateTime) ? todaysResetDateTime : yesterdaysResetDateTime;
      // No data state reset calls (like setTasks([])) needed here, useState did that.
      // localStorage for these items will be updated by the save hook if they are new.
    } else {
      if (now >= todaysResetDateTime && currentLastResetTs < todaysResetDateTime) {
        performReset = true;
        currentLastResetTs = todaysResetDateTime; // Update to today's reset time
      }
    }
    setLastResetTimestamp(currentLastResetTs); // Set state for lastResetTimestamp

    // --- Load or Reset Data States ---
    if (performReset) {
      // Save the previous day's stats before resetting
      const previousDayStats = {
        date: new Date(currentLastResetTs - 86400000).toISOString().split('T')[0], // Yesterday's date
        focusTime: calculateFocusTime(), // Usage of calculateFocusTime
        idleTime: displayedIdleTime,
        tasksCompleted: tasks.filter(t => t.completed).length,
        score: score,
        totalTasks: tasks.length,
        totalPlannedTime: tasks.reduce((total, task) => total + task.estimatedDuration, 0)
      };
      
      // Save stats to history
      statsHistory.saveDailyStats(previousDayStats);
      
      // Now reset current day's data
      setTasks([]);
      setScore(0);
      setSessionStartTime(null);
      setCurrentTaskIndex(-1);
      setTimeRemaining(0);
      setIsTimerActive(false);
      setIsBreakTime(false);
      setDisplayedIdleTime(0);
      // Spirals are NOT reset. Settings are NOT reset.
      // The save useEffect will persist these new default values because isLoaded is still false.
    } else {
      // No reset due. Load data if it wasn't the very first run (i.e., savedLastResetTs was not null).
      // If savedLastResetTs was null, it means it's effectively a first run for data, and useState defaults are appropriate.
      if (savedLastResetTs) { 
        const sTasks = localStorage.getItem('tasks');
        if (sTasks) { try { setTasks(JSON.parse(sTasks)); } catch (e) { console.error("Error parsing tasks from localStorage", e); setTasks([]); } } else { setTasks([]); }
        
        const sScore = localStorage.getItem('score');
        setScore(sScore ? (parseInt(sScore, 10) || 0) : 0);

        const sSessionStart = localStorage.getItem('sessionStartTime');
        setSessionStartTime(sSessionStart ? (parseInt(sSessionStart, 10) || null) : null);
        
        const sCurrentTaskIndex = localStorage.getItem('currentTaskIndex');
        // Make sure we handle the case where currentTaskIndex is 0 (first task)
        setCurrentTaskIndex(sCurrentTaskIndex !== null ? parseInt(sCurrentTaskIndex, 10) : -1);

        const sTimeRemaining = localStorage.getItem('timeRemaining');
        setTimeRemaining(sTimeRemaining ? (parseInt(sTimeRemaining, 10) || 0) : 0);

        const sIsTimerActive = localStorage.getItem('isTimerActive');
        setIsTimerActive(sIsTimerActive === 'true');

        const sIsBreakTime = localStorage.getItem('isBreakTime');
        setIsBreakTime(sIsBreakTime === 'true');
      }
    }

    // Spirals are always loaded as they don't reset (or set to empty if not found)
    const savedSpirals = localStorage.getItem('spirals');
    if (savedSpirals) { try { setSpirals(JSON.parse(savedSpirals)); } catch (e) { console.error("Error parsing spirals from localStorage", e); setSpirals([]); } } else { setSpirals([]); }
    
    // Load initialTimeForProgress state
    const sInitialTimeForProgress = localStorage.getItem('initialTimeForProgress');
    setInitialTimeForProgress(sInitialTimeForProgress ? (parseInt(sInitialTimeForProgress, 10) || 0) : 0);

    setIsLoaded(true); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ESLint disabled due to complex, time-sensitive logic that uses state values from *before* potential reset

  // Save settings and data to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return; 

    localStorage.setItem('quoteType', quoteType);
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    localStorage.setItem('theme', theme);
    localStorage.setItem('breakDuration', breakDuration.toString());
    localStorage.setItem('allowExtendBreak', allowExtendBreak.toString());
    localStorage.setItem('dailyResetTime', dailyResetTime);
    localStorage.setItem('isQuickTaskEnabled', isQuickTaskEnabled.toString()); // Save Quick Task Enabled setting

    if (lastResetTimestamp !== null) {
      localStorage.setItem('lastResetTimestamp', lastResetTimestamp.toString());
    } else {
      localStorage.removeItem('lastResetTimestamp');
    }
    try { localStorage.setItem('tasks', JSON.stringify(tasks)); } catch (e) { console.error("Error stringifying tasks for localStorage", e); }
    try { localStorage.setItem('spirals', JSON.stringify(spirals)); } catch (e) { console.error("Error stringifying spirals for localStorage", e); }
    localStorage.setItem('score', score.toString());
    if (sessionStartTime !== null) localStorage.setItem('sessionStartTime', sessionStartTime.toString()); else localStorage.removeItem('sessionStartTime');
    localStorage.setItem('currentTaskIndex', currentTaskIndex.toString());
    localStorage.setItem('timeRemaining', timeRemaining.toString());
    localStorage.setItem('isTimerActive', isTimerActive.toString());
    localStorage.setItem('isBreakTime', isBreakTime.toString());
    
    // Save initialTimeForProgress state
    localStorage.setItem('initialTimeForProgress', initialTimeForProgress.toString());

    // Destructure tasks for clarity, though not strictly necessary for the fix
    const currentTasks = tasks;
    const currentScore = score;
    const currentDisplayedIdleTime = displayedIdleTime;

    if (currentTasks.length > 0 && sessionStartTime !== null) {
      const today = new Date().toISOString().split('T')[0];
      const currentStats = {
        date: today,
        focusTime: calculateFocusTime(),
        idleTime: currentDisplayedIdleTime, // use destructured
        tasksCompleted: currentTasks.filter(t => t.completed).length, // use destructured
        score: currentScore, // use destructured
        totalTasks: currentTasks.length, // use destructured
        totalPlannedTime: currentTasks.reduce((total, task) => total + task.estimatedDuration, 0)
      };
      statsHistory.saveDailyStats(currentStats);
    }
  }, [quoteType, soundEnabled, theme, breakDuration, allowExtendBreak, dailyResetTime, tasks, spirals, score, sessionStartTime, currentTaskIndex, timeRemaining, isTimerActive, isBreakTime, isLoaded, lastResetTimestamp, displayedIdleTime, calculateFocusTime, isQuickTaskEnabled, initialTimeForProgress]);

  // Apply theme class to body when it changes
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Initialize motivational quote, sound, and notification permissions
  useEffect(() => {
    // Sound initialization (runs once)
    notificationSound.current = new Audio();
    notificationSound.current.src = `${process.env.PUBLIC_URL}/assets/annoyingNotification.mp3`;

    // Notification permission request (runs once)
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") console.error("Desktop notification permission granted.");
      });
    }
  }, []); // Empty dependency array: runs only on mount and unmount

  // Motivational quote initialization and updates (runs when quoteType changes)
  useEffect(() => {
    const getRandomQuote = () => {
      const currentQuotes = quoteCategories[quoteType];
      if (currentQuotes && currentQuotes.length > 0) {
        return currentQuotes[Math.floor(Math.random() * currentQuotes.length)];
      }
      // Fallback to "Annoying" if current type is invalid or empty
      const fallbackQuotes = quoteCategories["Annoying"];
      if (fallbackQuotes && fallbackQuotes.length > 0) {
        return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      }
      return "Keep pushing!"; // Generic fallback
    };
    setMotivationalQuote(getRandomQuote());
  }, [quoteType]);

  // Show quote after 10 seconds of loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuote(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const playNotificationSound = useCallback(() => {
    console.log("playNotificationSound");
    if (soundEnabled && notificationSound.current) {
      // Ensure src is set (it should be from the initial useEffect, but as a fallback)
      if (!notificationSound.current.src) {
        notificationSound.current.src = `${process.env.PUBLIC_URL}/assets/annoyingNotification.mp3`;
      }
      notificationSound.current.currentTime = 0; // Reset sound to start
      notificationSound.current.play()
        .then(() => {
          // console.error("Notification sound played successfully."); // Optional: for debugging
        })
        .catch(error => {
          console.error("Error playing sound:", error);
          if (error.name === 'NotSupportedError') {
            console.error(`NotSupportedError: Please ensure the audio file at "${notificationSound.current.src}" exists in the public/assets/ folder, is a valid audio format (e.g., MP3), and that the browser can access it.`);
            toast({
              title: "Sound Playback Error",
              description: "Could not play notification sound. Check file path and format.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sound Error",
              description: "An issue occurred while trying to play the sound.",
              variant: "destructive"
            });
          }
        });
    }
  }, [soundEnabled]); // Removed process.env.PUBLIC_URL from deps as it's constant

  const pauseNotificationSound = useCallback(() => {
    if (notificationSound.current && !notificationSound.current.paused) {
      notificationSound.current.pause();
      notificationSound.current.currentTime = 0; // Reset to beginning
    }
  }, []);

  const showDesktopNotification = useCallback((title, body) => {
    if (Notification.permission === "granted") new Notification(title, { body });
  }, []);

  // Motivational quote logic
  const updateMotivationalQuote = useCallback(() => {
    const getRandomQuote = () => {
      const currentQuotes = quoteCategories[quoteType];
      if (currentQuotes && currentQuotes.length > 0) {
        return currentQuotes[Math.floor(Math.random() * currentQuotes.length)];
      }
      // Fallback to "Annoying" if current type is invalid or empty
      const fallbackQuotes = quoteCategories["Annoying"];
      if (fallbackQuotes && fallbackQuotes.length > 0) {
        return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      }
      return "You can do it!"; // Generic fallback
    };
    setMotivationalQuote(getRandomQuote());
  }, [quoteType]);

  const startMotivationalQuoteInterval = useCallback(() => {
    if (!isTimerActive && !quoteIntervalId.current) {
      updateMotivationalQuote();
      quoteIntervalId.current = setInterval(updateMotivationalQuote, 30000);
    }
  }, [isTimerActive, updateMotivationalQuote]);

  const stopMotivationalQuoteInterval = useCallback(() => {
    if (quoteIntervalId.current) {
      clearInterval(quoteIntervalId.current);
      quoteIntervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      stopMotivationalQuoteInterval();
    } else {
      startMotivationalQuoteInterval();
    }
    return () => stopMotivationalQuoteInterval(); // Cleanup on unmount
  }, [isTimerActive, startMotivationalQuoteInterval, stopMotivationalQuoteInterval]);


  // Task Management
  const handleAddTask = useCallback((newTaskData) => {
    setTasks(prevTasks => [
      ...prevTasks,
      {
        id: Date.now(),
        name: newTaskData.name,
        duration: newTaskData.duration, // user input in minutes
        estimatedDuration: newTaskData.duration,
        completed: false,
        started: false,
        timeSpentSeconds: 0,
        timerStartTime: null,
        completionTimestamp: null,
      }
    ]);
    toast({ title: "Task Added", description: `"${newTaskData.name}" added to your list.` });
  }, [setTasks]); // Added setTasks

  const handleRemoveTask = useCallback((taskId) => {
    const taskToRemove = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (taskToRemove) {
      toast({ title: "Task Removed", description: `"${taskToRemove.name}" has been removed.`, variant: "destructive" });
    }
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex]?.id === taskId) {
      if (timerIntervalId.current) clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setCurrentTaskIndex(-1);
      setTimeRemaining(0);
      setIsTimerActive(false);
      setIsBreakTime(false);
    }
  }, [tasks, currentTaskIndex, setTasks, setCurrentTaskIndex, setTimeRemaining, setIsTimerActive, setIsBreakTime]); // Added missing dependencies

  // Timer Core Logic: Start, Pause, Resume, Done, Extend
  const startTimer = useCallback((taskIndex) => {
    // Guard 1: Basic validity and completion check
    if (taskIndex < 0 || taskIndex >= tasks.length || !tasks[taskIndex]) {
      toast({ title: "Invalid Task", description: "Task not found or index is out of bounds.", variant: "destructive" });
      return;
    }
    if (tasks[taskIndex].completed) {
      toast({ title: "Task Completed", description: `"${tasks[taskIndex].name}" is already completed.`, variant: "default" });
      return;
    }

    // Guard 2: Check if another task is active or this specific one
    if (isTimerActive && !isBreakTime && currentTaskIndex === taskIndex) {
      toast({ title: "Already Active", description: `"${tasks[taskIndex].name}" is already running.`, variant: "default" });
      return;
    }
    if (isTimerActive && !isBreakTime && currentTaskIndex !== -1 && currentTaskIndex !== taskIndex) { 
      toast({ title: "Timer Busy", description: `"${tasks[currentTaskIndex]?.name || 'Another task'}" is in progress. Complete or stop it first.`, variant: "destructive" });
      return;
    }
    
    pauseNotificationSound(); // Stop any ongoing notification sound

    // Guard 3: Handle active break
    if (isBreakTime) { 
      if (timerIntervalId.current) clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setIsBreakTime(false); // Stop the break
      toast({ title: "Break Interrupted", description: "Starting a new task." });
    }

    // Set session start time if this is the very first task being started
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }

    const taskToStart = tasks[taskIndex];

    // This extra check is for absolute safety, though guards above should cover it.
    if (!taskToStart || typeof taskToStart.duration === 'undefined') {
        console.error("Critical error: taskToStart is invalid despite guards. taskIndex:", taskIndex, "task:", taskToStart);
        toast({ title: "Task Data Error", description: "Cannot start task due to incomplete data. Please check console.", variant: "destructive" });
        return;
    }
    
    setTasks(prevTasks =>
      prevTasks.map((task, idx) =>
        idx === taskIndex ? { ...task, started: true, timerStartTime: Date.now(), timeSpentSeconds: task.timeSpentSeconds || 0 } : task
      )
    );
    setCurrentTaskIndex(taskIndex);
    // If task was partially worked on, resume from remaining, else from full duration
    const timeToSet = (taskToStart.duration * 60) - (taskToStart.timeSpentSeconds || 0);
    setTimeRemaining(timeToSet > 0 ? timeToSet : taskToStart.duration * 60); // Ensure it doesn't start negative
    setIsTimerActive(true);
    setIsBreakTime(false); // Ensure break mode is off
    setInitialTimeForProgress(timeToSet > 0 ? timeToSet : taskToStart.duration * 60); // Set initial time for progress bar
    toast({ title: "Task Started", description: `Timer for "${taskToStart.name}" has begun.` });
  }, [tasks, isTimerActive, isBreakTime, currentTaskIndex, sessionStartTime, setSessionStartTime, setTasks, setCurrentTaskIndex, setTimeRemaining, setIsTimerActive, setIsBreakTime, pauseNotificationSound]);

  const handlePauseTimer = useCallback(() => {
    if (timerIntervalId.current) { 
      clearInterval(timerIntervalId.current);
      timerIntervalId.current = null;
      setIsTimerActive(false);

      // **Modification Start**
      // If it's a task, update timeSpentSeconds with elapsed time since last start
      if (!isBreakTime && currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
        const task = tasks[currentTaskIndex];
        const elapsedSinceStart = task.timerStartTime ? Math.floor((Date.now() - task.timerStartTime) / 1000) : 0;
        setTasks(prevTasks => prevTasks.map((t, idx) =>
          idx === currentTaskIndex ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + elapsedSinceStart, timerStartTime: null } : t
        ));
      }
      // **Modification End**

      toast({ title: isBreakTime ? "Break Paused" : "Timer Paused" });
    }
  }, [isBreakTime, setIsTimerActive, currentTaskIndex, tasks, setTasks]); // Removed pauseNotificationSound

  const handleResumeTimer = useCallback(() => {
    if (!isTimerActive && timeRemaining > 0 && 
        ((currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) || isBreakTime)) {
       setIsTimerActive(true);
       // **Modification Start**
       // For tasks, update timerStartTime to now
       if (!isBreakTime && currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
         setTasks(prevTasks => prevTasks.map((t, idx) =>
           idx === currentTaskIndex ? { ...t, timerStartTime: Date.now() } : t
         ));
       }
       // **Modification End**
       // initialTimeForProgress should already be set from when it was paused
       toast({ title: isBreakTime ? "Break Resumed" : "Timer Resumed" });
    }
  }, [isTimerActive, timeRemaining, currentTaskIndex, tasks, isBreakTime, setIsTimerActive, setTasks]);

  const handleTaskDone = useCallback(() => {
    if (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed) {
      toast({title: "No Active Task", description: "No task to mark as done.", variant: "default"});
      return;
    }

    pauseNotificationSound(); // Stop any ongoing notification sound

    const task = tasks[currentTaskIndex];
    let pointsEarnedThisTask = 0;
    
    const timeWhenDoneSeconds = task.timerStartTime ? (Date.now() - task.timerStartTime) / 1000 : task.timeSpentSeconds;
    const actualTimeSpentMinutes = Math.round(timeWhenDoneSeconds / 60); // Round to nearest minute for scoring

    // Base score: 1 point per minute of focus time
    pointsEarnedThisTask += actualTimeSpentMinutes;

    // Bonus for finishing early: 1 point per minute saved
    const estimatedSeconds = task.estimatedDuration * 60;
    const secondsSaved = Math.max(0, estimatedSeconds - timeWhenDoneSeconds);
    const bonusMinutes = Math.round(secondsSaved / 60); // Round saved seconds to nearest minute
    pointsEarnedThisTask += bonusMinutes;
    
    // Ensure score is not negative (shouldn't happen with this logic, but as a safeguard)
    pointsEarnedThisTask = Math.max(0, pointsEarnedThisTask);

    setScore(prevScore => prevScore + pointsEarnedThisTask);
    // Confetti centered on the focus card
    if (focusCardRef.current) {
      const rect = focusCardRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: originX, y: originY },
        disableForReducedMotion: true // Good practice for accessibility
      });
    } else {
       // Fallback to default origin if ref is not available
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }

    // Use actualTimeSpent (which could be > estimated if they let timer run out and clicked done)
    // for the task's final timeSpentSeconds for record keeping.
    const finalTimeSpentSeconds = timeWhenDoneSeconds;

    setTasks(prevTasks => prevTasks.map((t, idx) =>
      idx === currentTaskIndex ? { 
        ...t, 
        completed: true, 
        timeSpentSeconds: finalTimeSpentSeconds, 
        duration: finalTimeSpentSeconds / 60, // Update duration to reflect actual time spent
        completionTimestamp: Date.now() 
      } : t
    ));

    if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
    }
    setIsTimerActive(false); 
    
    showDesktopNotification("Task Finished!", `"${task.name}" is complete.`);
    toast({ title: "Task Finished!", description: `"${task.name}" complete. Points: +${pointsEarnedThisTask}` });
    
    setIsBreakTime(true);
    const breakTimeSeconds = breakDuration * 60;
    setTimeRemaining(breakTimeSeconds);
    setCurrentTaskIndex(-1); 
    setIsTimerActive(true); 
    setInitialTimeForProgress(breakTimeSeconds); // Set initial time for break progress bar
    toast({title: "Break Time!", description: `Taking a ${breakDuration} minute break.`});
  }, [tasks, currentTaskIndex, showDesktopNotification, breakDuration, setScore, setTasks, setIsBreakTime, setTimeRemaining, setCurrentTaskIndex, setIsTimerActive, focusCardRef, pauseNotificationSound]); // Removed playNotificationSound

  const handleSkipBreak = useCallback(() => {
    if (isBreakTime && isTimerActive) {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
      pauseNotificationSound(); // Stop any ongoing notification sound
      setIsTimerActive(false);
      setIsBreakTime(false);
      setTimeRemaining(0);
      setCurrentTaskIndex(-1); 
      toast({title: "Break Skipped", description: "Break ended. Ready for the next task?"});
    } else {
      toast({title: "No Active Break", description: "There is no active break to skip.", variant: "default"});
    }
  }, [isBreakTime, isTimerActive, setIsTimerActive, setIsBreakTime, setTimeRemaining, setCurrentTaskIndex, pauseNotificationSound]);

  const handleExtendTimer = useCallback(() => {
    // If no task active AND not break time, nothing to extend
    if (currentTaskIndex === -1 && !isBreakTime) {
      toast({title: "No Timer Active", description: "Start a task or break to extend its time.", variant: "default"});
      return;
    }

    pauseNotificationSound(); // Stop any ongoing notification sound

    // If it's a task, check if it's completed 
    // (This check is also in the button's disabled logic, but good for safety)
    if (!isBreakTime && tasks[currentTaskIndex] && tasks[currentTaskIndex].completed) {
        toast({title: "Task Completed", description: `Task "${tasks[currentTaskIndex].name}" is already completed and cannot be extended.`, variant: "default"});
        return;
    }

    // If it's a break, check if extending breaks is allowed
    if (isBreakTime && !allowExtendBreak) {
      toast({title: "Extend Break Disabled", description: "Extending break time is currently disabled in settings.", variant: "default"});
      return;
    }
    
    const context = isBreakTime ? "break" : (tasks[currentTaskIndex] ? `task "${tasks[currentTaskIndex].name}"` : "task");
    const defaultExtension = "5";
    const currentTimerValue = formatTime(timeRemaining);

    setPromptConfig({
      title: `Extend ${context}`,
      message: isBreakTime && timeRemaining > 0 ? 
                 `Current break time is ${currentTimerValue}. How many additional minutes would you like to add?` :
                 `How many minutes would you like to add to the ${context}? ${!isBreakTime && tasks[currentTaskIndex] ? `Timer is currently at ${formatTime(timeRemaining)}.` : ''}`, // Updated message
      inputLabel: 'Minutes to add:',
      defaultValue: defaultExtension,
      confirmText: 'Extend',
      cancelText: 'Cancel',
      placeholder: 'Enter minutes',
      onConfirm: (extendMinutesText) => {
        const extendMinutes = parseInt(extendMinutesText, 10);

        if (!isNaN(extendMinutes) && extendMinutes > 0) {
          const newTimeRemaining = timeRemaining + extendMinutes * 60;
          setTimeRemaining(newTimeRemaining);
          
          // If extending a break, update the initial time for progress bar
          if (isBreakTime) {
              setInitialTimeForProgress(prev => prev + extendMinutes * 60);
          } else if (currentTaskIndex !== -1) { // Also update for tasks
              setInitialTimeForProgress(prev => prev + extendMinutes * 60);
          }

          let toastDescription = `Added ${extendMinutes} minutes to ${context}.`;

          if (!isBreakTime && currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
            setTasks(prevTasks => prevTasks.map((t, idx) =>
              idx === currentTaskIndex ? { ...t, duration: t.duration + extendMinutes, estimatedDuration: t.estimatedDuration + extendMinutes } : t
            ));
            // Deduct 1 point per minute extended for tasks
            setScore(prevScore => prevScore - extendMinutes);
            toastDescription += ` Points: -${extendMinutes}`; // Update toast message with actual deduction
          }
          
          if (!isTimerActive && newTimeRemaining > 0) {
            setIsTimerActive(true);
          }
          toast({ title: "Timer Extended", description: toastDescription });
        } else {
          toast({ title: "Invalid Input", description: "Please enter a valid number of minutes.", variant: "destructive" });
        }
      }
    });
    setIsPromptOpen(true); 
  }, [currentTaskIndex, isBreakTime, isTimerActive, timeRemaining, tasks, allowExtendBreak, setPromptConfig, setTasks, setScore, setTimeRemaining, setIsTimerActive, pauseNotificationSound]);

  // Effect for Timer Countdown
  useEffect(() => { 
    if (isTimerActive && timeRemaining > 0) {
      // If timer should be active and there's time, start the interval
      timerIntervalId.current = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) { 
            // Stop the interval first
            if(timerIntervalId.current) clearInterval(timerIntervalId.current);
            timerIntervalId.current = null;
            setIsTimerActive(false); // Timer is no longer active
            
            if (isBreakTime) {
              playNotificationSound();
              showDesktopNotification("Break Over!", "Your break time is up.");
              toast({ title: "Break Finished!", description: "Ready for the next task?" });
              setIsBreakTime(false); // Break is over
              setCurrentTaskIndex(-1); // No active task
            } else if (currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
              const task = tasks[currentTaskIndex];
              // Increment timeSpentSeconds one last time for the final second
              setTasks(prevTasks => prevTasks.map((t, idx) => 
                idx === currentTaskIndex ? {...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + 1} : t
              ));
              playNotificationSound();
              showDesktopNotification("Time's Up!", `Time for "${task.name}" is up.`);
              toast({ title: "Time's Up!", description: `"${task.name}" timer finished. Mark done or extend.` });
              // User needs to manually mark done or extend. isTimerActive is false.
            }
            return 0; // Time is up
          }

          // Increment timeSpentSeconds for active task during normal countdown
          if (currentTaskIndex !== -1 && !isBreakTime && tasks[currentTaskIndex]) {
            setTasks(prevTasks => prevTasks.map((task, idx) => 
                idx === currentTaskIndex ? {...task, timeSpentSeconds: (task.timeSpentSeconds || 0) + 1} : task
            ));
          }
          return prevTime - 1; // Countdown
        });
      }, 1000);
    } else {
      // If timer shouldn't be active or time is up, ensure interval is cleared
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null;
      }
    }
    // Cleanup function: always clear interval when dependencies change or component unmounts
    return () => {
      if (timerIntervalId.current) {
        clearInterval(timerIntervalId.current);
        timerIntervalId.current = null; 
      }
    };
  }, [isTimerActive, timeRemaining, tasks, currentTaskIndex, isBreakTime, playNotificationSound, showDesktopNotification, setTasks, breakDuration]); // Removed duplicate showDesktopNotification

  // Effect for Idle Time Calculation
  useEffect(() => {
    if (!isTimerActive && sessionStartTime !== null) {
      const updateIdleTime = () => {
        // Calculate time elapsed since the session started in seconds
        const now = Date.now();
        const totalSessionTimeSeconds = Math.floor((now - sessionStartTime) / 1000);
        
        // Calculate total focus time (sum of time spent on completed tasks)
        const totalFocusTimeSeconds = calculateFocusTime();
        
        // Idle time = total session time - total focus time
        const calculatedIdleTime = Math.max(0, totalSessionTimeSeconds - totalFocusTimeSeconds);
        
        setDisplayedIdleTime(calculatedIdleTime);
      };
      
      // Update immediately and then every minute
      updateIdleTime();
      const intervalId = setInterval(updateIdleTime, 60000); // 60 seconds

      return () => clearInterval(intervalId);
    }
  }, [isTimerActive, sessionStartTime, calculateFocusTime, setDisplayedIdleTime]); // Added missing dependencies

  // Formatting and Display Logic
  const timerDisplayColor = () => {
    if (isBreakTime) return 'text-emerald-400'; // Specific color for break time
    // Idle state: timer is not active, no task index, or task completed
    if (!isTimerActive && (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed)) return 'text-greeb-400'; // Default/idle color
    
    // Safely access task and its estimated duration
    const task = currentTaskIndex !== -1 && tasks[currentTaskIndex] ? tasks[currentTaskIndex] : null;
    const totalTaskSeconds = (task?.estimatedDuration ?? 0) * 60;
    // If task has no duration or timer is active but timeRemaining is 0, default to teal
    if ((totalTaskSeconds === 0 && !isBreakTime) || (isTimerActive && timeRemaining === 0 && !isBreakTime)) return 'text-teal-400'; 
    
    const percentageRemaining = (timeRemaining / totalTaskSeconds) * 100;
    
    if (percentageRemaining <= 20) return 'text-red-500'; // Low time warning
    if (percentageRemaining <= 50) return 'text-yellow-500'; // Mid time warning
    
    // Default color for active task when not in warning thresholds
    return 'text-teal-400'; 
  };

  const calculateDailyStats = useCallback(() => {
    const totalPlannedDuration = tasks.reduce((acc, task) => acc + (task?.estimatedDuration ?? 0), 0); // in minutes, added safety

    let accumulatedFocusTimeSeconds = tasks.reduce((acc, task) => {
      // Safely access task and its properties
      if (!task) return acc; // Skip if task is undefined
      if (task.completed) {
        return acc + (task.timeSpentSeconds ?? 0);
      }
      // Check if it's the current active task and timer is running (and not break)
      if (task.id === (tasks[currentTaskIndex]?.id) && !task.completed && !isBreakTime && isTimerActive) {
          // For active task while timer is running, calculate time spent since start
          const timeElapsedSinceStart = task.timerStartTime ? Math.floor((Date.now() - task.timerStartTime) / 1000) : 0;
          return acc + (task.timeSpentSeconds ?? 0) + timeElapsedSinceStart;
      } else if (task.id === (tasks[currentTaskIndex]?.id) && !task.completed && !isBreakTime && !isTimerActive) {
          // For active but paused task, include already accumulated timeSpentSeconds
           return acc + (task.timeSpentSeconds ?? 0);
      }
      // For other uncompleted/inactive tasks, don't add their timeSpentSeconds here
      return acc; // Do not add timeSpentSeconds if not the current active task
    }, 0);
    
    const remainingUncompletedTaskMinutes = tasks
      .filter(task => !task.completed)
      .reduce((acc, task) => {
          // Safely access task and its properties
          if (!task) return acc; // Skip if task is undefined
          if (task.id === (tasks[currentTaskIndex] && tasks[currentTaskIndex].id) && !isBreakTime) {
            return acc + Math.max(0, Math.ceil(timeRemaining / 60));
          }
          return acc + (task.estimatedDuration ?? 0); // Added safety
      }, 0);

    const now = new Date();
    let timeLeftTodayMinutes = 0;
    
    // Determine the end time for P(Not Finishing) based on customFinishTime or dailyResetTime
    let endOfTodayTargetTime;

    if (customFinishTime) {
      const [finishHour, finishMinute] = customFinishTime.split(':').map(Number);
      const customEndTime = new Date(now);
      customEndTime.setHours(finishHour, finishMinute, 0, 0);
      
      // If the custom time is in the past today, calculate until tomorrow's custom time
      // This handles cases where the user sets a time like 9 AM, but it's already 10 AM
      if (customEndTime.getTime() < now.getTime()) {
           customEndTime.setDate(customEndTime.getDate() + 1);
      }
       endOfTodayTargetTime = customEndTime;

    } else {
      // Fallback to dailyResetTime if no custom finish time is set
      const [resetHour, resetMinute] = dailyResetTime.split(':').map(Number);
      const todayReset = new Date(now);
      todayReset.setHours(resetHour, resetMinute, 0, 0);

      const tomorrowReset = new Date(now);
      tomorrowReset.setDate(tomorrowReset.getDate() + 1);
      tomorrowReset.setHours(resetHour, resetMinute, 0, 0);

      endOfTodayTargetTime = (now.getTime() < todayReset.getTime())
        ? todayReset
        : tomorrowReset;
    }

    const localMsLeft = endOfTodayTargetTime.getTime() - now.getTime();
    timeLeftTodayMinutes = Math.max(0, Math.floor(localMsLeft / (1000 * 60)));

    let probNotFinishingPercentage = 0;

    if (remainingUncompletedTaskMinutes === 0) {
      probNotFinishingPercentage = 0;
    } else if (timeLeftTodayMinutes <= 0) {
      probNotFinishingPercentage = 100;
    } else {
      const P_base_workload = Math.min(1, remainingUncompletedTaskMinutes / timeLeftTodayMinutes);
      
      const totalSessionTimeSeconds = accumulatedFocusTimeSeconds + displayedIdleTime;
      let inefficiency_penalty_multiplier = 1; // Default to no penalty
      if (totalSessionTimeSeconds > 0) {
        const efficiency_metric = accumulatedFocusTimeSeconds / totalSessionTimeSeconds;
        inefficiency_penalty_multiplier = 1 + (1 - efficiency_metric); // Ranges [1, 2]
      }

      const raw_probability = P_base_workload * inefficiency_penalty_multiplier;
      probNotFinishingPercentage = Math.min(100, Math.round(raw_probability * 100));
    }

    return {
      totalPlannedTime: totalPlannedDuration,
      accumulatedFocusTimeSeconds: accumulatedFocusTimeSeconds, 
      estimatedRemainingTaskTimeMinutes: remainingUncompletedTaskMinutes,
      probNotFinishing: probNotFinishingPercentage,
    };
  }, [tasks, currentTaskIndex, timeRemaining, isBreakTime, displayedIdleTime, dailyResetTime, customFinishTime]); // Added missing dependencies

  const dailyStats = calculateDailyStats();
  const activeTaskObject = currentTaskIndex !== -1 && tasks[currentTaskIndex] ? tasks[currentTaskIndex] : null;
  const currentDisplayTaskName = isBreakTime ? "Break Time!" : (activeTaskObject ? activeTaskObject.name : "No Active Task");
  const activeTaskOriginalId = activeTaskObject ? activeTaskObject.id : null;

  const handleClearAllTasks = useCallback(() => {
    setTasks([]);
    localStorage.removeItem('tasks'); // Also clear from localStorage immediately
    toast({ title: "Tasks Cleared", description: "All tasks have been removed.", variant: "destructive" });
  }, [setTasks]); // Added setTasks dependency

  // Spirals handlers (to be implemented)
  const handleAddSpiral = useCallback((spiralName) => {
    if (!spiralName.trim()) {
        toast({title: "Invalid Spiral", description: "Spiral name cannot be empty.", variant: "destructive"});
        return;
    }
    setSpirals(prev => [...prev, { id: Date.now(), name: spiralName.trim() }]);
    toast({title: "Spiral Added", description: `"${spiralName.trim()}" added to spirals.`});
  }, [setSpirals]); // Added setSpirals dependency

  const handleRemoveSpiral = useCallback((spiralId) => {
    const spiralToRemove = spirals.find(s => s.id === spiralId);
    setSpirals(prev => prev.filter(s => s.id !== spiralId));
    if (spiralToRemove) {
        toast({title: "Spiral Removed", description: `"${spiralToRemove.name}" removed.`, variant: "destructive"});
    }
  }, [spirals, setSpirals]); // Added setSpirals dependency

  const handleMoveSpiralToTasks = useCallback((spiralId) => {
    const spiralToMove = spirals.find(s => s.id === spiralId);
    if (!spiralToMove) return;

    setPromptConfig({
      title: "Move Spiral to Task",
      message: `Enter estimated duration (minutes) for task "${spiralToMove.name}":`,
      inputLabel: "Duration (minutes):",
      defaultValue: "30",
      confirmText: "Move to Tasks",
      cancelText: "Cancel",
      placeholder: "e.g., 30",
      onConfirm: (durationText) => {
        if (durationText === null) return; 
        const duration = parseInt(durationText, 10);

        if (duration && duration > 0) {
          handleAddTask({ name: spiralToMove.name, duration });
          setSpirals(prev => prev.filter(s => s.id !== spiralId));
          toast({ title: "Spiral Moved", description: `"${spiralToMove.name}" moved to tasks.` });
        } else {
          toast({ title: "Invalid Duration", description: "Please enter a positive number for duration.", variant: "destructive" });
        }
      }
    });
    setIsPromptOpen(true); 
  }, [spirals, handleAddTask, setIsPromptOpen, setPromptConfig, setSpirals]); // Added missing dependencies

  const handleMasterPlayPause = useCallback(() => {
    if (isTimerActive) { // If timer is currently running
      handlePauseTimer(); // Pause it
    } else { // If timer is not currently running (stopped or paused)
      // Check if we can resume an existing task or break
      if (timeRemaining > 0 && ((currentTaskIndex !== -1 && tasks[currentTaskIndex] && !tasks[currentTaskIndex].completed && !isBreakTime) || isBreakTime)) {
        handleResumeTimer(); // Resume it
      } else {
        // Otherwise, try to start the first available (uncompleted) task
        const firstUncompletedTaskIndex = tasks.findIndex(t => !t.completed);
        if (firstUncompletedTaskIndex !== -1) {
          startTimer(firstUncompletedTaskIndex); // Start it
        } else {
          toast({title: "No Tasks", description: "Add a task or all tasks are complete.", variant:"default"});
        }
      }
    }
  }, [isTimerActive, timeRemaining, currentTaskIndex, tasks, isBreakTime, handlePauseTimer, handleResumeTimer, startTimer]); // Added missing dependencies

  // Handle click on apple icon to toggle quote visibility
  const handleAppleClick = () => {
    setShowQuote(prevShowQuote => !prevShowQuote);
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      const nextStepIndex = currentTutorialStep + 1;
      setCurrentTutorialStep(nextStepIndex); // Update step first

      // Then, set the view for the NEW current step
      const newCurrentStepConfig = tutorialSteps[nextStepIndex];
      if (newCurrentStepConfig.targetView) {
        setActiveView(newCurrentStepConfig.targetView);
      }
    }
  };

  const handlePrevTutorialStep = () => {
    if (currentTutorialStep > 0) {
      const prevStepIndex = currentTutorialStep - 1;
      setCurrentTutorialStep(prevStepIndex); // Update step first

      // Then, set the view for the NEW current step
      const newCurrentStepConfig = tutorialSteps[prevStepIndex];
      if (newCurrentStepConfig.targetView) {
        setActiveView(newCurrentStepConfig.targetView);
      }
      // If no targetView (e.g. for the first 'Welcome' step when going back to it),
      // the view will remain as it was from the step before it. This is generally fine.
    }
  };

  const handleFinishTutorial = () => { // Renamed from handleSkipTutorial for clarity when it's the last step
    setShowTutorial(false);
    localStorage.setItem('annoyingPomodoroTutorial_v1_seen', 'true');
    setActiveView('focus'); // Ensure they land on focus view
  };

  // Function to restart tutorial
  const handleRestartTutorial = () => {
    setShowTutorial(true);
    setCurrentTutorialStep(0);
    localStorage.removeItem('annoyingPomodoroTutorial_v1_seen'); // Ensure it shows again
    setActiveView('focus'); // Start tutorial from focus view
  };

  
  // JSX will be in the next part
  return (
    <div 
      className={`bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden ${!isMobileView ? 'h-screen' : ''}`}
      style={isMobileView ? { height: `${viewportHeight}px` } : {}}
    >
      {/* Custom style to override TaskListC max height and add custom breakpoint */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar.max-h-\[450px\], 
        ul.max-h-\[450px\].custom-scrollbar {
          max-height: 500px !important;
        }
        @media (min-width: 375px) { /* Custom 'xs' breakpoint definition */
          .xs\:max-w-xs {
             max-width: 320px !important;
          }
        }
      `}} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      <div className="relative z-10 p-2 sm:p-6 max-w-7xl mx-auto flex flex-col h-full"> {/* Made this a flex column that fills height, reduced padding on small screens */}
        {/* Header */}
        <div className="mb-2 sm:mb-8 relative"> {/* Reduced margin on small screens */}
          {/* Container for Title and Apple/Quote, making it a flex row and relative for positioning context */}
          <div className="relative flex items-center justify-center mb-2 sm:mb-6"> {/* Reduced margin on small screens */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold flex gap-2"> {/* Smaller text on small screens */}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #ff3b3b 0%, #ff8c00 100%)' }}
              >
                Annoying
              </span>
              <span
                className="text-lightText"
              >
                Pomodoro
              </span>
            </h1>

            {/* Annoying Apple/Tomato and its Quote Bubble - Positioned alongside title */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex items-center space-x-2 p-1 z-20 mt-[-1px] sm:mt-0"> {/* Adjusted to be more flush left, reduced padding and space, moved up 1px on mobile */}
              {/* Image from logo192.png */}
              <img 
                src={`${process.env.PUBLIC_URL}/assets/android-chrome-192x192.png`} // Changed from logo192.png
                alt="Annoying Character" 
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 cursor-pointer" /* Added cursor-pointer */
                onClick={handleAppleClick} // Added click handler
              />
              
              {/* Quote Bubble - Conditionally rendered */}
              {motivationalQuote && showQuote && (
                <div className="relative bg-gray-800/80 backdrop-blur-md border border-gray-700/70 rounded-lg px-2 py-1 sm:px-3 sm:py-2 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] shadow-xl"> {/* Smaller on small screens */}
                  <p className="text-gray-200 italic text-[10px] sm:text-xs md:text-sm leading-snug md:leading-relaxed">"{motivationalQuote}"</p>
                  {/* Speech bubble pointer (pointing left, adjusted for alignment) */}
                  <div 
                    className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-gray-800/80 border-b border-l border-gray-700/70 rotate-45"
                  />
                </div>
              )}
            </div>
          </div>
        
          {/* Stats Grid - This is the existing stats display from your file */}
          <div className="mt-2 sm:mt-4 pt-1 sm:pt-2 lg:pt-6 xl:pt-6 border-t border-dark-300/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-around items-center gap-2 sm:gap-3 lg:gap-4"> {/* Added large and extra large top padding, Reduced spacing */}
          <div className="flex flex-col items-center group">
              <div className="flex items-center text-subtleText text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-0.5 font-medium"> {/* Smaller text */}
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-cyanAccent transition-transform duration-300 group-hover:scale-110" /> {/* Smaller icon */}
              Score
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-cyanAccent/10 blur-md rounded-full"></div>
                <span className="score-display relative z-10 text-cyanAccent font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 group-hover:text-brightAccent px-2 sm:px-2">{score}</span> {/* Smaller text */}
          </div>
            </div>
            
          <div className="flex flex-col items-center group">
              <div className="flex items-center text-subtleText text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-0.5 font-medium">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-green-500 transition-transform duration-300 group-hover:scale-110" />
              Tasks Done
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/10 blur-md rounded-full"></div>
                <span className="relative z-10 text-green-500 font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 group-hover:text-green-400 px-2 sm:px-3">{tasks.filter(t => t.completed).length}</span>
          </div>
            </div>
            
          <div className="flex flex-col items-center group">
              <div className="flex items-center text-subtleText text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-0.5 font-medium">
                <Timer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
              Focus Time
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-md rounded-full"></div>
                <span className="relative z-10 text-blue-500 font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 group-hover:text-blue-400 px-2 sm:px-3">{formatDurationToHoursMinutes(dailyStats.accumulatedFocusTimeSeconds)}</span>
          </div>
            </div>
            
          <div className="flex flex-col items-center group">
              <div className="flex items-center text-subtleText text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-0.5 font-medium">
                <Coffee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-amber-500 transition-transform duration-300 group-hover:scale-110" />
              Idle Time
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/10 blur-md rounded-full"></div>
                <span className="relative z-10 text-amber-500 font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 group-hover:text-amber-400 px-2 sm:px-3 flex flex-wrap justify-center">{/* Added flex flex-wrap */}
                  {(() => {
                    const totalSeconds = Math.floor(displayedIdleTime);
                    if (isNaN(totalSeconds) || totalSeconds < 0 || totalSeconds === 0) return "0 min";
                    
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    
                    if (hours > 0) {
                      return (
                        <>
                          <span className="whitespace-nowrap">{hours} hour{hours > 1 ? 's' : ''}</span>
                          <span className="whitespace-nowrap ml-1">{minutes} min</span>{/* Added ml-1 for spacing */}
                        </>
                      );
                    } else {
                      return <span className="whitespace-nowrap">{minutes} min</span>;
                    }
                  })()}
                </span>
          </div>
            </div>
            
          <div className="flex flex-col items-center group">
              <div className="flex items-center text-subtleText text-[10px] sm:text-xs md:text-sm uppercase tracking-wider mb-0.5 font-medium">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-red-500 transition-transform duration-300 group-hover:scale-110" />
              P(Not Finishing)
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/10 blur-md rounded-full"></div>
                <span className="relative z-10 text-red-500 font-bold text-lg sm:text-xl md:text-2xl transition-all duration-300 group-hover:text-red-400 px-2 sm:px-3">{dailyStats.probNotFinishing}%</span>
          </div>
        </div>
          </div>
        </div>

        {/* Main content area with side navigation */}
        <div className="flex flex-col sm:flex-row flex-grow overflow-hidden w-full gap-2 sm:gap-2 lg:gap-3"> {/* Reduced gap from sm:gap-3 lg:gap-5 */}
          {/* Side Navigation - Enhanced with modern styling */}
          <div className="flex p-1 sm:pt-1 flex-row sm:flex-col gap-2 sm:gap-1 lg:gap-1.5 w-full sm:w-16 sm:w-20 lg:w-[13.5vh] flex-shrink-0 justify-between relative z-[100] sm:bg-transparent sm:dark:bg-transparent p-1 rounded-lg sm:p-0 sm:rounded-none"> {/* Removed bg-gray-900/50 */}
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              return (
                <UIButton
                  key={item.id}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setActiveView(item.id)}
                  className={`h-14 sm:h-14 md:h-[17.8%] sm:px-3 xl:py-3 flex flex-col items-center justify-center text-xs sm:text-s lg:text-base rounded-lg sm:rounded-xl w-[18%] sm:w-20 lg:w-[13vh]
                            ${
                              isActive
                                ? `bg-gradient-to-br from-cyanAccent/20 to-brightAccent/10 shadow-lg shadow-cyanAccent/30 border border-cyanAccent/30` // Always use cyan/bright accent for active
                                : `bg-dark-200/30 hover:bg-dark-200/50 hover:shadow-md hover:shadow-${item.color}/15`
                            }
                            transition-all duration-300 group`}
                  // The rgba values would ideally come from Tailwind config, here using placeholder logic
                  // For specific colors like cyanAccent, you might need to map them to RGB if not directly usable in rgba()
                >
                  <IconComponent className={`
                    ${item.id === 'focus' ? 
                      `h-[1.92em] w-[1.92em] md:h-[2em] md:w-[2em] lg:h-[4.5vh] lg:w-[4.5vh]` : 
                      item.id === 'plan' ?
                      `h-[1.92em] w-[1.92em] md:h-[2em] md:w-[2em] lg:h-[4vh] lg:w-[4vh]` : 
                      `h-[1.67em] w-[1.67em] md:h-[1.75em] md:w-[1.75em] lg:h-[3.5vh] lg:w-[3.5vh]`
                    }
                    mb-1 md:mb-1.5 sm:mb-2 lg:mb-2 ${getIconClass(isActive, item.color)}
                 `} />
                  <span className={`text-xs md:text-sm lg:text-[2.1vh] ${isActive ? 'font-semibold text-lightText' : 'text-subtleText/90'} truncate ${viewportHeight < 720 ? 'text-sm': 'text-base'}`}>{item.label}</span>
                </UIButton>
              );
            })}
        </div>

          {/* Main view area */}
        <main className="flex-grow overflow-auto h-full m-1 sm:m-0 relative z-0"> {/* Added z-0 */}
          {/* Content will be conditionally rendered here based on activeView */}
          {activeView === 'focus' && (
              <div 
                className="h-full flex flex-col bg-gradient-to-br from-dark-100/90 to-dark-200/90 shadow-md hover:shadow-lg transition-all duration-500 rounded-xl p-2 sm:p-4 lg:p-6 relative focus-view-container"
                ref={focusCardRef} // Attach the ref here
              > 
                {/* Quick Task shortcut */}
                {isQuickTaskEnabled && (
                  <div className={`absolute ${isExtraSmallScreen ? 'top-0 right-2' : 'top-4 right-4'} z-10 sm:top-4.5 md:top-3.5 lg:top-5 sm:right-5 max-w-xs`}> {/* Adjusted top position for mobile, conditional rendering */}
                    <TaskShortcut onAddTask={handleAddTask} isMobileView={isMobileView} /> {/* Pass isMobileView prop */}
                  </div>
                )}
                
                {/* Current Task Header - normal position by default, moved to top left on small heights via CSS */}
                <div className="task-header-wrapper text-center mt-4 sm:mt-0 pt-1 sm:pt-1 mb-3 sm:mb-4 min-w-[10R0px]"> {/* Increased default pt and mb, Added mt-4 sm:mt-0 */}
                  <div className={`inline-flex items-center ${isExtraSmallScreen ? 'gap-1.5 px-2 py-1.5 rounded-lg' : 'gap-2 sm:gap-2 px-3 py-2 sm:px-3 sm:py-2 rounded-xl'} bg-gray-900/70 backdrop-blur-sm text-sm sm:text-base task-header`}>
                    <div className={`${isExtraSmallScreen ? 'w-1.5 h-1.5' : 'w-2 h-2 sm:w-2 sm:h-2'} rounded-full ${isTimerActive && !isBreakTime ? 'bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse' : 'bg-gray-600'}`}></div>
                    <div className="task-header-content">
                      <span className={`${isExtraSmallScreen ? 'text-xs' : 'text-gray-300'} font-medium task-label`}>Current Task: </span>
                      <span className={`font-semibold ${currentTaskIndex !== -1 && !isBreakTime ? "text-cyan-400" : "text-gray-400"} task-name ${isExtraSmallScreen ? 'text-xs max-w-[150px]' : 'max-w-[200px]'} truncate`}>{currentDisplayTaskName}</span>
                    </div>
                  </div>
                </div>

                {/* Timer Circle - centered in the container */}
                <div id="timer-circle-container" className={`flex-grow flex items-center justify-center timer-container`}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl scale-110"></div>
                    <div className={`relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-full w-[min(35vh,70vw)] h-[min(35vh,70vw)] min-w-[150px] min-h-[150px] flex flex-col items-center justify-center shadow-2xl timer-circle ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'w-[min(40vh,70vw)] h-[min(40vh,70vw)]' : 'w-[min(35vh,70vw)] h-[min(35vh,70vw)]'}`}>
                      {/* Circular Progress Indicator */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          strokeWidth="2.5" 
                          stroke="rgba(255,255,255,0.05)" 
                        />
                        {/* Progress circle - dynamically calculate stroke-dashoffset based on remaining time */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          strokeWidth="2.5" 
                          stroke={!isTimerActive && timeRemaining > 0 ? '#facc15' : (isBreakTime ? '#10b981' : (isTimerActive ? '#22d3ee' : 'rgba(255,255,255,0.1)'))} 
                          strokeLinecap="round"
                          strokeDasharray="283" 
                          strokeDashoffset={(() => {
                            // If idle, show full circle
                            if (!isTimerActive && currentTaskIndex === -1 && !isBreakTime && timeRemaining === 0) { // Added timeRemaining === 0
                              return 0; // Full circle
                            }
                             // Calculate progress percentage (elapsed time relative to total)
                             const totalTime = (isTimerActive || (!isTimerActive && timeRemaining > 0)) 
                               ? initialTimeForProgress 
                               : (currentTaskIndex !== -1 && tasks[currentTaskIndex] 
                                   ? tasks[currentTaskIndex].estimatedDuration * 60 // Fallback for completed/over tasks
                                   : (isBreakTime ? breakDuration * 60 : 0)); // Fallback for break (shouldn't be hit if using initialTimeForProgress)
                             
                             if (totalTime <= 0) return "283"; // Default to empty if no total time
                             
                             // Calculate elapsed time
                             const elapsed = totalTime - timeRemaining; // totalTime is now initialTimeForProgress state
                             // Calculate progress (percentage of time elapsed)
                             const progress = 1 - elapsed / totalTime;
                             
                             // 283 is approximation of 2πr (2 * π * 45)
                             // To show elapsed time from filled, use the progress percentage directly
                             return 283 * (1 - progress);
                           })()}
                        />
                      </svg>
                      
                      {/* Adjusted styling: Apply responsive font size based on viewport height */}
                      <div id="timer-clock-react" className={`text-[6vh] text-[length:clamp(0rem,min(6vh,14vw),4rem)] font-mono font-bold ${timerDisplayColor()} tabular-nums tracking-tight transition-all duration-500 ${!isTimerActive && currentTaskIndex === -1 ? 'mt-2' : 'mt-1'} ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'text-[7.5vh]' : ''}`}>
                        {formatTime(timeRemaining)}
                      </div>
                      {isTimerActive && !isBreakTime && (
                        <div className="mt-1 text-xs sm:text-sm text-gray-400 uppercase tracking-widest animate-pulse text-center ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'sm:text-[2.25vh]' : ''}">
                          FOCUS IN PROGRESS
                        </div>
                      )}
                      {isTimerActive && isBreakTime && (
                        <div className="mt-1 text-xs sm:text-sm text-emerald-400 uppercase tracking-widest animate-pulse text-center ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'sm:text-[2.25vh]' : ''}">
                          BREAK IN PROGRESS
                        </div>
                      )}
                      {!isTimerActive && timeRemaining > 0 && (currentTaskIndex !== -1 || isBreakTime) && (
                         <div className="mt-1 text-xs sm:text-sm text-yellow-500 uppercase tracking-widest text-center ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'sm:text-[2.25vh]' : ''}">
                           PAUSED
                         </div>
                      )}
                      {!isTimerActive && timeRemaining === 0 && currentTaskIndex !== -1 && !isBreakTime && (
                         <div className="mt-1 text-xs sm:text-sm text-red-500 uppercase tracking-widest text-center ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'sm:text-[2.25vh]' : ''}">
                           TIMER OVER
                         </div>
                      )}
                        {!isTimerActive && timeRemaining === 0 && currentTaskIndex === -1 && (
                          <div className={`mt-1 ${isExtraSmallScreen ? 'text-xs' : 'text-sm'} tracking-widest text-gray-400 uppercase text-center animate-pulse ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'sm:text-[2.25vh]' : 'sm:text-[2vh]'}`}>
                              <div className={`text-gray-400 ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'mb-[0.4em]' : ''}`}>CLOCKS TICKING...</div>
                              <div className="text-gray-400">NOT YOURS</div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className={`flex justify-center gap-[5vw] sm:gap-4 lg:gap-5 xl:gap-5 mt-4 mb-4 sm:mb-0 pb-2 sm:pb-2 ${viewportHeight > 780 && viewportHeight < window.innerWidth ? 'gap-3 sm:gap-4 lg:gap-5 xl:gap-5' : ''}`}> {/* Increased gap for large breakpoints, Increased default pb, Added mb-4 sm:mb-0 */}
                  <button
                    onClick={handleMasterPlayPause}
                    disabled={isTimerActive ? false : (!tasks.some(task => !task.completed) && (!isBreakTime || timeRemaining === 0))}
                    className={`group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center
                      ${viewportHeight < 820 && viewportHeight < window.innerWidth
                        ? 'py-1.5 sm:py-2 lg:py-3 xl:py-3 text-xs sm:text-sm xl:text-base w-[70px] sm:w-[90px] lg:w-[120px] xl:w-[135px]'
                        : 'py-2 sm:py-3 lg:py-4 xl:py-4 text-sm sm:text-base xl:text-lg w-[24vw] sm:w-[100px] lg:w-[135px] xl:w-[150px]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className={`relative flex items-center
                      ${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}
                    `}> {/* Increased default gap */}
                      {isTimerActive ?
                        <Pause className={`${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-4 xl:w-4' : 'h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-5 xl:w-5'}`} />
                        :
                        <Play className={`${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-4 xl:w-4' : 'h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-5 xl:w-5'}`} />
                      } {/* Increased default and xl icon size */}
                      {isTimerActive ? 'Pause' : (timeRemaining > 0 ? 'Resume' : 'Start')}
                    </div>
                  </button>
                  
                  <button 
                      onClick={() => {
                        if (isBreakTime) {
                          handleSkipBreak(); // Use handleSkipBreak from useTimer hook
                        } else {
                          handleTaskDone(); // Use handleTaskDone from useTimer hook
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                      }
                    }}
                    disabled={isBreakTime ? !isTimerActive : (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed)}
                    className={`group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center text-center
                      ${viewportHeight < 820 && viewportHeight < window.innerWidth
                        ? 'py-1.5 sm:py-2 lg:py-3 xl:py-3 text-xs sm:text-sm xl:text-base w-[70px] sm:w-[90px] lg:w-[120px] xl:w-[135px]'
                        : 'py-2 sm:py-3 lg:py-4 xl:py-4 text-sm sm:text-base xl:text-lg w-[24vw] sm:w-[100px] lg:w-[135px] xl:w-[150px]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className={`relative flex items-center
                      ${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}
                    `}> {/* Increased default gap */}
                      <CheckCircle className={`${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-4 xl:w-4' : 'h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-5 xl:w-5'}`} /> {/* Increased default and xl icon size */}
                      {isBreakTime ? 'Skip Break' : 'Done!'}
                </div>
                  </button>
                  
                  <button 
                    onClick={handleExtendTimer} // Use handleExtendTimer from useTimer hook
                    disabled={isBreakTime ? (!isTimerActive || !allowExtendBreak) : (currentTaskIndex === -1 || !tasks[currentTaskIndex] || tasks[currentTaskIndex].completed || isTimerActive || timeRemaining !== 0) }
                     className={`group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center text-center
                       ${viewportHeight < 820 && viewportHeight < window.innerWidth
                        ? 'py-1.5 sm:py-2 lg:py-3 xl:py-3 text-xs sm:text-sm xl:text-base w-[70px] sm:w-[90px] lg:w-[120px] xl:w-[135px]'
                        : 'py-2 sm:py-3 lg:py-4 xl:py-4 text-sm sm:text-base xl:text-lg w-[24vw] h-[45px] sm:h-auto sm:w-[100px] lg:w-[135px] xl:w-[150px]'
                      }
                    `}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className={`relative flex items-center
                      ${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}
                    `}> {/* Increased default gap */}
                      <Plus className={`${viewportHeight < 820 && viewportHeight < window.innerWidth ? 'h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-4 xl:w-4' : 'h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-5 xl:w-5'}`} /> {/* Increased default and xl icon size */}
                    Extend
                </div>
                  </button>
                </div>
              </div>
          )}

          {activeView === 'plan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                <UICard className="lg:col-span-1 bg-gradient-to-br from-dark-100/90 to-dark-200/90 flex flex-col shadow-md hover:shadow-lg transition-all duration-500 border-0"> {/* Removed ring border, added border-0 */}
                  <UICardHeader className="py-3 border-b border-dark-300/25">
                    <UICardTitle className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent text-center">Plan Your Day</UICardTitle>
                  </UICardHeader>
                  <UICardContent className="flex-grow flex flex-col overflow-hidden p-6"> {/* UICardContent for Plan Your Day */}
                    <TaskFormC onAddTask={handleAddTask} />
                    <div className="mt-4 pt-4 border-t border-dark-300/40 space-y-2.5 flex-grow overflow-y-auto"> {/* This div will contain stats and session time, it grows and scrolls */}
                      <h3 className="text-sm font-semibold text-cyanAccent mb-2">Daily Stats</h3>
                      <div className="bg-dark-300/25 rounded-md p-3 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-subtleText flex items-center">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyanAccent mr-1.5"></span>
                            Total Tasks:
                          </span>
                          <span className='text-teal-400 font-semibold'>{tasks.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-subtleText flex items-center">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                            Total Planned:
                          </span>
                          <span className='text-teal-400 font-semibold'>{dailyStats.totalPlannedTime} min</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-subtleText flex items-center">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                            Remaining:
                          </span>
                          <span className='text-teal-400 font-semibold'>{dailyStats.estimatedRemainingTaskTimeMinutes} min</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-subtleText flex items-center">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            P(Not Finishing):
                          </span>
                          <span className='text-teal-400 font-semibold'>{dailyStats.probNotFinishing}%</span>
                        </div>
                      </div>

                      {/* Session End Time - collapsible section */}
                      <div className="mt-4 pt-4 border-t border-dark-300/40 space-y-2.5">
                        <button 
                          onClick={() => setIsSessionEndTimeExpanded(!isSessionEndTimeExpanded)}
                          className="w-full flex justify-between items-center text-sm font-semibold text-cyanAccent mb-2 focus:outline-none hover:text-brightAccent transition-colors"
                        >
                          Session End Time
                          {isSessionEndTimeExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                        {isSessionEndTimeExpanded && (
                          <div className="bg-dark-300/25 rounded-md p-3 space-y-2.5 text-xs animate-fadeIn">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1 text-cyanAccent" />
                                <span className="font-medium text-xs md:text-sm">Set End Time</span>
                              </div>
                              <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                                {customFinishTime || 'Not Set'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={customFinishTime || ''}
                                onChange={(e) => setCustomFinishTime(e.target.value)}
                                className="w-full bg-dark-200/70 border border-dark-300/50 rounded p-1.5 text-xs md:text-sm focus:ring-cyanAccent focus:border-cyanAccent appearance-none"
                                style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} // Ensures native time picker matches theme
                              />
                              <UIButton
                                variant="destructive"
                                size="sm"
                                onClick={() => setCustomFinishTime(null)}
                                disabled={!customFinishTime}
                                className="py-1 px-2 text-xs"
                              >
                                Clear
                              </UIButton>
                            </div>
                            <div className="text-[9px] md:text-[10px] text-subtleText/70 mt-1.5 pl-0.5">
                              Set a temporary end time for today's session. Overrides Daily Reset Time for P(Not Finishing).
                            </div>
                          </div>
                        )}
                      </div>
                    </div> {/* This closes the div starting on line 1491 */}
                    
                    {/* Clear All Tasks Button - pushed to bottom */}
                    <div className="mt-auto pt-4 border-t border-dark-300/40">
                         <UIButton
                           variant="destructive"
                           size="sm"
                           onClick={handleClearAllTasks} // Use handleClearAllTasks from useTasksAndSpirals hook
                           disabled={tasks.length === 0}
                           className="w-full py-2 text-xs"
                       >
                           Clear All Tasks
                         </UIButton>
                    </div>
                  </UICardContent>
                </UICard>

                <UICard className="lg:col-span-2 bg-gradient-to-br from-dark-100/90 to-dark-200/90 flex flex-col shadow-md hover:shadow-lg transition-all duration-500 border-0"> {/* UICard for Today's Tasks */}
                  <UICardHeader className="py-3 border-b border-dark-300/25">
                    <UICardTitle className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent text-center">Today's Tasks</UICardTitle>
                  </UICardHeader>
                  <UICardContent className="p-6 flex-grow flex flex-col"> {/* Added flex-grow and flex-col */}
                    <div className="tall-task-list flex flex-col flex-grow"> {/* Added flex flex-col flex-grow */}
                      <TaskListC 
                        className="task-list-override"
                        tasks={[...tasks].sort((a, b) => {
                          // Sort uncompleted tasks first
                          if (a.completed && !b.completed) return 1;
                          if (!a.completed && b.completed) return -1;
                          return 0; // Keep original order within each group
                        })}
                      onRemoveTask={handleRemoveTask} 
                      onStartTask={(taskId) => {
                          const currentTasks = tasks; 
                          const taskIndex = currentTasks.findIndex(t => t.id === taskId);
                          
                          if (taskIndex !== -1) {
                              // startTimer is now from useTimer hook
                              startTimer(taskIndex);
                          } else {
                              console.error("[App onStartTask] Task ID not found in current tasks:", { taskId });
                              toast({ 
                                  title: "Task Not Found", 
                                  description: "The selected task could not be found to start.", 
                                  variant: "destructive" 
                              });
                          }
                      }}
                      currentTaskIndex={currentTaskIndex} 
                      activeTaskOriginalId={activeTaskOriginalId} 
                      isTimerActive={isTimerActive} 
                      isBreakTime={isBreakTime}
                      timeRemaining={timeRemaining}
                      onMarkTaskDone={handleTaskDone} // Use handleTaskDone from useTimer hook
                  />
                    </div>
                  </UICardContent>
                </UICard>
            </div>
          )}

          {activeView === 'spirals' && (
              <UICard className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-500 border-0"> {/* Removed ring border, added border-0 */}
                <UICardHeader className="py-3 border-b border-dark-300/25">
                  <UICardTitle className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent text-center">Spirals (Ideas for Later)</UICardTitle>
                </UICardHeader>
                <UICardContent className="flex-grow flex flex-col overflow-hidden p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTAgOTBjMjIuMDkxIDAgNDAtMTcuOTA5IDQwLTQwUzcyLjA5MSAxMCA1MCAxMCAxMCAyNy45MDkgMTAgNTBzMTcuOTA5IDQwIDQwIDQweiIgc3Ryb2tlPSIjMkQzNzQ4IiBmaWxsPSJub25lIiBvcGFjaXR5PSIuMDMiLz48L3N2Zz4=')] bg-[length:80px_80px]"> {/* Increased padding */}
                  <SpiralFormC onAddSpiral={handleAddSpiral} />
                <div className="mt-4 flex-grow overflow-y-auto">
                    <SpiralListC 
                    spirals={spirals} 
                    onRemoveSpiral={handleRemoveSpiral} // Uses wrapped App.js version
                    onMoveSpiralToTasks={handleMoveSpiralToTasks} // Uses wrapped App.js version
                  />
                </div>
                </UICardContent>
              </UICard>
          )}

          {activeView === 'settings' && (
              <UICard className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-500 border-0"> {/* Removed ring border, added border-0 */}
                <UICardHeader className="py-3 border-b border-dark-300/25">
                  <UICardTitle className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-brightAccent text-center">App Settings</UICardTitle>
                </UICardHeader>
                <UICardContent className="flex-grow flex flex-col p-6 text-sm md:text-base overflow-y-auto"> {/* Increased padding */}
                <div className="space-y-5 md:space-y-6">
                  {/* Motivation Type Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Motivation Type</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        {quoteType.charAt(0).toUpperCase() + quoteType.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] md:text-xs">
                      {Object.keys(quoteCategories).filter(type => type !== 'Geeky').map(type => (
                        <div 
                          key={type}
                          className={`${quoteType === type ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded p-1.5 text-center cursor-pointer hover:bg-cyanAccent/20 hover:text-cyanAccent transition-colors`}
                          onClick={() => setQuoteType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sound Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Sound Notifications</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          className={`${soundEnabled ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setSoundEnabled(true)}
                        >
                          <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                        <button 
                          className={`${!soundEnabled ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setSoundEnabled(false)}
                        >
                          <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Allow Extend Break Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Allow Extending Breaks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          className={`${allowExtendBreak ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setAllowExtendBreak(true)}
                        >
                          Yes
                        </button>
                        <button 
                          className={`${!allowExtendBreak ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-1 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                          onClick={() => setAllowExtendBreak(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Default Break Duration Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Default Break Duration</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        {breakDuration} minutes
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-dark-300 rounded-lg appearance-none cursor-pointer range-thumb-cyanAccent"
                    />
                    <div className="flex justify-between text-[10px] md:text-xs text-subtleText/80 mt-1">
                      <span>1 min</span>
                      <span>15 min</span>
                    </div>
                    </div>
                    
                                      {/* App Controls Section */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex items-center mb-3">
                      <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                      <span className="font-medium text-xs md:text-sm">App Controls</span>
                      </div>
                      {/* Quick Task Button Toggle */}
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-subtleText text-xs md:text-sm">Quick Task Button:</span>
                       <div className="flex items-center gap-1.5">
                         <button 
                           className={`${isQuickTaskEnabled ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-2 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                           onClick={() => setIsQuickTaskEnabled(true)}
                         >
                           Enabled
                         </button>
                         <button 
                           className={`${!isQuickTaskEnabled ? 'bg-cyanAccent/30 text-cyanAccent font-semibold' : 'bg-dark-200/40 text-subtleText'} rounded-full px-2.5 py-2 text-[10px] md:text-xs flex items-center transition-all duration-300`}
                           onClick={() => setIsQuickTaskEnabled(false)}
                         >
                           Disabled
                         </button>
                       </div>
                    </div>
                    {/* Restart Tutorial Button */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-subtleText text-xs md:text-sm">Tutorial</span>
                      </div>
                      <button 
                        className="w-full bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-500/90 hover:to-cyan-500/90 text-white py-1.5 rounded-md text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5"

                        onClick={() => handleRestartTutorial(setActiveView)}
                      >
                        <Play className="h-3.5 w-3.5" /> Restart Tutorial
                      </button>
                    </div>

                  </div>


                  {/* Points System Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Points System</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        Enabled
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 mt-2 text-[10px] md:text-xs">
                      <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Base Score (Focus):</span>
                        <span className="text-cyanAccent">1 pt per minute</span>
                      </div>
                      <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Time Saved Bonus:</span>
                        <span className="text-cyanAccent">1 pt per minute saved</span>
                      </div>
                       <div className="bg-dark-200/40 rounded p-1.5 flex justify-between items-center">
                        <span>Task Extension Penalty:</span>
                        <span className="text-red-500">1 pt per minute extended</span>
                      </div>
                    </div>
                    <div className="text-[9px] md:text-[10px] text-subtleText/70 mt-1.5 pl-0.5">
                      Score is based on total minutes focused and minutes saved compared to estimated duration. Extending tasks deducts points.
                    </div>
                  </div>

                  {/* Daily Reset Time Setting */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                        <span className="font-medium text-xs md:text-sm">Daily Reset Time</span>
                      </div>
                      <div className="bg-dark-200/80 text-subtleText rounded px-2 py-0.5 text-[10px] md:text-xs flex items-center">
                        {dailyResetTime}
                      </div>
                    </div>
                    <input
                      type="time"
                      value={dailyResetTime}
                      onChange={(e) => setDailyResetTime(e.target.value)}
                      className="w-full bg-dark-200/70 border border-dark-300/50 rounded p-1.5 text-xs md:text-sm focus:ring-cyanAccent focus:border-cyanAccent appearance-none"
                      style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} 
                    />
                    <div className="text-[9px] md:text-[10px] text-subtleText/70 mt-1.5 pl-0.5">
                      Time at which tasks, score, and timers reset daily. Spirals and historical stats are not affected.
                    </div>
                  </div>


                  {/* About Section */}
                  <div className="bg-dark-300/25 rounded-md p-3 md:p-4">
                    <div className="flex items-center mb-2">
                      <BrainCircuit className="h-4 w-4 md:h-5 md:w-5 mr-1.5 text-cyanAccent" />
                      <span className="font-medium text-xs md:text-sm">About</span>
                    </div>
                    <div className="text-[10px] md:text-xs text-subtleText/80">
                      Annoying Pomodoro v0.3
                    </div>
                  </div>

                </div>
                </UICardContent>
              </UICard>
          )}
          
          {activeView === 'dashboard' && (
              <DashboardViewC />
          )}

          {/* Tutorial Modal - MOVED INSIDE MAIN and changed to absolute positioning */}
          {showTutorial && tutorialSteps[currentTutorialStep] && (
            <div className={`absolute z-50 ${isExtraSmallScreen ? 'bottom-0 right-0' : 'bottom-4 right-4'} animate-in fade-in duration-300`}> {/* Adjusted positioning based on isExtraSmallScreen */}
              <div className="bg-gray-800 border border-gray-700/80 p-6 rounded-xl shadow-2xl max-w-[280px] sm:max-w-sm w-full flex flex-col space-y-4 text-white"> {/* Adjusted max-w for mobile */}
                {/* Image and Title container - Conditional rendering */}
                {currentTutorialStep === 0 ? (
                  <div className="flex items-center space-x-3 mb-1"> {/* Reduced mb-2 to mb-1 */}
                    {/* Image of Annoying Tomato */}
                    <img 
                      src={`${process.env.PUBLIC_URL}/assets/annoyingTomato.png`} // Assuming the image is placed here
                      alt="Annoying Tomato Character" 
                      className="h-12 w-12 flex-shrink-0" // Adjust size as needed
                    />
                    {/* Tutorial Title - Use dangerouslySetInnerHTML only for step 0 */}
                    <h2 
                      className="text-lg sm:text-xl font-bold text-cyanAccent"  // Adjusted font size for mobile
                      dangerouslySetInnerHTML={{ __html: tutorialSteps[currentTutorialStep].title }}
                    />
                  </div>
                ) : (
                  // Normal title rendering for other steps
                  <h2 className="text-lg sm:text-xl font-bold text-cyanAccent">{tutorialSteps[currentTutorialStep].title}</h2> 
                )}
                
                {/* Tutorial Content */}
                <p 
                  className="text-gray-300 leading-relaxed text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: tutorialSteps[currentTutorialStep].content }}
                ></p> {/* Using dangerouslySetInnerHTML to render HTML in content */}
                
                {/* Tutorial Button Container */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-gray-700/50 gap-2 sm:gap-0"> {/* Adjusted layout for mobile */}
                  <UIButton 
                    variant="outline"
                    onClick={() => handleFinishTutorial(setActiveView)} // Skip button always finishes/skips
                    className="text-xs sm:text-sm"
                  >
                    Skip Tutorial
                  </UIButton>
                  <div className="flex space-x-2">
                    {currentTutorialStep > 0 && (
                      <UIButton 
                        variant="outline"
                        onClick={() => handlePrevTutorialStep(setActiveView)}
                        className="text-xs sm:text-sm"
                      >
                        Previous
                      </UIButton>
                    )}
                    {currentTutorialStep < tutorialSteps.length - 1 ? (
                      <UIButton 
                        variant="default"
                        onClick={() => handleNextTutorialStep(setActiveView)}
                        className="bg-cyanAccent hover:bg-cyanAccent/90 text-black text-xs sm:text-sm"
                      >
                        Next
                      </UIButton>
                    ) : (
                      <UIButton 
                        variant="default"
                        onClick={() => handleFinishTutorial(setActiveView)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                      >
                        Finish
                      </UIButton>
                    )}
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500 pt-0 mt-0">
                  Step {currentTutorialStep + 1} of {tutorialSteps.length}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toaster component for displaying toast notifications */}
      <Toaster />
      <PromptDialog 
        isOpen={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        title={promptConfig.title}
        message={promptConfig.message}
        inputLabel={promptConfig.inputLabel}
        defaultValue={promptConfig.defaultValue}
        confirmText={promptConfig.confirmText}
        cancelText={promptConfig.cancelText}
        onConfirm={promptConfig.onConfirm}
        placeholder={promptConfig.placeholder}
      />
      </div>
    </div>
  );
}

export default App;