const { useState, useEffect, useMemo, useCallback } = React;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';
const TMDB_TOKEN = import.meta.env.VITE_TMDB_KEY;

// --- Icons (Inline SVGs) ---
const Icons = {
    ArrowRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
    ArrowLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
    Loader2: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>,
    Film: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M3 7.5h4" /><path d="M3 12h18" /><path d="M3 16.5h4" /><path d="M17 3v18" /><path d="M17 7.5h4" /><path d="M17 16.5h4" /></svg>,
    Star: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    X: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
    Check: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5" /></svg>,
    SkipForward: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" x2="19" y1="5" y2="19" /></svg>,
    Plus: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    RefreshCw: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>,
    Zap: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>,
    Target: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    ExternalLink: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>,
};

// --- Genre Config ---
const GENRES = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
};

const SUB_GENRES = {
    28: ['Martial Arts', 'Heist Thriller', 'Spy Action', 'One-Man Army'],
    18: ['Tearjerker', 'Character Study', 'Biopic', 'Courtroom Drama'],
    35: ['Dark Comedy', 'Parody', 'Slapstick', 'Bromance'],
    27: ['Slasher', 'Supernatural', 'Psychological Horror', 'Body Horror'],
    878: ['Cyberpunk', 'Space Opera', 'Time Travel', 'Dystopian'],
    10749: ['Meet-Cute', 'Star-Crossed', 'Slow Burn Romance'],
    53: ['Political Thriller', 'Serial Killer', 'Survival', 'Conspiracy'],
    80: ['Heist', 'Mob Drama', 'Detective Noir'],
    14: ['Dark Fantasy', 'Fairy Tale', 'Sword & Sorcery'],
};

// --- Question Data Structure ---
const QUESTIONS = {
    general: [
        {
            id: 'vibe',
            text: "WHAT'S THE VIBE?",
            multiSelect: true,
            options: [
                { label: "Laughs (Comedy)", genres: [35, 10751], pathHint: 'comedy' },
                { label: "Romance & Love", genres: [10749, 18], pathHint: 'romance' },
                { label: "Action & Thrills", genres: [28, 53, 80], pathHint: 'action' },
                { label: "Mind Bending", genres: [9648, 878], pathHint: 'scifi' },
                { label: "Horror & Fear", genres: [27, 53], pathHint: 'horror' },
            ]
        },
        {
            id: 'reality',
            text: "REALITY CHECK",
            multiSelect: true,
            options: [
                { label: "Strictly Real Life", genres: [18, 36, 80] },
                { label: "Grounded Action", genres: [28, 53, 10752] },
                { label: "Pure Fantasy", genres: [14, 16] },
                { label: "Sci-Fi / Future", genres: [878] },
            ]
        },
        {
            id: 'pacing',
            text: "PACING",
            multiSelect: true,
            options: [
                { label: "Slow Burn", genres: [18, 9648, 37] },
                { label: "Non-Stop", genres: [28, 12] },
                { label: "Easy Going", genres: [35, 10749] },
                { label: "Balanced", genres: [10751, 80] },
            ]
        },
    ],
    horror: [
        {
            id: 'horror_type',
            text: "TYPE OF SCARE",
            multiSelect: true,
            options: [
                { label: "Supernatural / Ghosts", genres: [27, 14] },
                { label: "Slasher / Gore", genres: [27, 53] },
                { label: "Psychological", genres: [27, 9648] },
                { label: "Monsters & Creatures", genres: [27, 878] },
            ]
        },
        {
            id: 'horror_tone',
            text: "HOW DARK?",
            multiSelect: true,
            options: [
                { label: "Nightmare Fuel", genres: [27] },
                { label: "Creepy but Fun", genres: [27, 35] },
                { label: "Unsettling Dread", genres: [27, 9648] },
            ]
        },
    ],
    romance: [
        {
            id: 'romance_type',
            text: "LOVE STORY TYPE",
            multiSelect: true,
            options: [
                { label: "Enemies to Lovers", genres: [10749, 35] },
                { label: "Star-Crossed / Tragic", genres: [10749, 18] },
                { label: "Meet-Cute / Wholesome", genres: [10749, 10751] },
                { label: "Steamy & Passionate", genres: [10749, 18] },
            ]
        },
        {
            id: 'romance_setting',
            text: "SETTING",
            multiSelect: true,
            options: [
                { label: "Modern Day", genres: [10749, 35] },
                { label: "Period / Historical", genres: [10749, 36] },
                { label: "Fantasy / Magical", genres: [10749, 14] },
            ]
        },
    ],
    scifi: [
        {
            id: 'scifi_type',
            text: "SCI-FI FLAVOR",
            multiSelect: true,
            options: [
                { label: "Hard Sci-Fi (Realistic)", genres: [878, 18] },
                { label: "Space Opera", genres: [878, 12] },
                { label: "Cyberpunk / Dystopia", genres: [878, 53] },
                { label: "Time Travel", genres: [878, 9648] },
            ]
        },
        {
            id: 'scifi_tone',
            text: "TONE",
            multiSelect: true,
            options: [
                { label: "Hopeful / Optimistic", genres: [878, 12] },
                { label: "Dark & Gritty", genres: [878, 53] },
                { label: "Philosophical", genres: [878, 18] },
            ]
        },
    ],
    action: [
        {
            id: 'action_type',
            text: "ACTION STYLE",
            multiSelect: true,
            options: [
                { label: "Explosive Blockbuster", genres: [28, 12] },
                { label: "Martial Arts", genres: [28] },
                { label: "Heist / Caper", genres: [28, 80] },
                { label: "War / Military", genres: [28, 10752] },
            ]
        },
        {
            id: 'action_hero',
            text: "PROTAGONIST VIBE",
            multiSelect: true,
            options: [
                { label: "One-Man Army", genres: [28] },
                { label: "Ensemble Team", genres: [28, 12] },
                { label: "Underdog", genres: [28, 18] },
            ]
        },
    ],
    comedy: [
        {
            id: 'comedy_type',
            text: "COMEDY STYLE",
            multiSelect: true,
            options: [
                { label: "Slapstick / Physical", genres: [35] },
                { label: "Witty / Dialogue-Heavy", genres: [35, 18] },
                { label: "Parody / Satire", genres: [35] },
                { label: "Rom-Com", genres: [35, 10749] },
            ]
        },
        {
            id: 'comedy_rating',
            text: "HUMOR LEVEL",
            multiSelect: true,
            options: [
                { label: "Family Friendly", genres: [35, 10751] },
                { label: "Adult / R-Rated", genres: [35] },
                { label: "Dark Comedy", genres: [35, 80] },
            ]
        },
    ],
    refinement: [
        {
            id: 'era',
            text: "PICK AN ERA",
            multiSelect: true,
            options: [
                { label: "The Classics (Pre-90s)", filter: { 'primary_release_date.lte': '1989-12-31' } },
                { label: "90s Nostalgia", filter: { 'primary_release_date.gte': '1990-01-01', 'primary_release_date.lte': '1999-12-31' } },
                { label: "The 2000s", filter: { 'primary_release_date.gte': '2000-01-01', 'primary_release_date.lte': '2009-12-31' } },
                { label: "Modern Hits (2010+)", filter: { 'primary_release_date.gte': '2010-01-01' } },
            ]
        },
    ],
};

// --- Calculate Total Questions for Progress ---
const calculateTotalQuestions = (isDeeperDive = false) => {
    return isDeeperDive ? 9 : 6;
};

// --- Progress Bar Component ---
function ProgressBar({ progress, themeColor }) {
    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[100] bg-zinc-900/50 overflow-hidden">
            <div
                className="h-full transition-all duration-700 ease-in-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: themeColor }}
            />
        </div>
    );
}

// --- Modal Component ---
function Modal({ movie, onClose, themeColor }) {
    if (!movie) return null;

    const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(movie.title + ' movie')}`;
    const whereToWatchUrl = `https://www.google.com/search?q=${encodeURIComponent('where to watch ' + movie.title + ' ' + movie.release_date?.split('-')[0])}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-black border border-zinc-900 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row max-h-[95vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 bg-black/50 hover:bg-zinc-900 text-white rounded-full transition-all border border-zinc-800">
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                    <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r" />
                </div>
                <div className="w-full md:w-1/2 p-10 flex flex-col overflow-y-auto">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="text-white bg-zinc-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-zinc-800">
                            {movie.release_date?.split('-')[0]}
                        </span>
                        <span className="flex items-center gap-1.5 text-white text-sm font-bold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                            <Icons.Star className="w-4 h-4 fill-white text-white" />
                            {movie.vote_average.toFixed(1)}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 leading-none text-white">{movie.title}</h2>
                    <p className="text-zinc-400 leading-relaxed mb-10 border-l-[3px] pl-6" style={{ borderColor: themeColor }}>{movie.overview}</p>

                    <div className="flex flex-col gap-4 mt-auto">
                        <a
                            href={tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest transition-all scale-100 hover:scale-[1.02] active:scale-95 shadow-xl"
                        >
                            <Icons.ExternalLink className="w-5 h-5" />
                            Check on TikTok
                        </a>
                        <a
                            href={whereToWatchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 bg-transparent text-white border-2 border-zinc-800 hover:border-white rounded-2xl font-black uppercase tracking-widest transition-all scale-100 hover:scale-[1.02] active:scale-95"
                        >
                            <Icons.Film className="w-5 h-5" />
                            Where to Watch
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    // --- Core State ---
    const [stage, setStage] = useState('intro'); // 'intro' | 'quiz' | 'results'
    const [answerHistory, setAnswerHistory] = useState([]);
    const [currentPath, setCurrentPath] = useState('general');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [multiSelectBuffer, setMultiSelectBuffer] = useState([]);
    const [results, setResults] = useState([]);
    const [seenMovieIds, setSeenMovieIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastFetchParams, setLastFetchParams] = useState(null);
    const [hasMoreResults, setHasMoreResults] = useState(true);
    const [isDeeperDive, setIsDeeperDive] = useState(false);
    const [deepDiveQuestions, setDeepDiveQuestions] = useState([]);
    const [accumulatedFilters, setAccumulatedFilters] = useState({});
    const [isFallbackResults, setIsFallbackResults] = useState(false);

    // --- Theme Variables ---
    const themeColor = isDeeperDive ? '#FFD700' : '#FF0000'; // Yellow or Red
    const themeAccentClass = isDeeperDive ? 'text-yellow-500' : 'text-red-600';
    const themeBgAccentClass = isDeeperDive ? 'bg-yellow-500' : 'bg-red-600';
    const themeBorderAccentClass = isDeeperDive ? 'border-yellow-500' : 'border-red-600';

    // --- Computed Values ---
    const currentQuestions = useMemo(() => {
        if (isDeeperDive && deepDiveQuestions.length > 0) return deepDiveQuestions;
        return QUESTIONS[currentPath] || [];
    }, [currentPath, isDeeperDive, deepDiveQuestions]);

    const currentQuestion = currentQuestions[currentQuestionIndex];
    const totalQuestionsInPath = currentQuestions.length;

    const progressPercentage = useMemo(() => {
        const totalEstimated = calculateTotalQuestions(isDeeperDive);
        const answered = answerHistory.length;
        return (answered / totalEstimated) * 100;
    }, [answerHistory, isDeeperDive]);

    const determineBranchPath = (history) => {
        const vibeAnswer = history.find(h => h.questionId === 'vibe');
        if (!vibeAnswer || vibeAnswer.skipped) return null;
        const pathCounts = {};
        vibeAnswer.selectedOptions.forEach(opt => {
            if (opt.pathHint) pathCounts[opt.pathHint] = (pathCounts[opt.pathHint] || 0) + 1;
        });
        const sorted = Object.entries(pathCounts).sort(([, a], [, b]) => b - a);
        return sorted[0] ? sorted[0][0] : null;
    };

    const generateDeepDiveQuestions = useCallback((movieResults) => {
        const genreCounts = {};
        movieResults.forEach(movie => {
            (movie.genre_ids || []).forEach(gid => genreCounts[gid] = (genreCounts[gid] || 0) + 1);
        });
        const topGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([id]) => parseInt(id));
        const years = movieResults.map(m => parseInt(m.release_date?.split('-')[0])).filter(Boolean);
        const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length) || 2020;

        // Enhanced Deep Dive logic with specific sub-genres
        const options = [];
        topGenres.forEach(gid => {
            const subs = SUB_GENRES[gid] || [];
            subs.slice(0, 2).forEach(s => {
                options.push({ label: s, genres: [gid] });
            });
        });

        return [
            {
                id: 'deep_focus',
                text: "FOCUS YOUR SEARCH",
                multiSelect: true,
                options: [
                    { label: "Higher Ratings Only (8+)", filter: { 'vote_average.gte': '8' } },
                    { label: "Hidden Gems (Less Popular)", filter: { 'vote_count.lte': '500' } },
                    { label: "Critically Acclaimed", filter: { 'vote_count.gte': '1000', 'vote_average.gte': '7.5' } },
                    { label: "Recent Releases", filter: { 'primary_release_date.gte': `${new Date().getFullYear() - 2}-01-01` } },
                ]
            },
            {
                id: 'deep_subgenre',
                text: "REFINE THE GENRE MIX",
                multiSelect: true,
                options: options.length > 0 ? options : [
                    { label: "Add Some Drama", genres: [18] },
                    { label: "Add Some Thriller", genres: [53] },
                ]
            },
            {
                id: 'deep_era',
                text: "NARROW THE ERA",
                multiSelect: true,
                options: [
                    { label: `Before ${avgYear}`, filter: { 'primary_release_date.lte': `${avgYear}-01-01` } },
                    { label: `After ${avgYear}`, filter: { 'primary_release_date.gte': `${avgYear}-01-01` } },
                    { label: "Last 5 Years Only", filter: { 'primary_release_date.gte': `${new Date().getFullYear() - 5}-01-01` } },
                    { label: "Keep It Open", genres: [] },
                ]
            },
        ];
    }, []);

    const handleRestart = useCallback(() => {
        setStage('intro');
        setAnswerHistory([]);
        setCurrentPath('general');
        setCurrentQuestionIndex(0);
        setMultiSelectBuffer([]);
        setResults([]);
        setSeenMovieIds(new Set());
        setError('');
        setCurrentPage(1);
        setLastFetchParams(null);
        setHasMoreResults(true);
        setIsDeeperDive(false);
        setDeepDiveQuestions([]);
        setAccumulatedFilters({});
        setIsFallbackResults(false);
    }, []);

    // --- FIXED: handleMoreReccos with proper append logic ---
    const handleMoreReccos = async () => {
        if (!lastFetchParams || loadingMore) return;
        setLoadingMore(true);
        setError('');
        try {
            const nextPage = currentPage + 1;
            const { genreParam, filters } = lastFetchParams;
            let url = `${TMDB_BASE_URL}/discover/movie?with_genres=${genreParam}&sort_by=vote_average.desc&vote_count.gte=200&page=${nextPage}`;
            Object.entries({ ...accumulatedFilters, ...filters }).forEach(([key, val]) => url += `&${key}=${val}`);
            const data = await fetchFromTMDB(url);
            const newMovieIds = new Set(seenMovieIds);
            const uniqueNewResults = data.results.filter(movie => {
                if (newMovieIds.has(movie.id)) return false;
                newMovieIds.add(movie.id); return true;
            });

            // CRITICAL: Append new results to existing list
            setSeenMovieIds(newMovieIds);
            setResults(prev => [...prev, ...uniqueNewResults]);
            setCurrentPage(nextPage);
            setHasMoreResults(data.results.length >= 10);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingMore(false);
        }
    };

    // --- FIXED: handleLetsGoDeeper with force-clear and proper state reset ---
    const handleLetsGoDeeper = useCallback(() => {
        // Force-clear the movies array FIRST
        setResults([]);
        setSeenMovieIds(new Set());
        setCurrentPage(1);
        setIsFallbackResults(false);

        // Generate new questions based on previous results
        const questions = generateDeepDiveQuestions(results);
        setDeepDiveQuestions(questions);

        // Toggle theme to Yellow
        setIsDeeperDive(true);
        setCurrentPath('deepdive');
        setCurrentQuestionIndex(0);
        setMultiSelectBuffer([]);
        setStage('quiz');
    }, [results, generateDeepDiveQuestions]);

    const startQuiz = () => {
        setStage('quiz');
        setAnswerHistory([]);
        setCurrentPath('general');
        setCurrentQuestionIndex(0);
        setMultiSelectBuffer([]);
        setResults([]);
        setSeenMovieIds(new Set());
        setError('');
        setCurrentPage(1);
        setLastFetchParams(null);
        setHasMoreResults(true);
        setIsDeeperDive(false);
        setDeepDiveQuestions([]);
        setAccumulatedFilters({});
        setIsFallbackResults(false);
    };

    const handleOptionClick = (option) => {
        setMultiSelectBuffer(prev => {
            const exists = prev.find(o => o.label === option.label);
            return exists ? prev.filter(o => o.label !== option.label) : [...prev, option];
        });
    };

    const confirmMultiSelect = () => { if (multiSelectBuffer.length > 0) submitAnswer(multiSelectBuffer); };

    const submitAnswer = (selectedOptions) => {
        const newEntry = { questionId: currentQuestion.id, path: currentPath, selectedOptions, skipped: false };
        const newHistory = [...answerHistory, newEntry];
        setAnswerHistory(newHistory);
        setMultiSelectBuffer([]);
        advanceQuestion(newHistory);
    };

    // --- FIXED: handleSkip correctly advances without adding broken filters ---
    const handleSkip = () => {
        const newEntry = { questionId: currentQuestion.id, path: currentPath, selectedOptions: [], skipped: true };
        const newHistory = [...answerHistory, newEntry];
        setAnswerHistory(newHistory);
        setMultiSelectBuffer([]);
        advanceQuestion(newHistory);
    };

    const advanceQuestion = (history) => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < currentQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            if (isDeeperDive) fetchResults(history, 1, true);
            else if (currentPath === 'general') {
                const branchPath = determineBranchPath(history);
                if (branchPath && QUESTIONS[branchPath]) { setCurrentPath(branchPath); setCurrentQuestionIndex(0); }
                else { setCurrentPath('refinement'); setCurrentQuestionIndex(0); }
            } else if (currentPath === 'refinement') fetchResults(history, 1, false);
            else { setCurrentPath('refinement'); setCurrentQuestionIndex(0); }
        }
    };

    const handleBack = () => {
        if (answerHistory.length === 0) return;
        const newHistory = [...answerHistory];
        const lastEntry = newHistory.pop();
        setAnswerHistory(newHistory);
        setMultiSelectBuffer([]);
        if (lastEntry.path !== currentPath) {
            setCurrentPath(lastEntry.path);
            const pathQuestions = isDeeperDive ? deepDiveQuestions : (QUESTIONS[lastEntry.path] || []);
            const qIndex = pathQuestions.findIndex(q => q.id === lastEntry.questionId);
            setCurrentQuestionIndex(qIndex >= 0 ? qIndex : 0);
        } else setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    };

    const buildFetchParams = (history, includeAccumulated = false) => {
        const scores = {};
        let filters = includeAccumulated ? { ...accumulatedFilters } : {};
        history.forEach(entry => {
            // FIXED: Only process non-skipped entries with valid selectedOptions
            if (!entry.skipped && entry.selectedOptions && entry.selectedOptions.length > 0) {
                entry.selectedOptions.forEach(opt => {
                    if (opt.genres && opt.genres.length > 0) {
                        opt.genres.forEach(g => scores[g] = (scores[g] || 0) + 5);
                    }
                    if (opt.filter) filters = { ...filters, ...opt.filter };
                });
            }
        });
        const sortedGenres = Object.entries(scores).sort(([, a], [, b]) => b - a);
        const topGenres = sortedGenres.slice(0, 3).map(([id]) => id);
        // Use comma-separated (AND) for genre filtering
        const genreParam = topGenres.length > 0 ? topGenres.join(',') : '28';
        const hasEraFilter = Object.keys(filters).some(k => k.includes('release_date'));
        return { genreParam, filters, hasEraFilter };
    };

    // --- FIXED: fetchResults with soft fallback for zero results ---
    const fetchResults = async (history, page = 1, isDeeperDiveFetch = false) => {
        setLoading(true);
        setStage('results');
        setError('');
        setIsFallbackResults(false);

        try {
            const params = buildFetchParams(history, isDeeperDiveFetch);
            setLastFetchParams(params);
            if (isDeeperDiveFetch) setAccumulatedFilters(prev => ({ ...prev, ...params.filters }));
            const { genreParam, filters, hasEraFilter } = params;

            let baseUrl = `${TMDB_BASE_URL}/discover/movie?with_genres=${genreParam}&sort_by=vote_average.desc&vote_count.gte=200&page=${page}`;
            Object.entries(filters).forEach(([key, val]) => baseUrl += `&${key}=${val}`);

            let allResults = [];

            if (!hasEraFilter && page === 1 && !isDeeperDiveFetch) {
                const currentYear = new Date().getFullYear();
                const [recentData, olderData] = await Promise.all([
                    fetchFromTMDB(`${baseUrl}&primary_release_date.gte=${currentYear - 1}-01-01`),
                    fetchFromTMDB(`${baseUrl}&primary_release_date.lte=${currentYear - 2}-12-31`),
                ]);
                allResults = [...recentData.results.slice(0, 3), ...olderData.results.slice(0, 7).sort(() => Math.random() - 0.5)];
                setHasMoreResults(true);
            } else {
                const data = await fetchFromTMDB(baseUrl);
                allResults = data.results.slice(0, 10);
                setHasMoreResults(data.results.length >= 10);
            }

            // --- SOFT FALLBACK: If zero results, fetch trending/popular in the same genre ---
            if (allResults.length === 0) {
                console.log('Zero results from filter, fetching fallback...');
                const fallbackUrl = `${TMDB_BASE_URL}/discover/movie?with_genres=${genreParam}&sort_by=popularity.desc&vote_count.gte=50&page=1`;
                const fallbackData = await fetchFromTMDB(fallbackUrl);
                allResults = fallbackData.results.slice(0, 8);
                setIsFallbackResults(true);
                setHasMoreResults(fallbackData.results.length >= 8);
            }

            const newMovieIds = new Set(seenMovieIds);
            const uniqueResults = allResults.filter(movie => {
                if (newMovieIds.has(movie.id)) return false;
                newMovieIds.add(movie.id); return true;
            });

            setSeenMovieIds(newMovieIds);
            setResults(uniqueResults);
            setCurrentPage(page);

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFromTMDB = async (url) => {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${TMDB_TOKEN}`, 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error("TMDB Error");
        return res.json();
    };

    // --- Renderers ---
    if (stage === 'intro') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-black selection:bg-red-600 selection:text-white overflow-hidden">
                <div className="max-w-4xl w-full border-t-[10px] border-red-600 pt-16">
                    <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter mb-10 text-white uppercase leading-none">
                        Vibe<span className="text-red-600">Recco</span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-zinc-500 font-light mb-20 tracking-[0.2em] uppercase">
                        Curated Cinema. <span className="text-white font-black">No junk.</span>
                    </p>
                    <button onClick={startQuiz} className="bg-red-600 hover:bg-red-500 text-white px-20 py-8 text-4xl font-black tracking-widest uppercase rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] active:scale-95 transition-all">
                        Start Discovery
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'quiz' && currentQuestion) {
        const totalOptions = currentQuestion.options.length;
        const gridCols = totalOptions > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

        const pathLabel = isDeeperDive ? 'DEEP DIVE' : currentPath === 'general' ? 'DISCOVER' : currentPath === 'refinement' ? 'REFINE' : currentPath.toUpperCase();

        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black p-6 md:p-12 overflow-hidden text-white">
                <ProgressBar progress={progressPercentage} themeColor={themeColor} />

                <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-12 items-center justify-center relative">

                    {/* Main Content Area */}
                    <div className="flex-1 w-full flex flex-col h-full max-h-[85vh]">
                        <header className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-6 uppercase font-black tracking-widest text-xs text-zinc-500">
                            <div className="flex items-center gap-6">
                                {answerHistory.length > 0 && (
                                    <button onClick={handleBack} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800">
                                        <Icons.ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <span className={themeAccentClass}>{pathLabel}</span>
                            </div>
                            <span>{(currentQuestionIndex + 1).toString().padStart(2, '0')} — {totalQuestionsInPath.toString().padStart(2, '0')}</span>
                        </header>

                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 leading-none text-balance">
                            {currentQuestion.text}
                        </h2>

                        <div className={`grid ${gridCols} gap-4 overflow-y-auto pr-4 custom-scrollbar flex-1 max-h-[70vh]`} style={{ scrollbarWidth: 'none' }}>
                            {currentQuestion.options.map((opt, idx) => {
                                const isSelected = multiSelectBuffer.find(o => o.label === opt.label);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(opt)}
                                        className={`
                                            p-6 flex flex-col items-center justify-center min-h-[140px] transition-all duration-300 rounded-[1.5rem] relative group border-2
                                            ${isSelected ? `${themeBorderAccentClass} bg-zinc-900 shadow-xl` : 'border-zinc-900 hover:border-zinc-700 bg-zinc-900/40'}
                                        `}
                                    >
                                        <span className={`font-black uppercase tracking-tight text-xl leading-none transition-all ${isSelected ? 'scale-110' : 'group-hover:scale-105 opacity-60 group-hover:opacity-100'}`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side Navigation */}
                    <div className="flex flex-col gap-6 w-full md:w-auto md:min-w-[200px] items-center justify-center">
                        <button
                            onClick={confirmMultiSelect}
                            disabled={multiSelectBuffer.length === 0}
                            className={`
                                px-6 py-10 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 w-full border-2
                                ${multiSelectBuffer.length > 0
                                    ? `${themeBgAccentClass} border-transparent text-white shadow-2xl scale-105`
                                    : 'bg-zinc-950 border-zinc-900 text-zinc-800 opacity-40 cursor-not-allowed'}
                            `}
                        >
                            <span className="font-black uppercase tracking-widest text-xs text-center flex items-center gap-2">
                                <span>Next Question</span>
                                <Icons.ArrowRight className={`w-5 h-5 ${multiSelectBuffer.length > 0 ? 'animate-bounce-x' : ''}`} />
                            </span>
                        </button>

                        <button
                            onClick={handleSkip}
                            className="text-zinc-600 hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em]"
                        >
                            Skip / No Preference
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'results') {
        return (
            <div className="min-h-screen p-8 md:p-16 animate-fade-in bg-black pb-40">
                <ProgressBar progress={100} themeColor={themeColor} />
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-zinc-900 pb-12 gap-8">
                    <div>
                        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white leading-none">
                            Your <span className={themeAccentClass}>Selection</span>
                        </h1>
                        <p className="text-zinc-500 font-black mt-6 text-xl tracking-widest uppercase">
                            {results.length} MOVIES <span className="opacity-30 mx-4">|</span> PAGE {currentPage}
                            {isDeeperDive && <span className="text-yellow-500 ml-6">★ DEEP DIVE</span>}
                            {isFallbackResults && <span className="text-orange-500 ml-6">★ POPULAR PICKS</span>}
                        </p>
                    </div>
                    <button onClick={handleRestart} className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] hover:text-red-500 transition-all text-zinc-700 bg-zinc-950 px-8 py-4 rounded-full border border-zinc-900 scale-75 md:scale-100">
                        <Icons.RefreshCw className="w-4 h-4" />
                        Start Fresh
                    </button>
                </header>

                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-10">
                        <div className={`w-20 h-20 border-t-4 border-l-4 rounded-full animate-spin`} style={{ borderColor: themeColor }} />
                        <span className="font-black uppercase tracking-[1em] text-2xl animate-pulse text-zinc-500">Accessing...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-20">
                            {results.map(movie => (
                                <div key={movie.id} className="group cursor-pointer" onClick={() => setSelectedMovie(movie)}>
                                    <div className="relative aspect-[2/3] bg-zinc-950 overflow-hidden mb-8 border border-zinc-900 group-hover:border-white transition-all duration-700 rounded-[2rem] shadow-2xl scale-100 group-hover:scale-[1.03]">
                                        {movie.poster_path ? (
                                            <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-110" alt={movie.title} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-800"><Icons.Film className="w-16 h-16" /></div>
                                        )}
                                        <div className="absolute top-6 right-6 bg-white text-black text-xs font-black px-3 py-1.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            {movie.vote_average.toFixed(1)}
                                        </div>
                                    </div>
                                    <h3 className="font-black text-2xl leading-none uppercase tracking-tighter group-hover:text-white transition-colors line-clamp-2 text-zinc-500 px-2">
                                        {movie.title}
                                    </h3>
                                </div>
                            ))}
                        </div>

                        {/* FIXED BOTTOM NAVIGATION */}
                        <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black to-transparent z-40 pointer-events-none">
                            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch justify-center gap-6 pointer-events-auto">
                                <button onClick={handleRestart} className="bg-zinc-950 border-2 border-zinc-900 hover:border-zinc-500 text-white font-black uppercase tracking-widest py-4 px-6 rounded-3xl transition-all active:scale-95 shadow-2xl text-sm">
                                    <div className="flex items-center justify-center gap-3"><Icons.RefreshCw className="w-5 h-5" /> <span>Restart</span></div>
                                </button>

                                <button onClick={handleMoreReccos} disabled={loadingMore || !hasMoreResults} className="bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest py-6 px-10 rounded-3xl transition-all active:scale-95 shadow-2xl disabled:opacity-20 flex-1">
                                    <div className="flex items-center justify-center gap-3">
                                        {loadingMore ? <Icons.Loader2 className="w-6 h-6 animate-spin" /> : <Icons.Plus className="w-6 h-6" />}
                                        <span>More Reccos</span>
                                    </div>
                                </button>

                                <button
                                    onClick={handleLetsGoDeeper}
                                    className="bg-black text-white font-black uppercase tracking-widest py-8 px-12 rounded-3xl transition-all active:scale-95 shadow-2xl border-[8px] flex-1"
                                    style={{ borderColor: themeColor }}
                                >
                                    <div className="flex items-center justify-center gap-3"><Icons.Target className="w-8 h-8" /> <span>Deeper Dive</span></div>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {selectedMovie && <Modal movie={selectedMovie} onClose={() => setSelectedMovie(null)} themeColor={themeColor} />}
                {error && <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest z-50">{error}</div>}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
