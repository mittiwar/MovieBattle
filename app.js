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
  { name: "Welcome to the Jungle", subtitle: "Comedy · Released Jun 26", wiki: "Welcome to the Jungle (2026 film)", image_url: "https://m.media-amazon.com/images/M/MV5BMTY5ODUxNDctZGJjNC00OTk0LWIzMzAtMWQ5NTAyMGZhY2NmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg", imdb: "tt28540171" },
  { name: "Cocktail 2", subtitle: "Romance · Released Jun 19", wiki: "Cocktail 2" },
  { name: "Alpha", subtitle: "Spy thriller · Released Jul 10", wiki: "Alpha (2026 film)", image_url: "https://images.filmibeat.com/ph-big/2026/06/alpha-teaser-out-alia-bhatt-turns-into-yrf-spy-universes-fiercest-weapon-bobby-deol-reveals-mission1781095130_7.jpg", imdb: "tt28363783" },
  { name: "Main Vaapas Aaunga", subtitle: "Romantic drama · Released Jun 12", wiki: "Main Vaapas Aaunga" },
  { name: "O' Romeo", subtitle: "Romantic thriller · Released Feb 13", wiki: "O' Romeo", image_url: "https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster--dark-mode.png/0/images/masterrepository/Fandango/244329/oromeo-1080x1600-Px.jpg", imdb: "tt31969779" },
  { name: "Mardaani 3", subtitle: "Crime thriller · Released Jan 30", wiki: "Mardaani 3", imdb: "tt27673536" },
  { name: "Drishyam: The Conclusion", subtitle: "Mystery thriller · Released Oct 2", wiki: "Drishyam 3" },
  { name: "Udta Teer", subtitle: "Spy comedy · Coming Oct 23", wiki: "Udta Teer", image_url: "https://images.filmibeat.com/ph-big/2026/09/udta-teer1790233430_0.jpg", imdb: "tt31806773" },
  { name: "Prahaar – The Ujjwal Nikam Story", subtitle: "Biographical drama · Released Aug 7", wiki: "Prahaar: The Untold Story of Ujjwal Nikam", image_url: "https://m.media-amazon.com/images/M/MV5BODc2MTM1YjgtZjIyOC00ZTA2LWJmMTUtOGJiMzQwNGUzMjZkXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg", imdb: "tt28773062" },
  { name: "Nayyi Navelli", subtitle: "Hindi cinema · 2026", wiki: "Nayyi Navelli" },
  { name: "Ramayana: Rise of a Legend", subtitle: "Mythological epic · Expected Diwali", wiki: "Ramayana (2026 film)" },
  { name: "Yeh Prem Mol Liya", subtitle: "Romance · Expected Nov 27", wiki: "Yeh Prem Mol Liya" },
  { name: "Eetha", subtitle: "Drama · Expected Dec 4", wiki: "Eetha (film)" },
  { name: "Maatrubhumi", subtitle: "War drama · 2026 date TBA", wiki: "Maatrubhumi: May War Rest in Peace", image_url: "https://images.filmibeat.com/ph-big/2026/07/maatrubhumi1784537269_0.jpg", imdb: "tt27610832" },
  { name: "King", subtitle: "Action thriller · Expected Dec 24", wiki: "King (2026 film)", image_url: "https://assets.gadgets360cdn.com/pricee/assets/product/202511/King_Poster_1_1762929482.jpg", imdb: "tt28228084" },
  { name: "The Vvaan: Force of the Forrest", subtitle: "Fantasy thriller · Released Sep 25", wiki: "The Vvaan: Force of the Forrest", image_url: "https://m.media-amazon.com/images/M/MV5BYmNkYWJhZTAtYjMxNC00MjM3LWIwOGMtM2E2NGRmN2Y3OThmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg", imdb: "tt34498564" },
  { name: "Ohh My Dog", subtitle: "Family drama · Released Aug 7", wiki: "Ohh My Dog", image_url: "https://images.filmibeat.com/ph-big/2026/07/ohh-my-dog1784799711_0.jpg" },
  { name: "Toxic", subtitle: "Action thriller · Released Aug 26", wiki: "Toxic (2026 film)", image_url: "https://m.media-amazon.com/images/M/MV5BYTBiYWZkNGYtYWVkOC00NzVjLWE3ZTQtYzk3ZWM4OWRjODBiXkEyXkFqcGc%40._V1_.jpg", imdb: "tt27530512" },
].map((option, index) => ({ id: `film-${index + 1}`, ...option }))
  .filter((option) => !["Dhamaal 4", "Cocktail 2", "Mardaani 3", "Nayyi Navelli", "Yeh Prem Mol Liya", "Drishyam: The Conclusion"].includes(option.name) && !option.name.startsWith("Prahaar"))
  .concat([
    { id: "film-irumudi", name: "Irumudi", subtitle: "Action drama · Released Aug 21", wiki: "Irumudi (2026 film)" },
    { id: "film-peddi", name: "Peddi", subtitle: "Sports action drama · Released Jun 4", wiki: "Peddi (film)" },
    { id: "film-vishwanath", name: "Vishwanath & Sons", subtitle: "Family drama · Released Aug 14", wiki: "Vishwanath and Sons (film)" },
    { id: "film-dc", name: "DC", subtitle: "Tamil action drama · Lokesh Kanagaraj, Wamiqa Gabbi · Released Aug 7", wiki: "DC (2026 film)", image_url: "https://cdn.moviefone.com/image-assets/1479832/k9AwqfQ9wYtaGew8oZh6GBouvO2.jpg?d=800x1200&q=85" },
    { id: "film-bethlehem", name: "Bethlehem Kudumba Unit", subtitle: "Comedy drama · Released Aug 21", wiki: "Bethlehem Kudumba Unit" },
    { id: "film-vaazha-2", name: "Vaazha II: Biopic of a Billion Bros", subtitle: "Comedy drama · Released Apr 2", wiki: "Vaazha II: Biopic of a Billion Bros" },
    { id: "film-drishyam-3", name: "Drishyam 3", subtitle: "Mystery thriller · Released Oct 2", wiki: "Drishyam 3" },
  ]);

const actorOptions = [
  { id: "actor-srk", name: "Shah Rukh Khan", subtitle: "King", wiki: "Shah Rukh Khan" },
  { id: "actor-ranbir", name: "Ranbir Kapoor", subtitle: "Ramayana: Rise of a Legend", wiki: "Ranbir Kapoor" },
  { id: "actor-salman", name: "Salman Khan", subtitle: "Maatrubhumi", wiki: "Salman Khan" },
  { id: "actor-ranveer", name: "Ranveer Singh", subtitle: "Dhurandhar: The Revenge", wiki: "Ranveer Singh" },
  { id: "actor-yash", name: "Yash", subtitle: "Toxic", wiki: "Yash (actor)", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Yash_during_toxic_trailer_launch_event.jpg/330px-Yash_during_toxic_trailer_launch_event.jpg" },
  { id: "actor-nani", name: "Nani", subtitle: "The Paradise", wiki: "Nani (actor)", image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Nani_at_an_interview_for_film_companion_%28cropped%29.png/330px-Nani_at_an_interview_for_film_companion_%28cropped%29.png" },
  { id: "actor-sunny", name: "Sunny Deol", subtitle: "Border 2", wiki: "Sunny Deol" },
  { id: "actor-divyenndu", name: "Divyenndu", subtitle: "Mirzapur: The Movie as Munna Tripathi", wiki: "Divyenndu" },
  { id: "actor-akshay", name: "Akshay Kumar", subtitle: "Bhooth Bangla", wiki: "Akshay Kumar" },
  { id: "actor-ajay", name: "Ajay Devgn", subtitle: "Drishyam 3", wiki: "Ajay Devgn" },
  { id: "actor-emraan", name: "Emraan Hashmi", subtitle: "Awarapan 2", wiki: "Emraan Hashmi" },
  { id: "actor-shahid", name: "Shahid Kapoor", subtitle: "Cocktail 2", wiki: "Shahid Kapoor" },
  { id: "actor-ravi", name: "Ravi Teja", subtitle: "Irumudi", wiki: "Ravi Teja" },
  { id: "actor-ram", name: "Ram Charan", subtitle: "Peddi", wiki: "Ram Charan" },
  { id: "actor-suriya", name: "Suriya", subtitle: "Vishwanath & Sons", wiki: "Suriya" },
  { id: "actor-nivin", name: "Nivin Pauly", subtitle: "Bethlehem Kudumba Unit", wiki: "Nivin Pauly" },
];

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
const starterActorPoll = { ...starterPoll, category: "best-actor", question: "Best Actor of 2026", options: actorOptions };
const starterPolls = [starterPoll, starterActorPoll];

const emptyStats = (options) => Object.fromEntries(options.map((option) => [option.id, { votes: 0, percent: 0 }]));
const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value));

async function withPortraits(options) {
  return Promise.all(options.map(async (option) => {
    if (option.image_url) return { ...option, image: option.image_url };
    if (option.name === "Ohh My Dog") return { ...option, image: option.image_url || null };
    try {
      const slug = option.wiki || option.name.replaceAll(" ", "_");
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`);
      if (response.ok) return { ...option, image: (await response.json()).thumbnail?.source || null };
    } catch { /* Keep the nominee card useful when the photo service is unavailable. */ }
    return option;
  }));
}

async function previewPolls() {
  return Promise.all(starterPolls.map(async (item) => ({ ...item, options: await withPortraits(item.options) })));
}

function App() {
  const [poll, setPoll] = React.useState(starterPoll);
  const [awardPolls, setAwardPolls] = React.useState(starterPolls);
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
      const previews = await previewPolls();
      setPoll(previews[0]);
      setAwardPolls(previews);
      setStats(emptyStats(previews[0].options));
      setNotice("Connect the awards setup in Supabase to open voting. The ballots are ready to preview.");
      setLoading(false);
      return;
    }

    const { data, error } = await db.from("polls")
      .select("id, category, award_year, question, closes_at, results_at, options:poll_options(id, name, subtitle, image_url, sort_order)")
      .eq("is_active", true).not("category", "is", null).order("created_at", { ascending: true });

    if (error) {
      const previews = await previewPolls();
      setPoll(previews[0]);
      setAwardPolls(previews);
      setStats(emptyStats(previews[0].options));
      setNotice("Run the awards setup SQL in Supabase to publish this ballot and accept votes.");
      setLoading(false);
      return;
    }
    if (!data?.length) {
      const previews = await previewPolls();
      setPoll(previews[0]);
      setAwardPolls(previews);
      setStats(emptyStats(previews[0].options));
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
        <a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }} aria-label="Audience Choice Awards home"><span class="brand-mark"><${Clapperboard} size=${18}/></span><span>Audience Choice Awards</span></a>
        <button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}><${Menu} size=${20}/></button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation"><a href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}>Home</a><a class="nav-active" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>The awards</a></nav>
        <div class="account">${!user && !quickVoteUsed ? html`<button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}><${Heart} size=${15}/>${anonymousEnabled === false ? "Try again" : anonymousEnabled === null ? "Starting" : "Join to vote"}</button>` : null}</div>
      </header>
      ${notice ? html`<div class="site-notice" role="status"><span><${Film} size=${16}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Dismiss message" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

      <main class="awards-main">
        <section class="awards-heading"><div class="awards-heading-copy"><p class="section-kicker"><${Sparkles} size=${14}/> THE PEOPLE'S FILM AWARDS · 2026</p><h1>The story is not over.<br/><em>Your vote writes the ending.</em></h1>
            <p class="hero-intro">A celebration shaped by movie lovers across India. Vote for your favourite film; the people's verdict arrives on 31 December.</p>
            <div class="hero-actions">
              <a class="primary-button" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>Enter the awards <${ArrowRight} size=${16}/></a>
            </div>
            <div class="hero-meta"><span><${Clock3} size=${15}/> Final results · 31 December</span><span class="meta-divider"></span><span><${Film} size=${15}/> 25 films in contention</span></div>
          </div>
          <div class="hero-visual" aria-label="Audience Choice Awards night">
            <div class="hero-photo-wrap">
              <img class="hero-photo" src="./assets/audience-choice-awards-logo.png" alt="Audience Choice Awards 2026 logo with a golden film trophy" />
              <div class="photo-caption"><span class="caption-kicker">THE 2026 EDITION</span><strong>Audience Choice Awards</strong><span>Cinema. Chosen together.</span></div>
            </div>
            <div class="hero-stamp"><${Popcorn} size=${18}/><span>Good films.<br/><b>Great debates.</b></span></div>
            <span class="visual-number">AUDIENCE CHOICE / 2026</span>
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
          <div class="about-heading"><span class="about-mark"><${Trophy} size=${20}/></span><div><div class="eyebrow">A YEAR IN INDIAN CINEMA</div><h2>Not a jury room.<br/><em>A whole audience.</em></h2></div></div>
          <p class="about-copy">Audience Choice Awards is an annual celebration of Indian cinema, built around your voice. Pick a favourite in each award category, then come back on New Year's Eve to see who won the audience vote.</p>
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

      <footer class="footer"><a class="brand" href="#top"><span class="brand-mark"><${Clapperboard} size=${16}/></span><span>Audience Choice Awards</span></a><span class="footer-note">A love letter to the movies, and the people who make them.</span><span class="footer-year">© 2026 AUDIENCE CHOICE AWARDS</span></footer>

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
