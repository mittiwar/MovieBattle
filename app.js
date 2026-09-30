import React from "https://esm.sh/react@19.1.0";
import { createRoot } from "https://esm.sh/react-dom@19.1.0/client?external=react";
import htm from "https://esm.sh/htm@3.1.1";
import {
  ArrowDown, ArrowRight, BarChart3, Check, ChevronDown, Clapperboard,
  Clock3, Film, Heart, LogOut, Menu, Popcorn, Sparkles, Trophy, X,
} from "https://esm.sh/lucide-react@0.468.0?external=react";

const html = htm.bind(React.createElement);
const CONFIG = window.FRAME_CONFIG || {};
const db = CONFIG.url && CONFIG.anonKey && window.supabase
  ? window.supabase.createClient(CONFIG.url, CONFIG.anonKey)
  : null;

const starterOptions = [
  { id: "srk", name: "Shah Rukh Khan", subtitle: "The King of Romance", wiki: "Shah_Rukh_Khan" },
  { id: "salman", name: "Salman Khan", subtitle: "The Bhaijaan of Bollywood", wiki: "Salman_Khan" },
  { id: "amitabh", name: "Amitabh Bachchan", subtitle: "The Shahenshah of Indian cinema", wiki: "Amitabh_Bachchan" },
  { id: "rajinikanth", name: "Rajinikanth", subtitle: "The one and only Superstar", wiki: "Rajinikanth" },
  { id: "aamir", name: "Aamir Khan", subtitle: "The perfectionist", wiki: "Aamir_Khan" },
  { id: "hrithik", name: "Hrithik Roshan", subtitle: "Bollywood's Greek God", wiki: "Hrithik_Roshan" },
];

const starterPoll = {
  id: null,
  question: "Who is your all-time Indian cinema icon?",
  closes_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  options: starterOptions,
};

const emptyStats = (options) => Object.fromEntries(options.map((option) => [option.id, { votes: 0, percent: 0 }]));
const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

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
  const [stats, setStats] = React.useState(() => emptyStats(starterOptions));
  const [user, setUser] = React.useState(null);
  const [anonymousEnabled, setAnonymousEnabled] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [existingVote, setExistingVote] = React.useState(null);
  const [notice, setNotice] = React.useState("");
  const [toast, setToast] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const toastTimer = React.useRef(null);

  const totalVotes = Object.values(stats).reduce((sum, item) => sum + item.votes, 0);
  const pollOpen = new Date(poll.closes_at) > new Date();
  const leader = [...poll.options].sort((a, b) => (stats[b.id]?.votes || 0) - (stats[a.id]?.votes || 0))[0];
  const rankedOptions = [...poll.options].sort((a, b) => (stats[b.id]?.votes || 0) - (stats[a.id]?.votes || 0));

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

  const loadPoll = React.useCallback(async () => {
    if (!db) {
      const options = await withPortraits(starterOptions);
      setPoll({ ...starterPoll, options });
      setStats(emptyStats(options));
      setNotice("Preview mode is on. Connect Supabase anonymous sign-in to vote.");
      setLoading(false);
      return;
    }

    const { data, error } = await db.from("polls")
      .select("id, question, closes_at, options:poll_options(id, name, subtitle, image_url, sort_order)")
      .eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (error) {
      setNotice("We couldn't load the poll. Check the Supabase connection and database setup.");
      setLoading(false);
      return;
    }
    if (!data) {
      setNotice("There isn't an active poll right now. Check back soon for the next movie debate.");
      setLoading(false);
      return;
    }

    const ordered = (data.options || []).sort((a, b) => a.sort_order - b.sort_order);
    const options = await withPortraits(ordered);
    const nextPoll = { ...data, options };
    setPoll(nextPoll);
    setSelected(null);
    setExistingVote(null);
    await refreshResults(data.id, options);
    setLoading(false);
  }, [refreshResults]);

  React.useEffect(() => {
    let mounted = true;
    loadPoll();

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
        setUser(data.session.user);
        setAnonymousEnabled(true);
        return;
      }
      try {
        const { data: authData, error } = await db.auth.signInAnonymously();
        if (!mounted) return;
        if (error) {
          setAnonymousEnabled(false);
          setNotice(error.message || "Quick voting could not start. Check Supabase Auth settings and try again.");
          return;
        }
        setUser(authData.user || authData.session?.user || null);
        setAnonymousEnabled(true);
      } catch {
        if (mounted) {
          setAnonymousEnabled(false);
          setNotice("We couldn't start a quick-vote session. Check your connection and try again.");
        }
      }
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setSelected(null);
      setExistingVote(null);
      window.setTimeout(() => { if (mounted) loadPoll(); }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearTimeout(toastTimer.current);
    };
  }, [loadPoll]);

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
    const { error } = await db.rpc("create_poll", {
      p_question: form.get("question"), p_closes_at: closesAt.toISOString(), p_options: options,
    });
    if (error) { showToast(error.message); return; }
    setAdminOpen(false);
    await loadPoll();
    setNotice("Your new poll is live. Let the debate begin!");
  };

  return html`
    <div class="site-shell">
      <header class="topbar">
        <a class="brand" href="#top" aria-label="movieidiots home"><span class="brand-mark"><${Clapperboard} size=${18} strokeWidth=${2.2}/></span><span>movieidiots<span class="brand-dot">.</span></span></a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}>
          <${Menu} size=${20}/>
        </button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          <a href="#poll" onClick=${() => setMobileMenuOpen(false)}>The poll</a>
          <a href="#results" onClick=${() => setMobileMenuOpen(false)}>Fan picks</a>
          <a href="#about" onClick=${() => setMobileMenuOpen(false)}>Our corner</a>
        </nav>
        <div class="account">
          ${user ? html`
            <div class="user-chip">
              <span class="avatar-fallback"><${Heart} size=${14}/></span>
              <span class="user-name">Movie fan</span>
              <button class="icon-button" type="button" title="Sign out" aria-label="Sign out" onClick=${() => db.auth.signOut()}><${LogOut} size=${16}/></button>
            </div>
          ` : html`
            <button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}>
              <${Heart} size=${15}/>${anonymousEnabled === false ? "Try quick vote again" : anonymousEnabled === null ? "Starting quick vote" : "Quick vote sign-in"}
            </button>
          `}
        </div>
      </header>

      <main id="top">
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow"><span class="eyebrow-icon"><${Film} size=${14}/></span> A FAN POLL FOR THE LOVE OF CINEMA</div>
            <h1>The movies we love.<br/><em>The stars we keep.</em></h1>
            <p class="hero-intro">The performances we quote. The stars we grew up with. Pick the Indian cinema legend who always gets your ticket.</p>
            <div class="hero-actions">
              <a class="primary-button" href="#poll">Make your pick <${ArrowDown} size=${16}/></a>
              <a class="text-link" href="#results">See the fan count <${ArrowRight} size=${15}/></a>
            </div>
            <div class="hero-meta"><span><${Clock3} size=${15}/> Closes ${dateLabel(poll.closes_at)}</span><span class="meta-divider"></span><span><${Heart} size=${15}/> ${totalVotes.toLocaleString()} fans have voted</span></div>
          </div>
          <div class="hero-visual" aria-label=${leader ? `Featured nominee: ${leader.name}` : "Movie fan poll"}>
            <div class="hero-photo-wrap">
              ${leader?.image ? html`<img class="hero-photo" src=${leader.image} alt=${leader.name} />` : html`<div class="hero-photo-placeholder"><${Film} size=${58}/></div>`}
              <div class="photo-caption"><span class="caption-kicker">IN THE CURRENT POLL</span><strong>${leader?.name || "The legends"}</strong><span>${leader?.subtitle || "Indian cinema, through fan eyes"}</span></div>
            </div>
            <div class="hero-stamp"><${Popcorn} size=${18}/><span>Good films.<br/><b>Great debates.</b></span></div>
            <span class="visual-number">MOVIEIDIOTS / 001</span>
          </div>
          <div class="hero-bottom"><span>MADE FOR MOVIE PEOPLE</span><span>01 <i></i> 06 NOMINEES</span></div>
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
          <div class="about-heading"><span class="about-mark"><${Clapperboard} size=${20}/></span><div><div class="eyebrow">A LITTLE CORNER OF THE CINEMA</div><h2>Movies are better <em>together.</em></h2></div></div>
          <p class="about-copy">movieidiots is a place for the arguments that start after the credits: favourite performances, unforgettable scenes, and the stars who made us feel something. Pull up a seat.</p>
          <a href="#poll" class="about-link">Join this week's conversation <${ArrowRight} size=${16}/></a>
          <div class="about-film"><span><${Film} size=${16}/></span><span>FANS FIRST</span><i></i><span>ALWAYS IN GOOD COMPANY</span><span><${Heart} size=${15}/></span></div>
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
