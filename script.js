"use strict";

/* =========================================================
   HER LITTLE UNIVERSE: script.js
   STEP 1: Edit the CONFIG below (only this part needs changes).
   ========================================================= */

const CONFIG = {
  // From Supabase dashboard -> Project Settings -> API
  SUPABASE_URL: "https://kwkidlcyvbngkqclpids.supabase.co",       // e.g. https://abcd1234.supabase.co
  SUPABASE_ANON_KEY: "sb_publishable_Um2bFYVsdlgH0Ek534-vZA_uwjVNXtZ",

  NAME: "Suhu",          // her nickname shown on the site
  FROM: "Sayyed Sahil",     // your name, shown in the letter + footer
  BIRTH_MONTH: 11,       // November
  BIRTH_DAY: 27,

  // Your letter: each line becomes a paragraph. Write from the heart!
LETTER: [
    "Aaj ka din sirf tumhara hai, because the world became a little more beautiful the day you were born. And somewhere in this big world, I got lucky enough to have you in my life. 💗",

    "Teri smile meri favourite cheez hai, aur teri awaaz meri favourite song. Tujhse baat karna, teri chhoti-chhoti baatein sunna, aur tere saath waqt bitana — ye sab mere liye bahut special hai.",

    "Maybe I can't always find the perfect words to explain what you mean to me, but I hope you can feel it in the little things I do. You don't have to be perfect, Suhu. You can be happy, sad, silly, quiet, or completely yourself — I want you to know that the real you is someone truly special to me. 🫶🏻",

    "I made this little universe for you because I wanted to give you something that feels like us. Every photo, every little note, every word here carries a tiny piece of what I feel for you.",

    "On your birthday, I wish you a heart full of happiness, dreams that come true, and countless reasons to smile. I hope life treats you gently and gives you beautiful moments to remember.",

    "Happy Birthday, my love. 🎂💗",

    "Aur haan, Suhu… aaj bas tera birthday nahi hai. Aaj woh din hai jis din meri favourite person is duniya mein aayi thi.",

    "Chalo, abhi toh hamari kahani ka ek chhota sa hissa hai. Aage aur bhi memories banani hain, aur bhi hasi-mazaak karna hai, aur bahut saari kahaniyan saath likhni hain. 💖"
]
};

/* ---------- tiny helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const configured =
  !CONFIG.SUPABASE_URL.includes("PASTE") && !CONFIG.SUPABASE_ANON_KEY.includes("PASTE");
const sb = configured && window.supabase
  ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;

/* "01-our-first-date.jpg" -> "Our first date" */
function prettify(filename) {
  const t = filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_ .]*/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Little moment";
}

/* =========================================================
   UI HELPERS: toasts, glass dialogs, shared state
   ========================================================= */
const sleep = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));

let isAdmin = false;     // UI flag only. Real security = Supabase RLS (see setup SQL).
let photosCache = [];
let voicesCache = [];
let tracksCache = [];
const seenKeys = { photos: null, voices: null, notes: null };
const isFresh = (kind, key) => !!seenKeys[kind] && !seenKeys[kind].has(key);
const markSeen = (kind, keys) => { seenKeys[kind] = new Set(keys); };

function toast(message, type = "success") {
  const box = $("#toasts");
  const t = el("div", "toast " + type);
  t.append(el("span", "toast-icon", type === "error" ? "⚠️" : "✨"), el("span", "", message));
  box.append(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, type === "error" ? 5200 : 3200);
}

function showDlg(d) {
  d.returnValue = "";
  d.showModal();
  requestAnimationFrame(() => d.classList.add("show"));
}
function hideDlg(d) {
  if (d.dataset.busy) return;
  d.classList.remove("show");
  setTimeout(() => { if (d.open) d.close(); }, reduceMotion ? 0 : 230);
}
function setDlgBusy(d, on) {
  if (on) d.dataset.busy = "1"; else delete d.dataset.busy;
  d.querySelectorAll("button, input, textarea").forEach(n => (n.disabled = on));
  d.classList.toggle("is-busy", on);
}
document.querySelectorAll(".glass-dialog").forEach(d => {
  d.addEventListener("close", () => d.classList.remove("show"));
  d.addEventListener("cancel", e => { if (d.dataset.busy) e.preventDefault(); });
  d.addEventListener("click", e => { if (e.target === d) hideDlg(d); }); // click on the blurred backdrop
});

/* Confirmation before anything destructive. `action` runs while the dialog stays open. */
function confirmDialog({ title, message, okText = "Confirm", action }) {
  return new Promise(resolve => {
    const d = $("#confirmDlg");
    $("#cfTitle").textContent = title;
    $("#cfMsg").textContent = message;
    $("#cfErr").textContent = "";
    $("#cfOk").textContent = okText;
    let done = false;

    const onClose = () => {
      $("#cfOk").onclick = null;
      $("#cfCancel").onclick = null;
      d.removeEventListener("close", onClose);
      resolve(done);
    };
    d.addEventListener("close", onClose);

    $("#cfCancel").onclick = () => hideDlg(d);
    $("#cfOk").onclick = async () => {
      $("#cfErr").textContent = "";
      setDlgBusy(d, true);
      try {
        if (action) await action();
        done = true;
        setDlgBusy(d, false);
        hideDlg(d);
      } catch (err) {
        setDlgBusy(d, false);
        $("#cfErr").textContent = err.message || "Something went wrong.";
      }
    };
    showDlg(d);
    $("#cfCancel").focus();
  });
}

/* Edit dialog with validation. `save(value)` runs while the dialog stays open;
   if it throws, the error is shown inside the dialog and nothing is lost. */
function editDialog({ title, label, value = "", max = 60, multiline = false, save }) {
  return new Promise(resolve => {
    const d = $("#editDlg");
    const form = $("#editForm");
    const input = multiline ? $("#editArea") : $("#editInput");
    $("#editTitle").textContent = title;
    $("#editLabel").textContent = label;
    $("#editInput").classList.toggle("hidden", multiline);
    $("#editArea").classList.toggle("hidden", !multiline);
    input.maxLength = max;
    input.value = value;
    $("#editErr").textContent = "";
    let saved = false;

    const onInput = () => ($("#editErr").textContent = "");
    const onSubmit = async ev => {
      ev.preventDefault();
      const v = input.value.trim();
      if (!v) { $("#editErr").textContent = "This can't be empty."; input.focus(); return; }
      if (v === value.trim()) { hideDlg(d); return; }
      setDlgBusy(d, true);
      try {
        await save(v);
        saved = true;
        setDlgBusy(d, false);
        hideDlg(d);
      } catch (err) {
        setDlgBusy(d, false);
        $("#editErr").textContent = err.message || "Could not save. Please try again.";
        input.focus();
      }
    };
    const onClose = () => {
      form.removeEventListener("submit", onSubmit);
      input.removeEventListener("input", onInput);
      d.removeEventListener("close", onClose);
      resolve(saved);
    };
    form.addEventListener("submit", onSubmit);
    input.addEventListener("input", onInput);
    d.addEventListener("close", onClose);
    $("#editCancel").onclick = () => hideDlg(d);
    showDlg(d);
    input.focus();
    input.select();
  });
}

/* ✏️ / 🗑️ buttons shown on each item (admin + Edit mode only) */
function adminActions(onEdit, onDelete, label) {
  const box = el("div", "item-actions");
  const edit = el("button", "mini-btn", "✏️");
  const del = el("button", "mini-btn danger", "🗑️");
  edit.type = "button";
  del.type = "button";
  edit.setAttribute("aria-label", "Edit " + label);
  del.setAttribute("aria-label", "Delete " + label);
  edit.addEventListener("click", e => { e.stopPropagation(); onEdit(); });
  del.addEventListener("click", e => { e.stopPropagation(); onDelete(); });
  box.addEventListener("click", e => e.stopPropagation());
  box.append(edit, del);
  return box;
}

/* =========================================================
   FILL NAMES + LETTER
   ========================================================= */
document.querySelectorAll("[data-name]").forEach(n => (n.textContent = CONFIG.NAME));
$("#fromName").textContent = CONFIG.FROM;
$("#introName") && ($("#introName").textContent = CONFIG.NAME);
document.title = `${CONFIG.NAME}'s Little Universe 💖`;

(function renderLetter() {
  const body = $("#letterBody");
  CONFIG.LETTER.forEach(line => body.append(el("p", "", line)));
  $("#letterSign").textContent = `Forever yours, ${CONFIG.FROM} 💌`;
})();

/* =========================================================
   FLOATING DOODLES + CONFETTI
   ========================================================= */
(function buildFloaters() {
  if (reduceMotion) return;
  const icons = ["💖", "✨", "⭐", "🌸", "🦋", "🎀", "☁️", "💫"];
  const box = $("#floaters");
  for (let i = 0; i < 16; i++) {
    const s = el("span", "floater", icons[i % icons.length]);
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 16 + Math.random() * 20 + "px";
    s.style.animationDuration = 14 + Math.random() * 16 + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    box.append(s);
  }
})();

const cv = $("#confetti");
const ctx = cv.getContext("2d");
let pieces = [];
let raf = null;

function resizeCanvas() { cv.width = innerWidth; cv.height = innerHeight; }
resizeCanvas();
addEventListener("resize", resizeCanvas);

function burst(count = 150) {
  if (reduceMotion) return;
  const colors = ["#ff8fab", "#ffe29a", "#bfe5d6", "#cfe8ff", "#d9c6ea", "#ffc8a2", "#f06a8e"];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 220,
      y: innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -13 - 4,
      s: 6 + Math.random() * 7,
      c: colors[Math.floor(Math.random() * colors.length)],
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.35,
      life: 0
    });
  }
  if (!raf) raf = requestAnimationFrame(confettiLoop);
}

function confettiLoop() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  for (const p of pieces) {
    p.vy += 0.25; p.vx *= 0.992;
    p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
    ctx.restore();
  }
  pieces = pieces.filter(p => p.y < cv.height + 30 && p.life < 280);
  if (pieces.length) {
    raf = requestAnimationFrame(confettiLoop);
  } else {
    raf = null;
    ctx.clearRect(0, 0, cv.width, cv.height);
  }
}

/* =========================================================
   COUNTDOWN
   ========================================================= */
let celebratedToday = false;

function tick() {
  const now = new Date();
  const m = CONFIG.BIRTH_MONTH - 1;
  const isToday = now.getMonth() === m && now.getDate() === CONFIG.BIRTH_DAY;

  if (isToday) {
    ["Days", "Hours", "Mins", "Secs"].forEach(k => ($("#cd" + k).textContent = "0"));
    $("#countMsg").textContent = `🎉 Today is YOUR day, ${CONFIG.NAME}! 🎉`;
    if (!celebratedToday && document.body.classList.contains("opened")) {
      celebratedToday = true;
      setTimeout(() => burst(220), 600);
    }
    return;
  }

  let target = new Date(now.getFullYear(), m, CONFIG.BIRTH_DAY);
  if (target < now) target = new Date(now.getFullYear() + 1, m, CONFIG.BIRTH_DAY);

  const diff = target - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const mins = Math.floor(diff / 60000) % 60;
  const secs = Math.floor(diff / 1000) % 60;

  $("#cdDays").textContent = days;
  $("#cdHours").textContent = hours;
  $("#cdMins").textContent = mins;
  $("#cdSecs").textContent = secs;
  $("#countMsg").textContent = days <= 7
    ? "Almost here... the best day is coming! 🥳"
    : "The world got more beautiful the day you were born. 💗";
}
tick();
setInterval(tick, 1000);

/* =========================================================
   MUSIC PLAYER
   ========================================================= */
const music = new Audio();
music.preload = "none";
let songs = [];
let cur = 0;
let userOpened = false;
let musicWasPlaying = false; // used to resume after a voice note

function loadSong(i) {
  cur = (i + songs.length) % songs.length;
  music.src = songs[cur].url;
  $("#songTitle").textContent = "🎵 " + songs[cur].title;
  $("#seek").value = 0;
}

async function playMusic() {
  try { await music.play(); } catch (e) { console.warn("Music blocked until you tap play:", e.message); }
}

function setupPlayer(list) {
  const playingName = songs[cur] && songs[cur].name;
  const wasPlaying = !music.paused;
  songs = list;
  tracksCache = list;
  const has = songs.length > 0;
  $("#player").classList.toggle("hidden", !has);
  document.body.classList.toggle("has-player", has);
  if (!has) {
    music.pause();
    music.removeAttribute("src");
    return;
  }
  const idx = songs.findIndex(x => x.name === playingName);
  if (idx >= 0) { cur = idx; return; } // current song still exists: keep playing
  loadSong(0);
  if (userOpened && (wasPlaying || !playingName)) playMusic();
}

$("#playBtn").addEventListener("click", () => (music.paused ? playMusic() : music.pause()));
$("#nextBtn").addEventListener("click", () => { loadSong(cur + 1); playMusic(); });
$("#prevBtn").addEventListener("click", () => { loadSong(cur - 1); playMusic(); });
$("#muteBtn").addEventListener("click", () => {
  music.muted = !music.muted;
  $("#muteBtn").textContent = music.muted ? "🔇" : "🔊";
});
$("#seek").addEventListener("input", e => {
  if (music.duration) music.currentTime = (e.target.value / 100) * music.duration;
});
music.addEventListener("play",  () => ($("#playBtn").textContent = "⏸"));
music.addEventListener("pause", () => ($("#playBtn").textContent = "▶"));
music.addEventListener("timeupdate", () => {
  if (music.duration) $("#seek").value = (music.currentTime / music.duration) * 100;
});
music.addEventListener("ended", () => { loadSong(cur + 1); playMusic(); });

/* =========================================================
   ENVELOPE -> OPEN SITE
   ========================================================= */
$("#openBtn").addEventListener("click", () => {
  const intro = $("#intro");
  if (intro.classList.contains("opening")) return;
  intro.classList.add("opening");
  userOpened = true;
  if (songs.length) playMusic(); // allowed because the user just tapped

  setTimeout(() => {
    intro.classList.add("gone");
    $("#site").classList.remove("hidden");
    document.body.classList.add("opened");
    window.scrollTo(0, 0);
    burst();
    setTimeout(() => intro.remove(), 700);
  }, 1200);
});

/* =========================================================
   SUPABASE: LIST FILES FROM STORAGE BUCKETS
   ========================================================= */
const IMG_RE = /\.(jpe?g|png|gif|webp|avif)$/i;
const AUDIO_RE = /\.(mp3|m4a|aac|wav|ogg|opus|weba|webm|mp4)$/i;

async function listFiles(bucket, regex) {
  if (!sb) return [];
  const { data, error } = await sb.storage.from(bucket).list("", {
    limit: 200,
    sortBy: { column: "name", order: "asc" }
  });
  if (error) { console.warn(`Could not list "${bucket}":`, error.message); return null; }
  return data
    .filter(f => f.id && !f.name.startsWith(".") && regex.test(f.name))
    .map(f => ({
      name: f.name,
      title: prettify(f.name),
      url: sb.storage.from(bucket).getPublicUrl(f.name).data.publicUrl
    }));
}

function emptyState(icon, title, hint) {
  const box = el("div", "empty");
  box.append(el("b", "", `${icon} ${title}`), el("span", "muted", hint));
  return box;
}

/* =========================================================
   PHOTO WALL + LIGHTBOX
   ========================================================= */
const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];
const STICKERS = ["💖", "🌸", "⭐", "🎀", "🦋", "🍓", "☁️", "✨"];
const TAPES = ["tape-0", "tape-1", "tape-2"];

const DEMO_PHOTOS = [
  { title: "Our first hello", emoji: "👋", bg: "#ffd6e0" },
  { title: "Chai date", emoji: "☕", bg: "#ffe29a" },
  { title: "Your best smile", emoji: "😊", bg: "#bfe5d6" },
  { title: "Sunset walk", emoji: "🌇", bg: "#ffc8a2" },
  { title: "Silly us", emoji: "🤪", bg: "#d9c6ea" },
  { title: "Always together", emoji: "💞", bg: "#cfe8ff" }
].map(p => ({ ...p, demo: true }));

function renderPhotos(list) {
  photosCache = list;
  const wall = $("#photoWall");
  wall.replaceChildren();
  if (!list.length) {
    markSeen("photos", []);
    wall.append(emptyState("📸", "Photos are on the way",
      isAdmin ? "Tap ➕ Add in the admin bar to upload the first photo." : "Something sweet is coming soon 💗"));
    return;
  }
  const keys = [];
  list.forEach((p, i) => {
    const key = p.name || p.title;
    keys.push(key);
    const fig = el("figure", "polaroid" + (isFresh("photos", key) ? " pop-in" : ""));
    fig.tabIndex = 0;
    fig.style.setProperty("--r", TILTS[i % TILTS.length] + "deg");

    const frame = el("div", "photo-frame");
    if (p.demo) {
      frame.style.background = p.bg;
      frame.append(el("span", "demo-emoji", p.emoji));
    } else {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = p.title;
      img.src = p.url;
      frame.append(img);
    }

    fig.append(
      el("span", "tape " + TAPES[i % TAPES.length]),
      frame,
      el("figcaption", "", p.title),
      el("span", "sticker", STICKERS[i % STICKERS.length])
    );
    if (isAdmin && !p.demo) {
      fig.append(adminActions(() => editMedia("photos", p), () => deleteMedia("photos", p, fig), p.title));
    }
    fig.addEventListener("click", () => openLightbox(p));
    fig.addEventListener("keydown", e => {
      if (e.target === fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLightbox(p); }
    });
    wall.append(fig);
  });
  markSeen("photos", keys);
}

function openLightbox(p) {
  const stage = $("#lbStage");
  stage.replaceChildren();
  if (p.demo) {
    const d = el("div", "lb-demo", p.emoji);
    d.style.background = p.bg;
    stage.append(d);
  } else {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.title;
    stage.append(img);
  }
  $("#lbCap").textContent = p.title;
  $("#lightbox").classList.remove("hidden");
  $("#lbClose").focus();
}
function closeLightbox() { $("#lightbox").classList.add("hidden"); }
$("#lbClose").addEventListener("click", closeLightbox);
$("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

/* =========================================================
   VOICE MESSAGES
   ========================================================= */
const voiceAudios = [];

function fmt(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function resumeMusicIfNeeded() {
  setTimeout(() => {
    const anyPlaying = voiceAudios.some(a => !a.paused);
    if (!anyPlaying && musicWasPlaying) {
      musicWasPlaying = false;
      playMusic();
    }
  }, 200);
}

function renderVoices(list) {
  voicesCache = list;
  const box = $("#voiceList");
  voiceAudios.forEach(a => a.pause()); // stop old players before rebuilding
  box.replaceChildren();
  voiceAudios.length = 0;

  if (!list.length) {
    markSeen("voices", []);
    box.append(emptyState("🎙️", "Voice notes are coming soon",
      isAdmin ? "Tap ➕ Add, then choose “Voice messages”." : "Something to listen to, just for you 💗"));
    return;
  }

  const keys = [];
  list.forEach(v => {
    keys.push(v.name);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = v.url;
    voiceAudios.push(audio);

    const card = el("article", "voice" + (isFresh("voices", v.name) ? " pop-in" : ""));
    const btn = el("button", "v-play", "▶");
    btn.type = "button";
    btn.setAttribute("aria-label", "Play voice note: " + v.title);

    const main = el("div", "v-main");
    const bar = el("div", "v-bar");
    const fill = document.createElement("i");
    bar.append(fill);
    const time = el("div", "v-time", "0:00");
    main.append(el("div", "v-title", v.title), bar, time);
    card.append(btn, main);
    if (isAdmin) {
      card.append(adminActions(() => editMedia("voices", v), () => deleteMedia("voices", v, card), v.title));
    }

    btn.addEventListener("click", () => {
      if (!audio.paused) { audio.pause(); return; }
      voiceAudios.forEach(a => { if (a !== audio) a.pause(); });
      if (!music.paused) { musicWasPlaying = true; music.pause(); }
      audio.play().catch(err => console.warn(err.message));
    });
    bar.addEventListener("click", e => {
      if (!audio.duration) return;
      const r = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    audio.addEventListener("play", () => (btn.textContent = "⏸"));
    audio.addEventListener("pause", () => { btn.textContent = "▶"; resumeMusicIfNeeded(); });
    audio.addEventListener("ended", () => { btn.textContent = "▶"; fill.style.width = "0"; });
    audio.addEventListener("loadedmetadata", () => (time.textContent = fmt(audio.duration)));
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
      time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    });

    box.append(card);
  });
  markSeen("voices", keys);
}

/* =========================================================
   NOTES (Supabase table: notes)
   ========================================================= */
const NOTE_COLORS = ["#ffe29a", "#ffc8dd", "#cdeac0", "#cfe8ff", "#e4c1f9", "#ffd6a5"];
let localNotes = []; // used in demo mode
let notesCache = [];

function renderNotes(list) {
  const board = $("#noteBoard");
  board.replaceChildren();
  if (!list.length) {
    markSeen("notes", []);
    board.append(emptyState("📝", "The wall is empty", "Be the first to stick a note!"));
    return;
  }
  const keys = [];
  list.forEach((n, i) => {
    const key = n.id !== undefined ? n.id : n.created_at + n.message;
    keys.push(key);
    const card = el("div", "sticky" + (isFresh("notes", key) ? " pop-in" : ""));
    card.style.setProperty("--bg", NOTE_COLORS[i % NOTE_COLORS.length]);
    card.style.setProperty("--r", [-2, 1.5, -1, 2.5, -2.5, 1][i % 6] + "deg");
    const when = new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    card.append(el("p", "", n.message), el("small", "", when));
    if (isAdmin && sb && n.id !== undefined) {
      card.append(adminActions(() => editNote(n), () => deleteNote(n, card), "note"));
    }
    board.append(card);
  });
  markSeen("notes", keys);
}

async function loadNotes() {
  if (!sb) { renderNotes(localNotes); return; }
  const { data, error } = await sb
    .from("notes").select("*").order("created_at", { ascending: false }).limit(60);
  if (error) {
    console.warn("Notes error:", error.message);
    $("#noteBoard").replaceChildren(emptyState("😕", "Notes could not load", "Check that the notes table exists in Supabase."));
    return;
  }
  notesCache = data;
  renderNotes(notesCache);
}

$("#noteText").addEventListener("input", e => {
  $("#noteCount").textContent = `${e.target.value.length} / 300`;
});

$("#noteForm").addEventListener("submit", async e => {
  e.preventDefault();
  const input = $("#noteText");
  const message = input.value.trim();
  if (!message) return;
  const submit = e.submitter || $("#noteForm button[type=submit]");
  submit.disabled = true;

  if (!sb) {
    localNotes.unshift({ message, created_at: new Date().toISOString() });
    renderNotes(localNotes);
  } else {
    const { data, error } = await sb.from("notes").insert({ message }).select().single();
    if (error) {
      toast("The note could not be saved: " + error.message, "error");
      submit.disabled = false;
      return;
    }
    notesCache.unshift(data);
    renderNotes(notesCache);
  }
  input.value = "";
  $("#noteCount").textContent = "0 / 300";
  submit.disabled = false;
  toast("Note stuck on the wall 📌");
  burst(60);
});

/* =========================================================
   ADMIN: verified session, toolbar, upload, edit, delete
   -------------------------------------------------------
   SECURITY NOTE: this code only decides what the UI SHOWS.
   The real protection is Supabase Row Level Security: every
   insert / update / delete on storage and notes is checked by
   public.is_admin() in the database. A visitor who edits this
   JavaScript still cannot write anything. (Run the setup SQL.)
   ========================================================= */
const adminBox = $("#admin");
const abEdit = $("#abEdit");
let lastFocus = null;
let adminSetupError = false;

const currentNotes = () => (sb ? notesCache : localNotes);

/* Is this logged-in user listed in the `admins` table? Deny by default. */
async function verifyAdmin(session) {
  if (!sb || !session) return false;
  const { data, error } = await sb.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
  if (error) { console.warn("Admin check failed:", error.message); adminSetupError = true; return false; }
  return !!data;
}

async function syncAuth() {
  if (!sb) return;
  adminSetupError = false;
  const { data } = await sb.auth.getSession();
  const session = data.session;
  const ok = await verifyAdmin(session);
  if (session && !ok) {
    toast(adminSetupError
      ? "Admin setup is incomplete. Run the setup SQL in Supabase first."
      : "This account is not an admin.", "error");
    await sb.auth.signOut(); // fires SIGNED_OUT -> syncAuth again with no session
  }
  setAdmin(ok);
}

function setAdmin(on) {
  const changed = on !== isAdmin;
  isAdmin = on;
  $("#adminBar").classList.toggle("hidden", !on);
  document.body.classList.toggle("is-admin", on);
  if (!on) {
    document.body.classList.remove("edit-mode");
    abEdit.setAttribute("aria-pressed", "false");
    abEdit.textContent = "✏️ Edit mode";
    if ($("#songsDlg").open) hideDlg($("#songsDlg"));
  }
  if (changed) {
    renderPhotos(photosCache);
    renderVoices(voicesCache);
    renderNotes(currentNotes());
  }
  refreshAdmin();
}

async function refreshAdmin() {
  const open = location.hash === "#admin";
  adminBox.classList.toggle("hidden", !open);
  document.body.classList.toggle("modal-open", open);
  if (!open) return;
  if (!sb) {
    $("#adminMsg").textContent = "Supabase is not connected yet. Fill CONFIG in script.js first.";
    $("#loginForm").classList.add("hidden");
    $("#uploadForm").classList.add("hidden");
    return;
  }
  $("#loginForm").classList.toggle("hidden", isAdmin);
  $("#uploadForm").classList.toggle("hidden", !isAdmin);
  $("#adminMsg").textContent = isAdmin
    ? "You are logged in as admin. Upload photos, music or voice notes."
    : "Admin login only. Use the account you created in Supabase.";
  setTimeout(() => (isAdmin ? $("#upFiles") : $("#adEmail")).focus(), 60);
}
addEventListener("hashchange", refreshAdmin);

function syncAccept() {
  $("#upFiles").accept = $("#upBucket").value === "photos" ? "image/*" : "audio/*";
}
$("#upBucket").addEventListener("change", syncAccept);

function openAdmin(bucket) {
  if (bucket) { $("#upBucket").value = bucket; syncAccept(); }
  lastFocus = document.activeElement;
  if (location.hash === "#admin") refreshAdmin(); else location.hash = "admin";
}
function closeAdmin() {
  // restore the URL of the screen the visitor was on (not plain home)
  if (location.hash === "#admin") {
    history.replaceState({ screen: currentScreen, idx: navIdx }, "", location.pathname + location.search + currentRouteHash());
  }
  refreshAdmin();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$("#adminLink").addEventListener("click", () => { lastFocus = $("#adminLink"); });
$("#adminClose").addEventListener("click", closeAdmin);
adminBox.addEventListener("click", e => { if (e.target === adminBox) closeAdmin(); });
addEventListener("keydown", e => {
  if (adminBox.classList.contains("hidden")) return;
  if (e.key === "Escape") { closeAdmin(); return; }
  if (e.key !== "Tab") return;
  const f = [...adminBox.querySelectorAll("button, input, select, textarea, a[href]")]
    .filter(n => !n.disabled && n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* ---------- login / logout ---------- */
$("#loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!sb) return;
  const btn = e.submitter || $("#loginForm button[type=submit]");
  const status = $("#upStatus");
  btn.disabled = true;
  status.classList.add("busy");
  status.textContent = "Checking...";
  const { error } = await sb.auth.signInWithPassword({
    email: $("#adEmail").value.trim(),
    password: $("#adPass").value
  });
  status.classList.remove("busy");
  btn.disabled = false;
  if (error) { status.textContent = "Login failed: " + error.message; return; }
  status.textContent = "";
  $("#adPass").value = "";
  await syncAuth();
});

async function logout() {
  await sb.auth.signOut();
  await syncAuth();
  toast("Logged out. See you soon 💗");
}
$("#logoutBtn").addEventListener("click", logout);
$("#abLogout").addEventListener("click", logout);

/* ---------- toolbar ---------- */
$("#abUpload").addEventListener("click", () => openAdmin("photos"));
$("#abSongs").addEventListener("click", () => { renderSongsManager(); showDlg($("#songsDlg")); });
abEdit.addEventListener("click", () => {
  const on = document.body.classList.toggle("edit-mode");
  abEdit.setAttribute("aria-pressed", String(on));
  abEdit.textContent = on ? "✅ Done" : "✏️ Edit mode";
});

/* ---------- upload ---------- */
/* shrink big phone photos before upload (saves storage + loads faster) */
async function compressImage(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(res => c.toBlob(res, "image/jpeg", 0.85));
  } catch {
    return null; // e.g. HEIC not supported by this browser -> upload original
  }
}

function makeFileName(file, caption, ext, index) {
  const base = (caption || file.name.replace(/\.[^.]+$/, ""))
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  return `${Date.now() + index}-${base}.${ext}`;
}

const MAX_IMAGE_MB = 15;
const MAX_AUDIO_MB = 50;

$("#uploadForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!isAdmin) { toast("Admin login required.", "error"); return; }
  const bucket = $("#upBucket").value;
  const files = [...$("#upFiles").files];
  const caption = files.length === 1 ? $("#upCaption").value.trim() : "";
  const status = $("#upStatus");
  const submit = e.submitter || $("#uploadForm button[type=submit]");
  if (!files.length) { status.textContent = "Please choose at least one file."; return; }

  // validate type + size before sending anything
  const wantImage = bucket === "photos";
  for (const f of files) {
    const typeOk = wantImage
      ? f.type.startsWith("image/")
      : f.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg|opus)$/i.test(f.name);
    if (!typeOk) { status.textContent = `"${f.name}" is not a ${wantImage ? "photo" : "audio file"}.`; return; }
    if (f.size > (wantImage ? MAX_IMAGE_MB : MAX_AUDIO_MB) * 1048576) {
      status.textContent = `"${f.name}" is too large (max ${wantImage ? MAX_IMAGE_MB : MAX_AUDIO_MB} MB).`;
      return;
    }
  }

  submit.disabled = true;
  status.classList.add("busy");
  let ok = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    status.textContent = `Uploading ${i + 1} of ${files.length}...`;
    let body = f;
    let ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";

    if (wantImage && /^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) {
      const small = await compressImage(f);
      if (small) { body = small; ext = "jpg"; }
      else if (/heic|heif/i.test(f.type + f.name)) {
        status.classList.remove("busy");
        status.textContent = `"${f.name}" is HEIC and this browser cannot convert it. Please export it as JPG.`;
        submit.disabled = false;
        return;
      }
    }
    const { error } = await sb.storage.from(bucket).upload(
      makeFileName(f, caption, ext, i), body, { contentType: body.type || f.type, upsert: false }
    );
    if (error) {
      status.classList.remove("busy");
      status.textContent = `Failed on "${f.name}": ${error.message}`;
      toast("Upload failed. " + error.message, "error");
      submit.disabled = false;
      if (ok) await loadMedia();
      return;
    }
    ok++;
  }

  status.classList.remove("busy");
  status.textContent = "";
  $("#uploadForm").reset();
  syncAccept();
  submit.disabled = false;
  await loadMedia();
  closeAdmin();
  toast(`${ok} file${ok > 1 ? "s" : ""} uploaded 🎉`);
});

/* ---------- edit / delete: photos, voice notes, songs ---------- */
async function renameFile(bucket, item, newTitle) {
  const prefix = (item.name.match(/^\d+[-_ .]*/) || [""])[0]; // keep the order number
  const dot = item.name.lastIndexOf(".");
  const ext = dot > -1 ? item.name.slice(dot) : "";
  const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (!slug) throw new Error("Please use letters or numbers in the title.");
  const newName = prefix + slug + ext;
  if (newName === item.name) return;
  const { error } = await sb.storage.from(bucket).move(item.name, newName);
  if (error) throw new Error(error.message || "Could not rename.");
}

async function editMedia(bucket, item) {
  if (!isAdmin) return;
  const saved = await editDialog({
    title: "Edit title",
    label: "Title",
    value: item.title,
    max: 60,
    save: async v => { await renameFile(bucket, item, v); await loadMedia(); }
  });
  if (saved) toast("Title updated ✓");
}

async function deleteMedia(bucket, item, card) {
  if (!isAdmin) return;
  const ok = await confirmDialog({
    title: "Delete forever?",
    message: `“${item.title}” will be removed permanently. This can't be undone.`,
    okText: "Delete",
    action: async () => {
      const { data, error } = await sb.storage.from(bucket).remove([item.name]);
      if (error) throw new Error(error.message);
      // storage returns an empty list (no error) when the database refuses the delete
      if (!data || !data.length) throw new Error("Not allowed, or the file is already gone.");
      if (card) card.classList.add("leaving");
      await sleep(240);
      await loadMedia();
    }
  });
  if (ok) toast("Deleted ✓");
}

async function editNote(n) {
  if (!isAdmin) return;
  const saved = await editDialog({
    title: "Edit note",
    label: "Note",
    value: n.message,
    max: 300,
    multiline: true,
    save: async v => {
      const { data, error } = await sb.from("notes").update({ message: v }).eq("id", n.id).select();
      if (error) throw new Error(error.message);
      if (!data || !data.length) throw new Error("Not allowed, or the note no longer exists.");
      notesCache = notesCache.map(x => (x.id === n.id ? data[0] : x));
      renderNotes(notesCache);
    }
  });
  if (saved) toast("Note updated ✓");
}

async function deleteNote(n, card) {
  if (!isAdmin) return;
  const ok = await confirmDialog({
    title: "Remove this note?",
    message: "It will disappear from the wall for everyone.",
    okText: "Remove",
    action: async () => {
      const { data, error } = await sb.from("notes").delete().eq("id", n.id).select();
      if (error) throw new Error(error.message);
      if (!data || !data.length) throw new Error("Not allowed, or the note is already gone.");
      if (card) card.classList.add("leaving");
      await sleep(240);
      notesCache = notesCache.filter(x => x.id !== n.id);
      renderNotes(notesCache);
    }
  });
  if (ok) toast("Note removed ✓");
}

/* ---------- playlist manager ---------- */
function renderSongsManager() {
  const box = $("#songsList");
  box.replaceChildren();
  if (!tracksCache.length) {
    box.append(emptyState("🎵", "No songs yet", "Use “Add songs” to upload the first one."));
    return;
  }
  tracksCache.forEach(t => {
    const row = el("div", "song-row");
    row.append(el("span", "song-name", "🎵 " + t.title));
    const acts = adminActions(() => editMedia("music", t), () => deleteMedia("music", t, row), t.title);
    acts.classList.add("always");
    row.append(acts);
    box.append(row);
  });
}
$("#songsClose").addEventListener("click", () => hideDlg($("#songsDlg")));
$("#songsAdd").addEventListener("click", () => {
  hideDlg($("#songsDlg"));
  setTimeout(() => openAdmin("music"), reduceMotion ? 0 : 260);
});

/* =========================================================
   LOAD EVERYTHING
   ========================================================= */
async function loadMedia() {
  if (!sb) {
    renderPhotos(DEMO_PHOTOS);
    renderVoices([]);
    return;
  }
  const [photos, tracks, voices] = await Promise.all([
    listFiles("photos", IMG_RE),
    listFiles("music", AUDIO_RE),
    listFiles("voices", AUDIO_RE)
  ]);
  if (!photos || !tracks || !voices) toast("Some content could not load. Check your connection.", "error");
  renderPhotos(photos || photosCache);
  renderVoices(voices || voicesCache);
  if (tracks) setupPlayer(tracks);
  if ($("#songsDlg").open) renderSongsManager();
}

/* shimmer placeholders while content loads */
function showSkeletons() {
  for (let i = 0; i < 4; i++) $("#photoWall").append(el("div", "skeleton sk-photo"));
  for (let i = 0; i < 2; i++) $("#voiceList").append(el("div", "skeleton sk-voice"));
  for (let i = 0; i < 2; i++) $("#noteBoard").append(el("div", "skeleton sk-note"));
}

/* gentle fade-in for sections as they scroll into view */
function setupReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll("main .section:not(.admin)").forEach(sec => {
    sec.classList.add("reveal");
    io.observe(sec);
  });
}

(async function init() {
  if (!sb) $("#demoBanner").classList.remove("hidden");
  showSkeletons();
  await Promise.all([loadMedia(), loadNotes()]);
  setupReveal();
  if (sb) {
    await syncAuth();
    sb.auth.onAuthStateChange(evt => {
      // setTimeout avoids calling Supabase inside its own auth callback
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(evt)) setTimeout(syncAuth, 0);
    });
  }
  refreshAdmin();
})();


/* =========================================================
   SCREEN NAVIGATION: one section per screen (History API)
   -------------------------------------------------------
   Home / Letter / Photos / Voice / Notes each open on their
   own screen. Browser Back and Forward work. Music keeps
   playing because the player lives outside the screens.
   #admin is NOT a screen: it is a modal on top of the current one.
   ========================================================= */
const SCREENS = {
  home:   { id: "top",    title: "Home",               hash: "" },
  letter: { id: "letter", title: "A letter for you",   hash: "#letter" },
  photos: { id: "photos", title: "Our little moments", hash: "#photos" },
  voices: { id: "voices", title: "Voice notes",        hash: "#voices" },
  notes:  { id: "notes",  title: "Stick a note back",  hash: "#notes" }
};
const HASH_TO_SCREEN = {
  "#top": "home", "#home": "home", "#letter": "letter",
  "#photos": "photos", "#voices": "voices", "#notes": "notes"
};
const LEAVE_MS = 200;

let currentScreen = "home";  // what is on screen now
let wantedScreen = "home";   // where we are heading (handles fast clicks)
let navIdx = 0;              // how many in-site steps we can go Back
let switching = false;

const screenEl = name => document.getElementById(SCREENS[name].id);
const routeUrl = name => location.pathname + location.search + SCREENS[name].hash;
function currentRouteHash() { return SCREENS[currentScreen].hash; }

/* "#photos" -> "photos", "" -> "home", "#admin" -> null (modal, stay put) */
function screenFromHash(hash) {
  if (hash === "#admin") return null;
  return HASH_TO_SCREEN[hash] || "home";
}

/* Back/Home bar, nav highlight, page marker */
function updateChrome() {
  $("#screenBar").classList.toggle("hidden", currentScreen === "home");
  $("#screenName").textContent = SCREENS[currentScreen].title;
  document.body.dataset.screen = currentScreen;
  document.querySelectorAll(".nav a").forEach(a => {
    if (HASH_TO_SCREEN[a.getAttribute("href")] === currentScreen) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

/* fade the old screen out, then fade the new one in; only one is ever visible */
async function renderScreen(name) {
  wantedScreen = name;
  if (switching) return; // the running loop will pick up wantedScreen
  switching = true;
  while (wantedScreen !== currentScreen) {
    const next = wantedScreen;
    const from = screenEl(currentScreen);
    const to = screenEl(next);

    from.classList.remove("entering");
    from.classList.add("leaving");
    await sleep(LEAVE_MS);
    from.classList.remove("active", "leaving");

    currentScreen = next;
    to.classList.add("active");
    if (!reduceMotion) {
      to.classList.add("entering");
      const onEnd = e => {
        if (e.animationName !== "screenIn") return;
        to.classList.remove("entering");
        to.removeEventListener("animationend", onEnd);
      };
      to.addEventListener("animationend", onEnd);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    updateChrome();
    to.focus({ preventScroll: true }); // keyboard and screen-reader users land on the new screen
  }
  switching = false;
}

/* go to a screen and add a browser-history entry */
function navigate(name, { replace = false } = {}) {
  if (!SCREENS[name]) name = "home";
  if (name === wantedScreen) return;
  try {
    if (replace) {
      history.replaceState({ screen: name, idx: navIdx }, "", routeUrl(name));
    } else {
      navIdx += 1;
      history.pushState({ screen: name, idx: navIdx }, "", routeUrl(name));
    }
  } catch (err) {
    // e.g. some file:// setups: fall back to plain hash navigation
    console.warn("History API unavailable, using hash:", err.message);
    location.hash = SCREENS[name].hash || "top";
  }
  renderScreen(name);
}

/* browser Back / Forward (and manual hash changes) */
addEventListener("popstate", e => {
  const name = screenFromHash(location.hash);
  if (name === null) return; // #admin modal: keep the current screen
  navIdx = e.state && typeof e.state.idx === "number" ? e.state.idx : 0;
  renderScreen(name);
});

/* every in-page link to a section (nav, cards, buttons) opens its screen */
document.addEventListener("click", e => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const name = HASH_TO_SCREEN[a.getAttribute("href")];
  if (!name) return; // e.g. #admin keeps its own behaviour
  e.preventDefault();
  navigate(name);
});

$("#backBtn").addEventListener("click", () => {
  if (navIdx > 0) history.back();            // real browser Back
  else navigate("home", { replace: true });  // opened via direct link: go Home
});
$("#homeBtn").addEventListener("click", () => navigate("home"));

/* open the right screen on first load, e.g. when she opens .../#photos */
(function initRouter() {
  const start = screenFromHash(location.hash) || "home";
  if (start !== "home") {
    screenEl("home").classList.remove("active");
    screenEl(start).classList.add("active");
  }
  currentScreen = wantedScreen = start;
  if (location.hash !== "#admin") {
    try { history.replaceState({ screen: start, idx: 0 }, "", routeUrl(start)); } catch (err) { /* ignore */ }
  }
  updateChrome();
})();
