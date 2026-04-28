const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  overlay: document.getElementById("overlay"),
  start: document.getElementById("startButton"),
  score: document.getElementById("score"),
  hp: document.getElementById("hp"),
  fame: document.getElementById("fame"),
  punk: document.getElementById("punk"),
  policeSpeed: document.getElementById("policeSpeed"),
  invincible: document.getElementById("invincible"),
  strum: document.getElementById("strum"),
  power: document.getElementById("power"),
  rock: document.getElementById("rock"),
  skill: document.getElementById("skill"),
  concert: document.getElementById("concert"),
  punkToggle: document.getElementById("punkToggle"),
  location: document.getElementById("location"),
  crew: document.getElementById("crew"),
  titleStatus: document.getElementById("titleStatus"),
  buffs: document.getElementById("buffs"),
  shopTitle: document.getElementById("shopTitle"),
  shopItems: document.getElementById("shopItems"),
  shopHint: document.getElementById("shopHint"),
  log: document.getElementById("log"),
  scoreForm: document.getElementById("scoreForm"),
  finalScore: document.getElementById("finalScore"),
  playerName: document.getElementById("playerName"),
  scoreStatus: document.getElementById("scoreStatus"),
  scoreList: document.getElementById("scoreList"),
  refreshScores: document.getElementById("refreshScores"),
  gestureKnob: document.querySelector(".gesture-knob")
};

const INITIAL_WORLD_W = 4200;
const INITIAL_WORLD_H = 3000;
const WORLD_EXPAND_STEP = 2400;
const WORLD_EDGE_TRIGGER = 920;
const WORLD_EDGE_BUFFER = 42;
const WORLD_CHAIN_EXPANSIONS = 2;
const ROAD_W = 132;
const SHOP_KEYS = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8"];
const SHOP_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const LOCATIONS = ["뉴욕", "런던", "옴스크", "서울", "브리즈번"];
const LOCATION_TARGET = 20000;
const CREW_OFFER_INTERVAL = 300;
const MAX_PARTY_SIZE = 3;
const MAX_CREW = MAX_PARTY_SIZE - 1;
const POLICE_RESPAWN_INTERVAL = 18;
const POLICE_MAX = 9;
const POLICE_ATTACK_MULTIPLIER = 2;
const NOTE_DAMAGE = 58;
const POWER_NOTE_DAMAGE = 82;
const FAME_TIGER_TARGET = 1000;
const ATLANTIC_FAME_TARGET = 500;
const PUNK_TARGET = 500;
const CANVAS_MIN_W = 1;
const CANVAS_MIN_H = 1;
const JOSEON_PUNK_DURATION = 10;
const JOSEON_PUNK_RADIUS = 210;
const JOSEON_PUNK_DAMAGE_PER_SECOND = 92;
const JOSEON_PUNK_HEAL_PER_SECOND = 28;
const JOSEON_PUNK_KNOCKBACK_PER_SECOND = 185;
const JOSEON_PUNK_MIN_HP_RATIO = 0.18;
const PSYCHEDELIA_DURATION = 3;
const RIFF_BPM = 160;
const RIFF_STEPS_PER_BAR = 8;
const RIFF_STEP_SECONDS = 60 / RIFF_BPM / 2;
const BASE_MUSIC_GAIN = 0.08;
const CONCERT_MUSIC_MULTIPLIER = 1.2;
const RIFF_NOTES = [
  ...Array(16).fill("E4"),
  ...Array(8).fill("A4"),
  ...Array(4).fill("B4"),
  "A4", "A4", "G#4", "G#4",
  "F#4", "F#4", "E4", null
];
const NOTE_FREQUENCIES = {
  "E4": 329.63,
  "F#4": 369.99,
  "G#4": 415.3,
  "A4": 440,
  "B4": 493.88
};
const PUNK_TRACKS = {
  street: "https://www.gr-oborona.ru/mp3/1985-poganaja_molodezh/01.mp3",
  boss: "https://www.gr-oborona.ru/mp3/1993-sto_let_odinochestva/02.mp3"
};

const clearTitles = {
  tiger: {
    name: "언더 씬의 맹호",
    desc: "당신은 펑크의 맹호입니다. 당신의 동료들은 떠나기도 남기도 했지만, 록은 죽지 않습니다."
  },
  immortal: {
    name: "불멸의 펑크족",
    desc: "명성을 포기하고 펑크를 택한 당신! 그러나 언젠간 단순 심볼이 될까요?"
  },
  symbol: {
    name: "펑크의 심볼",
    desc: "쇼 비즈니스의 심볼인 당신은 저택에 사는 부자가 되었습니다. 화이트 와인을 든 당신의 손목에는 'PUNK NOT DEAD' 타투가 어색하게 가려져 있습니다."
  }
};

const characters = {
  egor: {
    name: "예고르",
    attack: 2,
    defense: 1.5,
    health: 0.8,
    capital: 1,
    powerScore: 2,
    color: "#b81f35"
  },
  roman: {
    name: "로만",
    attack: 1,
    defense: 2,
    health: 1,
    capital: 1,
    powerScore: 1,
    color: "#3159aa"
  },
  didiramon: {
    name: "디디라몬",
    attack: 1.5,
    defense: 1,
    health: 1.2,
    capital: 1.2,
    powerScore: 1.3,
    color: "#2cb673"
  },
  jundai: {
    name: "준다이",
    attack: 1.5,
    defense: 0.8,
    health: 2,
    capital: 1,
    powerScore: 1.1,
    color: "#d843bf"
  },
  kuznetsov: {
    name: "쿠즈네초프",
    attack: 1.2,
    defense: 3,
    health: 0.7,
    capital: 1,
    powerScore: 1.15,
    color: "#f08ab7"
  }
};

const artifacts = [
  { id: "paint", name: "페이스페인팅", price: 700, desc: "35초간 최대 체력 2배", duration: 35, buff: { maxHp: 2 } },
  { id: "jacket", name: "가죽재킷", price: 800, desc: "35초간 방어력 2배", duration: 35, buff: { defense: 2 } },
  { id: "bike", name: "오토바이 대여", price: 950, desc: "22초간 속도 2배", duration: 22, buff: { speed: 2 } },
  { id: "beer", name: "맥주", price: 300, desc: "8초간 체력 회복", duration: 8, buff: { regen: 15 } },
  { id: "vodka", name: "보드카", price: 550, desc: "26초간 체력 -20, 공격력 1.5배", duration: 26, buff: { attack: 1.5, hpCost: 20 } },
  { id: "underground", name: "지하 음반 유통", price: 850, desc: "명성 +95. 브리즈번 클리어의 핵심", instant: { fame: 95 } },
  { id: "citizen", name: "모범 시민인 척 해서 명성을 쌓기", price: 1200, desc: "명성 +120. 애틀랜틱 루트 강화", instant: { fame: 120, civic: 1 } },
  { id: "poster", name: "사회 고발성 대자보를 붙여서 펑크력을 쌓기", price: 950, desc: "펑크력 +100. 불멸의 펑크족 루트", instant: { punk: 100 } }
];
const basicArtifactIds = new Set(["paint", "jacket", "bike", "beer", "vodka"]);
const routeArtifactIds = {
  klaxon: new Set(["underground"]),
  atlantic: new Set(["citizen", "poster"])
};

let selected = "egor";
let state = null;
let pendingScore = null;
let lastTime = performance.now();
let shake = 0;
let messages = [];
let audio = null;
let punkAudio = null;
const touchInput = {
  active: false,
  id: null,
  startX: 0,
  startY: 0,
  dx: 0,
  dy: 0,
  moved: false,
  longPressed: false,
  downAt: 0,
  lastTap: 0,
  holdTimer: null
};

function ensureAudio() {
  if (audio) return audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const ctxAudio = new AudioContext();
  const master = ctxAudio.createGain();
  master.gain.value = 0.18;
  master.connect(ctxAudio.destination);

  const musicGain = ctxAudio.createGain();
  musicGain.gain.value = BASE_MUSIC_GAIN;
  musicGain.connect(master);

  audio = {
    ctx: ctxAudio,
    master,
    musicGain,
    nextRiffStep: 0,
    riffStep: 0,
    riffCurve: distortionCurve(720),
    musicTargetGain: BASE_MUSIC_GAIN,
    ready: false
  };
  return audio;
}

function ensurePunkAudio() {
  if (punkAudio) return punkAudio;
  punkAudio = {
    enabled: false,
    loadingStreet: false,
    loadingBoss: false,
    streetReady: false,
    bossReady: false,
    streetAudio: null,
    bossAudio: null,
    current: null,
    awaitingBoss: false
  };
  return punkAudio;
}

async function togglePunkAudio() {
  const punk = ensurePunkAudio();
  punk.enabled = !punk.enabled;
  syncPunkToggle();
  if (!punk.enabled) {
    stopPunkTracks();
    punk.awaitingBoss = false;
    log("펑크 음원 모드 해제. 기존 미디 리프를 다시 사용한다.");
    return;
  }
  ensureAudioReady();
  log("펑크와 함께하기. 01.mp3를 전부 받을 때까지 기존 미디 리프를 유지한다.");
  loadPunkTrack("street");
  if (punk.streetReady) {
    if (isBossPhase()) checkBossTrack();
    else playPunkTrack("street");
  }
}

function ensureAudioReady() {
  const audioState = ensureAudio();
  if (audioState && audioState.ctx.state === "suspended") audioState.ctx.resume();
}

async function loadPunkTrack(kind) {
  const punk = ensurePunkAudio();
  const loadingKey = kind === "boss" ? "loadingBoss" : "loadingStreet";
  const readyKey = kind === "boss" ? "bossReady" : "streetReady";
  const audioKey = kind === "boss" ? "bossAudio" : "streetAudio";
  if (punk[readyKey] || punk[loadingKey]) return;
  punk[loadingKey] = true;
  try {
    const track = await fetchPunkTrack(kind);
    punk[audioKey] = track;
    punk[readyKey] = true;
    punk[loadingKey] = false;
    if (kind === "street") {
      log("01.mp3 다운로드 완료. 기존 미디를 끄고 음원을 재생한다.");
      loadPunkTrack("boss");
      if (punk.enabled) {
        if (isBossPhase()) checkBossTrack();
        else playPunkTrack("street");
      }
    } else {
      log("02.mp3 다운로드 완료. 보스전 진입 시 전환 준비 완료.");
      if (punk.enabled && isBossPhase()) {
        punk.awaitingBoss = false;
        playPunkTrack("boss");
      }
    }
    syncPunkToggle();
  } catch {
    punk[loadingKey] = false;
    log(kind === "boss"
      ? "02.mp3 다운로드 확인 실패. 보스전에서도 01.mp3 또는 기존 미디를 유지한다."
      : "01.mp3 다운로드 실패. 외부 음원 대신 기존 미디 리프를 유지한다.");
    syncPunkToggle();
  }
}

async function fetchPunkTrack(kind) {
  try {
    const response = await fetch(PUNK_TRACKS[kind], { mode: "cors", cache: "force-cache" });
    if (!response.ok) throw new Error("track fetch failed");
    const blob = await response.blob();
    return configurePunkTrack(new Audio(URL.createObjectURL(blob)), kind);
  } catch {
    return loadDirectPunkTrack(kind);
  }
}

function configurePunkTrack(track, kind) {
  track.loop = true;
  track.preload = "auto";
  track.volume = kind === "boss" ? 0.62 : 0.58;
  return track;
}

function loadDirectPunkTrack(kind) {
  return new Promise((resolve, reject) => {
    const track = configurePunkTrack(new Audio(PUNK_TRACKS[kind]), kind);
    let done = false;
    const timeout = window.setTimeout(() => finish(false), 120000);
    const cleanup = () => {
      window.clearTimeout(timeout);
      track.removeEventListener("error", onError);
      track.removeEventListener("progress", onProgress);
      track.removeEventListener("canplaythrough", onProgress);
      track.removeEventListener("loadedmetadata", onProgress);
    };
    const finish = ok => {
      if (done) return;
      done = true;
      cleanup();
      if (ok) resolve(track);
      else reject(new Error("track preload failed"));
    };
    const onError = () => finish(false);
    const onProgress = () => {
      if (isTrackFullyBuffered(track)) finish(true);
    };
    track.addEventListener("error", onError);
    track.addEventListener("progress", onProgress);
    track.addEventListener("canplaythrough", onProgress);
    track.addEventListener("loadedmetadata", onProgress);
    track.load();
  });
}

function isTrackFullyBuffered(track) {
  if (!Number.isFinite(track.duration) || track.duration <= 0 || track.buffered.length === 0) return false;
  return track.buffered.end(track.buffered.length - 1) >= track.duration - 0.25;
}

function playPunkTrack(kind) {
  const punk = ensurePunkAudio();
  if (!punk.enabled) return;
  const target = kind === "boss" ? punk.bossAudio : punk.streetAudio;
  if (!target) return;
  const other = kind === "boss" ? punk.streetAudio : punk.bossAudio;
  if (other && !other.paused) other.pause();
  if (other) other.currentTime = 0;
  punk.awaitingBoss = false;
  punk.current = kind;
  target.play().catch(() => {
    punk.current = null;
    log("브라우저가 음원 자동 재생을 막았다. 펑크와 함께하기를 다시 누르면 재생을 시도한다.");
    syncPunkToggle();
  });
  syncPunkToggle();
}

function stopPunkTracks() {
  const punk = ensurePunkAudio();
  for (const track of [punk.streetAudio, punk.bossAudio]) {
    if (!track) continue;
    track.pause();
    track.currentTime = 0;
  }
  punk.current = null;
}

function shouldUseExternalMusic() {
  const punk = ensurePunkAudio();
  return punk.enabled && punk.streetReady && (punk.current || punk.awaitingBoss);
}

function isBossPhase() {
  return !!state && LOCATIONS[state.locationIndex] === "브리즈번";
}

function checkBossTrack() {
  const punk = ensurePunkAudio();
  if (!punk.enabled || !isBossPhase()) return;
  if (punk.bossReady) {
    playPunkTrack("boss");
    log("보스전 음원 확인: 02.mp3 준비 완료, 전환한다.");
  } else {
    punk.awaitingBoss = true;
    if (punk.streetAudio && !punk.streetAudio.paused) punk.streetAudio.pause();
    if (punk.bossAudio && !punk.bossAudio.paused) punk.bossAudio.pause();
    punk.current = null;
    loadPunkTrack("boss");
    log("보스전 음원 확인: 02.mp3가 아직 준비되지 않아 완전 다운로드를 기다린다.");
  }
  syncPunkToggle();
}

function syncPunkToggle() {
  if (!ui.punkToggle) return;
  const punk = ensurePunkAudio();
  let label = "OFF";
  if (punk.enabled) {
    if (punk.current === "boss") label = "02";
    else if (punk.current === "street") label = "01";
    else if (punk.awaitingBoss) label = "WAIT";
    else if (punk.loadingStreet) label = "LOAD";
    else label = "ON";
  }
  ui.punkToggle.setAttribute("aria-pressed", punk.enabled ? "true" : "false");
  ui.punkToggle.innerHTML = `펑크와 함께하기 <b>${label}</b>`;
}

function baseState() {
  const c = characters[selected];
  return {
    running: true,
    over: false,
    character: c,
    score: 0,
    totalScore: 0,
    fame: 0,
    punk: 0,
    followers: 0,
    capitalists: 0,
    route: "street",
    clearTitle: null,
    clearDescription: "",
    clear: false,
    locationIndex: 0,
    elapsed: 0,
    nextCrewOfferAt: CREW_OFFER_INTERVAL,
    crew: [],
    allyChoice: null,
    baseMaxHp: Math.round(500 * c.health),
    baseAttack: 50 * c.attack,
    baseDefense: 40 * c.defense,
    baseSpeed: 230,
    maxHp: Math.round(500 * c.health),
    hp: Math.round(500 * c.health),
    attack: 50 * c.attack,
    defense: 40 * c.defense,
    playerSpeed: 230,
    policeMult: 1,
    policeBaseSpeed: 124,
    policeSpawnTimer: POLICE_RESPAWN_INTERVAL,
    concertTimer: 0,
    concertPoliceBoost: 1,
    invincible: 0,
    skillCooldown: 0,
    joseonPunkTimer: 0,
    joseonPunkFlash: 0,
    psychedeliaTimer: 0,
    clubBrand: "PUNK CLUB",
    discount: 1,
    activeBuffs: [],
    buyCounts: {},
    inShop: false,
    shopFlash: 0,
    camera: { x: 0, y: 0 },
    world: generateWorld(),
    player: { x: 180, y: 310, w: 31, h: 48, vx: 0, vy: 0 },
    police: [
      { x: 24, y: 345, hp: 300, maxHp: 300, returning: false, phase: 0 },
      { x: 70, y: 228, hp: 300, maxHp: 300, returning: false, phase: 1.7 },
      { x: -34, y: 286, hp: 300, maxHp: 300, returning: false, phase: 2.8 }
    ],
    notes: [],
    sparks: []
  };
}

function randomFor(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function generateWorld() {
  const rnd = randomFor(Date.now() & 0xffffffff);
  const bounds = { minX: 0, minY: 0, maxX: INITIAL_WORLD_W, maxY: INITIAL_WORLD_H };
  const roads = [
    { x: 90, y: 280, w: 2320, h: ROAD_W },
    { x: 2060, y: 290, w: ROAD_W, h: 1250 },
    { x: 390, y: 860, w: 1800, h: ROAD_W },
    { x: 730, y: 370, w: ROAD_W, h: 930 },
    { x: 1260, y: 240, w: ROAD_W, h: 1260 },
    { x: 170, y: 1280, w: 2140, h: ROAD_W }
  ];

  for (let i = 0; i < 7; i++) {
    if (rnd() > 0.48) {
      const y = 170 + Math.floor(rnd() * (INITIAL_WORLD_H - 380));
      const x = 120 + Math.floor(rnd() * 360);
      const w = 720 + Math.floor(rnd() * 1280);
      roads.push({ x, y, w, h: 92 + Math.floor(rnd() * 44) });
    } else {
      const x = 260 + Math.floor(rnd() * (INITIAL_WORLD_W - 620));
      const y = 180 + Math.floor(rnd() * 360);
      const h = 640 + Math.floor(rnd() * 820);
      roads.push({ x, y, w: 92 + Math.floor(rnd() * 44), h });
    }
  }

  const lots = [];
  let guard = 0;
  while (lots.length < 48 && guard < 320) {
    guard++;
    const w = 72 + Math.floor(rnd() * 150);
    const h = 58 + Math.floor(rnd() * 130);
    const x = 70 + Math.floor(rnd() * (INITIAL_WORLD_W - w - 140));
    const y = 70 + Math.floor(rnd() * (INITIAL_WORLD_H - h - 140));
    const rect = { x, y, w, h, tone: rnd(), lit: rnd() > 0.42 };
    if (isRoadPoint(x + w / 2, y + h / 2, roads, 70)) continue;
    if (rectsOverlap(rect, { x: 2140, y: 1220, w: 250, h: 250 })) continue;
    if (lots.some(lot => rectsOverlap(expandRect(rect, 22), lot))) continue;
    lots.push(rect);
  }

  const clubs = [
    { x: 3220, y: 2180, w: 144, h: 160 },
    { x: 640, y: 2240, w: 144, h: 160 },
    { x: 1540, y: 520, w: 144, h: 160 },
    { x: 2720, y: 780, w: 144, h: 160 },
    { x: 1060, y: 1520, w: 144, h: 160 }
  ];

  return {
    bounds,
    roads,
    lots,
    clubs,
    clubAnchors: [
      { x: 3220, y: 2180, phase: 0 },
      { x: 640, y: 2240, phase: 1.9 },
      { x: 1540, y: 520, phase: 3.7 },
      { x: 2720, y: 780, phase: 4.8 },
      { x: 1060, y: 1520, phase: 5.6 }
    ],
    expanded: new Set(["0,0"]),
    seed: Date.now()
  };
}

function markBrisbaneLabels() {
  if (!state || LOCATIONS[state.locationIndex] !== "브리즈번") return;
  const labels = [
    { type: "klaxon", name: "크락손 레코즈" },
    { type: "atlantic", name: "애틀랜틱 레코즈" }
  ];
  labels.forEach((label, index) => {
    const club = state.world.clubs[index];
    if (club) Object.assign(club, label);
  });
}

function ensureWorldAroundPlayer() {
  if (!state) return;
  ensureWorldAroundRect(state.player);
}

function ensureWorldAroundRect(rect) {
  if (!state) return;
  const bounds = state.world.bounds;
  growTowardEdge("left", () => rect.x - bounds.minX < WORLD_EDGE_TRIGGER);
  growTowardEdge("right", () => bounds.maxX - (rect.x + rect.w) < WORLD_EDGE_TRIGGER);
  growTowardEdge("up", () => rect.y - bounds.minY < WORLD_EDGE_TRIGGER);
  growTowardEdge("down", () => bounds.maxY - (rect.y + rect.h) < WORLD_EDGE_TRIGGER);
}

function ensureWorldAroundView() {
  if (!state) return;
  ensureWorldAroundRect({
    x: state.camera.x,
    y: state.camera.y,
    w: canvas.width,
    h: canvas.height
  });
}

function ensureWorldForMovement(next, dx, dy) {
  if (!state) return;
  const bounds = state.world.bounds;
  if (dx < 0 && next.x <= bounds.minX + 18) growTowardEdge("left", () => next.x <= bounds.minX + 18);
  if (dx > 0 && next.x + next.w >= bounds.maxX - 18) growTowardEdge("right", () => next.x + next.w >= bounds.maxX - 18);
  if (dy < 0 && next.y <= bounds.minY + 18) growTowardEdge("up", () => next.y <= bounds.minY + 18);
  if (dy > 0 && next.y + next.h >= bounds.maxY - 18) growTowardEdge("down", () => next.y + next.h >= bounds.maxY - 18);
}

function growTowardEdge(direction, shouldGrow) {
  let expansions = 0;
  while (shouldGrow() && expansions < WORLD_CHAIN_EXPANSIONS) {
    expandWorld(direction);
    expansions++;
  }
}

function expandWorld(direction) {
  const bounds = state.world.bounds;
  let region;
  if (direction === "left") {
    bounds.minX -= WORLD_EXPAND_STEP;
    region = { x: bounds.minX, y: bounds.minY, w: WORLD_EXPAND_STEP, h: bounds.maxY - bounds.minY };
  } else if (direction === "right") {
    region = { x: bounds.maxX, y: bounds.minY, w: WORLD_EXPAND_STEP, h: bounds.maxY - bounds.minY };
    bounds.maxX += WORLD_EXPAND_STEP;
  } else if (direction === "up") {
    bounds.minY -= WORLD_EXPAND_STEP;
    region = { x: bounds.minX, y: bounds.minY, w: bounds.maxX - bounds.minX, h: WORLD_EXPAND_STEP };
  } else {
    region = { x: bounds.minX, y: bounds.maxY, w: bounds.maxX - bounds.minX, h: WORLD_EXPAND_STEP };
    bounds.maxY += WORLD_EXPAND_STEP;
  }
  growDistrict(region, direction);
  log(`도시가 ${directionLabel(direction)}으로 확장됐다. 새 펑크 거점도 퍼져나간다.`);
}

function directionLabel(direction) {
  return { left: "서쪽", right: "동쪽", up: "북쪽", down: "남쪽" }[direction] || "바깥쪽";
}

function growDistrict(region, direction) {
  const rnd = randomFor(hashRegion(region.x, region.y, direction));
  const roads = state.world.roads;
  const lots = state.world.lots;
  const horizontal = direction === "left" || direction === "right";
  const midX = region.x + region.w / 2;
  const midY = region.y + region.h / 2;

  if (horizontal) {
    roads.push({ x: region.x + 20, y: midY - ROAD_W / 2, w: region.w - 40, h: ROAD_W });
    roads.push({ x: midX - ROAD_W / 2, y: region.y + 80, w: ROAD_W, h: region.h - 160 });
  } else {
    roads.push({ x: midX - ROAD_W / 2, y: region.y + 20, w: ROAD_W, h: region.h - 40 });
    roads.push({ x: region.x + 80, y: midY - ROAD_W / 2, w: region.w - 160, h: ROAD_W });
  }

  const sideRoads = 3 + Math.floor(rnd() * 4);
  for (let i = 0; i < sideRoads; i++) {
    if (rnd() > 0.5) {
      const y = region.y + 120 + rnd() * Math.max(80, region.h - 240);
      roads.push({ x: region.x + 40, y, w: region.w - 80, h: 86 + Math.floor(rnd() * 42) });
    } else {
      const x = region.x + 120 + rnd() * Math.max(80, region.w - 240);
      roads.push({ x, y: region.y + 40, w: 86 + Math.floor(rnd() * 42), h: region.h - 80 });
    }
  }

  let guard = 0;
  const targetLots = 24 + Math.floor(Math.min(42, (region.w * region.h) / 180000));
  while (guard < 260 && targetLots > 0 && lots.filter(lot => rectsOverlap(lot, region)).length < targetLots) {
    guard++;
    const w = 70 + Math.floor(rnd() * 150);
    const h = 58 + Math.floor(rnd() * 130);
    const x = region.x + 50 + Math.floor(rnd() * Math.max(1, region.w - w - 100));
    const y = region.y + 50 + Math.floor(rnd() * Math.max(1, region.h - h - 100));
    const rect = { x, y, w, h, tone: rnd(), lit: rnd() > 0.42 };
    if (isRoadPoint(x + w / 2, y + h / 2, roads, 70)) continue;
    if (state.world.clubs.some(club => rectsOverlap(expandRect(rect, 20), club))) continue;
    if (lots.some(lot => rectsOverlap(expandRect(rect, 22), lot))) continue;
    lots.push(rect);
  }

  seedClubs(region, rnd);
}

function seedClubs(region, rnd) {
  const desired = 2 + Math.floor(rnd() * 3);
  const anchors = [...state.world.clubAnchors]
    .map(anchor => ({
      ...anchor,
      distance: Math.hypot(anchor.x - (region.x + region.w / 2), anchor.y - (region.y + region.h / 2))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  for (let i = 0; i < desired; i++) {
    const anchor = anchors[i % anchors.length] || state.world.clubAnchors[0];
    const regionCenterX = region.x + region.w / 2;
    const regionCenterY = region.y + region.h / 2;
    const angle = Math.atan2(regionCenterY - anchor.y, regionCenterX - anchor.x) + (rnd() - 0.5) * 1.25;
    const distance = 260 + rnd() * Math.min(region.w, region.h) * 0.65;
    const candidate = {
      x: clamp(anchor.x + Math.cos(angle) * distance + (rnd() - 0.5) * region.w * 0.5, region.x + 70, region.x + region.w - 220),
      y: clamp(anchor.y + Math.sin(angle) * distance + (rnd() - 0.5) * region.h * 0.5, region.y + 70, region.y + region.h - 230),
      w: 144,
      h: 160
    };
    if (state.world.clubs.some(club => Math.hypot(club.x - candidate.x, club.y - candidate.y) < 520)) continue;
    state.world.clubs.push(candidate);
    state.world.clubAnchors.push({ x: candidate.x, y: candidate.y, phase: rnd() * Math.PI * 2 });
  }
}

function hashRegion(x, y, direction) {
  const text = `${state.world.seed}:${Math.round(x)}:${Math.round(y)}:${direction}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function log(text) {
  messages.unshift(text);
  messages = messages.slice(0, 5);
  ui.log.innerHTML = messages.map(m => `<div>${m}</div>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function priceFor(item) {
  const concertDiscount = state.concertTimer > 0 ? 0.93 : 1;
  return Math.round(item.price * state.discount * concertDiscount / state.character.capital);
}

function addScore(points) {
  const earned = Math.round(points * state.character.capital);
  state.score += earned;
  state.totalScore += earned;
  checkLocationAdvance();
}

function addFame(points) {
  if (!state || state.clear) return;
  state.fame = Math.max(0, state.fame + Math.round(points));
  updateScenePressure();
  checkClear();
}

function addPunk(points) {
  if (!state || state.clear) return;
  state.punk = Math.max(0, state.punk + Math.round(points));
  checkClear();
}

function updateScenePressure() {
  if (!state) return;
  state.followers = state.route === "klaxon" ? Math.floor(state.fame / 90) : 0;
  state.capitalists = state.route === "atlantic" ? Math.floor(state.fame / 75) : 0;
}

function activeTitleName() {
  return state && state.clearTitle ? clearTitles[state.clearTitle].name : "없음";
}

function resetPoliceSpeed() {
  state.policeMult = 1;
}

function currentPoliceMultiplier() {
  return state.policeMult * state.concertPoliceBoost;
}

function applyPoliceSpeedBump(multiplier) {
  const threshold = 3;
  const adjusted = state.policeMult > threshold ? 1 + (multiplier - 1) * 0.5 : multiplier;
  state.policeMult *= adjusted;
  return adjusted;
}

function startGame() {
  const audioState = ensureAudio();
  if (audioState && audioState.ctx.state === "suspended") audioState.ctx.resume();
  state = baseState();
  pendingScore = null;
  updateCamera();
  messages = [];
  ui.scoreForm.classList.add("hidden");
  ui.scoreStatus.textContent = "";
  ui.scoreForm.querySelector("button").disabled = false;
  ui.overlay.classList.add("hidden");
  log(`${state.character.name} 출발. 경찰서 앞 골목을 찢어라.`);
  log("뉴욕에서 시작한다. 런던, 옴스크, 서울 다음 목적지는 브리즈번이다.");
  log("레코즈 루트 활동은 브리즈번 도착 후 해당 거점 문을 열어야 등장한다.");
  log("도시는 끝없이 열린다. 끝에 닿으면 새 구역과 Punk Club 거점이 확장된다.");
  const punk = ensurePunkAudio();
  if (punk.enabled && punk.streetReady) playPunkTrack("street");
  renderShop();
}

function strum(power = false) {
  if (!state || state.over || state.inShop) return;
  const score = power ? 260 * state.character.powerScore : 135;
  const speedBump = power ? 1.24 : 1.14;
  addScore(score);
  if (LOCATIONS[state.locationIndex] === "브리즈번") {
    addFame(power ? 4 : 2);
    if (state.route !== "atlantic") addPunk(power ? 2 : 1);
  }
  const applied = applyPoliceSpeedBump(speedBump);
  state.notes.push(makeNote(state.player.x + 38, state.player.y + 10, power ? 76 : 56, 0.22, power));
  state.sparks.push({ x: state.player.x + 35, y: state.player.y + 16, life: 0.28, power });
  playGuitar(power);
  log(power ? `파워코드! +${Math.round(score * state.character.capital)}점, 추격 속도 x${applied.toFixed(2)}` : `일렉기타 갈기기! +${Math.round(score * state.character.capital)}점, 추격 속도 x${applied.toFixed(2)}`);
}

function rockNeverDie(extra = 0) {
  if (!state || state.over || state.inShop || state.score < 1000) return;
  state.score -= 1000;
  state.invincible = Math.max(state.invincible, 16 + extra);
  resetPoliceSpeed();
  log(extra ? "나의 방어! 락네버다이 무적 시간이 5초 늘었다." : "락네버다이! 16초 무적, 경찰 속도 리셋.");
}

function useSkill() {
  if (!state || state.over || state.inShop) return;
  if (state.skillCooldown > 0) {
    log("스킬은 아직 재정비 중.");
    return;
  }
  if (selected === "egor") {
    if (state.score < 500) {
      log("나의 방어에는 500점이 필요하다.");
      return;
    }
    state.score -= 500;
    state.invincible = Math.max(state.invincible, state.invincible + 5);
    state.skillCooldown = 20;
    log("예고르: 나의 방어 발동. 무적 +5초.");
  } else if (selected === "roman") {
    state.invincible = Math.max(state.invincible, 3);
    state.skillCooldown = 10;
    log("로만: 신앙심 집중. 짧은 무적 상태.");
  } else if (selected === "didiramon") {
    state.discount = 0.9;
    state.skillCooldown = 12;
    log("디디라몬: 미국의 자본력. 아티팩트 가격 10% 할인.");
    renderShop();
  } else if (selected === "jundai") {
    state.joseonPunkTimer = JOSEON_PUNK_DURATION;
    state.joseonPunkFlash = 0.32;
    state.invincible = Math.max(state.invincible, 2.2);
    state.hp = Math.max(state.hp, Math.ceil(state.maxHp * JOSEON_PUNK_MIN_HP_RATIO));
    state.skillCooldown = 28;
    state.notes.push(makeNote(state.player.x + 15, state.player.y + 18, JOSEON_PUNK_RADIUS, 0.45, true));
    state.sparks.push({ x: state.player.x + 34, y: state.player.y + 14, life: 0.42, power: true });
    log("준다이: 조선펑크 발동. 10초간 가까운 경찰 1명을 밀어내고 체력을 회복한다.");
  } else if (selected === "kuznetsov") {
    state.psychedeliaTimer = PSYCHEDELIA_DURATION;
    state.invincible = Math.max(state.invincible, PSYCHEDELIA_DURATION);
    state.clubBrand = "PINK CIGAR";
    state.skillCooldown = 24;
    state.notes.push(makeNote(state.player.x + 15, state.player.y + 18, 132, 0.45, true));
    state.sparks.push({ x: state.player.x + 36, y: state.player.y + 12, life: 0.5, power: true });
    log("쿠즈네초프: 싸이키델리아. 3초간 경찰 타격을 완전 무효화하고 PUNK CLUB이 PINK CIGAR로 바뀐다.");
  }
}

function guerrillaConcert() {
  if (!state || state.over || state.inShop || state.concertTimer > 0 || state.score < 10000) return;
  state.score -= 10000;
  state.concertTimer = 60;
  state.concertPoliceBoost = 1.08;
  state.notes.push(makeNote(state.player.x + 38, state.player.y + 12, 150, 0.34, true));
  state.sparks.push({ x: state.player.x + 36, y: state.player.y + 10, life: 0.5, power: true });
  playGuitar(true);
  log("게릴라 락 콘서트! 1분간 샵 7% 할인, 경찰 추격 속도 소폭 상승.");
  renderShop();
}

function buy(id) {
  if (!state || state.over || !state.inShop) return;
  const item = artifacts.find(a => a.id === id);
  if (!item) return;
  if (!availableArtifacts().some(available => available.id === item.id)) {
    log(routeLockedMessage(item.id));
    return;
  }
  const cost = priceFor(item);
  if (state.score < cost) {
    log(`${item.name} 구매 포인트가 부족하다.`);
    return;
  }
  state.score -= cost;
  state.buyCounts[id] = (state.buyCounts[id] || 0) + 1;
  if (item.instant) {
    if (item.instant.fame) addFame(item.instant.fame);
    if (item.instant.punk) addPunk(item.instant.punk);
    log(`${item.name} 실행 #${state.buyCounts[id]}. ${item.desc}`);
    renderShop();
    return;
  }
  if (item.buff.hpCost) state.hp = Math.max(1, state.hp - item.buff.hpCost);
  state.activeBuffs.push({ id: item.id, name: item.name, remaining: item.duration, buff: item.buff });
  recalcStats();
  log(`${item.name} 구매 #${state.buyCounts[id]}. ${item.desc}`);
  renderShop();
}

function makeNote(x, y, r, life, power = false) {
  return { x, y, r, life, maxLife: life, power };
}

function buySlot(index) {
  if (!state || !state.inShop) return;
  const item = availableArtifacts()[index];
  if (item) buy(item.id);
}

function enterShop() {
  if (!state || state.over || state.inShop || !nearClub()) return false;
  activateNearbyLabel();
  state.inShop = true;
  state.policeMult = 1;
  state.shopFlash = 0.7;
  state.notes = [];
  state.sparks = [];
  log("Punk Club 입장. 중복 구매 가능. 숫자키 1-5로 계속 구매.");
  renderShop();
  return true;
}

function activateNearbyLabel() {
  const club = nearbyClub();
  if (!club || LOCATIONS[state.locationIndex] !== "브리즈번") return;
  if (club.type === "klaxon" && state.route !== "klaxon") {
    state.route = "klaxon";
    state.policeMult = Math.max(state.policeMult, 1.35);
    state.policeSpawnTimer = Math.min(state.policeSpawnTimer, 4);
    while (state.police.length < 8) state.police.push(spawnPoliceNearPlayer(460 + Math.random() * 360));
    updateScenePressure();
    log("크락손 레코즈 도착. 전투 모드: 경찰이 불어나지만 추종자가 명성에 따라 돈을 벌어온다.");
  } else if (club.type === "atlantic" && state.route !== "atlantic") {
    state.route = "atlantic";
    state.policeMult = Math.min(state.policeMult, 0.88);
    state.policeBaseSpeed = Math.max(100, state.policeBaseSpeed - 14);
    updateScenePressure();
    log("애틀랜틱 레코즈 도착. 경찰은 누그러졌지만 자본가가 명성에 붙어 체력을 갉아먹는다.");
    log("이 루트의 목표는 명성 500이다. 펑크력 500을 택해 다른 결말도 가능하다.");
  }
}

function exitShop() {
  if (!state || !state.inShop) return;
  state.inShop = false;
  state.shopFlash = 0.45;
  log("클럽 밖으로 나왔다. 추격 재개.");
  renderShop();
}

function nearClub() {
  if (!state) return false;
  return state.world.clubs.some(c => nearClubRect(c));
}

function nearbyClub() {
  if (!state) return null;
  return state.world.clubs.find(c => nearClubRect(c)) || null;
}

function nearClubRect(c) {
  if (!state) return false;
  const p = state.player;
  return (
    p.x + p.w > c.x - 34 &&
    p.x < c.x + c.w + 34 &&
    p.y + p.h > c.y - 24 &&
    p.y < c.y + c.h + 24
  );
}

function renderShop() {
  if (!state) return;
  const items = availableArtifacts();
  ui.shopItems.innerHTML = items.map((item, index) => {
    const cost = priceFor(item);
    const count = state.buyCounts[item.id] || 0;
    const disabled = !state.inShop;
    const cls = !disabled && state.score >= cost ? "affordable" : "";
    return `<button class="${cls}" data-buy="${item.id}" ${disabled ? "disabled" : ""}>
      <span><i>${SHOP_NUMBERS[index]}</i> ${item.name}<br><small>${item.desc}</small></span>
      <b>${count ? `x${count} · ${cost}점` : `무제한 · ${cost}점`}</b>
    </button>`;
  }).join("");
}

function availableArtifacts() {
  if (!state) return artifacts.filter(item => basicArtifactIds.has(item.id));
  return artifacts.filter(item => {
    if (basicArtifactIds.has(item.id)) return true;
    if (LOCATIONS[state.locationIndex] !== "브리즈번") return false;
    const routeItems = routeArtifactIds[state.route];
    return routeItems ? routeItems.has(item.id) : false;
  });
}

function routeLockedMessage(id) {
  if (LOCATIONS[state.locationIndex] !== "브리즈번") {
    return "브리즈번 레코즈 거점에 도착해야 열리는 활동이다.";
  }
  if (id === "underground") return "지하 음반 유통은 크락손 레코즈 루트에서 열린다.";
  if (id === "citizen" || id === "poster") return "이 활동은 애틀랜틱 레코즈 루트에서 열린다.";
  return "아직 열리지 않은 활동이다.";
}

const keys = new Set();

document.querySelectorAll(".character").forEach(button => {
  button.addEventListener("click", () => {
    selected = button.dataset.character;
    document.querySelectorAll(".character").forEach(b => b.classList.toggle("active", b === button));
  });
});

ui.start.addEventListener("click", startGame);
ui.strum.addEventListener("click", () => {
  if (state && state.inShop) {
    exitShop();
  } else if (!enterShop()) {
    strum(false);
  }
});
ui.power.addEventListener("click", () => strum(true));
ui.rock.addEventListener("click", () => rockNeverDie(0));
ui.skill.addEventListener("click", useSkill);
ui.concert.addEventListener("click", guerrillaConcert);
if (ui.punkToggle) ui.punkToggle.addEventListener("click", togglePunkAudio);
ui.shopItems.addEventListener("click", event => {
  const button = event.target.closest("[data-buy]");
  if (button) buy(button.dataset.buy);
});
ui.refreshScores.addEventListener("click", loadScores);
ui.scoreForm.addEventListener("submit", submitScore);

window.addEventListener("keydown", event => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.code === "Enter" && (!state || state.over)) startGame();
  if (event.code === "Space") {
    event.preventDefault();
    if (!enterShop()) strum(false);
  }
  if (event.code === "KeyF") strum(true);
  if (event.code === "KeyR") rockNeverDie(0);
  if (event.code === "KeyE") useSkill();
  if (event.code === "KeyG" && !event.repeat) guerrillaConcert();
  if (event.code === "Escape") exitShop();
  const slot = SHOP_KEYS.indexOf(event.code);
  if (state && state.allyChoice && slot >= 0) chooseAlly(slot);
  else if (slot >= 0) buySlot(slot);
  keys.add(event.code);
});

window.addEventListener("keyup", event => keys.delete(event.code));
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerCancel);
canvas.addEventListener("lostpointercapture", handlePointerCancel);
canvas.addEventListener("contextmenu", event => event.preventDefault());

function handlePointerDown(event) {
  if (event.pointerType === "mouse" || touchInput.active) return;
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  touchInput.active = true;
  touchInput.id = event.pointerId;
  touchInput.startX = event.clientX;
  touchInput.startY = event.clientY;
  touchInput.dx = 0;
  touchInput.dy = 0;
  touchInput.moved = false;
  touchInput.longPressed = false;
  touchInput.downAt = performance.now();
  updateGestureKnob();
  clearTimeout(touchInput.holdTimer);
  touchInput.holdTimer = window.setTimeout(() => {
    if (!touchInput.active || touchInput.moved || touchInput.longPressed) return;
    touchInput.longPressed = true;
    rockNeverDie(0);
  }, 620);
}

function handlePointerMove(event) {
  if (!touchInput.active || event.pointerId !== touchInput.id) return;
  event.preventDefault();
  const rawX = event.clientX - touchInput.startX;
  const rawY = event.clientY - touchInput.startY;
  const distance = Math.hypot(rawX, rawY);
  const radius = 46;
  const scale = distance > radius ? radius / distance : 1;
  touchInput.dx = rawX * scale / radius;
  touchInput.dy = rawY * scale / radius;
  touchInput.moved = distance > 10;
  if (touchInput.moved && touchInput.holdTimer) {
    clearTimeout(touchInput.holdTimer);
    touchInput.holdTimer = null;
  }
  updateGestureKnob();
}

function handlePointerUp(event) {
  if (!touchInput.active || event.pointerId !== touchInput.id) return;
  event.preventDefault();
  const wasTap = !touchInput.moved && !touchInput.longPressed && performance.now() - touchInput.downAt < 520;
  clearTouchInput();
  if (!wasTap) return;
  const now = performance.now();
  if (state && state.inShop) {
    const itemIndex = shopItemIndexAt(event.clientX, event.clientY);
    if (itemIndex >= 0) buySlot(itemIndex);
    touchInput.lastTap = 0;
    return;
  }
  if (now - touchInput.lastTap < 290) {
    touchInput.lastTap = 0;
    strum(true);
  } else {
    touchInput.lastTap = now;
    if (!enterShop()) strum(false);
  }
}

function handlePointerCancel(event) {
  if (!touchInput.active || event.pointerId !== touchInput.id) return;
  clearTouchInput();
}

function clearTouchInput() {
  clearTimeout(touchInput.holdTimer);
  touchInput.active = false;
  touchInput.id = null;
  touchInput.dx = 0;
  touchInput.dy = 0;
  touchInput.moved = false;
  touchInput.longPressed = false;
  touchInput.holdTimer = null;
  updateGestureKnob();
}

function updateGestureKnob() {
  if (!ui.gestureKnob) return;
  const px = touchInput.dx * 28;
  const py = touchInput.dy * 28;
  ui.gestureKnob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
}

function update(dt) {
  if (!state || state.over) return;
  tickMusic();
  state.elapsed += dt;
  tickBuffs(dt);
  tickBrisbaneEconomy(dt);
  if (state.elapsed >= state.nextCrewOfferAt && state.crew.length < MAX_CREW && !state.allyChoice) {
    offerAlly();
    state.nextCrewOfferAt += CREW_OFFER_INTERVAL;
  }
  if (state.allyChoice) {
    state.invincible = Math.max(state.invincible, 0.2);
    return;
  }
  const p = state.player;
  let dx = 0;
  let dy = 0;
  if (!state.inShop) {
    if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;
    if (touchInput.active && touchInput.moved) {
      dx += touchInput.dx;
      dy += touchInput.dy;
    }
  }
  const len = Math.hypot(dx, dy) || 1;
  const onRoad = isRoadPoint(p.x + p.w / 2, p.y + p.h / 2, state.world.roads, 10);
  const terrainSpeed = onRoad ? 1.08 : 0.86;
  const next = {
    x: p.x + (dx / len) * state.playerSpeed * terrainSpeed * dt,
    y: p.y + (dy / len) * state.playerSpeed * terrainSpeed * dt,
    w: p.w,
    h: p.h
  };
  ensureWorldAroundRect({
    x: next.x - WORLD_EDGE_BUFFER,
    y: next.y - WORLD_EDGE_BUFFER,
    w: next.w + WORLD_EDGE_BUFFER * 2,
    h: next.h + WORLD_EDGE_BUFFER * 2
  });
  ensureWorldForMovement(next, dx, dy);
  const bounds = state.world.bounds;
  p.x = clamp(next.x, bounds.minX + 18, bounds.maxX - p.w - 18);
  p.y = clamp(next.y, bounds.minY + 18, bounds.maxY - p.h - 18);
  ensureWorldAroundPlayer();
  updateCamera();
  ensureWorldAroundView();
  updateCamera();

  state.invincible = Math.max(0, state.invincible - dt);
  state.skillCooldown = Math.max(0, state.skillCooldown - dt);
  state.concertTimer = Math.max(0, state.concertTimer - dt);
  state.concertPoliceBoost = state.concertTimer > 0 ? 1.08 : 1;
  state.joseonPunkTimer = Math.max(0, state.joseonPunkTimer - dt);
  state.joseonPunkFlash = Math.max(0, state.joseonPunkFlash - dt);
  const wasPsychedeliaActive = state.psychedeliaTimer > 0;
  state.psychedeliaTimer = Math.max(0, state.psychedeliaTimer - dt);
  if (wasPsychedeliaActive && state.psychedeliaTimer <= 0 && state.clubBrand === "PINK CIGAR") {
    state.clubBrand = "PUNK CLUB";
  }
  state.notes = state.notes.filter(n => (n.life -= dt) > 0);
  state.sparks = state.sparks.filter(s => (s.life -= dt) > 0);
  state.shopFlash = Math.max(0, state.shopFlash - dt);
  shake = Math.max(0, shake - dt * 18);
  tickPoliceRespawn(dt);
  tickJoseonPunk(dt);

  if (!state.inShop) for (const cop of state.police) {
    if (cop.returning) {
      cop.x -= 260 * dt;
      if (cop.x < -170) {
        cop.returning = false;
        cop.hp = cop.maxHp;
        cop.x = clamp(p.x - 520 - Math.random() * 260, bounds.minX + 24, bounds.maxX - 80);
        cop.y = clamp(p.y - 160 + Math.random() * 320, bounds.minY + 24, bounds.maxY - 80);
      }
      continue;
    }

    const speed = state.policeBaseSpeed * currentPoliceMultiplier();
    const angle = Math.atan2(p.y - cop.y, p.x - cop.x);
    const copRoad = isRoadPoint(cop.x + 18, cop.y + 28, state.world.roads, 18);
    cop.x = clamp(cop.x + Math.cos(angle) * speed * (copRoad ? 1.05 : 0.9) * dt, bounds.minX + 18, bounds.maxX - 48);
    cop.y = clamp(cop.y + Math.sin(angle) * speed * (copRoad ? 1.05 : 0.9) * dt, bounds.minY + 18, bounds.maxY - 62);

    for (const note of state.notes) {
      const hit = Math.hypot((cop.x + 22) - note.x, (cop.y + 24) - note.y) < note.r;
      if (hit && !note.used) {
        const baseDamage = note.power ? POWER_NOTE_DAMAGE : NOTE_DAMAGE;
        const damage = baseDamage * state.attack / 50;
        cop.hp -= damage;
        const applied = applyPoliceSpeedBump(1.01);
        note.used = true;
        shake = 6;
        log(`경찰 1명 타격. HP -${Math.round(damage)}, 추격 속도 x${applied.toFixed(2)}`);
        if (cop.hp <= 0) {
          cop.returning = true;
          addScore(250);
          log("경찰 HP 소진. 경찰서로 후퇴한다. +250점");
        }
      }
    }

    if (rectsOverlap(p, { x: cop.x, y: cop.y, w: 36, h: 46 }) && state.invincible <= 0) {
      const critical = Math.random() < 0.16;
      const blocked = selected === "roman" && critical && Math.random() < 0.1;
      if (!blocked) {
        const routeRelief = state.route === "atlantic" ? 0.78 : 1;
        const raw = (critical ? 42 : 24) * routeRelief * POLICE_ATTACK_MULTIPLIER;
        const skillGuard = selected === "jundai" && state.joseonPunkTimer > 0;
        const psychedeliaGuard = selected === "kuznetsov" && state.psychedeliaTimer > 0;
        const damage = psychedeliaGuard ? 0 : Math.max(4, raw * (100 / (100 + state.defense))) * (skillGuard ? 0.35 : 1);
        state.hp -= damage;
        if (skillGuard && state.hp <= 0) state.hp = 1;
        state.invincible = psychedeliaGuard ? 0.2 : skillGuard ? 0.7 : 0.42;
        shake = 10;
        log(psychedeliaGuard
          ? "싸이키델리아가 경찰의 타격을 100% 무효화했다."
          : skillGuard
          ? `조선펑크가 충돌 피해를 버텼다. 체력 -${Math.round(damage)}`
          : critical ? `치명타! 체력 -${Math.round(damage)}` : `붙잡혔다. 체력 -${Math.round(damage)}`);
      } else {
        state.invincible = 0.8;
        log("로만의 신앙심이 치명타를 무효화했다.");
      }
    }
  }

  if (selected === "jundai" && state.joseonPunkTimer > 0 && state.hp <= 0) {
    state.hp = 1;
    state.invincible = Math.max(state.invincible, 0.8);
    log("조선펑크가 쓰러짐을 막았다.");
  }

  if (state.hp <= 0) {
    state.hp = 0;
    state.over = true;
    showGameOver();
    log("체력이 바닥났다. 다시 Press to Start.");
  }

  const clubNear = nearClub();
  ui.shopHint.textContent = state.inShop
    ? state.concertTimer > 0
      ? `게릴라 콘서트 할인 ${Math.ceil(state.concertTimer)}초 남음. 중앙 샵 아이템을 누르거나 숫자키 1-5로 구매.`
      : "클럽 내부 샵. 중앙 샵 아이템을 누르면 같은 아이템도 제한 없이 계속 구매합니다."
    : clubNear
      ? "Punk Club 앞입니다. Space를 누르면 추격을 멈추고 샵에 들어갑니다."
      : "랜덤 도시를 자유롭게 이동해 Punk Club을 찾으세요.";
  renderShop();
}

function tickBrisbaneEconomy(dt) {
  if (!state || LOCATIONS[state.locationIndex] !== "브리즈번" || state.clear) return;
  updateScenePressure();
  if (state.route === "klaxon") {
    const income = (2.2 + state.followers * 0.55) * dt;
    state.score += income;
    state.totalScore += income;
  } else if (state.route === "atlantic") {
    const income = (5.5 + state.capitalists * 1.05) * dt;
    const damage = state.capitalists * 0.22 * dt;
    state.score += income;
    state.totalScore += income;
    if (state.capitalists > 0 && state.invincible <= 0) state.hp = Math.max(1, state.hp - damage);
  }
}

function tickBuffs(dt) {
  if (!state) return;
  for (const active of state.activeBuffs) {
    active.remaining -= dt;
    if (active.buff.regen) state.hp = Math.min(state.maxHp, state.hp + active.buff.regen * dt);
  }
  const before = state.activeBuffs.length;
  state.activeBuffs = state.activeBuffs.filter(active => active.remaining > 0);
  if (state.activeBuffs.length !== before) {
    recalcStats();
    log("시간제 아티팩트 효과가 일부 종료됐다.");
  } else {
    recalcStats();
  }
}

function tickJoseonPunk(dt) {
  if (!state || state.inShop || state.joseonPunkTimer <= 0) return;
  const p = state.player;
  const centerX = p.x + p.w / 2;
  const centerY = p.y + p.h / 2;
  let affected = 0;
  const guardedHp = Math.ceil(state.maxHp * JOSEON_PUNK_MIN_HP_RATIO);
  if (state.hp < guardedHp) {
    state.hp = Math.min(state.maxHp, state.hp + JOSEON_PUNK_HEAL_PER_SECOND * 1.15 * dt);
  }
  const target = state.police
    .filter(cop => !cop.returning)
    .map(cop => ({
      cop,
      distance: Math.hypot((cop.x + 18) - centerX, (cop.y + 24) - centerY)
    }))
    .filter(hit => hit.distance <= JOSEON_PUNK_RADIUS)
    .sort((a, b) => a.distance - b.distance)[0];
  if (target) {
    const cop = target.cop;
    affected = 1;
    const copX = cop.x + 18;
    const copY = cop.y + 24;
    const force = Math.max(0.25, 1 - target.distance / JOSEON_PUNK_RADIUS);
    const angle = Math.atan2(copY - centerY, copX - centerX);
    cop.x += Math.cos(angle) * JOSEON_PUNK_KNOCKBACK_PER_SECOND * force * dt;
    cop.y += Math.sin(angle) * JOSEON_PUNK_KNOCKBACK_PER_SECOND * force * dt;
    cop.hp -= JOSEON_PUNK_DAMAGE_PER_SECOND * dt;
    if (cop.hp <= 0) {
      cop.returning = true;
      cop.hp = 0;
      addScore(250);
      state.joseonPunkFlash = 0.18;
      log("조선펑크 파동으로 경찰 1명이 후퇴한다. +250점");
    }
  }
  if (affected > 0) {
    const healRate = JOSEON_PUNK_HEAL_PER_SECOND * Math.min(2.4, 0.8 + affected * 0.35);
    state.hp = Math.min(state.maxHp, state.hp + healRate * dt);
  }
}

function recalcStats() {
  const oldMax = state.maxHp || state.baseMaxHp;
  let maxHp = state.baseMaxHp;
  let attack = state.baseAttack;
  let defense = state.baseDefense;
  let speed = state.baseSpeed;
  for (const active of state.activeBuffs) {
    if (active.buff.maxHp) maxHp *= active.buff.maxHp;
    if (active.buff.attack) attack *= active.buff.attack;
    if (active.buff.defense) defense *= active.buff.defense;
    if (active.buff.speed) speed *= active.buff.speed;
  }
  for (const allyId of state.crew) {
    const ally = characters[allyId];
    attack *= 1 + (ally.attack - 1) * 0.22;
    defense *= 1 + (ally.defense - 1) * 0.18;
    maxHp *= 1 + (ally.health - 1) * 0.12;
  }
  state.maxHp = Math.round(maxHp);
  state.attack = attack;
  state.defense = defense;
  state.playerSpeed = speed;
  if (oldMax !== state.maxHp && state.hp > 0) state.hp = Math.min(state.maxHp, state.hp * state.maxHp / oldMax);
  state.hp = Math.min(state.maxHp, state.hp);
}

function tickPoliceRespawn(dt) {
  if (!state || state.inShop) return;
  state.policeSpawnTimer -= dt;
  if (state.policeSpawnTimer > 0) return;
  const routeBoost = state.route === "klaxon" ? 5 : state.route === "atlantic" ? -2 : 0;
  const routePace = state.route === "klaxon" ? 4 : 0;
  state.policeSpawnTimer = Math.max(5, POLICE_RESPAWN_INTERVAL - state.locationIndex * 2 - Math.min(7, state.totalScore / 18000) - routePace);
  if (state.police.length >= POLICE_MAX + state.locationIndex + routeBoost) return;
  state.police.push(spawnPoliceNearPlayer(520 + Math.random() * 260));
  log("새 경찰이 무전 받고 합류했다.");
}

function spawnPoliceNearPlayer(distance = 620) {
  const p = state.player;
  const angle = Math.random() * Math.PI * 2;
  const bounds = state.world.bounds;
  return {
    x: clamp(p.x + Math.cos(angle) * distance, bounds.minX + 24, bounds.maxX - 80),
    y: clamp(p.y + Math.sin(angle) * distance, bounds.minY + 24, bounds.maxY - 80),
    hp: 300 + state.locationIndex * 55,
    maxHp: 300 + state.locationIndex * 55,
    returning: false,
    phase: Math.random() * Math.PI * 2
  };
}

function checkLocationAdvance() {
  if (!state) return;
  const nextIndex = Math.min(LOCATIONS.length - 1, Math.floor(state.totalScore / LOCATION_TARGET));
  if (nextIndex <= state.locationIndex) return;
  state.locationIndex = nextIndex;
  const hpRatio = state.hp / Math.max(1, state.maxHp);
  state.world = generateWorld();
  markBrisbaneLabels();
  state.player.x = 180;
  state.player.y = 310;
  state.camera = { x: 0, y: 0 };
  state.policeBaseSpeed += 10;
  state.policeMult = 1 + nextIndex * 0.08;
  state.police = [
    spawnPoliceNearPlayer(420),
    spawnPoliceNearPlayer(560),
    spawnPoliceNearPlayer(720),
    spawnPoliceNearPlayer(820)
  ];
  state.hp = Math.max(1, Math.min(state.maxHp, state.maxHp * hpRatio + 70));
  updateCamera();
  log(`${LOCATIONS[nextIndex]} 도착. 현지 경찰 무전망이 더 빨라졌다.`);
  if (LOCATIONS[nextIndex] === "브리즈번") {
    log("브리즈번 도착. 크락손 레코즈와 애틀랜틱 레코즈 중 어느 쪽 문을 열지 결정해야 한다.");
    checkBossTrack();
  }
}

function checkClear() {
  if (!state || state.clear || LOCATIONS[state.locationIndex] !== "브리즈번") return;
  if (state.punk >= PUNK_TARGET) {
    clearGame("immortal");
  } else if (state.route === "atlantic" && state.fame >= ATLANTIC_FAME_TARGET) {
    clearGame("symbol");
  } else if (state.route === "klaxon" && state.fame >= FAME_TIGER_TARGET) {
    clearGame("tiger");
  }
}

function clearGame(titleId) {
  const title = clearTitles[titleId];
  state.clear = true;
  state.clearTitle = titleId;
  state.clearDescription = title.desc;
  state.over = true;
  state.invincible = Math.max(state.invincible, 4);
  log(`클리어: ${title.name}`);
  showGameOver(true);
}

function offerAlly() {
  const ids = Object.keys(characters).filter(id => id !== selected && !state.crew.includes(id));
  if (!ids.length) return;
  state.allyChoice = ids.slice(0, 4);
  state.invincible = Math.max(state.invincible, 3);
  log("5분 생존 보너스. 숫자 1-4로 동료 1명을 영입할 수 있다.");
}

function chooseAlly(index) {
  if (!state || !state.allyChoice) return;
  const id = state.allyChoice[index];
  if (!id) return;
  if (state.crew.length < MAX_CREW) {
    state.crew.push(id);
    recalcStats();
    log(`${characters[id].name} 합류. 현재 파티 ${state.crew.length + 1}/${MAX_PARTY_SIZE}.`);
  }
  state.allyChoice = null;
}

function showGameOver(isClear = false) {
  const finalScore = Math.floor(state.totalScore);
  pendingScore = {
    score: finalScore,
    character: state.character.name,
    location: LOCATIONS[state.locationIndex],
    title: activeTitleName(),
    titleDescription: state.clearDescription || ""
  };
  ui.finalScore.textContent = isClear
    ? `클리어: ${activeTitleName()} · 돈 ${finalScore.toLocaleString("ko-KR")}`
    : `최종 돈 ${finalScore.toLocaleString("ko-KR")}`;
  ui.scoreStatus.textContent = isClear
    ? state.clearDescription
    : "이름을 남기면 전당에 기록됩니다.";
  ui.scoreForm.classList.remove("hidden");
  ui.overlay.classList.remove("hidden");
  ui.start.textContent = "다시 시작";
  window.setTimeout(() => ui.playerName.focus(), 0);
}

async function loadScores() {
  ui.scoreList.innerHTML = "<li>기록을 불러오는 중...</li>";
  try {
    const response = await fetch("/api/scores", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("scores failed");
    const data = await response.json();
    renderScores(data.scores || []);
  } catch {
    ui.scoreList.innerHTML = "<li>전당을 불러오지 못했습니다.</li>";
  }
}

function renderScores(scores) {
  if (!scores.length) {
    ui.scoreList.innerHTML = "<li>아직 등록된 기록이 없습니다.</li>";
    return;
  }
  ui.scoreList.innerHTML = scores.slice(0, 10).map((entry, index) => `
    <li>
      <span class="rank">${index + 1}</span>
      <span class="runner">${escapeHtml(entry.name)}</span>
      <strong>${Number(entry.score || 0).toLocaleString("ko-KR")}</strong>
      <small>${escapeHtml(entry.character || "")} · ${escapeHtml(entry.location || "")} · ${escapeHtml(entry.title || "칭호 없음")}</small>
    </li>
  `).join("");
}

async function submitScore(event) {
  event.preventDefault();
  if (!pendingScore) return;
  const payload = {
    ...pendingScore,
    name: ui.playerName.value
  };
  ui.scoreStatus.textContent = "전당에 등록 중...";
  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "submit failed");
    pendingScore = null;
    ui.scoreStatus.textContent = "등록 완료. Enter 또는 버튼으로 다시 시작하세요.";
    ui.scoreForm.querySelector("button").disabled = true;
    renderScores(data.scores || []);
  } catch {
    ui.scoreStatus.textContent = "등록에 실패했습니다. 다시 시도하세요.";
  }
}

function draw() {
  ctx.save();
  const speedPressure = state ? Math.max(0, currentPoliceMultiplier() - 1) : 0;
  const rumble = shake + Math.min(9, speedPressure * 2.5);
  if (rumble > 0) ctx.translate((Math.random() - 0.5) * rumble, (Math.random() - 0.5) * rumble);
  drawWorld();
  if (state) {
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);
    for (const club of state.world.clubs) drawClub(club);
    drawPlayer();
    drawCrew();
    if (!state.inShop) for (const cop of state.police) drawPolice(cop);
    drawEffects();
    ctx.restore();
    drawSpeedPressure();
    drawMinimap();
    if (state.inShop) drawShopInterior();
    if (state.allyChoice) drawAllyChoice();
  } else {
    drawAttract();
  }
  ctx.restore();
  syncUi();
}

function drawWorld() {
  const cam = state ? state.camera : { x: 0, y: 0 };
  ctx.fillStyle = "#111414";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!state) {
    ctx.fillStyle = "#2b2925";
    ctx.fillRect(0, 160, canvas.width, 380);
    ctx.fillStyle = "#4c4940";
    for (let x = -20; x < canvas.width; x += 90) ctx.fillRect(x, 350, 48, 7);
    ctx.fillStyle = "#202c32";
    for (let i = 0; i < 13; i++) {
      const x = i * 82;
      ctx.fillRect(x, 70 + (i % 3) * 14, 50, 90);
      ctx.fillStyle = i % 2 ? "#ffc857" : "#20d6b5";
      ctx.fillRect(x + 10, 91 + (i % 3) * 14, 9, 10);
      ctx.fillStyle = "#202c32";
    }
    ctx.fillStyle = "#111";
    ctx.fillRect(22, 205, 96, 90);
    ctx.fillStyle = "#d6d0c5";
    ctx.font = "700 13px monospace";
    ctx.fillText("POLICE", 41, 252);
    return;
  }

  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  const bounds = state.world.bounds;
  ctx.fillStyle = "#22241f";
  ctx.fillRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  ctx.fillStyle = "#151515";
  ctx.font = "900 48px monospace";
  ctx.fillText(LOCATIONS[state.locationIndex], bounds.minX + 90, bounds.minY + 92);
  ctx.fillStyle = "#30302a";
  for (const road of state.world.roads) ctx.fillRect(road.x, road.y, road.w, road.h);
  ctx.fillStyle = "#535149";
  for (const road of state.world.roads) {
    if (road.w > road.h) {
      for (let x = road.x + 24; x < road.x + road.w - 20; x += 94) ctx.fillRect(x, road.y + road.h / 2 - 3, 44, 6);
    } else {
      for (let y = road.y + 24; y < road.y + road.h - 20; y += 94) ctx.fillRect(road.x + road.w / 2 - 3, y, 6, 44);
    }
  }

  for (const lot of state.world.lots) {
    ctx.fillStyle = lot.tone > 0.66 ? "#1d3434" : lot.tone > 0.33 ? "#332b36" : "#2f332c";
    ctx.fillRect(lot.x, lot.y, lot.w, lot.h);
    ctx.fillStyle = lot.lit ? "#ffc857" : "#54504a";
    for (let y = lot.y + 14; y < lot.y + lot.h - 12; y += 28) {
      for (let x = lot.x + 12; x < lot.x + lot.w - 12; x += 32) {
        if ((x + y) % 3 !== 0) ctx.fillRect(x, y, 10, 10);
      }
    }
  }
  ctx.fillStyle = "#111";
  ctx.fillRect(60, 250, 120, 104);
  ctx.fillStyle = "#d6d0c5";
  ctx.font = "700 13px monospace";
  ctx.fillText("POLICE", 94, 309);
  ctx.restore();
}

function drawAttract() {
  ctx.fillStyle = "#ff375f";
  ctx.fillRect(170, 312, 28, 45);
  ctx.fillStyle = "#f3d6a2";
  ctx.fillRect(176, 292, 18, 18);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(198, 322, 56, 8);
  ctx.fillStyle = "#d6d0c5";
  ctx.fillRect(52, 308, 36, 45);
  ctx.fillStyle = "#2f5cff";
  ctx.fillRect(58, 288, 24, 15);
}

function drawClub(c) {
  const pinkCigarActive = state && state.clubBrand === "PINK CIGAR" && state.psychedeliaTimer > 0;
  if (pinkCigarActive) {
    ctx.save();
    ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-(c.x + c.w / 2), -(c.y + c.h / 2));
  }

  ctx.fillStyle = "#191817";
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.strokeStyle = nearClubRect(c) ? "#20d6b5" : "#6f655a";
  ctx.lineWidth = 4;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
  if (c.type === "klaxon" || c.type === "atlantic") {
    ctx.fillStyle = c.type === "klaxon" ? "#ff375f" : "#ffc857";
    ctx.fillRect(c.x + 8, c.y + 8, c.w - 16, 24);
    ctx.fillStyle = "#111";
    ctx.font = "900 10px monospace";
    ctx.fillText(c.name, c.x + 14, c.y + 25);
  }
  const signY = c.y + (c.type ? 42 : 22);
  ctx.fillStyle = "#101010";
  ctx.fillRect(c.x + 14, signY, c.w - 28, 48);
  ctx.strokeStyle = "#20d6b5";
  ctx.lineWidth = 2;
  ctx.strokeRect(c.x + 14, signY, c.w - 28, 48);
  drawElectricGuitar(c.x + 27, signY + 12, 0.72);
  drawCitySymbol(c.x + c.w - 44, signY + 11, 0.78);
  const brand = state && state.clubBrand === "PINK CIGAR" ? ["PINK", "CIGAR"] : ["PUNK", "CLUB"];
  ctx.fillStyle = "#20d6b5";
  ctx.font = "900 16px monospace";
  ctx.fillText(brand[0], c.x + 55, signY + 19);
  ctx.fillStyle = "#ff8abd";
  ctx.fillText(brand[1], c.x + 55, signY + 39);
  ctx.fillStyle = "#3b3631";
  ctx.fillRect(c.x + 44, c.y + 88, 36, 57);
  ctx.fillStyle = "#ffc857";
  ctx.font = "700 12px monospace";
  ctx.fillText("SPACE", c.x + 49, c.y + 120);

  if (pinkCigarActive) ctx.restore();
}

function drawElectricGuitar(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(20, 5, 38, 5);
  ctx.fillRect(53, 1, 8, 13);
  ctx.fillStyle = "#ff375f";
  ctx.fillRect(4, 16, 19, 17);
  ctx.fillRect(15, 10, 16, 25);
  ctx.fillStyle = "#f7f2e8";
  ctx.fillRect(23, 20, 28, 2);
  ctx.fillRect(23, 26, 25, 2);
  ctx.restore();
}

function drawCitySymbol(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#d8d0c4";
  ctx.fillRect(2, 18, 9, 22);
  ctx.fillRect(15, 8, 10, 32);
  ctx.fillRect(29, 14, 12, 26);
  ctx.fillStyle = "#20d6b5";
  for (let yy = 13; yy < 36; yy += 8) {
    ctx.fillRect(18, yy, 4, 4);
    if (yy > 18) ctx.fillRect(5, yy, 3, 4);
    ctx.fillRect(33, yy, 4, 4);
  }
  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  const c = state.character;
  ctx.fillStyle = state.invincible > 0 ? "#fff6a8" : c.color;
  ctx.fillRect(p.x, p.y + 16, p.w, 32);
  ctx.fillStyle = "#f0c891";
  ctx.fillRect(p.x + 7, p.y, 18, 18);
  ctx.fillStyle = "#171717";
  ctx.fillRect(p.x + 2, p.y + 48, 9, 14);
  ctx.fillRect(p.x + 20, p.y + 48, 9, 14);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(p.x + 27, p.y + 24, 50, 7);
  ctx.fillStyle = "#f2eadc";
  ctx.fillRect(p.x + 58, p.y + 20, 14, 15);
}

function drawCrew() {
  state.crew.forEach((id, index) => {
    const p = state.player;
    const c = characters[id];
    const lagX = 34 + index * 24;
    const lagY = 24 + Math.sin(performance.now() / 220 + index) * 4;
    const x = p.x - lagX;
    const y = p.y + lagY;
    ctx.fillStyle = c.color;
    ctx.fillRect(x, y + 16, 25, 28);
    ctx.fillStyle = "#f0c891";
    ctx.fillRect(x + 5, y + 3, 15, 15);
    ctx.fillStyle = "#171717";
    ctx.fillRect(x + 2, y + 44, 8, 10);
    ctx.fillRect(x + 16, y + 44, 8, 10);
  });
}

function drawPolice(cop) {
  ctx.fillStyle = cop.returning ? "#7c7c7c" : "#dfe6ee";
  ctx.fillRect(cop.x, cop.y + 14, 36, 32);
  ctx.fillStyle = "#2f5cff";
  ctx.fillRect(cop.x + 5, cop.y, 26, 16);
  ctx.fillStyle = "#f1c99b";
  ctx.fillRect(cop.x + 9, cop.y + 16, 18, 14);
  ctx.fillStyle = "#111";
  ctx.fillRect(cop.x + 5, cop.y + 46, 10, 12);
  ctx.fillRect(cop.x + 22, cop.y + 46, 10, 12);
  ctx.fillStyle = "#101010";
  ctx.fillRect(cop.x - 2, cop.y - 10, 42, 5);
  ctx.fillStyle = "#ff375f";
  ctx.fillRect(cop.x - 2, cop.y - 10, 42 * Math.max(0, cop.hp / cop.maxHp), 5);
}

function drawEffects() {
  for (const note of state.notes) {
    ctx.strokeStyle = note.power ? "#ffc857" : "#ff375f";
    ctx.lineWidth = note.power ? 5 : 3;
    const maxLife = Math.max(0.01, note.maxLife || 0.22);
    const radius = Math.max(1, note.r * (1 - note.life / maxLife));
    ctx.beginPath();
    ctx.arc(note.x, note.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const spark of state.sparks) {
    ctx.fillStyle = spark.power ? "#fff1a8" : "#ff8a9d";
    ctx.fillRect(spark.x, spark.y - spark.life * 60, 18, 18);
  }
  if (state.invincible > 0) {
    ctx.strokeStyle = "#fff6a8";
    ctx.lineWidth = 3;
    ctx.strokeRect(state.player.x - 7, state.player.y - 7, state.player.w + 14, state.player.h + 22);
  }
  if (state.joseonPunkTimer > 0) {
    const p = state.player;
    const pulse = JOSEON_PUNK_RADIUS + Math.sin(performance.now() / 95) * 8 + state.joseonPunkFlash * 60;
    ctx.strokeStyle = "#d843bf";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + p.h / 2, Math.max(24, pulse), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(216, 67, 191, 0.12)";
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + p.h / 2, JOSEON_PUNK_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpeedPressure() {
  if (state.inShop) return;
  const pressure = Math.max(0, currentPoliceMultiplier() - 1);
  if (pressure <= 0.15) return;
  const alpha = Math.min(0.34, pressure * 0.065);
  const streaks = 7 + Math.min(18, Math.floor(pressure * 3));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#f2eadc";
  ctx.lineWidth = 3;
  for (let i = 0; i < streaks; i++) {
    const y = 18 + i * (canvas.height - 36) / streaks;
    const len = 34 + pressure * 18;
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(len, y - 8);
    ctx.moveTo(canvas.width - 8, y + 12);
    ctx.lineTo(canvas.width - len, y + 4);
    ctx.stroke();
  }
  const edge = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.25, canvas.width / 2, canvas.height / 2, canvas.width * 0.62);
  edge.addColorStop(0, "rgba(255,55,95,0)");
  edge.addColorStop(1, `rgba(255,55,95,${alpha})`);
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawMinimap() {
  const w = 168;
  const h = 116;
  const x = canvas.width - w - 18;
  const y = 18;
  const bounds = state.world.bounds;
  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const sx = w / worldW;
  const sy = h / worldH;
  const px = value => x + (value - bounds.minX) * sx;
  const py = value => y + (value - bounds.minY) * sy;
  ctx.save();
  ctx.fillStyle = "rgba(16,16,16,0.76)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#6f655a";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#555147";
  for (const road of state.world.roads) ctx.fillRect(px(road.x), py(road.y), road.w * sx, Math.max(2, road.h * sy));
  ctx.fillStyle = "#20d6b5";
  for (const club of state.world.clubs) ctx.fillRect(px(club.x), py(club.y), 6, 6);
  ctx.fillStyle = state.character.color;
  ctx.fillRect(px(state.player.x) - 2, py(state.player.y) - 2, 5, 5);
  if (!state.inShop) {
    ctx.fillStyle = "#dfe6ee";
    for (const cop of state.police) ctx.fillRect(px(cop.x) - 1, py(cop.y) - 1, 4, 4);
  }
  ctx.fillStyle = "#d8d0c4";
  ctx.font = "700 11px monospace";
  ctx.fillText("PUNK", x + w - 42, y + h - 10);
  ctx.restore();
}

function drawShopInterior() {
  ctx.save();
  const items = availableArtifacts();
  const compact = canvas.width < 620 || canvas.height < 360;
  if (compact) {
    drawCompactShopInterior(items);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(10, 10, 10, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#191817";
  ctx.fillRect(210, 96, 540, 342);
  ctx.strokeStyle = state.shopFlash > 0 ? "#20d6b5" : "#6f655a";
  ctx.lineWidth = 4;
  ctx.strokeRect(210, 96, 540, 342);
  ctx.fillStyle = "#20d6b5";
  ctx.font = "900 30px monospace";
  ctx.fillText(`${state.clubBrand} SHOP`, 292, 150);
  ctx.fillStyle = "#d8d0c4";
  ctx.font = "700 16px monospace";
  ctx.fillText("CHASE PAUSED", 410, 182);

  const rowH = Math.max(27, Math.min(38, 248 / items.length));
  items.forEach((item, index) => {
    const y = 214 + index * rowH;
    const count = state.buyCounts[item.id] || 0;
    const cost = priceFor(item);
    ctx.fillStyle = state.score >= cost ? "#263f3a" : "#302b2b";
    ctx.fillRect(270, y - 20, 420, rowH - 5);
    ctx.fillStyle = "#f7f2e8";
    ctx.font = "800 13px monospace";
    ctx.fillText(`${index + 1}. ${item.name}`, 286, y);
    ctx.textAlign = "right";
    ctx.fillText(`${cost} pts x${count}`, 672, y);
    ctx.textAlign = "left";
  });

  ctx.fillStyle = "#b9b0a3";
  ctx.font = "700 13px monospace";
  ctx.fillText("TAP ITEM / 1-5 BUY   ESC EXIT", 344, 410);
  ctx.restore();
}

function shopItemRects() {
  const items = availableArtifacts();
  const compact = canvas.width < 620 || canvas.height < 360;
  if (!compact) {
    return items.map((item, index) => ({
      index,
      x: 270,
      y: 214 + index * Math.max(27, Math.min(38, 248 / items.length)) - 20,
      w: 420,
      h: Math.max(27, Math.min(38, 248 / items.length)) - 5
    }));
  }

  const margin = Math.max(8, Math.min(12, Math.floor(canvas.width * 0.03)));
  const x = margin;
  const y = margin;
  const w = Math.max(1, canvas.width - margin * 2);
  const h = Math.max(1, canvas.height - margin * 2);
  const itemCount = Math.min(items.length, h < 150 ? 4 : 8);
  const top = y + Math.max(43, Math.min(50, h * 0.22));
  const footerH = h < 160 ? 16 : 24;
  const rowH = Math.max(22, Math.min(31, (h - (top - y) - footerH) / itemCount));

  return items.slice(0, itemCount).map((item, index) => ({
    index,
    x: x + 10,
    y: top + index * rowH - 16,
    w: w - 20,
    h: rowH - 4
  }));
}

function shopItemIndexAt(clientX, clientY) {
  if (!state || !state.inShop) return -1;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(1, rect.width);
  const scaleY = canvas.height / Math.max(1, rect.height);
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  const hit = shopItemRects().find(item =>
    x >= item.x &&
    x <= item.x + item.w &&
    y >= item.y &&
    y <= item.y + item.h
  );
  return hit ? hit.index : -1;
}

function drawCompactShopInterior(items = availableArtifacts()) {
  const margin = Math.max(8, Math.min(12, Math.floor(canvas.width * 0.03)));
  const x = margin;
  const y = margin;
  const w = Math.max(1, canvas.width - margin * 2);
  const h = Math.max(1, canvas.height - margin * 2);
  const itemCount = Math.min(items.length, h < 150 ? 4 : 8);

  ctx.fillStyle = "rgba(10, 10, 10, 0.62)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(25, 24, 23, 0.94)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = state.shopFlash > 0 ? "#20d6b5" : "#6f655a";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  const headerY = y + Math.max(24, Math.min(31, h * 0.14));
  ctx.fillStyle = "#20d6b5";
  ctx.font = `900 ${Math.max(14, Math.min(18, Math.floor(w / 18)))}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText("샵", x + 12, headerY);
  ctx.fillStyle = "#b9b0a3";
  ctx.font = "800 10px monospace";
  ctx.textAlign = "right";
  ctx.fillText("CLUB PAUSED", x + w - 12, headerY - 1);
  ctx.textAlign = "left";

  const top = y + Math.max(43, Math.min(50, h * 0.22));
  const footerH = h < 160 ? 16 : 24;
  const rowH = Math.max(22, Math.min(31, (h - (top - y) - footerH) / itemCount));
  for (let index = 0; index < itemCount; index++) {
    const item = items[index];
    const rowY = top + index * rowH;
    const cost = priceFor(item);
    const count = state.buyCounts[item.id] || 0;
    ctx.fillStyle = state.score >= cost ? "#263f3a" : "#302b2b";
    ctx.fillRect(x + 10, rowY - 16, w - 20, rowH - 4);
    ctx.fillStyle = "#ffc857";
    ctx.font = "900 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${index + 1}`, x + 18, rowY + 1);
    ctx.fillStyle = "#f7f2e8";
    ctx.font = `800 ${Math.max(11, Math.min(13, Math.floor(w / 28)))}px monospace`;
    ctx.textAlign = "left";
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 42, rowY - 16, Math.max(20, w - 150), rowH - 4);
    ctx.clip();
    ctx.fillText(item.name, x + 42, rowY + 1);
    ctx.restore();
    ctx.textAlign = "right";
    ctx.fillText(`${cost} x${count}`, x + w - 18, rowY + 1);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#b9b0a3";
  ctx.font = "800 10px monospace";
  ctx.fillText("TAP ITEM / 1-5 BUY", x + 12, y + h - 10);
}

function drawAllyChoice() {
  ctx.save();
  ctx.fillStyle = "rgba(10, 10, 10, 0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#181715";
  ctx.fillRect(188, 126, 584, 280);
  ctx.strokeStyle = "#ffc857";
  ctx.lineWidth = 4;
  ctx.strokeRect(188, 126, 584, 280);
  ctx.fillStyle = "#ffc857";
  ctx.font = "900 25px monospace";
  ctx.fillText("CREW RECRUIT", 360, 176);
  ctx.fillStyle = "#f7f2e8";
  ctx.font = "800 15px monospace";
  ctx.fillText("5분 생존. 숫자키로 동료를 선택", 332, 204);
  state.allyChoice.forEach((id, index) => {
    const c = characters[id];
    const x = 242 + index * 132;
    ctx.fillStyle = c.color;
    ctx.fillRect(x + 38, 238, 34, 42);
    ctx.fillStyle = "#f0c891";
    ctx.fillRect(x + 45, 220, 20, 20);
    ctx.fillStyle = "#f7f2e8";
    ctx.font = "900 18px monospace";
    ctx.fillText(`${index + 1}`, x + 10, 262);
    ctx.font = "800 14px monospace";
    ctx.fillText(c.name, x + 18, 316);
  });
  ctx.restore();
}

function syncUi() {
  if (!state) return;
  document.body.classList.toggle("shop-mode", state.inShop);
  ui.score.textContent = Math.floor(state.score).toString();
  ui.hp.textContent = `${Math.ceil(state.hp)} / ${Math.ceil(state.maxHp)}`;
  ui.fame.textContent = `${Math.floor(state.fame)}${state.route === "atlantic" ? " / 500" : state.route === "klaxon" ? " / 1000" : ""}`;
  ui.punk.textContent = `${Math.floor(state.punk)} / 500`;
  ui.policeSpeed.textContent = state.inShop ? "PAUSED" : `${currentPoliceMultiplier().toFixed(2)}x`;
  ui.invincible.textContent = `${state.invincible.toFixed(1)}s`;
  ui.location.textContent = `${LOCATIONS[state.locationIndex]} ${Math.min(LOCATIONS.length, state.locationIndex + 1)}/${LOCATIONS.length}`;
  const sceneForces = [
    state.crew.length ? state.crew.map(id => characters[id].name).join(", ") : "",
    state.followers ? `추종자 ${state.followers}` : "",
    state.capitalists ? `자본가 ${state.capitalists}` : ""
  ].filter(Boolean);
  ui.crew.textContent = sceneForces.length ? sceneForces.join(" / ") : "없음";
  ui.titleStatus.textContent = activeTitleName();
  if (ui.shopTitle) ui.shopTitle.textContent = `${state.clubBrand} 내부 샵`;
  ui.buffs.textContent = state.activeBuffs.length
    ? state.activeBuffs.slice(0, 3).map(b => `${b.name} ${Math.ceil(b.remaining)}s`).join(" / ")
    : "없음";
  ui.strum.innerHTML = state.inShop ? "클럽 나가기 <b>Esc</b>" : "일렉기타 / 클럽 입장 <b>Space</b>";
  ui.strum.disabled = state.over;
  ui.power.disabled = state.inShop || state.over;
  ui.rock.disabled = state.inShop || state.score < 1000 || state.over;
  ui.skill.disabled = state.inShop || state.over;
  ui.skill.innerHTML = selected === "kuznetsov" && state.psychedeliaTimer > 0
      ? `싸이키델리아 ${Math.ceil(state.psychedeliaTimer)}s <b>E</b>`
      : selected === "jundai" && state.joseonPunkTimer > 0
      ? `조선펑크 ${Math.ceil(state.joseonPunkTimer)}s <b>E</b>`
      : state.skillCooldown > 0
        ? `캐릭터 스킬 ${Math.ceil(state.skillCooldown)}s <b>E</b>`
      : "캐릭터 스킬 <b>E</b>";
  ui.concert.innerHTML = state.concertTimer > 0
    ? `게릴라 콘서트 ${Math.ceil(state.concertTimer)}s <b>7%</b>`
    : "게릴라 락 콘서트 <b>G</b>";
  ui.concert.disabled = state.inShop || state.over || state.score < 10000 || state.concertTimer > 0;
  syncPunkToggle();
}

function playGuitar(power) {
  const audioState = ensureAudio();
  if (!audioState) return;
  const now = audioState.ctx.currentTime;
  const length = power ? 0.55 : 0.28;
  const gain = audioState.ctx.createGain();
  const shaper = audioState.ctx.createWaveShaper();
  const filter = audioState.ctx.createBiquadFilter();
  const oscA = audioState.ctx.createOscillator();
  const oscB = audioState.ctx.createOscillator();
  shaper.curve = distortionCurve(power ? 650 : 420);
  shaper.oversample = "4x";
  filter.type = "bandpass";
  filter.frequency.value = power ? 880 : 640;
  filter.Q.value = 3.4;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(power ? 0.42 : 0.3, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, now + length);
  oscA.type = "sawtooth";
  oscB.type = "square";
  oscA.frequency.setValueAtTime(power ? 110 : 147, now);
  oscB.frequency.setValueAtTime(power ? 165 : 220, now);
  oscA.connect(shaper);
  oscB.connect(shaper);
  shaper.connect(filter);
  filter.connect(gain);
  gain.connect(audioState.master);
  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + length);
  oscB.stop(now + length);
}

function tickMusic() {
  const audioState = ensureAudio();
  if (!audioState || audioState.ctx.state !== "running") return;
  if (shouldUseExternalMusic()) return;
  const now = audioState.ctx.currentTime;
  updateConcertMusicVolume(audioState, now);
  if (!audioState.nextRiffStep || audioState.nextRiffStep < now) audioState.nextRiffStep = now;
  while (audioState.nextRiffStep < now + 0.12) {
    playRiffStep(audioState.nextRiffStep, audioState.riffStep);
    audioState.nextRiffStep += RIFF_STEP_SECONDS;
    audioState.riffStep += 1;
  }
}

function updateConcertMusicVolume(audioState, now) {
  const target = state && state.concertTimer > 0
    ? BASE_MUSIC_GAIN * CONCERT_MUSIC_MULTIPLIER
    : BASE_MUSIC_GAIN;
  if (audioState.musicTargetGain === target) return;
  audioState.musicTargetGain = target;
  audioState.musicGain.gain.cancelScheduledValues(now);
  audioState.musicGain.gain.setTargetAtTime(target, now, 0.08);
}

function playRiffStep(time, step) {
  const audioState = audio;
  const note = RIFF_NOTES[step % RIFF_NOTES.length];
  const barStep = step % RIFF_STEPS_PER_BAR;
  const accent = barStep === 0 ? 1.28 : barStep % 2 === 0 ? 1.08 : 0.88;
  if (note) playGuitarNote(NOTE_FREQUENCIES[note], time, RIFF_STEP_SECONDS * 0.86, accent);
  if (barStep === 0 || barStep === 4) playKick(time, barStep === 0 ? 1 : 0.62);
}

function playGuitarNote(frequency, time, length, accent = 1) {
  const audioState = audio;
  const gain = audioState.ctx.createGain();
  const shaper = audioState.ctx.createWaveShaper();
  const body = audioState.ctx.createBiquadFilter();
  const bite = audioState.ctx.createBiquadFilter();
  const oscA = audioState.ctx.createOscillator();
  const oscB = audioState.ctx.createOscillator();

  shaper.curve = audioState.riffCurve;
  shaper.oversample = "4x";
  body.type = "bandpass";
  body.frequency.setValueAtTime(1650, time);
  body.Q.value = 1.35;
  bite.type = "highshelf";
  bite.frequency.setValueAtTime(2600, time);
  bite.gain.setValueAtTime(8, time);
  oscA.type = "sawtooth";
  oscB.type = "square";
  oscA.frequency.setValueAtTime(frequency, time);
  oscB.frequency.setValueAtTime(frequency * 2.002, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.17 * accent, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);

  oscA.connect(shaper);
  oscB.connect(shaper);
  shaper.connect(body);
  body.connect(bite);
  bite.connect(gain);
  gain.connect(audioState.musicGain);
  oscA.start(time);
  oscB.start(time);
  oscA.stop(time + length + 0.02);
  oscB.stop(time + length + 0.02);
}

function playKick(time, accent = 1) {
  const audioState = audio;
  const osc = audioState.ctx.createOscillator();
  const gain = audioState.ctx.createGain();
  const filter = audioState.ctx.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(78, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);
  filter.type = "lowpass";
  filter.frequency.value = 420;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.16 * accent, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioState.musicGain);
  osc.start(time);
  osc.stop(time + 0.12);
}

function distortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = i * 2 / samples - 1;
    curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(CANVAS_MIN_W, Math.round(rect.width));
  const height = Math.max(CANVAS_MIN_H, Math.round(rect.height));
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
  if (state) {
    updateCamera();
    ensureWorldAroundView();
    updateCamera();
  }
}

function syncViewportHeight() {
  const viewport = window.visualViewport;
  const height = viewport ? viewport.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-vh", `${Math.round(height)}px`);
  resizeCanvas();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateCamera() {
  const bounds = state.world.bounds;
  const maxX = Math.max(bounds.minX, bounds.maxX - canvas.width);
  const maxY = Math.max(bounds.minY, bounds.maxY - canvas.height);
  state.camera.x = clamp(state.player.x + state.player.w / 2 - canvas.width / 2, bounds.minX, maxX);
  state.camera.y = clamp(state.player.y + state.player.h / 2 - canvas.height / 2, bounds.minY, maxY);
}

function isRoadPoint(x, y, roads, margin = 0) {
  return roads.some(road =>
    x >= road.x - margin &&
    x <= road.x + road.w + margin &&
    y >= road.y - margin &&
    y <= road.y + road.h + margin
  );
}

function expandRect(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

syncViewportHeight();
window.addEventListener("resize", syncViewportHeight);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncViewportHeight);
  window.visualViewport.addEventListener("scroll", syncViewportHeight);
}
loadScores();
draw();
requestAnimationFrame(loop);
