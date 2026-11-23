/* =========================================================
   PASSWORD SCREEN (added at the very top)
   - Your original code is untouched: it is simply wrapped in
     startSite() below, and runs only AFTER the correct code.
   - HONEST NOTE: this is a front-end "privacy curtain", not real
     security. Anyone who reads the files can get around it.
   ========================================================= */
(function passwordScreen() {
  "use strict";

  const CODE_HASH = 4219995300484010;      // fingerprint of the access code (code itself is not stored here)
  const SALT = "hlu-gate:";
  const REMEMBER_IN_TAB = true;    // true: a refresh keeps her inside until the tab is closed
  const KEY = "hlu_unlocked";

  function hashCode(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    startSite(); // runs your original script, exactly once
  }

  const gate = document.getElementById("gate");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gateCode");
  const msg = document.getElementById("gateMsg");
  const eye = document.getElementById("gateEye");

  function openSite() {
    document.body.classList.remove("locked");
    start();
  }

  let remembered = false;
  try { remembered = REMEMBER_IN_TAB && sessionStorage.getItem(KEY) === "1"; } catch (e) { /* storage blocked */ }
  if (remembered) {
    if (gate) gate.remove();
    openSite();
    return;
  }

  function fail(text) {
    msg.textContent = text;
    input.value = "";
    form.classList.remove("shake");
    void form.offsetWidth; // restart the shake animation
    form.classList.add("shake");
    input.focus();
  }

  eye.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Hide code" : "Show code");
    eye.classList.toggle("is-on", show);
    input.focus();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) { fail("Please enter the code."); return; }
    if (hashCode(SALT + value) !== CODE_HASH) { fail("That is not the right code. Try again 💗"); return; }

    try { if (REMEMBER_IN_TAB) sessionStorage.setItem(KEY, "1"); } catch (err) { /* ignore */ }
    msg.textContent = "";
    gate.classList.add("is-open");     // fade the password screen out
    setTimeout(() => gate.remove(), 600);
    openSite();                        // reveal + start your original website
  });

  input.focus();
})();

/* =========================================================
   YOUR ORIGINAL script.js STARTS HERE (unchanged, wrapped in startSite)
   ========================================================= */
function startSite() {
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

/* =========================================================
   EXTRA CONFIG (added): edit these freely, nothing else needs changing
   ========================================================= */

/* ---------- BIRTHDAY SURPRISE ----------
   PERMANENT MEDIA: paste a public, DIRECT link to an image or a video
   between the quotes on the next line, then save the file.
     image example:  "https://example.com/our-photo.jpg"
     video example:  "https://drive.google.com/file/d/1BURFNeK9UigH2ngiRgb50IXx4nnHsTds/view?usp=drivesdk"
   Leave it as "" and the surprise still works (message + confetti).
   (Nothing is uploaded anywhere by the website.) */
const SURPRISE_MEDIA_URL = "";
const SURPRISE_MEDIA_TYPE = "auto";   // "auto" | "image" | "video"  (auto guesses from the link)
const SURPRISE_TITLE = "Happy Birthday, {name}!";
const SURPRISE_MESSAGE = [
  "Aaj ka din poori tarah tumhara hai. Ye chhota sa gift box maine sirf tumhare liye sajaya hai.",
  "Tum meri life ki sabse khoobsurat surprise ho, Suhu. Hamesha hasti raho, hamesha aise hi chamakti raho.",
  "Happy Birthday, my love."
];

/* ---------- OPEN WHEN LETTERS ----------
   Each letter = one card. Change the words freely.
   {name} becomes her nickname and {from} becomes your name.
   icon options: smile, cloud-rain, heart, moon, shield, cake, mail-open, sparkles */
const OPEN_WHEN_LETTERS = [
  {
    icon: "smile",
    kicker: "Open when",
    title: "you're happy",
    message: [
      "Tumhe khush dekhna meri favourite cheez hai, {name}. Aaj jo bhi wajah hai is khushi ki, mujhe usse pyaar ho gaya hai.",
      "Is pal ko poori tarah jee lo. Hans lo, naach lo, photos kheench lo. Aur mujhe zaroor batana, kyunki tumhari khushi mere liye bhi celebration hai.",
      "Bas itna yaad rakhna: tum jab muskurati ho, to meri duniya bhi halki aur roshan ho jaati hai."
    ]
  },
  {
    icon: "cloud-rain",
    kicker: "Open when",
    title: "you're sad",
    message: [
      "Aaj ka din bhaari hai na? Main wahan nahi hu to bhi, dil se tumhare bagal mein hi baitha hu.",
      "Ek gehri saans lo. Thoda paani piyo. Rona ho to ro lo, kyunki rona kamzori nahi hota. Ye din bhi guzar jayega, hamesha guzarta hai.",
      "Main har cheez theek nahi kar sakta, par tumhari baat sun sakta hu, jitni der tak tum chaho. Jab bhi mann kare, mujhe bata dena. Bina kisi wajah ke bhi."
    ]
  },
  {
    icon: "heart",
    kicker: "Open when",
    title: "you miss me",
    message: [
      "Agar tum mujhe miss kar rahi ho, to jaan lo ki main bhi tumhe miss kar raha hu, shayad tumse zyada.",
      "Door hone se kuch kam nahi hota, bas intezaar thoda lamba ho jaata hai. Voice notes dobara sun lo, photos dekh lo, aur hamare purane pal yaad kar lo.",
      "Aur jab hum milenge, ye saara intezaar bhool jayenge. Tab tak, mera ek bada sa hug tumhare liye."
    ]
  },
  {
    icon: "moon",
    kicker: "Open",
    title: "before you sleep",
    message: [
      "Aaj ka din chahe jaisa bhi gaya ho, ab usse yahin chhod do. Phone side mein rakho aur ek lambi saans lo.",
      "Tumne aaj bahut kuch sambhala hoga, bina kisi ko bataye. Ab aaram ka waqt hai. Tum kaafi ho, jaisi ho waisi hi.",
      "Good night, {name}. Meethe sapne dekhna, aur subah ek nayi muskurahat ke saath uthna."
    ]
  },
  {
    icon: "shield",
    kicker: "Open when",
    title: "you doubt yourself",
    message: [
      "Jab bhi tumhe khud par shak ho, ek baat yaad rakhna: tum utni hi kaabil ho jitna tum sochti ho, aur usse kahin zyada.",
      "Galtiyan sabse hoti hain, aur har galti ke baad tum pehle se zyada strong banti ho. Mujhe tumhari perfection nahi chahiye, mujhe tum chahiye.",
      "Main tumhare saath hu, har faisle mein, har darr mein, har naye kadam mein."
    ]
  },
  {
    icon: "cake",
    kicker: "Open",
    title: "on your birthday",
    message: [
      "Happy Birthday, {name}! Aaj ka din sirf tumhara hai.",
      "Dil se dua hai ki ye saal tumhe wo sab de jo tumne chaha hai, aur wo bhi jo tumne kabhi maanga nahi. Khoob khushiyan, khoob sukoon, aur khoob saari hansi.",
      "Mujhe tumse milna meri life ki sabse achhi baaton mein se ek lagta hai. Ek wish maango, aur use dil mein rakhna."
    ]
  }
];

/* ---------- tiny helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ---------- icons (inline SVG sprite defined in index.html) ---------- */
const SVG_NS = "http://www.w3.org/2000/svg";
function iconEl(name, cls) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "ico" + (cls ? " " + cls : ""));
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", "#i-" + name);
  svg.append(use);
  return svg;
}
/* put an icon (and optional label) inside a button */
function setBtn(btn, name, text) {
  btn.replaceChildren(iconEl(name));
  if (text) btn.append(document.createTextNode(" " + text));
}
/* decorative animations switched off in Settings? */
const noAnim = () => document.body.classList.contains("no-anim");

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
  const ic = el("span", "toast-icon");
  ic.append(iconEl(type === "error" ? "alert" : "sparkles"));
  t.append(ic, el("span", "", message));
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
    $("#editCount").textContent = `${value.length} / ${max}`;
    let saved = false;

    const onInput = () => {
      $("#editErr").textContent = "";
      $("#editCount").textContent = `${input.value.length} / ${max}`;
    };
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
  const edit = el("button", "mini-btn");
  const del = el("button", "mini-btn danger");
  edit.append(iconEl("pencil"));
  del.append(iconEl("trash"));
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
  const icons = ["heart-fill", "sparkles", "star", "flower", "heart-fill", "sparkles", "star", "flower"];
  const tints = ["#ff8fab", "#d9c6ea", "#ffe29a", "#ffc8a2", "#f06a8e", "#bfe5d6"];
  const box = $("#floaters");
  for (let i = 0; i < 16; i++) {
    const s = el("span", "floater");
    s.append(iconEl(icons[i % icons.length]));
    s.style.color = tints[i % tints.length];
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
  if (reduceMotion || noAnim()) return;
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
  $("#songTitle").textContent = songs[cur].title;
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
  setBtn($("#muteBtn"), music.muted ? "volume-x" : "volume");
});
$("#seek").addEventListener("input", e => {
  if (music.duration) music.currentTime = (e.target.value / 100) * music.duration;
});
music.addEventListener("play",  () => { setBtn($("#playBtn"), "pause"); $("#player").classList.add("is-playing"); });
music.addEventListener("pause", () => { setBtn($("#playBtn"), "play"); $("#player").classList.remove("is-playing"); });
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

/* =========================================================
   EXTRA TEXT FOR MEDIA TITLES (emoji + long captions)
   A photo's title is stored in its storage FILE NAME, and file names cannot hold
   emoji or thousands of characters. So when a title does not fit in the file name,
   the full text is kept in a tiny "_meta.json" file in the same bucket.
   - Existing files and their names are never touched.
   - Titles that fit in the file name (most of them) behave exactly as before.
   - If _meta.json is missing or unreadable, the old file-name titles are shown.
   ========================================================= */
const META_FILE = "_meta.json";
const TITLE_MAX = { photos: 20000, music: 60, voices: 60 }; // characters per title / caption

/* returns {} when there is no file yet, null when it could not be read (never overwrite then) */
async function loadMeta(bucket) {
  if (!sb) return {};
  try {
    const url = sb.storage.from(bucket).getPublicUrl(META_FILE).data.publicUrl + "?t=" + Date.now();
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 400 || res.status === 404) return {};
    if (!res.ok) return null;
    const raw = await res.json();
    const out = {};
    if (raw && typeof raw === "object") {
      Object.keys(raw).forEach(k => { if (raw[k] && typeof raw[k].t === "string") out[k] = { t: raw[k].t }; });
    }
    return out;
  } catch (e) {
    return null;
  }
}
async function saveMeta(bucket, meta) {
  const blob = new Blob([JSON.stringify(meta)], { type: "application/json" });
  const { error } = await sb.storage.from(bucket).upload(META_FILE, blob, {
    upsert: true, contentType: "application/json", cacheControl: "0"
  });
  if (error) throw new Error("Could not save the full text: " + error.message);
}
const titleNeedsMeta = (name, title) => title !== prettify(name);
const altText = t => Array.from(String(t)).slice(0, 150).join(""); // image alt text stays short

async function listFiles(bucket, regex) {
  if (!sb) return [];
  const { data, error } = await sb.storage.from(bucket).list("", {
    limit: 200,
    sortBy: { column: "name", order: "asc" }
  });
  if (error) { console.warn(`Could not list "${bucket}":`, error.message); return null; }
  const meta = (await loadMeta(bucket)) || {};
  return data
    .filter(f => f.id && !f.name.startsWith(".") && regex.test(f.name))
    .map(f => ({
      name: f.name,
      title: (meta[f.name] && meta[f.name].t) || prettify(f.name),
      url: sb.storage.from(bucket).getPublicUrl(f.name).data.publicUrl
    }));
}

function emptyState(icon, title, hint) {
  const box = el("div", "empty");
  const head = el("b", "");
  head.append(iconEl(icon, "empty-ico"), document.createTextNode(" " + title));
  box.append(head, el("span", "muted", hint));
  return box;
}

/* =========================================================
   PHOTO WALL + LIGHTBOX
   ========================================================= */
const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3.5, 2];
const STICKERS = ["heart-fill", "flower", "star", "sparkles", "heart-fill", "flower", "star", "sparkles"];
function stickerEl(i) {
  const st = el("span", "sticker st-" + (i % 4));
  st.append(iconEl(STICKERS[i % STICKERS.length]));
  return st;
}
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
    wall.append(emptyState("image", "Photos are on the way",
      isAdmin ? "Tap Add in the admin bar to upload the first photo." : "Something sweet is coming soon 💗"));
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
      img.alt = altText(p.title);
      img.src = p.url;
      frame.append(img);
    }

    fig.append(
      el("span", "tape " + TAPES[i % TAPES.length]),
      frame,
      el("figcaption", "", p.title),
      stickerEl(i)
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

let lbIndex = -1;
function openLightbox(p) {
  lbIndex = photosCache.indexOf(p);
  const stage = $("#lbStage");
  stage.replaceChildren();
  if (p.demo) {
    const d = el("div", "lb-demo", p.emoji);
    d.style.background = p.bg;
    stage.append(d);
  } else {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = altText(p.title);
    stage.append(img);
  }
  $("#lbCap").textContent = p.title;
  const several = lbIndex >= 0 && photosCache.length > 1;
  $("#lbPrev").classList.toggle("hidden", !several);
  $("#lbNext").classList.toggle("hidden", !several);
  $("#lightbox").classList.remove("hidden");
  $("#lbClose").focus();
}
function closeLightbox() { $("#lightbox").classList.add("hidden"); }
function stepLightbox(dir) {
  if (lbIndex < 0 || photosCache.length < 2) return;
  lbIndex = (lbIndex + dir + photosCache.length) % photosCache.length;
  openLightbox(photosCache[lbIndex]);
}
$("#lbClose").addEventListener("click", closeLightbox);
$("#lbPrev").addEventListener("click", e => { e.stopPropagation(); stepLightbox(-1); });
$("#lbNext").addEventListener("click", e => { e.stopPropagation(); stepLightbox(1); });
$("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
  if ($("#lightbox").classList.contains("hidden")) return;
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});
(function lightboxSwipe() {
  let x0 = null;
  const lb = $("#lightbox");
  lb.addEventListener("touchstart", e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

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
    box.append(emptyState("mic", "Voice notes are coming soon",
      isAdmin ? "Tap Add, then choose “Voice messages”." : "Something to listen to, just for you 💗"));
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
    const btn = el("button", "v-play");
    btn.append(iconEl("play"));
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

    audio.addEventListener("play", () => setBtn(btn, "pause"));
    audio.addEventListener("pause", () => { setBtn(btn, "play"); resumeMusicIfNeeded(); });
    audio.addEventListener("ended", () => { setBtn(btn, "play"); fill.style.width = "0"; });
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
    board.append(emptyState("note", "The wall is empty", "Be the first to stick a note!"));
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
    $("#noteBoard").replaceChildren(emptyState("alert", "Notes could not load", "Check that the notes table exists in Supabase."));
    return;
  }
  notesCache = data;
  renderNotes(notesCache);
}

const NOTE_MAX = 2000; // characters per note

/* friendly text when the database refuses a note (e.g. its own, older length limit) */
function noteErrorText(error) {
  const msg = (error && error.message) || "";
  if ((error && error.code === "23514") || /check constraint|too long|violates/i.test(msg)) {
    return "This note is longer than your database currently accepts. Nothing was lost: your text is still here. Try a shorter note.";
  }
  return "The note could not be saved: " + msg;
}

$("#noteText").addEventListener("input", e => {
  const len = e.target.value.length;
  $("#noteCount").textContent = `${len} / ${NOTE_MAX}`;
  $("#noteCount").classList.toggle("near-limit", len > NOTE_MAX * 0.9);
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
      toast(noteErrorText(error), "error");
      submit.disabled = false;
      return;
    }
    notesCache.unshift(data);
    renderNotes(notesCache);
  }
  input.value = "";
  $("#noteCount").textContent = "0 / " + NOTE_MAX;
  $("#noteCount").classList.remove("near-limit");
  submit.disabled = false;
  toast("Note stuck on the wall");
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
    setBtn(abEdit, "pencil", "Edit mode");
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
$("#upCaption").addEventListener("input", e => {
  $("#upCaptionCount").textContent = `${e.target.value.length} / ${TITLE_MAX.photos}`;
});

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
  toast("Logged out. See you soon");
}
$("#logoutBtn").addEventListener("click", logout);
$("#abLogout").addEventListener("click", logout);

/* ---------- toolbar ---------- */
$("#abUpload").addEventListener("click", () => openAdmin("photos"));
$("#abSongs").addEventListener("click", () => { renderSongsManager(); showDlg($("#songsDlg")); });
abEdit.addEventListener("click", () => {
  const on = document.body.classList.toggle("edit-mode");
  abEdit.setAttribute("aria-pressed", String(on));
  if (on) setBtn(abEdit, "check", "Done"); else setBtn(abEdit, "pencil", "Edit mode");
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
  const capMax = TITLE_MAX[bucket] || 60;
  if (caption.length > capMax) { status.textContent = `The caption is too long for this type (max ${capMax} characters).`; return; }

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
  const newTitles = {}; // full captions that do not fit in a file name
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
    const objName = makeFileName(f, caption, ext, i);
    const { error } = await sb.storage.from(bucket).upload(
      objName, body, { contentType: body.type || f.type, upsert: false }
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
    if (caption && titleNeedsMeta(objName, caption)) newTitles[objName] = { t: caption };
  }

  if (Object.keys(newTitles).length) { // keep the emoji / long caption next to the photo
    try {
      const meta = await loadMeta(bucket);
      if (meta === null) throw new Error("Could not read the saved titles.");
      Object.assign(meta, newTitles);
      await saveMeta(bucket, meta);
    } catch (err) {
      toast("Uploaded, but the full caption could not be saved: " + err.message, "error");
    }
  }

  status.classList.remove("busy");
  status.textContent = "";
  $("#uploadForm").reset();
  $("#upCaptionCount").textContent = "0 / " + TITLE_MAX.photos;
  syncAccept();
  submit.disabled = false;
  await loadMedia();
  closeAdmin();
  toast(`${ok} file${ok > 1 ? "s" : ""} uploaded`);
});

/* ---------- edit / delete: photos, voice notes, songs ---------- */
async function renameFile(bucket, item, newTitle) {
  const prefix = (item.name.match(/^\d+[-_ .]*/) || [""])[0]; // keep the order number
  const dot = item.name.lastIndexOf(".");
  const ext = dot > -1 ? item.name.slice(dot) : "";
  const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "caption";
  const newName = prefix + slug + ext;

  // 1) save the full text for the new name first (harmless if the rename below fails)
  const meta = await loadMeta(bucket);
  if (meta === null) throw new Error("Could not read the saved titles. Please try again.");
  const hadOld = !!meta[item.name];
  const before = JSON.stringify(meta);
  if (titleNeedsMeta(newName, newTitle)) meta[newName] = { t: newTitle }; else delete meta[newName];
  if (newName === item.name && hadOld && !meta[newName]) delete meta[item.name];
  if (JSON.stringify(meta) !== before) await saveMeta(bucket, meta);

  // 2) rename the file only when its name really changes
  if (newName !== item.name) {
    const { error } = await sb.storage.from(bucket).move(item.name, newName);
    if (error) throw new Error(error.message || "Could not rename.");
    // 3) forget the old name's text (best effort)
    if (hadOld) {
      try { delete meta[item.name]; await saveMeta(bucket, meta); } catch (e) { /* harmless leftover */ }
    }
  }
}

async function editMedia(bucket, item) {
  if (!isAdmin) return;
  const saved = await editDialog({
    title: "Edit title",
    label: bucket === "photos" ? "Caption / title (emoji and line breaks are fine)" : "Title",
    value: item.title,
    max: TITLE_MAX[bucket] || 60,
    multiline: bucket === "photos",
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
      try { // forget the stored full title, if any
        const meta = await loadMeta(bucket);
        if (meta && meta[item.name]) { delete meta[item.name]; await saveMeta(bucket, meta); }
      } catch (e) { /* harmless leftover */ }
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
    max: NOTE_MAX,
    multiline: true,
    save: async v => {
      const { data, error } = await sb.from("notes").update({ message: v }).eq("id", n.id).select();
      if (error) throw new Error(noteErrorText(error));
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
    box.append(emptyState("music", "No songs yet", "Use “Add songs” to upload the first one."));
    return;
  }
  tracksCache.forEach(t => {
    const row = el("div", "song-row");
    const nm = el("span", "song-name");
    nm.append(iconEl("music"), document.createTextNode(" " + t.title));
    row.append(nm);
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
  if (!sb) { $("#demoBanner").classList.remove("hidden"); document.body.classList.add("is-demo"); }
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
  notes:  { id: "notes",  title: "Stick a note back",  hash: "#notes" },
  open:     { id: "open",     title: "Open when...",      hash: "#open" },
  surprise: { id: "surprise", title: "Birthday surprise", hash: "#surprise" },
  settings: { id: "settings", title: "Settings",          hash: "#settings" }
};
const HASH_TO_SCREEN = {
  "#top": "home", "#home": "home", "#letter": "letter",
  "#photos": "photos", "#voices": "voices", "#notes": "notes",
  "#open": "open", "#surprise": "surprise", "#settings": "settings"
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
    if (HASH_TO_SCREEN[a.getAttribute("href")] === currentScreen) {
      a.setAttribute("aria-current", "page");
      // keep the active tab in view when the nav scrolls sideways (small screens)
      const nav = a.parentElement;
      if (nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
    } else a.removeAttribute("aria-current");
  });
  // a video inside the surprise should not keep playing on another screen
  if (currentScreen !== "surprise") document.querySelectorAll("#surpriseMedia video, #surprisePreview video").forEach(v => v.pause());
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


/* =========================================================
   OPEN WHEN... LETTERS  (words live in OPEN_WHEN_LETTERS at the top)
   ========================================================= */
(function openWhenLetters() {
  const grid = $("#openGrid");
  const dlg = $("#owDlg");
  const fill = t => String(t).replace(/\{name\}/g, CONFIG.NAME).replace(/\{from\}/g, CONFIG.FROM);
  let lastCard = null;

  function openLetter(l, card) {
    lastCard = card;
    $("#owKicker").textContent = l.kicker || "Open when";
    $("#owTitle").textContent = fill(l.title);
    const box = $("#owText");
    box.replaceChildren();
    (Array.isArray(l.message) ? l.message : [l.message]).forEach(t => box.append(el("p", "", fill(t))));
    $("#owSign").textContent = "Always yours, " + CONFIG.FROM;
    card.classList.add("is-opening"); // the little envelope flap opens first
    setTimeout(() => {
      showDlg(dlg);
      $("#owClose").focus();
      setTimeout(() => card.classList.remove("is-opening"), 400);
    }, reduceMotion || noAnim() ? 0 : 320);
  }

  OPEN_WHEN_LETTERS.forEach((l, i) => {
    const card = el("button", "ow-card");
    card.type = "button";
    card.style.setProperty("--r", [-2, 1.5, -1, 2, -1.5, 1][i % 6] + "deg");
    card.style.setProperty("--d", i * 70 + "ms");
    card.setAttribute("aria-label", `${l.kicker || "Open when"} ${fill(l.title)}`);
    const ico = el("span", "ow-ico");
    ico.append(iconEl(l.icon || "mail-open"));
    const seal = el("span", "ow-seal");
    seal.append(iconEl("heart-fill"));
    card.append(
      el("span", "tape tape-" + (i % 3)),
      el("span", "ow-flap"),
      ico,
      el("span", "ow-card-kicker", l.kicker || "Open when"),
      el("span", "ow-card-title", fill(l.title)),
      seal
    );
    card.addEventListener("click", () => openLetter(l, card));
    grid.append(card);
  });

  $("#owClose").addEventListener("click", () => hideDlg(dlg));
  dlg.addEventListener("close", () => { if (lastCard) lastCard.focus(); });
})();

/* =========================================================
   BIRTHDAY SURPRISE: 3D gift box
   - spins forever until touched, then stops, lid opens, surprise appears
   - media: SURPRISE_MEDIA_URL (permanent) or a local preview (this device only)
   ========================================================= */
(function birthdaySurprise() {
  const stage = $("#giftStage");
  const spin = $("#giftSpin");
  const btn = $("#giftBtn");
  const hint = $("#giftHint");
  const reveal = $("#surpriseReveal");
  const fill = t => String(t).replace(/\{name\}/g, CONFIG.NAME).replace(/\{from\}/g, CONFIG.FROM);
  const HINT_TEXT = "A little surprise is waiting for you. Tap the gift box.";
  let opened = false;
  let timers = [];
  let localUrl = null;
  let localType = "";

  /* build the cube faces for the box and the lid */
  ["front", "back", "right", "left", "top", "bottom"].forEach(n => {
    $("#giftBody").append(el("div", "gf f-" + n));
    $("#giftLid").append(el("div", "gf f-" + n));
  });
  const bow = el("div", "gift-bow");
  ["bow-a", "bow-b"].forEach(c => {
    const plane = el("div", "bow-plane " + c);
    plane.append(el("i", "loop loop-l"), el("i", "loop loop-r"));
    bow.append(plane);
  });
  bow.append(el("i", "bow-knot"));
  $("#giftLid").append(bow);

  /* floating hearts and sparkles around the box */
  (function particles() {
    const box = $("#giftParticles");
    const names = ["heart-fill", "sparkles", "star", "heart-fill", "sparkles", "flower"];
    const tints = ["#ff8fab", "#ffd36b", "#d9c6ea", "#f06a8e", "#ffc8a2", "#bfe5d6"];
    for (let i = 0; i < 14; i++) {
      const p = el("span", "gp");
      p.append(iconEl(names[i % names.length]));
      p.style.left = 6 + Math.random() * 88 + "%";
      p.style.fontSize = 12 + Math.random() * 14 + "px";
      p.style.color = tints[i % tints.length];
      p.style.animationDuration = 6 + Math.random() * 6 + "s";
      p.style.animationDelay = -Math.random() * 10 + "s";
      box.append(p);
    }
  })();

  const later = (fn, ms) => timers.push(setTimeout(fn, reduceMotion || noAnim() ? 0 : ms));

  /* freeze the spin and glide to face the front */
  function stopSpin() {
    let deg = 0;
    try {
      const m = new DOMMatrixReadOnly(getComputedStyle(spin).transform);
      deg = Math.atan2(m.m31, m.m11) * 180 / Math.PI;
    } catch (e) { /* no matrix support: just settle */ }
    if (deg < 0) deg += 360;
    spin.style.animation = "none";
    spin.style.transition = "none";
    spin.style.transform = `rotateY(${deg}deg)`;
    void spin.offsetWidth; // apply the frozen angle before animating
    spin.style.transition = "transform .9s cubic-bezier(.2,.8,.2,1)";
    spin.style.transform = "rotateY(360deg)";
  }

  function mediaSource() {
    if (localUrl) return { url: localUrl, type: localType };
    const url = String(SURPRISE_MEDIA_URL || "").trim();
    if (!url) return null;
    let type = SURPRISE_MEDIA_TYPE;
    if (type !== "image" && type !== "video") {
      const ext = (url.split("?")[0].split("#")[0].split(".").pop() || "").toLowerCase();
      if (/^(jpe?g|png|gif|webp|avif|svg|bmp)$/.test(ext)) type = "image";
      else if (/^(mp4|webm|ogv|ogg|mov|m4v)$/.test(ext)) type = "video";
      else type = "unknown";
    }
    return { url, type };
  }

  function makeVideo(url, onFail) {
    const v = document.createElement("video");
    v.controls = true;          // play / pause / seek
    v.playsInline = true;
    v.preload = "metadata";
    v.src = url;
    v.addEventListener("error", onFail);
    let resume = false;         // lower the music while the video plays
    v.addEventListener("play", () => { if (!music.paused) { resume = true; music.pause(); } });
    const back = () => { if (resume) { resume = false; playMusic(); } };
    v.addEventListener("pause", back);
    v.addEventListener("ended", back);
    return v;
  }

  function renderMedia() {
    const box = $("#surpriseMedia");
    box.replaceChildren();
    box.classList.remove("has-media");
    const src = mediaSource();
    if (!src) return; // default surprise: message + confetti only
    const fail = () => {
      box.classList.remove("has-media");
      box.replaceChildren(el("p", "sr-fail",
        "This file could not be shown. Please use a JPG/PNG image or an MP4 (H.264) / WebM video."));
    };
    let node;
    if (src.type === "video") {
      node = makeVideo(src.url, fail);
    } else {
      node = document.createElement("img");
      node.alt = "Your birthday surprise";
      node.addEventListener("error", () => {
        if (src.type === "unknown") { // not an image: maybe it is a video
          box.replaceChildren(makeVideo(src.url, fail));
          box.classList.add("has-media");
        } else fail();
      });
      node.src = src.url;
    }
    box.append(node);
    box.classList.add("has-media");
  }

  function showReveal() {
    $("#surpriseTitle").textContent = fill(SURPRISE_TITLE);
    const text = $("#surpriseText");
    text.replaceChildren();
    SURPRISE_MESSAGE.forEach(t => text.append(el("p", "", fill(t))));
    renderMedia(); // media appears only now, after the visitor interacted
    $("#surprisePreview").querySelectorAll("video").forEach(v => v.pause()); // never two videos at once
    reveal.classList.remove("hidden");
    reveal.classList.add("is-in");
    burst(220);
    later(() => reveal.scrollIntoView({ behavior: reduceMotion || noAnim() ? "auto" : "smooth", block: "center" }), 250);
  }

  function openGift() {
    if (opened) return;
    opened = true;
    btn.setAttribute("aria-expanded", "true");
    hint.textContent = "";
    stopSpin();
    later(() => { stage.classList.add("is-open"); burst(80); }, 900);   // lid lifts
    later(showReveal, 1900);                                           // then the surprise
  }

  function closeGift() {
    timers.forEach(clearTimeout);
    timers = [];
    opened = false;
    btn.setAttribute("aria-expanded", "false");
    stage.classList.remove("is-open");
    reveal.classList.add("hidden");
    reveal.classList.remove("is-in");
    $("#surpriseMedia").querySelectorAll("video").forEach(v => v.pause());
    $("#surpriseMedia").replaceChildren();
    spin.style.removeProperty("animation");   // back to the endless rotation
    spin.style.removeProperty("transition");
    spin.style.removeProperty("transform");
    hint.textContent = HINT_TEXT;
    stage.scrollIntoView({ behavior: reduceMotion || noAnim() ? "auto" : "smooth", block: "center" });
    btn.focus();
  }

  btn.addEventListener("click", openGift);
  $("#giftReplay").addEventListener("click", closeGift);

  /* local preview (this device only, nothing is uploaded) */
  const fileInput = $("#surpriseFile");
  const fileMsg = $("#surpriseFileMsg");
  const clearBtn = $("#surpriseClear");
  const DEFAULT_MSG = fileMsg.textContent;

  const VIDEO_EXT = /\.(mp4|m4v|webm|ogv|ogg|mov|mkv)$/i;
  const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg|bmp|heic|heif)$/i;
  const preview = $("#surprisePreview");

  /* small preview right in the picker, so the file can be checked before the gift is opened */
  function showPreview() {
    preview.replaceChildren();
    if (!localUrl) { preview.classList.add("hidden"); return; }
    const fail = () => preview.replaceChildren(el("p", "sr-fail",
      "This file could not be played or shown by your browser. Please use a JPG/PNG image or an MP4 (H.264) / WebM video."));
    if (localType === "video") {
      preview.append(makeVideo(localUrl, fail)); // native controls: play, pause, volume, seek
    } else {
      const img = document.createElement("img");
      img.alt = "Preview of your surprise";
      img.addEventListener("error", fail);
      img.src = localUrl;
      preview.append(img);
    }
    preview.classList.remove("hidden");
  }

  fileInput.addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // some devices report an empty type for videos, so the file extension counts too
    const isVid = f.type.startsWith("video/") || VIDEO_EXT.test(f.name);
    const isImg = !isVid && (f.type.startsWith("image/") || IMAGE_EXT.test(f.name));
    if (!isImg && !isVid) {
      fileMsg.textContent = "Please choose an image (JPG, PNG, WebP, GIF) or a video (MP4, WebM).";
      e.target.value = "";
      return;
    }
    if (localUrl) URL.revokeObjectURL(localUrl);
    localUrl = URL.createObjectURL(f);
    localType = isVid ? "video" : "image";
    clearBtn.disabled = false;

    let hint = "";
    if (isVid) {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      const mime = f.type || { mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", ogv: "video/ogg", ogg: "video/ogg", mov: "video/quicktime", mkv: "video/x-matroska" }[ext] || "";
      const probe = document.createElement("video");
      if (mime && probe.canPlayType && probe.canPlayType(mime) === "") {
        hint = ` This browser may not play .${ext} files. MP4 (H.264) or WebM is safest.`;
      }
    }
    fileMsg.textContent = `Previewing “${f.name}” on this device only. Nothing was uploaded.` + hint +
      (opened ? "" : " Tap the gift box to see it inside the surprise.");
    showPreview();
    if (opened) renderMedia();
  });

  clearBtn.addEventListener("click", () => {
    if (localUrl) URL.revokeObjectURL(localUrl);
    localUrl = null;
    localType = "";
    fileInput.value = "";
    clearBtn.disabled = true;
    fileMsg.textContent = DEFAULT_MSG;
    showPreview();
    if (opened) renderMedia();
  });
})();

/* =========================================================
   SETTINGS: theme + animations (saved on this device only)
   Only these two choices are stored. No passwords, no private data.
   ========================================================= */
(function settingsPanel() {
  const KEY = "hlu_settings";
  const st = { theme: "pink", animations: !reduceMotion };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") {
      if (saved.theme === "pink" || saved.theme === "midnight") st.theme = saved.theme;
      if (typeof saved.animations === "boolean") st.animations = saved.animations;
    }
  } catch (e) { /* storage blocked or corrupt: use defaults */ }

  function apply() {
    document.body.dataset.theme = st.theme;
    document.body.classList.toggle("no-anim", !st.animations);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", st.theme === "midnight" ? "#1b1630" : "#ffd6e0");
    document.querySelectorAll('input[name="theme"]').forEach(r => { r.checked = r.value === st.theme; });
    $("#setAnim").checked = st.animations;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll('input[name="theme"]').forEach(r => {
    r.addEventListener("change", () => {
      if (!r.checked) return;
      st.theme = r.value;
      apply();
      save();
      toast(st.theme === "midnight" ? "Midnight lavender theme on" : "Original pink theme on");
    });
  });
  $("#setAnim").addEventListener("change", e => {
    st.animations = e.target.checked;
    apply();
    save();
    toast(st.animations ? "Decorative animations on" : "Decorative animations off");
  });
  apply();
})();

} // end of startSite(): your original script ends here
