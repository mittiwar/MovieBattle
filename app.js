import React from "https://esm.sh/react@19.1.0";
import { createRoot } from "https://esm.sh/react-dom@19.1.0/client?external=react";
import htm from "https://esm.sh/htm@3.1.1";
import {
  ArrowDown, ArrowRight, BarChart3, Check, ChevronDown, Clapperboard,
  Clock3, Film, Heart, Menu, Popcorn, Search, Sparkles, Trophy, X,
} from "https://esm.sh/lucide-react@0.468.0?external=react";

const html = htm.bind(React.createElement);
const CONFIG = window.FRAME_CONFIG || {};
const QUICK_VOTE_USED_KEY = "movieidiots.quickVoteUsed";
const db = CONFIG.url && CONFIG.anonKey && window.supabase
  ? window.supabase.createClient(CONFIG.url, CONFIG.anonKey)
  : null;

const starterOptions = [
  { name: "Dhurandhar: The Revenge", subtitle: "Spy thriller · Released Mar 19", wiki: "Dhurandhar: The Revenge", image_url: "https://static.wixstatic.com/media/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png/v1/fill/w_2500%2Ch_3228%2Cal_c/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png", imdb: "tt39139925" },
  { name: "Border 2", subtitle: "War drama · Released Jan 23", wiki: "Border 2", imdb: "tt30387012" },
  { name: "Hanuman Ansh", subtitle: "Biography · Released Aug 7", wiki: "Hanuman Ansh", imdb: "tt39390582" },
  { name: "Mirzapur: The Movie", subtitle: "Crime thriller · Released Sep 4", wiki: "Mirzapur: The Movie", image_url: "https://images.justwatch.com/poster/341957980/s718/mirzapur-the-film.jpg", imdb: "tt34339725" },
  { name: "Bhooth Bangla", subtitle: "Horror comedy · Released Apr 17", wiki: "Bhooth Bangla", image_url: "https://m.media-amazon.com/images/M/MV5BM2I0ZWM5ZDUtNzUwYy00YTVjLWIzZGQtZTU1NWFkOTZjNGY2XkEyXkFqcGc%40._V1_.jpg", imdb: "tt29540862" },
  { name: "Dhamaal 4", subtitle: "Comedy · Released Jul 10", wiki: "Dhamaal 4", image_url: "https://m.media-amazon.com/images/M/MV5BNTA1ZTIyZDYtZmQzZS00YmRkLThhMGQtNjM5Y2UwYzJhY2ZjXkEyXkFqcGc%40._V1_.jpg", imdb: "tt27548557" },
  { name: "Awarapan 2", subtitle: "Action drama · Released Aug 14", wiki: "Awarapan 2", image_url: "https://cinemaseats.net/movies/awarapan-2/poster" },
  { name: "Welcome to the Jungle", subtitle: "Comedy · Released Jun 26", wiki: "Welcome to the Jungle (2026 film)", imdb: "tt28540171" },
  { name: "Cocktail 2", subtitle: "Romance · Released Jun 19", wiki: "Cocktail 2" },
  { name: "Alpha", subtitle: "Spy thriller · Released Jul 10", wiki: "Alpha (2026 film)" },
  { name: "Main Vaapas Aaunga", subtitle: "Romantic drama · Released Jun 12", wiki: "Main Vaapas Aaunga" },
  { name: "O' Romeo", subtitle: "Romantic thriller · Released Feb 13", wiki: "O' Romeo", image_url: "https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster--dark-mode.png/0/images/masterrepository/Fandango/244329/oromeo-1080x1600-Px.jpg", imdb: "tt31969779" },
  { name: "Mardaani 3", subtitle: "Crime thriller · Released Jan 30", wiki: "Mardaani 3", imdb: "tt27673536" },
  { name: "Drishyam: The Conclusion", subtitle: "Mystery thriller · Released Oct 2", wiki: "Drishyam 3" },
  { name: "Udta Teer", subtitle: "Spy comedy · 2026", wiki: "Udta Teer" },
  { name: "Prahaar – The Ujjwal Nikam Story", subtitle: "Biographical drama · Released Aug 7", wiki: "Prahaar: The Untold Story of Ujjwal Nikam", image_url: "https://m.media-amazon.com/images/M/MV5BODc2MTM1YjgtZjIyOC00ZTA2LWJmMTUtOGJiMzQwNGUzMjZkXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg", imdb: "tt28773062" },
  { name: "Nayyi Navelli", subtitle: "Hindi cinema · 2026", wiki: "Nayyi Navelli" },
  { name: "Ramayana: Rise of a Legend", subtitle: "Mythological epic · Expected Diwali", wiki: "Ramayana (2026 film)" },
  { name: "Yeh Prem Mol Liya", subtitle: "Romance · Expected Nov 27", wiki: "Yeh Prem Mol Liya" },
  { name: "Eetha", subtitle: "Drama · Expected Dec 4", wiki: "Eetha (film)" },
  { name: "Chamunda", subtitle: "Horror · Expected Dec 4", wiki: "Chamunda (film)" },
  { name: "King", subtitle: "Action thriller · Expected Dec 24", wiki: "King (upcoming film)" },
  { name: "Shakti Shalini", subtitle: "Horror · Expected Dec 24", wiki: "Shakti Shalini" },
  { name: "Mahavatar", subtitle: "Mythological epic · Expected Dec 25", wiki: "Mahavatar (film)" },
  { name: "Chandni Bar", subtitle: "Drama · Expected Dec 3", wiki: "Chandni Bar (2026 film)" },
].map((option, index) => ({ id: `film-${index + 1}`, ...option }));

const awardCategories = [
  { id: "best-picture", name: "Best Picture", short: "Picture", icon: "01" },
  { id: "best-actor", name: "Best Actor", short: "Actor", icon: "02" },
  { id: "best-actress", name: "Best Actress", short: "Actress", icon: "03" },
  { id: "best-music", name: "Best Music", short: "Music", icon: "04" },
];

const starterPoll = {
  id: null,
  category: "best-picture",
  award_year: 2026,
  question: "Best Picture of 2026",
  closes_at: "2026-12-31T00:00:00+05:30",
  results_at: "2026-12-31T12:00:00+05:30",
  options: starterOptions,
};

const emptyStats = (options) => Object.fromEntries(options.map((option) => [option.id, { votes: 0, percent: 0 }]));
const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value));

async function withPortraits(options) {
  return Promise.all(options.map(async (option) => {
    if (option.image_url) return { ...option, image: option.image_url };
    try {
      const slug = option.wiki || option.name.replaceAll(" ", "_");
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`);
      if (response.ok) return { ...option, image: (await response.json()).thumbnail?.source || null };
    } catch { /* Keep the nominee card useful when the photo service is unavailable. */ }
    return option;
  }));
}

function App() {
  const [poll, setPoll] = React.useState(starterPoll);
  const [awardPolls, setAwardPolls] = React.useState([starterPoll]);
  const [page, setPage] = React.useState(() => window.location.hash === "#awards" ? "awards" : "home");
  const [search, setSearch] = React.useState("");
  const [stats, setStats] = React.useState(() => emptyStats(starterOptions));
  const [user, setUser] = React.useState(null);
  const [anonymousEnabled, setAnonymousEnabled] = React.useState(null);
  const [quickVoteUsed, setQuickVoteUsed] = React.useState(() => localStorage.getItem(QUICK_VOTE_USED_KEY) === "true");
  const [selected, setSelected] = React.useState(null);
  const [existingVote, setExistingVote] = React.useState(null);
  const [notice, setNotice] = React.useState("");
  const [toast, setToast] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const toastTimer = React.useRef(null);
  const selectedCategoryRef = React.useRef("best-picture");

  const totalVotes = Object.values(stats).reduce((sum, item) => sum + item.votes, 0);
  const pollOpen = new Date(poll.closes_at) > new Date();
  const resultsPublished = poll.results_at ? new Date(poll.results_at) <= new Date() : true;
  const currentCategory = awardCategories.find((item) => item.id === poll.category) || awardCategories[0];
  const leader = [...poll.options].sort((a, b) => (stats[b.id]?.votes || 0) - (stats[a.id]?.votes || 0))[0];
  const rankedOptions = [...poll.options].sort((a, b) => (stats[b.id]?.votes || 0) - (stats[a.id]?.votes || 0));
  const categoryPolls = Object.fromEntries(awardPolls.map((item) => [item.category, item]));
  const visibleOptions = poll.options.filter((option) => option.name.toLowerCase().includes(search.trim().toLowerCase()));

  React.useEffect(() => {
    const syncPage = () => setPage(window.location.hash === "#awards" ? "awards" : "home");
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  const showToast = React.useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3600);
  }, []);

  const refreshResults = React.useCallback(async (pollId, options) => {
    if (!db || !pollId) {
      setStats(emptyStats(options));
      return;
    }
    const { data, error } = await db.rpc("poll_results", { p_poll_id: pollId });
    if (error) {
      showToast("The live count could not refresh. Try again in a moment.");
      return;
    }
    setStats(Object.fromEntries((data || []).map((row) => [row.option_id, {
      votes: Number(row.vote_count), percent: Number(row.percent),
    }])));
  }, [showToast]);

  const loadPolls = React.useCallback(async () => {
    if (!db) {
      const options = await withPortraits(starterOptions);
      const preview = { ...starterPoll, options };
      setPoll(preview);
      setAwardPolls([preview]);
      setStats(emptyStats(options));
      setNotice("Connect the awards setup in Supabase to open voting. The film lineup is ready to preview.");
      setLoading(false);
      return;
    }

    const { data, error } = await db.from("polls")
      .select("id, category, award_year, question, closes_at, results_at, options:poll_options(id, name, subtitle, image_url, sort_order)")
      .eq("is_active", true).not("category", "is", null).order("created_at", { ascending: true });

    if (error) {
      const options = await withPortraits(starterOptions);
      const preview = { ...starterPoll, options };
      setPoll(preview);
      setAwardPolls([preview]);
      setStats(emptyStats(options));
      setNotice("Run the awards setup SQL in Supabase to publish this ballot and accept votes.");
      setLoading(false);
      return;
    }
    if (!data?.length) {
      const options = await withPortraits(starterOptions);
      const preview = { ...starterPoll, options };
      setPoll(preview);
      setAwardPolls([preview]);
      setStats(emptyStats(options));
      setNotice("The first ballot is ready. Publish it in Supabase to begin voting.");
      setLoading(false);
      return;
    }

    const nextPolls = await Promise.all(data.map(async (item) => {
      const ordered = (item.options || []).sort((a, b) => a.sort_order - b.sort_order);
      return { ...item, options: await withPortraits(ordered) };
    }));
    setAwardPolls(nextPolls);
    const nextPoll = nextPolls.find((item) => item.category === selectedCategoryRef.current) || nextPolls[0];
    selectedCategoryRef.current = nextPoll.category;
    setPoll(nextPoll);
    setSelected(null);
    setExistingVote(null);
    await refreshResults(nextPoll.id, nextPoll.options);
    setLoading(false);
  }, [refreshResults]);

  React.useEffect(() => {
    let mounted = true;
    loadPolls();

    if (!db) {
      setAnonymousEnabled(false);
      setNotice("Voting is not configured for this site. Check its Supabase project settings.");
      return () => { mounted = false; };
    }

    fetch(`${CONFIG.url}/auth/v1/settings`, { headers: {
      apikey: CONFIG.anonKey, Authorization: `Bearer ${CONFIG.anonKey}`,
    } })
      .then((response) => response.ok ? response.json() : null)
      .then((settings) => {
        if (mounted && settings?.external?.anonymous_users === false) {
          setNotice("Quick voting is turned off in Supabase. Enable Anonymous Sign-Ins in Authentication settings.");
        }
      })
      .catch(() => {});

    db.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        localStorage.setItem(QUICK_VOTE_USED_KEY, "true");
        setQuickVoteUsed(true);
        setUser(data.session.user);
        setAnonymousEnabled(true);
        return;
      }
      setQuickVoteUsed(localStorage.getItem(QUICK_VOTE_USED_KEY) === "true");
      setAnonymousEnabled(localStorage.getItem(QUICK_VOTE_USED_KEY) === "true" ? false : true);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setSelected(null);
      setExistingVote(null);
      window.setTimeout(() => { if (mounted) loadPolls(); }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(toastTimer.current);
    };
  }, [loadPolls]);

  React.useEffect(() => {
    if (!db || !poll.id) return undefined;
    const timer = window.setInterval(() => refreshResults(poll.id, poll.options), 15000);
    return () => window.clearInterval(timer);
  }, [poll.id, poll.options, refreshResults]);

  React.useEffect(() => {
    if (!db || !user || !poll.id) return;
    let mounted = true;
    db.from("votes").select("option_id").eq("poll_id", poll.id).maybeSingle().then(({ data, error }) => {
      if (!mounted) return;
      if (error) showToast("We couldn't check whether you have voted yet.");
      const vote = data?.option_id || null;
      setExistingVote(vote);
      if (vote) setSelected(vote);
    });
    return () => { mounted = false; };
  }, [user, poll.id, showToast]);

  const startAnonymousSession = async () => {
    if (window.location.protocol === "file:") {
      setNotice("Open this page through a web server to vote. Direct file previews cannot create a secure session.");
      return;
    }
    if (!db || anonymousEnabled === false) {
      setNotice("Quick voting is unavailable. Check Supabase Auth settings and try again.");
      return;
    }
    if (user || anonymousEnabled === null) return;
    try {
      setAnonymousEnabled(null);
      const { data: authData, error } = await db.auth.signInAnonymously();
      if (error) {
        setAnonymousEnabled(false);
        setNotice(error.message || "Quick voting is unavailable. Enable Anonymous Sign-Ins in Supabase.");
        return;
      }
      localStorage.setItem(QUICK_VOTE_USED_KEY, "true");
      setQuickVoteUsed(true);
      setUser(authData.user || authData.session?.user || null);
      setAnonymousEnabled(true);
    } catch {
      setAnonymousEnabled(false);
      setNotice("We couldn't start a quick-vote session. Check your connection and try again.");
    }
  };

  const castVote = async () => {
    if (!db || !user || !selected || !poll.id || submitting) return;
    setSubmitting(true);
    const { error } = await db.rpc("cast_vote", { p_poll_id: poll.id, p_option_id: selected });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        setExistingVote(selected);
        setNotice("Your account already has a vote in this poll. Thanks for joining the conversation!");
      } else showToast(error.message || "Your vote could not be submitted.");
      return;
    }
    setExistingVote(selected);
    setNotice("Your pick is counted. Thanks for adding your voice to the movie conversation!");
    await refreshResults(poll.id, poll.options);
  };

  const createPoll = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const options = String(form.get("options")).split("\n")
      .map((line) => line.split("|").map((part) => part.trim()))
      .filter(([name]) => name)
      .map(([name, image_url, subtitle], sort_order) => ({ name, image_url: image_url || null, subtitle: subtitle || null, sort_order }));
    const closesAt = new Date(form.get("closes_at"));
    const latestClose = new Date();
    latestClose.setMonth(latestClose.getMonth() + 3);
    if (options.length < 2) { showToast("Add at least two nominees."); return; }
    if (!Number.isFinite(+closesAt) || closesAt <= new Date() || closesAt > latestClose) {
      showToast("Choose a closing date within the next three months.");
      return;
    }
    const { error } = await db.rpc("create_award_poll", {
      p_category: form.get("category"), p_award_year: 2026,
      p_question: form.get("question"), p_closes_at: closesAt.toISOString(),
      p_results_at: "2026-12-31T12:00:00+05:30", p_options: options,
    });
    if (error) { showToast(error.message); return; }
    selectedCategoryRef.current = form.get("category");
    setAdminOpen(false);
    await loadPolls();
    setNotice("Your new poll is live. Let the debate begin!");
  };

  const navigateTo = (destination) => {
    window.location.hash = destination;
    setPage(destination === "awards" ? "awards" : "home");
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (category) => {
    const nextPoll = categoryPolls[category];
    if (!nextPoll) {
      showToast("That category is opening soon.");
      return;
    }
    selectedCategoryRef.current = category;
    setPoll(nextPoll);
    setSelected(null);
    setExistingVote(null);
    setSearch("");
    refreshResults(nextPoll.id, nextPoll.options);
  };

  if (page === "awards") return html`
    <div class="site-shell awards-shell">
      <header class="topbar">
        <a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }} aria-label="Movieidiots home"><span class="brand-mark"><${Clapperboard} size=${18}/></span><span>movieidiots<span class="brand-dot">.</span></span></a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}><${Menu} size=${20}/></button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation"><a href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}>Home</a><a class="nav-active" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>The awards</a></nav>
        <div class="account">${user ? html`<span class="user-chip"><span class="avatar-fallback"><${Heart} size=${14}/></span><span class="user-name">Movie fan</span></span>` : quickVoteUsed ? html`<span class="user-name">Movie fan</span>` : html`<button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}><${Heart} size=${15}/>${anonymousEnabled === false ? "Try again" : anonymousEnabled === null ? "Starting" : "Join to vote"}</button>`}</div>
      </header>
      ${notice ? html`<div class="site-notice" role="status"><span><${Film} size=${16}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Dismiss message" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

      <main class="awards-main">
        <section class="awards-heading"><div class="awards-heading-copy"><p class="section-kicker"><${Sparkles} size=${14}/> THE PEOPLE'S BOLLYWOOD AWARDS · 2026</p><h1>Make your<br/><em>movie picks.</em></h1><p>One ballot in every category. The final winners are revealed on 31 December.</p></div><div class="awards-seal"><${Trophy} size=${25}/><b>THE<br/>AUDIENCE<br/>AWARDS</b><span>EST. 2026</span></div><div class="awards-count"><b>${String(awardPolls.length).padStart(2, "0")}</b><span>BALLOTS<br/>LIVE</span></div></section>

        <section class="award-workspace">
          <div class="category-rail" role="tablist" aria-label="Award categories">${awardCategories.map((category) => { const open = Boolean(categoryPolls[category.id]); return html`<button class=${`category-tab ${poll.category === category.id ? "category-tab-active" : ""} ${open ? "" : "category-tab-soon"}`} type="button" role="tab" aria-selected=${poll.category === category.id} onClick=${() => selectCategory(category.id)}><span class="category-tab-number">${category.icon}</span><span>${category.name}</span><small>${open ? "VOTING OPEN" : "SOON"}</small></button>`; })}</div>

          <div class="ballot-header"><div><p class="section-kicker">CATEGORY ${currentCategory.icon} <i></i> ${currentCategory.name.toUpperCase()}</p><h2>${poll.question}</h2><p class="ballot-description">${poll.category === "best-picture" ? "Which Hindi film owned your imagination this year? The shortlist includes films already released and titles still on the way; release plans can change." : "Choose one nominee for the audience award."}</p></div><div class="deadline-stamp"><${Clock3} size=${17}/><span><small>BALLOT CLOSES</small><b>${dateLabel(poll.closes_at)}</b></span></div></div>
          <div class="ballot-toolbar"><span>${poll.options.length} FILMS <i></i> ${selected ? "1 PICK SELECTED" : "CHOOSE ONE"}</span><label class="film-search"><${Search} size=${16}/><input type="search" value=${search} onInput=${(event) => setSearch(event.currentTarget.value)} placeholder="Find a film" aria-label="Search films"/></label></div>
          <div class="film-grid" role="radiogroup" aria-label=${`Choose ${currentCategory.name} of ${poll.award_year || 2026}`}>
            ${loading ? html`<div class="loading-state"><span class="spinner"></span>Rolling out the red carpet...</div>` : poll.options.filter((option) => option.name.toLowerCase().includes(search.trim().toLowerCase())).map((option) => { const subtitle = option.subtitle || "Hindi cinema"; const isSelected = selected === option.id; const locked = Boolean(existingVote) || !pollOpen; const upcoming = subtitle.includes("Expected") || subtitle.includes("Coming soon"); return html`<button class=${`film-card ${isSelected ? "film-selected" : ""}`} type="button" role="radio" aria-checked=${isSelected} aria-label=${`${option.name}, ${subtitle}`} disabled=${locked} onClick=${() => setSelected(option.id)}><span class="film-poster-wrap">${option.image ? html`<img class="film-poster" src=${option.image} alt=${`${option.name} poster`} loading="lazy"/>` : html`<span class="film-poster-fallback"><${Film} size=${28}/><b>${option.name}</b><small>2026 · HINDI CINEMA</small></span>`}<span class="film-rank">${String(poll.options.indexOf(option) + 1).padStart(2, "0")}</span><span class=${`film-release ${upcoming ? "film-upcoming" : ""}`}>${upcoming ? "UPCOMING" : "RELEASED"}</span><span class="film-select"><${Check} size=${17}/></span><span class="film-poster-scrim"></span></span><span class="film-details"><b>${option.name}</b><small>${subtitle.split(" · ")[0]}</small></span></button>`; })}
            ${!loading && !poll.options.some((option) => option.name.toLowerCase().includes(search.trim().toLowerCase())) ? html`<div class="empty-search">No films match “${search}”.</div>` : null}
          </div>
          <div class="ballot-footer"><div class="ballot-note"><span class="ballot-note-icon"><${Check} size=${17}/></span><span><b>${existingVote ? "Your ballot is locked." : selected ? `Your pick: ${poll.options.find((item) => item.id === selected)?.name}` : "One film. One final pick."}</b><small>${existingVote ? "Thanks for being part of the audience." : "Your vote is saved to this browser and cannot be changed."}</small></span></div><button class="cast-button" type="button" disabled=${!selected || Boolean(existingVote) || !user || !pollOpen || submitting || !poll.id} onClick=${castVote}>${submitting ? "Saving your pick" : existingVote ? "Ballot submitted" : !pollOpen ? "Ballot closed" : "Submit my vote"}<${ArrowRight} size=${17}/></button></div>
          ${!user && !quickVoteUsed ? html`<p class="signin-prompt">Join once in this browser, then vote in every open award category.</p>` : null}
        </section>

        <section class=${`final-results ${resultsPublished ? "results-open" : ""}`}><div class="results-copy"><p class="section-kicker"><${Trophy} size=${14}/> THE ENVELOPE</p><h2>${resultsPublished ? "The audience has decided." : "The winner is sealed."}</h2><p>${resultsPublished ? "The final audience result is in." : "The final result will be revealed on 31 December. Until then, the votes stay under wraps."}</p></div>${resultsPublished ? html`<div class="final-leaderboard">${rankedOptions.map((option, index) => { const stat = stats[option.id] || { votes: 0, percent: 0 }; return html`<div class=${`final-result-row ${index === 0 && totalVotes ? "final-winner" : ""}`}><span class="final-rank">${String(index + 1).padStart(2, "0")}</span><b>${option.name}</b><span class="final-track"><i style=${{ width: `${stat.percent}%` }}></i></span><span class="final-percent">${stat.percent}%</span></div>`; })}</div>` : html`<div class="sealed-envelope"><span class="envelope-date">31<br/><small>DEC</small></span><span class="envelope-rule"></span><span class="envelope-caption">FINAL RESULTS<br/>2026</span></div>`}</section>
      </main>
      <footer class="site-footer"><a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}><span class="brand-mark"><${Clapperboard} size=${16}/></span><span>movieidiots<span class="brand-dot">.</span></span></a><span>Made for the love of Hindi cinema.</span><span>THE PEOPLE'S AWARDS · 2026</span></footer>
      ${user?.app_metadata?.role === "admin" ? html`<button class="admin-trigger" type="button" onClick=${() => setAdminOpen(true)}><${Sparkles} size=${15}/> Add category poll</button>` : null}
      ${adminOpen ? html`<div class="modal-backdrop" role="presentation" onClick=${(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}><section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title"><button class="modal-close" type="button" aria-label="Close" onClick=${() => setAdminOpen(false)}><${X} size=${19}/></button><div class="eyebrow">AWARDS CONTROL</div><h2 id="admin-title">Open another category</h2><form onSubmit=${createPoll}><label>Category<select name="category" required>${awardCategories.filter((item) => !categoryPolls[item.id]).map((item) => html`<option value=${item.id}>${item.name}</option>`)}</select></label><label>Poll question<input name="question" required minLength="8" maxLength="140" placeholder="Best Actor of 2026"/></label><label>Voting closes<input name="closes_at" type="datetime-local" required value="2026-12-31T00:00"/></label><label>Nominees <small>One per line: name | poster URL | short description</small><textarea name="options" required rows="6" placeholder="Performer or film | https://image.jpg | Short note"></textarea></label><button class="vote-button modal-submit" type="submit">Open category <${ArrowRight} size=${16}/></button></form></section></div>` : null}
      ${toast ? html`<div class="toast" role="status"><${Film} size=${16}/>${toast}</div>` : null}
    </div>
  `;

  return html`
    <div class="site-shell home-shell">
      <header class="topbar">
        <a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }} aria-label="movieidiots home"><span class="brand-mark"><${Clapperboard} size=${18}/></span><span>movieidiots<span class="brand-dot">.</span></span></a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}>
          <${Menu} size=${20}/>
        </button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          <a class="nav-active" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}>Home</a>
          <a href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>The awards</a>
        </nav>
        <div class="account">
          ${user ? html`
            <div class="user-chip">
              <span class="avatar-fallback"><${Heart} size=${14}/></span>
              <span class="user-name">Movie fan</span>
            </div>
          ` : quickVoteUsed ? html`
            <span class="user-name">Quick vote already used</span>
          ` : html`
            <button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}>
              <${Heart} size=${15}/>${anonymousEnabled === false ? "Try quick vote again" : anonymousEnabled === null ? "Starting quick vote" : "Quick vote sign-in"}
            </button>
          `}
        </div>
      </header>

      ${notice ? html`<div class="site-notice" role="status"><span><${Film} size=${16}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Dismiss message" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

      <main id="top">
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow"><span class="eyebrow-icon"><${Sparkles} size=${14}/></span> THE PEOPLE'S BOLLYWOOD AWARDS · 2026</div>
            <h1>Every film has a fan.<br/><em>Every fan has a say.</em></h1>
            <p class="hero-intro">A year of Hindi cinema, celebrated by the people who watched, cheered and argued about it. Cast your picks now. The winners are revealed on 31 December.</p>
            <div class="hero-actions">
              <a class="primary-button" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>Enter the awards <${ArrowRight} size=${16}/></a>
            </div>
            <div class="hero-meta"><span><${Clock3} size=${15}/> Final results · 31 December</span><span class="meta-divider"></span><span><${Film} size=${15}/> 25 films in contention</span></div>
          </div>
          <div class="hero-visual" aria-label=${leader ? `Featured nominee: ${leader.name}` : "Movie fan poll"}>
            <div class="hero-photo-wrap">
              ${leader?.image ? html`<img class="hero-photo" src=${leader.image} alt=${leader.name} />` : html`<div class="hero-photo-placeholder"><${Film} size=${58}/></div>`}
              <div class="photo-caption"><span class="caption-kicker">THE 2026 EDITION</span><strong>${leader?.name || "Bollywood"}</strong><span>Hindi cinema. Chosen together.</span></div>
            </div>
            <div class="hero-stamp"><${Popcorn} size=${18}/><span>Good films.<br/><b>Great debates.</b></span></div>
            <span class="visual-number">MOVIEIDIOTS / 001</span>
          </div>
          <div class="hero-bottom"><span>THE PEOPLE'S AWARDS</span><span>01 <i></i> 04 CATEGORIES</span></div>
        </section>

        <section class="poll-section" id="poll">
          <div class="section-heading">
            <div><div class="eyebrow"><span class="eyebrow-icon"><${Sparkles} size=${14}/></span> THE BIG SCREEN DEBATE</div>
              <h2>${poll.question}</h2>
              <p>Choose the one who made you fall in love with the movies.</p>
            </div>
            <div class="one-vote"><span class="one-vote-icon"><${Check} size=${17}/></span><span><b>One fan, one vote</b><small>Your pick is final</small></span></div>
          </div>

          ${notice ? html`<div class="notice" role="status"><span><${Film} size=${17}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Dismiss message" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

          <div class="nominee-toolbar"><span class="nominee-count">${poll.options.length} SCREEN LEGENDS</span><span class="select-hint">${existingVote ? "Your choice is highlighted" : selected ? "Ready when you are" : "Tap a portrait to choose"} <${ChevronDown} size=${14}/></span></div>
          <div class="candidate-grid" role="radiogroup" aria-label="Choose your Indian cinema icon">
            ${loading ? html`<div class="loading-state"><span class="spinner"></span>Finding the stars...</div>` : poll.options.map((option, index) => {
              const stat = stats[option.id] || { votes: 0, percent: 0 };
              const isSelected = selected === option.id;
              const isLocked = Boolean(existingVote);
              return html`<button class=${`candidate ${isSelected ? "candidate-selected" : ""} ${isLocked ? "candidate-locked" : ""}`} type="button" role="radio" aria-checked=${isSelected} aria-label=${`${option.name}, ${option.subtitle || "Indian cinema icon"}`} disabled=${isLocked || !pollOpen} onClick=${() => setSelected(option.id)}>
                <span class="candidate-image-wrap">
                  ${option.image ? html`<img class="candidate-image" src=${option.image} alt=${option.name} loading="lazy"/>` : html`<span class="candidate-image-fallback"><${Film} size=${31}/></span>`}
                  <span class="candidate-index">0${index + 1}</span>
                  <span class="candidate-check"><${Check} size=${16}/></span>
                  <span class="image-scrim"></span>
                </span>
                <span class="candidate-info"><span class="candidate-name">${option.name}</span><span class="candidate-subtitle">${option.subtitle || "Indian cinema icon"}</span>
                  ${existingVote ? html`<span class="candidate-stat"><span class="stat-track"><i style=${{ width: `${stat.percent}%` }}></i></span><span>${stat.votes.toLocaleString()} votes <b>${stat.percent}%</b></span></span>` : null}
                </span>
              </button>`;
            })}
          </div>

          <div class="vote-panel">
            <div class="vote-panel-copy"><span class="vote-panel-icon"><${Trophy} size=${18}/></span><span><b>${existingVote ? "Your vote is in the picture." : selected ? `You're backing ${poll.options.find((item) => item.id === selected)?.name}.` : "The next scene is yours."}</b><small>${existingVote ? "Thanks for joining the movie conversation." : "Pick your legend and add your voice to the fan poll."}</small></span></div>
            <button class="vote-button" type="button" disabled=${!selected || Boolean(existingVote) || !user || !pollOpen || submitting || !poll.id} onClick=${castVote}>
              ${submitting ? "Counting it..." : existingVote ? "Vote counted" : !pollOpen ? "Poll closed" : "Cast my vote"} <${ArrowRight} size=${17}/>
            </button>
          </div>
          ${!user && anonymousEnabled ? html`<p class="signin-prompt">No email or password needed. Your browser session keeps one vote per poll on this device.</p>` : null}
        </section>

        <section class="results-section" id="results">
          <div class="results-topline"><div><div class="eyebrow"><span class="eyebrow-icon"><${BarChart3} size=${14}/></span> THE AUDIENCE HAS THE FLOOR</div><h2>Fan picks, <em>so far.</em></h2></div><div class="live-count"><span class="live-dot"></span><span><b>${totalVotes.toLocaleString()}</b><small>votes counted</small></span></div></div>
          <div class="results-layout">
            <div class="leaderboard">
              ${rankedOptions.map((option, index) => {
                const stat = stats[option.id] || { votes: 0, percent: 0 };
                return html`<div class=${`result-row ${index === 0 && totalVotes ? "result-leading" : ""}`}>
                  <span class="result-rank">${String(index + 1).padStart(2, "0")}</span>
                  <span class="result-person">${option.image ? html`<img src=${option.image} alt="" loading="lazy"/>` : html`<span class="result-avatar"><${Film} size=${14}/></span>`}<b>${option.name}</b></span>
                  <span class="result-track"><i style=${{ width: `${stat.percent}%` }}></i></span>
                  <span class="result-percent">${stat.percent}%</span>
                  <span class="result-votes">${stat.votes.toLocaleString()}<small>votes</small></span>
                </div>`;
              })}
            </div>
            <aside class="results-note"><span class="note-icon"><${Clapperboard} size=${21}/></span><p class="note-label">THE PLOT SO FAR</p><h3>${totalVotes ? `${totalVotes.toLocaleString()} fans. One big-screen question.` : "Every great movie starts with an audience."}</h3><p>Live fan picks refresh as the conversation grows. Come back after the next scene.</p><span class="refresh-label"><span class="live-dot"></span> LIVE COMMUNITY COUNT</span></aside>
          </div>
        </section>

        <section class="about-section" id="about">
          <div class="about-heading"><span class="about-mark"><${Trophy} size=${20}/></span><div><div class="eyebrow">A YEAR IN HINDI CINEMA</div><h2>Not a jury room.<br/><em>A whole audience.</em></h2></div></div>
          <p class="about-copy">Movieidiots is an annual celebration of Bollywood, built around your voice. Pick a favourite in each award category, then come back on New Year's Eve to see who won the audience vote.</p>
          <button type="button" class="about-link" onClick=${() => navigateTo("awards")}>Explore the categories <${ArrowRight} size=${16}/></button>
          <div class="about-film"><span><${Film} size=${16}/></span><span>01 CATEGORY OPEN</span><i></i><span>WINNERS REVEALED · 31 DECEMBER</span><span><${Heart} size=${15}/></span></div>
        </section>

        <section class="category-preview">
          <div class="preview-heading"><div><span class="eyebrow">THE 2026 SHORTLIST</span><h2>Four ways to celebrate.</h2></div><button type="button" class="text-link" onClick=${() => navigateTo("awards")}>View awards <${ArrowRight} size=${16}/></button></div>
          <div class="preview-grid">
            ${awardCategories.map((category) => { const open = Boolean(categoryPolls[category.id]); return html`<button class=${`preview-category ${open ? "preview-open" : ""}`} type="button" onClick=${() => { navigateTo("awards"); if (open) selectCategory(category.id); }}><span class="preview-number">${category.icon}</span><span class="preview-name">${category.name}</span><span class="preview-status">${open ? "VOTING OPEN" : "OPENING SOON"} <${ArrowRight} size=${14}/></span></button>`; })}
          </div>
        </section>
      </main>

      <footer class="footer"><a class="brand" href="#top"><span class="brand-mark"><${Clapperboard} size=${16}/></span><span>movieidiots<span class="brand-dot">.</span></span></a><span class="footer-note">A love letter to the movies, and the people who make them.</span><span class="footer-year">© 2026 MOVIEIDIOTS FAN POLL</span></footer>

      ${user?.app_metadata?.role === "admin" ? html`<button class="admin-trigger" type="button" onClick=${() => setAdminOpen(true)}><${Sparkles} size=${15}/> New poll</button>` : null}

      ${adminOpen ? html`<div class="modal-backdrop" role="presentation" onClick=${(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}>
        <section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <button class="modal-close" type="button" aria-label="Close" onClick=${() => setAdminOpen(false)}><${X} size=${19}/></button>
          <div class="eyebrow">POLL CONTROL</div><h2 id="admin-title">Start a new debate</h2>
          <form onSubmit=${createPoll}>
            <label>Poll question<input name="question" required minLength="8" maxLength="140" placeholder="Which film deserves the rewatch?"/></label>
            <label>Voting closes<input name="closes_at" required type="datetime-local"/></label>
            <label>Nominees <small>One per line: name | image URL | short description</small><textarea name="options" required rows="5" placeholder="Film or actor | https://image.jpg | Why fans love them"></textarea></label>
            <button class="vote-button modal-submit" type="submit">Publish poll <${ArrowRight} size=${16}/></button>
          </form>
        </section>
      </div>` : null}

      ${toast ? html`<div class="toast" role="status"><${Film} size=${16}/>${toast}</div>` : null}
    </div>
  `;
}

createRoot(document.getElementById("root")).render(React.createElement(App));
