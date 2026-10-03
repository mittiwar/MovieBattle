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
  { id: "best-picture", name: "Behtareen Film", short: "Film", icon: "01" },
  { id: "best-actor", name: "Behtareen Abhineta", short: "Abhineta", icon: "02" },
  { id: "best-actress", name: "Behtareen Abhinetri", short: "Abhinetri", icon: "03" },
  { id: "best-music", name: "Behtareen Sangeet", short: "Sangeet", icon: "04" },
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
const dateLabel = (value) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  const months = ["Janavari", "Farvari", "March", "April", "May", "June", "July", "Agast", "Sitambar", "Aktubar", "Navambar", "Disambar"];
  return `${parts.day} ${months[Number(parts.month) - 1]} ${parts.year}`;
};

function nomineeDetail(subtitle, category) {
  if (category === "best-actor") return subtitle.replace(" as ", " mein ");
  const genreNames = {
    "Action drama": "Maar-dhaad kahani",
    "Action thriller": "Maar-dhaad aur romanch",
    Biography: "Jeevani",
    "Biographical drama": "Jeevani par aadharit kahani",
    "Comedy drama": "Hasya kahani",
    Comedy: "Hasya",
    "Crime thriller": "Apradh aur romanch",
    Drama: "Kahani",
    "Family drama": "Parivaarik kahani",
    "Historical drama": "Aitihasik kahani",
    "Fantasy comedy": "Kalpanik hasya",
    "Fantasy thriller": "Kalpanik romanch",
    "Horror comedy": "Darawana hasya",
    "Mythological epic": "Pauraanik mahaakaavya",
    "Mystery thriller": "Rahasyamay romanch",
    "Romantic drama": "Prem kahani",
    "Romantic thriller": "Prem aur romanch",
    "Romance": "Prem kahani",
    "Spy comedy": "Jasoosi hasya",
    "Spy thriller": "Jasoosi romanch",
    "Sports action drama": "Khel aur maar-dhaad kahani",
    "Survival thriller": "Bachne ki jung aur romanch",
    "Tamil action drama": "Tamil action kahani",
    "War drama": "Yuddh kahani",
  };
  return subtitle.split(" · ").map((part, index) => {
    if (index === 0) return genreNames[part] || part;
    if (part.startsWith("Released ")) return `Parde par: ${part.slice(9)}`;
    if (part.startsWith("Coming ")) return `Aa rahi hai: ${part.slice(7)}`;
    if (part.startsWith("Expected ")) return `Aane ki ummeed: ${part.slice(9)}`;
    if (part === "Release date TBA" || part === "2026 date TBA") return "Tareekh abhi tay nahi";
    if (part.startsWith("Release date ")) return `Tareekh: ${part.slice(13)}`;
    return part;
  }).join(" · ");
}

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
      showToast("Vote ginti abhi taaza nahi ho paayi. Thodi der baad phir koshish karein.");
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
      setNotice("Matdaan shuru karne ke liye Supabase mein awards setup jodein. Abhi matpatra dekh sakte hain.");
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
      setNotice("Matdaan shuru karne ke liye Supabase mein awards setup SQL chalaayein.");
      setLoading(false);
      return;
    }
    if (!data?.length) {
      const previews = await previewPolls();
      setPoll(previews[0]);
      setAwardPolls(previews);
      setStats(emptyStats(previews[0].options));
      setNotice("Pehla matpatra taiyaar hai. Matdaan shuru karne ke liye ise Supabase mein jaari karein.");
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
      setNotice("Is site par matdaan set nahi hai. Supabase project ki settings jaanchein.");
      return () => { mounted = false; };
    }

    fetch(`${CONFIG.url}/auth/v1/settings`, { headers: {
      apikey: CONFIG.anonKey, Authorization: `Bearer ${CONFIG.anonKey}`,
    } })
      .then((response) => response.ok ? response.json() : null)
      .then((settings) => {
        if (mounted && settings?.external?.anonymous_users === false) {
          setNotice("Supabase mein turant matdaan band hai. Authentication settings mein Anonymous Sign-Ins chalu karein.");
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
      if (error) showToast("Aapne matdaan kiya hai ya nahi, yeh jaanch nahi ho paaya.");
      const vote = data?.option_id || null;
      setExistingVote(vote);
      if (vote) setSelected(vote);
    });
    return () => { mounted = false; };
  }, [user, poll.id, showToast]);

  const startAnonymousSession = async () => {
    if (window.location.protocol === "file:") {
      setNotice("Matdaan ke liye is page ko web server par kholein. Seedha file preview surakshit session nahi bana sakta.");
      return;
    }
    if (!db || anonymousEnabled === false) {
      setNotice("Turant matdaan uplabdh nahi hai. Supabase Auth settings jaanchkar phir koshish karein.");
      return;
    }
    if (user || anonymousEnabled === null) return;
    try {
      setAnonymousEnabled(null);
      const { data: authData, error } = await db.auth.signInAnonymously();
      if (error) {
        setAnonymousEnabled(false);
        setNotice(error.message || "Turant matdaan uplabdh nahi hai. Supabase mein Anonymous Sign-Ins chalu karein.");
        return;
      }
      localStorage.setItem(QUICK_VOTE_USED_KEY, "true");
      setQuickVoteUsed(true);
      setUser(authData.user || authData.session?.user || null);
      setAnonymousEnabled(true);
    } catch {
      setAnonymousEnabled(false);
      setNotice("Matdaan session shuru nahi ho paaya. Internet jaanchkar phir koshish karein.");
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
        setNotice("Aap is matdaan mein apna vote de chuke hain. Hissa lene ke liye shukriya!");
      } else showToast("Aapka vote jama nahi ho paaya. Thodi der baad phir koshish karein.");
      return;
    }
    setExistingVote(selected);
    setNotice("Aapka vote jud gaya. Apni pasand batane ke liye shukriya!");
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
    if (options.length < 2) { showToast("Kam se kam do naam jodein."); return; }
    if (!Number.isFinite(+closesAt) || closesAt <= new Date() || closesAt > latestClose) {
      showToast("Matdaan band hone ki tareekh agle teen mahino ke andar chunein.");
      return;
    }
    const { error } = await db.rpc("create_award_poll", {
      p_category: form.get("category"), p_award_year: 2026,
      p_question: form.get("question"), p_closes_at: closesAt.toISOString(),
      p_results_at: "2026-12-31T12:00:00+05:30", p_options: options,
    });
    if (error) { showToast("Nayi shreni shuru nahi ho paayi. Settings jaanchkar phir koshish karein."); return; }
    selectedCategoryRef.current = form.get("category");
    setAdminOpen(false);
    await loadPolls();
    setNotice("Naya matdaan shuru ho gaya hai. Ab apni pasand bataayein!");
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
      showToast("Yeh shreni jald khulegi.");
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
        <a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }} aria-label="Audience Choice Awards par jaayein"><span class="brand-mark"><${Clapperboard} size=${18}/></span><span>Audience Choice Awards</span></a>
        <button class="menu-toggle" type="button" aria-label="Menu kholein ya band karein" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}><${Menu} size=${20}/></button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Mukhya menu"><a href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}>Ghar</a><a class="nav-active" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>Puraskar</a></nav>
        <div class="account">${!user && !quickVoteUsed ? html`<button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}><${Heart} size=${15}/>${anonymousEnabled === false ? "Phir koshish karein" : anonymousEnabled === null ? "Shuru ho raha hai" : "Vote dene judein"}</button>` : null}</div>
      </header>
      ${notice ? html`<div class="site-notice" role="status"><span><${Film} size=${16}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Sandesh band karein" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

      <main class="awards-main">
        <section class="awards-heading"><div class="awards-heading-copy"><p class="section-kicker"><${Sparkles} size=${14}/> JANATA KE FILM PURASKAR · 2026</p><h1>Apni pasand<br/><em>chuniye.</em></h1><p>Har shreni mein ek vote. Aakhri nateeje 31 Disambar ko saamne aayenge.</p></div><div class="awards-seal"><${Trophy} size=${25}/><b>JANATA<br/>KE<br/>PURASKAR</b><span>SHURU · 2026</span></div><div class="awards-count"><b>${String(awardPolls.length).padStart(2, "0")}</b><span>MATPATRA<br/>JAARI</span></div></section>

        <section class="award-workspace">
          <div class="category-rail" role="tablist" aria-label="Awards ki shreniyaan">${awardCategories.map((category) => { const available = Boolean(categoryPolls[category.id]); const live = Boolean(categoryPolls[category.id]?.id); return html`<button class=${`category-tab ${poll.category === category.id ? "category-tab-active" : ""} ${available ? "" : "category-tab-soon"}`} type="button" role="tab" aria-selected=${poll.category === category.id} onClick=${() => selectCategory(category.id)}><span class="category-tab-number">${category.icon}</span><span>${category.name}</span><small>${live ? "MATDAAN JAARI" : available ? "JHALAK" : "JALD"}</small></button>`; })}</div>

          <div class="ballot-header"><div><p class="section-kicker">SHRENI ${currentCategory.icon} <i></i> ${currentCategory.name.toUpperCase()}</p><h2>${poll.category === "best-picture" ? "2026 ki Behtareen Film" : poll.category === "best-actor" ? "2026 ke Behtareen Abhineta" : poll.question}</h2><p class="ballot-description">${poll.category === "best-picture" ? "Is saal kis film ne aapki kalpana par chhaap chhodi? Chuninda filmon mein release ho chuki aur aane wali dono filmein hain; release ki tareekhein badal sakti hain." : poll.category === "best-actor" ? "Kis adakaari ne aapke dil par asar chhoda? Apne pasandida kalakaar ko chuniye." : "Janata ke award ke liye ek naam chuniye."}</p></div><div class="deadline-stamp"><${Clock3} size=${17}/><span><small>MATDAAN BAND HONE KI TAREEKH</small><b>${dateLabel(poll.closes_at)}</b></span></div></div>
          <div class="ballot-toolbar"><span>${poll.options.length} ${poll.category === "best-actor" ? "KALAKAAR" : "FILMEIN"} <i></i> ${selected ? "1 PASAND CHUNI" : "EK CHUNEIN"}</span><label class="film-search"><${Search} size=${16}/><input type="search" value=${search} onInput=${(event) => setSearch(event.currentTarget.value)} placeholder=${poll.category === "best-actor" ? "Kalakaar khojein" : "Film khojein"} aria-label=${poll.category === "best-actor" ? "Kalakaar khojein" : "Filmein khojein"}/></label></div>
          <div class="film-grid" role="radiogroup" aria-label=${`${currentCategory.name} ${poll.award_year || 2026} ke liye chunein`}>
            ${loading ? html`<div class="loading-state"><span class="spinner"></span>Naam aa rahe hain...</div>` : poll.options.filter((option) => option.name.toLowerCase().includes(search.trim().toLowerCase())).map((option) => { const rawSubtitle = option.subtitle || "Film ka naam"; const subtitle = nomineeDetail(rawSubtitle, poll.category); const isSelected = selected === option.id; const locked = Boolean(existingVote) || !pollOpen; const upcoming = rawSubtitle.includes("Expected") || rawSubtitle.includes("Coming") || rawSubtitle.includes("TBA"); return html`<button class=${`film-card ${isSelected ? "film-selected" : ""}`} type="button" role="radio" aria-checked=${isSelected} aria-label=${`${option.name}, ${subtitle}`} disabled=${locked} onClick=${() => setSelected(option.id)}><span class="film-poster-wrap">${option.image ? html`<img class="film-poster" src=${option.image} alt=${`${option.name} ka poster`} loading="lazy"/>` : html`<span class="film-poster-fallback"><${Film} size=${28}/><b>${option.name}</b><small>FILMON KA PURASKAR · 2026</small></span>`}<span class="film-rank">${String(poll.options.indexOf(option) + 1).padStart(2, "0")}</span><span class=${`film-release ${upcoming ? "film-upcoming" : ""}`}>${upcoming ? "AANE WALI" : "PARDE PAR"}</span><span class="film-select"><${Check} size=${17}/></span><span class="film-poster-scrim"></span></span><span class="film-details"><b>${option.name}</b><small>${subtitle.split(" · ")[0]}</small></span></button>`; })}
            ${!loading && !poll.options.some((option) => option.name.toLowerCase().includes(search.trim().toLowerCase())) ? html`<div class="empty-search">“${search}” se koi naam nahi mila.</div>` : null}
          </div>
          <div class="ballot-footer"><div class="ballot-note"><span class="ballot-note-icon"><${Check} size=${17}/></span><span><b>${existingVote ? "Aapka matdaan darj hai." : selected ? `Aapki pasand: ${poll.options.find((item) => item.id === selected)?.name}` : "Ek film. Aakhri pasand."}</b><small>${existingVote ? "Janata ka hissa banne ke liye shukriya." : "Aapka vote is browser mein surakshit rahega aur badla nahi ja sakega."}</small></span></div><button class="cast-button" type="button" disabled=${!selected || Boolean(existingVote) || !user || !pollOpen || submitting || !poll.id} onClick=${castVote}>${submitting ? "Vote jama ho raha hai" : existingVote ? "Vote darj ho gaya" : !pollOpen ? "Matdaan band hai" : "Mera vote jama karein"}<${ArrowRight} size=${17}/></button></div>
          ${!user && !quickVoteUsed ? html`<p class="signin-prompt">Is browser par ek baar judein, phir har khuli award shreni mein vote dein.</p>` : null}
        </section>

        <section class=${`final-results ${resultsPublished ? "results-open" : ""}`}><div class="results-copy"><p class="section-kicker"><${Trophy} size=${14}/> NATEEJE</p><h2>${resultsPublished ? "Janata ka faisla aa gaya." : "Nateeja abhi raaz hai."}</h2><p>${resultsPublished ? "Janata ka aakhri nateeja saamne hai." : "Aakhri nateeja 31 Disambar ko saamne aayega. Tab tak vote gupt rahenge."}</p></div>${resultsPublished ? html`<div class="final-leaderboard">${rankedOptions.map((option, index) => { const stat = stats[option.id] || { votes: 0, percent: 0 }; return html`<div class=${`final-result-row ${index === 0 && totalVotes ? "final-winner" : ""}`}><span class="final-rank">${String(index + 1).padStart(2, "0")}</span><b>${option.name}</b><span class="final-track"><i style=${{ width: `${stat.percent}%` }}></i></span><span class="final-percent">${stat.percent}%</span></div>`; })}</div>` : html`<div class="sealed-envelope"><span class="envelope-date">31<br/><small>DIS</small></span><span class="envelope-rule"></span><span class="envelope-caption">AAKHRI NATEEJE<br/>2026</span></div>`}</section>
      </main>
      <footer class="site-footer"><a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}><span class="brand-mark"><${Clapperboard} size=${16}/></span><span>Audience Choice Awards</span></a><span>Cinema ke pyaar mein bana.</span><span>2026</span></footer>
      ${user?.app_metadata?.role === "admin" ? html`<button class="admin-trigger" type="button" onClick=${() => setAdminOpen(true)}><${Sparkles} size=${15}/> Nayi shreni jodein</button>` : null}
      ${adminOpen ? html`<div class="modal-backdrop" role="presentation" onClick=${(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}><section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title"><button class="modal-close" type="button" aria-label="Band karein" onClick=${() => setAdminOpen(false)}><${X} size=${19}/></button><div class="eyebrow">MATDAAN NIYANTRAN</div><h2 id="admin-title">Nayi shreni shuru karein</h2><form onSubmit=${createPoll}><label>Shreni<select name="category" required>${awardCategories.filter((item) => !categoryPolls[item.id]).map((item) => html`<option value=${item.id}>${item.name}</option>`)}</select></label><label>Matdaan ka sawaal<input name="question" required minLength="8" maxLength="140" placeholder="Kis film ko dobara dekhenge?"/></label><label>Matdaan band hone ka samay<input name="closes_at" type="datetime-local" required value="2026-12-31T00:00"/></label><label>Naam <small>Har line par: naam | poster URL | chhota vivaran</small><textarea name="options" required rows="6" placeholder="Film ya kalakaar | https://image.jpg | Pasand aane ki wajah"></textarea></label><button class="vote-button modal-submit" type="submit">Shreni shuru karein <${ArrowRight} size=${16}/></button></form></section></div>` : null}
      ${toast ? html`<div class="toast" role="status"><${Film} size=${16}/>${toast}</div>` : null}
    </div>
  `;

  return html`
    <div class="site-shell home-shell">
      <header class="topbar">
        <a class="brand" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }} aria-label="Audience Choice Awards par jaayein"><span class="brand-mark"><${Clapperboard} size=${18}/></span><span>Audience Choice Awards</span></a>
        <button class="menu-toggle" type="button" aria-label="Menu kholein ya band karein" aria-expanded=${mobileMenuOpen} onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}>
          <${Menu} size=${20}/>
        </button>
        <nav class=${mobileMenuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Mukhya menu">
          <a class="nav-active" href="#home" onClick=${(event) => { event.preventDefault(); navigateTo("home"); }}>Ghar</a>
          <a href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>Puraskar</a>
        </nav>
        <div class="account">${!user && !quickVoteUsed ? html`<button class="sign-in" type="button" onClick=${startAnonymousSession} disabled=${anonymousEnabled === null}><${Heart} size=${15}/>${anonymousEnabled === false ? "Phir koshish karein" : anonymousEnabled === null ? "Shuru ho raha hai" : "Vote dene judein"}</button>` : null}</div>
      </header>

      ${notice ? html`<div class="site-notice" role="status"><span><${Film} size=${16}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Sandesh band karein" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

      <main id="top">
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow"><span class="eyebrow-icon"><${Sparkles} size=${14}/></span> AUDIENCE CHOICE AWARDS · 2026</div>
            <h1>Kahaani abhi baaki hai.<br/><em>Aapka vote hi asli faisla.</em></h1>
            <p class="hero-intro">Yeh jashn hai un filmon ka jo dil mein bas gayin. Apni pasand chuniye; janata ka faisla 31 Disambar ko saamne aayega.</p>
            <div class="hero-actions">
          <a class="primary-button" href="#awards" onClick=${(event) => { event.preventDefault(); navigateTo("awards"); }}>Apni pasand chuniye <${ArrowRight} size=${16}/></a>
            </div>
            <div class="hero-meta"><span><${Clock3} size=${15}/> Aakhri nateeja · 31 Disambar</span><span class="meta-divider"></span><span><${Film} size=${15}/> 25 filmein daud mein</span></div>
          </div>
          <div class="hero-visual" aria-label="Audience Choice Awards ka jashn">
            <div class="hero-photo-wrap">
              <img class="hero-photo" src="./assets/audience-choice-awards-logo.png" alt="Audience Choice Awards 2026 ka sunehra film puraskar logo" />
              <div class="photo-caption"><span class="caption-kicker">2026 KA JASHN</span><strong>Audience Choice Awards</strong><span>Cinema, janata ki pasand.</span></div>
            </div>
            <div class="hero-stamp"><${Popcorn} size=${18}/><span>Behtareen filmein.<br/><b>Zabardast charcha.</b></span></div>
            <span class="visual-number">AUDIENCE CHOICE / 2026</span>
          </div>
          <div class="hero-bottom"><span>JANATA KE PURASKAR</span><span>01 <i></i> 04 SHRENIYAAN</span></div>
        </section>

        <section class="poll-section" id="poll">
          <div class="section-heading">
            <div><div class="eyebrow"><span class="eyebrow-icon"><${Sparkles} size=${14}/></span> BADE PARDE KI CHARCHA</div>
              <h2>${poll.category === "best-picture" ? "2026 ki Behtareen Film" : poll.category === "best-actor" ? "2026 ke Behtareen Abhineta" : poll.question}</h2>
              <p>Us film ya kalakaar ko chuniye jisne aapka dil jeet liya.</p>
            </div>
            <div class="one-vote"><span class="one-vote-icon"><${Check} size=${17}/></span><span><b>Ek darshak, ek vote</b><small>Aapki pasand aakhri hai</small></span></div>
          </div>

          ${notice ? html`<div class="notice" role="status"><span><${Film} size=${17}/></span><p>${notice}</p><button type="button" class="notice-close" aria-label="Sandesh band karein" onClick=${() => setNotice("")}><${X} size=${16}/></button></div>` : null}

          <div class="nominee-toolbar"><span class="nominee-count">${poll.options.length} KALAKAAR</span><span class="select-hint">${existingVote ? "Aapki pasand yahan dikh rahi hai" : selected ? "Vote dene ke liye taiyaar" : "Chunane ke liye tasveer par dabayein"} <${ChevronDown} size=${14}/></span></div>
          <div class="candidate-grid" role="radiogroup" aria-label="Apne pasandida kalakaar chunein">
            ${loading ? html`<div class="loading-state"><span class="spinner"></span>Kalakaar aa rahe hain...</div>` : poll.options.map((option, index) => {
              const stat = stats[option.id] || { votes: 0, percent: 0 };
              const isSelected = selected === option.id;
              const isLocked = Boolean(existingVote);
              return html`<button class=${`candidate ${isSelected ? "candidate-selected" : ""} ${isLocked ? "candidate-locked" : ""}`} type="button" role="radio" aria-checked=${isSelected} aria-label=${`${option.name}, ${option.subtitle || "Kalakaar"}`} disabled=${isLocked || !pollOpen} onClick=${() => setSelected(option.id)}>
                <span class="candidate-image-wrap">
                  ${option.image ? html`<img class="candidate-image" src=${option.image} alt=${option.name} loading="lazy"/>` : html`<span class="candidate-image-fallback"><${Film} size=${31}/></span>`}
                  <span class="candidate-index">0${index + 1}</span>
                  <span class="candidate-check"><${Check} size=${16}/></span>
                  <span class="image-scrim"></span>
                </span>
                <span class="candidate-info"><span class="candidate-name">${option.name}</span><span class="candidate-subtitle">${option.subtitle || "Kalakaar"}</span>
                  ${existingVote ? html`<span class="candidate-stat"><span class="stat-track"><i style=${{ width: `${stat.percent}%` }}></i></span><span>${stat.votes.toLocaleString()} vote <b>${stat.percent}%</b></span></span>` : null}
                </span>
              </button>`;
            })}
          </div>

          <div class="vote-panel">
            <div class="vote-panel-copy"><span class="vote-panel-icon"><${Trophy} size=${18}/></span><span><b>${existingVote ? "Aapka vote darj ho chuka hai." : selected ? `Aapki pasand: ${poll.options.find((item) => item.id === selected)?.name}.` : "Ab baari aapki hai."}</b><small>${existingVote ? "Is jashn ka hissa banne ke liye shukriya." : "Apni pasand chuniye aur apni awaaz jodiye."}</small></span></div>
            <button class="vote-button" type="button" disabled=${!selected || Boolean(existingVote) || !user || !pollOpen || submitting || !poll.id} onClick=${castVote}>
              ${submitting ? "Vote jud raha hai..." : existingVote ? "Vote darj hai" : !pollOpen ? "Matdaan band hai" : "Mera vote dein"} <${ArrowRight} size=${17}/>
            </button>
          </div>
          ${!user && anonymousEnabled ? html`<p class="signin-prompt">Email ki zaroorat nahi. Is device ke browser se har matdaan mein ek vote diya ja sakta hai.</p>` : null}
        </section>

        <section class="results-section" id="results">
          <div class="results-topline"><div><div class="eyebrow"><span class="eyebrow-icon"><${BarChart3} size=${14}/></span> AB JANATA KI BAARI</div><h2>Ab tak ki pasand, <em>janata ki.</em></h2></div><div class="live-count"><span class="live-dot"></span><span><b>${totalVotes.toLocaleString()}</b><small>vote darj</small></span></div></div>
          <div class="results-layout">
            <div class="leaderboard">
              ${rankedOptions.map((option, index) => {
                const stat = stats[option.id] || { votes: 0, percent: 0 };
                return html`<div class=${`result-row ${index === 0 && totalVotes ? "result-leading" : ""}`}>
                  <span class="result-rank">${String(index + 1).padStart(2, "0")}</span>
                  <span class="result-person">${option.image ? html`<img src=${option.image} alt="" loading="lazy"/>` : html`<span class="result-avatar"><${Film} size=${14}/></span>`}<b>${option.name}</b></span>
                  <span class="result-track"><i style=${{ width: `${stat.percent}%` }}></i></span>
                  <span class="result-percent">${stat.percent}%</span>
                  <span class="result-votes">${stat.votes.toLocaleString()}<small>vote</small></span>
                </div>`;
              })}
            </div>
            <aside class="results-note"><span class="note-icon"><${Clapperboard} size=${21}/></span><p class="note-label">AB TAK KI KAHANI</p><h3>${totalVotes ? `${totalVotes.toLocaleString()} darshak. Ek bada sawaal.` : "Har behtareen film ki shuruaat darshakon se hoti hai."}</h3><p>Janata ki pasand ke saath ginti badalti rahegi. Agle mod par phir laut aayein.</p><span class="refresh-label"><span class="live-dot"></span> JANATA KI TAAZA GINTI</span></aside>
          </div>
        </section>

        <section class="about-section" id="about">
          <div class="about-heading"><span class="about-mark"><${Trophy} size=${20}/></span><div><div class="eyebrow">BHARATIYA CINEMA KA EK SAAL</div><h2>Yeh jury ka faisla nahi.<br/><em>Yeh janata ki awaaz hai.</em></h2></div></div>
          <p class="about-copy">Audience Choice Awards, Bharatiya cinema ka saalana jashn hai, jahan faisla aapki pasand karti hai. Har puraskar shreni mein apna pasandida chuniye, phir saal ki aakhri shaam lautkar janata ka nateeja dekhiye.</p>
          <button type="button" class="about-link" onClick=${() => navigateTo("awards")}>Puraskar ki shreniyaan dekhein <${ArrowRight} size=${16}/></button>
          <div class="about-film"><span><${Film} size=${16}/></span><span>01 SHRENI KHULI</span><i></i><span>NATEEJE · 31 DISAMBAR</span><span><${Heart} size=${15}/></span></div>
        </section>

        <section class="category-preview">
          <div class="preview-heading"><div><span class="eyebrow">2026 KI CHUNINDA SUCHI</span><h2>Jashn manane ki chaar wajah.</h2></div><button type="button" class="text-link" onClick=${() => navigateTo("awards")}>Puraskar dekhein <${ArrowRight} size=${16}/></button></div>
          <div class="preview-grid">
            ${awardCategories.map((category) => { const open = Boolean(categoryPolls[category.id]); return html`<button class=${`preview-category ${open ? "preview-open" : ""}`} type="button" onClick=${() => { navigateTo("awards"); if (open) selectCategory(category.id); }}><span class="preview-number">${category.icon}</span><span class="preview-name">${category.name}</span><span class="preview-status">${open ? "MATDAAN JAARI" : "JALD KHULEGI"} <${ArrowRight} size=${14}/></span></button>`; })}
          </div>
        </section>
      </main>

      <footer class="footer"><a class="brand" href="#top"><span class="brand-mark"><${Clapperboard} size=${16}/></span><span>Audience Choice Awards</span></a><span class="footer-note">Filmon aur unhein banane walon ke naam ek paigaam.</span><span class="footer-year">© 2026 AUDIENCE CHOICE AWARDS</span></footer>

      ${user?.app_metadata?.role === "admin" ? html`<button class="admin-trigger" type="button" onClick=${() => setAdminOpen(true)}><${Sparkles} size=${15}/> Naya matdaan</button>` : null}

      ${adminOpen ? html`<div class="modal-backdrop" role="presentation" onClick=${(event) => { if (event.target === event.currentTarget) setAdminOpen(false); }}>
        <section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <button class="modal-close" type="button" aria-label="Band karein" onClick=${() => setAdminOpen(false)}><${X} size=${19}/></button>
          <div class="eyebrow">MATDAAN NIYANTRAN</div><h2 id="admin-title">Nayi charcha shuru karein</h2>
          <form onSubmit=${createPoll}>
            <label>Matdaan ka sawaal<input name="question" required minLength="8" maxLength="140" placeholder="Kaunsi film dobara dekhna chahenge?"/></label>
            <label>Matdaan band hone ka samay<input name="closes_at" required type="datetime-local"/></label>
            <label>Naam <small>Har line par: naam | tasveer ka URL | chhota vivaran</small><textarea name="options" required rows="5" placeholder="Film ya kalakaar | https://image.jpg | Pasand aane ki wajah"></textarea></label>
            <button class="vote-button modal-submit" type="submit">Matdaan jaari karein <${ArrowRight} size=${16}/></button>
          </form>
        </section>
      </div>` : null}

      ${toast ? html`<div class="toast" role="status"><${Film} size=${16}/>${toast}</div>` : null}
    </div>
  `;
}

createRoot(document.getElementById("root")).render(React.createElement(App));
