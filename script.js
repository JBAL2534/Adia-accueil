const STORAGE_KEY = "adia-presence-visible-demo";
const SERVER_SYNC_ENABLED = window.location.protocol.startsWith("http");

const defaultAppointments = [
  {
    id: "a1",
    name: "Camille R.",
    code: "camille",
    practitioner: "Dr Martin",
    reason: "Contrôle annuel",
    time: "10:30",
    room: "Salle 2",
    status: "scheduled",
  },
  {
    id: "a2",
    name: "Nora B.",
    code: "nora",
    practitioner: "Dr Martin",
    reason: "Radio panoramique",
    time: "10:45",
    room: "Salle 1",
    status: "scheduled",
  },
  {
    id: "a3",
    name: "Marc D.",
    code: "marc",
    practitioner: "Dr Cohen",
    reason: "Urgence douleur",
    time: "11:00",
    room: "Salle 3",
    status: "scheduled",
  },
  {
    id: "a4",
    name: "Sophie L.",
    code: "sophie",
    practitioner: "Dr Levy",
    reason: "Détartrage",
    time: "11:20",
    room: "Salle 4",
    status: "scheduled",
  },
  {
    id: "a5",
    name: "Yanis P.",
    code: "yanis",
    practitioner: "Dr Moreau",
    reason: "Consultation enfant",
    time: "11:40",
    room: "Salle 5",
    status: "scheduled",
  },
];

const defaultPatients = [
  {
    id: "p1",
    appointmentId: "a1",
    name: "Camille R.",
    practitioner: "Dr Martin",
    reason: "Contrôle annuel",
    time: "10:30",
    room: "Salle 2",
    status: "arrived",
    wait: 7,
    late: 0,
    priority: "normal",
  },
  {
    id: "p2",
    appointmentId: "a2",
    name: "Nora B.",
    practitioner: "Dr Martin",
    reason: "Radio panoramique",
    time: "10:45",
    room: "Salle 1",
    status: "waiting",
    wait: 13,
    late: 6,
    priority: "watch",
  },
  {
    id: "p3",
    appointmentId: "a3",
    name: "Marc D.",
    practitioner: "Dr Cohen",
    reason: "Urgence douleur",
    time: "11:00",
    room: "Salle 3",
    status: "in_care",
    wait: 21,
    late: 11,
    priority: "urgent",
  },
];

const defaultActivityLog = [
  {
    id: "e1",
    time: "10:31",
    title: "Camille R. a validé sa présence",
    detail: "Dr Martin · Contrôle annuel",
    kind: "arrival",
  },
  {
    id: "e2",
    time: "10:46",
    title: "Nora B. est en attente",
    detail: "Retard à surveiller · Salle 1",
    kind: "watch",
  },
];

const defaultCabinetConfig = {
  cabinetName: "Cabinet Montaigne",
  kioskTitle: "Indiquez simplement votre présence.",
  kioskMessage: "La borne confirme simplement votre présence et prévient l'équipe du cabinet.",
  patientInstructions: {
    prompt: "Nom et prénom obligatoires. Après validation : gel hydroalcoolique, puis salle d'attente.",
    appointmentSuccess: "{nom}, présence validée. Gel hydroalcoolique, puis salle d'attente de {praticien}.",
    secretariatSuccess: "{nom}, secrétariat prévenu. Gel hydroalcoolique, puis patientez en salle d'attente.",
    unmatchedSuccess: "{nom}, {cible} prévenu. Gel hydroalcoolique, puis salle d'attente.",
  },
  brand: {
    logo: "",
    primaryColor: "#153e75",
    accentColor: "#0f766e",
  },
  accessibility: {
    textSize: "standard",
    contrast: "normal",
    largeButtons: false,
    seniorMode: false,
  },
  kioskBehavior: {
    confirmationSeconds: 8,
    autoReturn: true,
    guidedName: true,
    helpButton: true,
    helpLabel: "J'ai besoin d'aide",
  },
  teamCounts: {
    practitioners: 5,
    secretaries: 5,
    assistants: 5,
  },
  teamNames: {
    practitioners: [],
    secretaries: [],
    assistants: [],
  },
  teamPhotos: {
    practitioners: [],
    secretaries: [],
    assistants: [],
  },
  teamLabels: {
    practitioner: "Praticiens",
    secretariat: "Secrétariat",
    assistant: "Assistantes cliniques",
    practitionerTitle: "Chirurgien-dentiste",
  },
  privacyMode: false,
  soundEnabled: false,
};

const teamSetup = {
  practitioners: [
    { id: "martin", name: "Dr Martin", room: "Salle 2", color: "#153e75", accent: "#5ec2b7", hair: "#3b2f2f", skin: "#f0c7a8" },
    { id: "cohen", name: "Dr Cohen", room: "Salle 3", color: "#0f766e", accent: "#8fd8cf", hair: "#20242a", skin: "#d8aa82" },
    { id: "benamou", name: "Dr Benamou", room: "Salle 1", color: "#7a4f9a", accent: "#d2b6ee", hair: "#6b4732", skin: "#f3c9ad" },
    { id: "levy", name: "Dr Levy", room: "Salle 4", color: "#9a4f64", accent: "#f0bacb", hair: "#3b2b25", skin: "#edbea0" },
    { id: "moreau", name: "Dr Moreau", room: "Salle 5", color: "#566c2f", accent: "#cfe6a1", hair: "#272a22", skin: "#dcb08a" },
  ],
};

function normalizeTeamCounts(counts = {}) {
  const readCount = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(Math.max(parsed, 0), 12);
  };

  return {
    practitioners: readCount(counts.practitioners, defaultCabinetConfig.teamCounts.practitioners),
    secretaries: readCount(counts.secretaries, defaultCabinetConfig.teamCounts.secretaries),
    assistants: readCount(counts.assistants, defaultCabinetConfig.teamCounts.assistants),
  };
}

function normalizeTeamNames(names = {}) {
  const cleanList = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 12);
    }
    if (typeof value === "string") {
      return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
    }
    return [];
  };

  return {
    practitioners: cleanList(names.practitioners),
    secretaries: cleanList(names.secretaries),
    assistants: cleanList(names.assistants),
  };
}

function normalizeTeamPhotos(photos = {}) {
  const cleanList = (value) => {
    const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/) : [];
    return items
      .map((item) => String(item || "").trim())
      .filter((item) => /^(https?:\/\/|data:image\/)/i.test(item))
      .slice(0, 12);
  };

  return {
    practitioners: cleanList(photos.practitioners),
    secretaries: cleanList(photos.secretaries),
    assistants: cleanList(photos.assistants),
  };
}

function normalizeTeamLabels(labels = {}) {
  const fallback = defaultCabinetConfig.teamLabels;
  const read = (key) => {
    const value = String(labels[key] || "").trim().slice(0, 40);
    return value || fallback[key];
  };
  return {
    practitioner: read("practitioner"),
    secretariat: read("secretariat"),
    assistant: read("assistant"),
    practitionerTitle: read("practitionerTitle"),
  };
}

function normalizePatientInstructions(instructions = {}) {
  const fallback = defaultCabinetConfig.patientInstructions;
  const readInstruction = (key) => String(instructions[key] || fallback[key] || "").trim();
  return {
    prompt: readInstruction("prompt"),
    appointmentSuccess: readInstruction("appointmentSuccess"),
    secretariatSuccess: readInstruction("secretariatSuccess"),
    unmatchedSuccess: readInstruction("unmatchedSuccess"),
  };
}

function normalizeBrand(brand = {}) {
  const fallback = defaultCabinetConfig.brand;
  const readColor = (value, fallbackValue) => {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : fallbackValue;
  };
  const logo = String(brand.logo || "").trim();
  return {
    logo: /^(https?:\/\/|data:image\/)/i.test(logo) ? logo : "",
    primaryColor: readColor(brand.primaryColor, fallback.primaryColor),
    accentColor: readColor(brand.accentColor, fallback.accentColor),
  };
}

function normalizeAccessibility(accessibility = {}) {
  return {
    textSize: ["standard", "large", "xlarge"].includes(accessibility.textSize)
      ? accessibility.textSize
      : defaultCabinetConfig.accessibility.textSize,
    contrast: accessibility.contrast === "high" ? "high" : "normal",
    largeButtons: Boolean(accessibility.largeButtons),
    seniorMode: Boolean(accessibility.seniorMode),
  };
}

function normalizeKioskBehavior(behavior = {}) {
  const readSeconds = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return defaultCabinetConfig.kioskBehavior.confirmationSeconds;
    return Math.min(Math.max(parsed, 4), 20);
  };
  const helpLabel = String(behavior.helpLabel || defaultCabinetConfig.kioskBehavior.helpLabel).trim();
  return {
    confirmationSeconds: readSeconds(behavior.confirmationSeconds),
    autoReturn: behavior.autoReturn !== false,
    guidedName: behavior.guidedName !== false,
    helpButton: behavior.helpButton !== false,
    helpLabel: helpLabel.slice(0, 40) || defaultCabinetConfig.kioskBehavior.helpLabel,
  };
}

function formatPatientInstruction(template, replacements = {}) {
  return String(template || "")
    .replaceAll("{nom}", replacements.name || "")
    .replaceAll("{praticien}", replacements.practitioner || "")
    .replaceAll("{cible}", replacements.target || "");
}

function getFullNameValidationMessage(value, { allowOrganization = false } = {}) {
  const cleaned = String(value || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return allowOrganization ? "Indiquez un nom ou une société." : "Indiquez le nom et prénom du patient.";
  if (allowOrganization) return "";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 2) return "Merci d'indiquer le nom et le prénom.";
  if (parts.some((part) => part.length < 2)) return "Merci de saisir un nom et un prénom lisibles.";
  return "";
}

function parseTeamNameEntry(value = "") {
  const [rawName, rawPractitioner] = String(value).split("|");
  return {
    name: String(rawName || "").trim(),
    practitioner: String(rawPractitioner || "").trim(),
  };
}

function getTeamNameEntry(list, index, fallbackName = "", fallbackPractitioner = "") {
  const entry = parseTeamNameEntry(list[index] || "");
  return {
    name: entry.name || fallbackName,
    practitioner: entry.practitioner || fallbackPractitioner,
  };
}

function findPractitionerAssignment(practitioners, requestedName, index) {
  if (requestedName) {
    const match = practitioners.find((practitioner) => normalize(practitioner.name) === normalize(requestedName));
    if (match) return match;
  }
  return practitioners[index % Math.max(practitioners.length, 1)] || { id: "cabinet", name: "Cabinet" };
}

// Marqueur : personne rattachée à aucun praticien (secrétariat / accueil mutualisé).
const SHARED_AGENDA = "__mutualise__";
const SHARED_AGENDA_LABEL = "— Non rattaché(e) · accueil partagé —";

function buildConfigurableTeamMembers(
  setup = teamSetup,
  counts = defaultCabinetConfig.teamCounts,
  names = defaultCabinetConfig.teamNames,
  photos = defaultCabinetConfig.teamPhotos,
  labels = defaultCabinetConfig.teamLabels,
) {
  const normalizedCounts = normalizeTeamCounts(counts);
  const normalizedNames = normalizeTeamNames(names);
  const normalizedPhotos = normalizeTeamPhotos(photos);
  const normalizedLabels = normalizeTeamLabels(labels);
  const allPractitioners = setup.practitioners || [];
  const fallbackPractitioner = allPractitioners[0] || {};
  const practitioners = Array.from({ length: normalizedCounts.practitioners }, (_, index) => {
    const base = allPractitioners[index % Math.max(allPractitioners.length, 1)] || fallbackPractitioner;
    return {
      ...base,
      id: index < allPractitioners.length ? base.id : `${base.id || "custom"}-${index + 1}`,
      name: getTeamNameEntry(normalizedNames.practitioners, index, base.name || `Praticien ${index + 1}`).name,
      photo: normalizedPhotos.practitioners[index] || "",
    };
  });
  const practitionerCards = practitioners.map((item) => ({
    ...item,
    id: `dr-${item.id}`,
    group: "practitioner",
    role: normalizedLabels.practitionerTitle,
    practitioner: item.name,
  }));

  const secretaryCards = Array.from({ length: normalizedCounts.secretaries }, (_, index) => {
    const entry = getTeamNameEntry(normalizedNames.secretaries, index, "Secrétaire");
    const isShared = entry.practitioner === SHARED_AGENDA;
    const item = isShared
      ? fallbackPractitioner
      : findPractitionerAssignment(practitioners, entry.practitioner, index) || fallbackPractitioner;
    return {
      ...item,
      id: `secretariat-${isShared ? "commun" : item.id || "cabinet"}-${index + 1}`,
      group: "secretariat",
      name: entry.name,
      role: isShared ? normalizedLabels.secretariat : `Pour ${item.name}`,
      practitioner: isShared ? "" : item.name,
      shared: isShared,
      room: "Accueil",
      color: "#2f6f95",
      accent: "#b8def1",
      hair: "#252a32",
      skin: "#f1c4a4",
      photo: normalizedPhotos.secretaries[index] || "",
    };
  });

  const assistantCards = Array.from({ length: normalizedCounts.assistants }, (_, index) => {
    const entry = getTeamNameEntry(normalizedNames.assistants, index, "Assistante clinique");
    const isShared = entry.practitioner === SHARED_AGENDA;
    const item = isShared
      ? fallbackPractitioner
      : findPractitionerAssignment(practitioners, entry.practitioner, index) || fallbackPractitioner;
    return {
      ...item,
      id: `assistante-${isShared ? "commun" : item.id || "cabinet"}-${index + 1}`,
      group: "assistant",
      name: entry.name,
      role: isShared ? normalizedLabels.assistant : `Pour ${item.name}`,
      practitioner: isShared ? "" : item.name,
      shared: isShared,
      color: "#c27a17",
      accent: "#ffd99a",
      hair: "#7a4b33",
      skin: "#e7b88f",
      photo: normalizedPhotos.assistants[index] || "",
    };
  });
  return [...practitionerCards, ...secretaryCards, ...assistantCards];
}

let teamMembers = buildConfigurableTeamMembers(teamSetup);

const loadedState = loadState();
let appointments = loadedState.appointments;
let patients = loadedState.patients;
let activityLog = loadedState.activityLog;
let cabinetConfig = loadedState.cabinetConfig;
let selectedAppointmentId = "a1";
let selectedTeamMemberId = "dr-martin";
let kioskMode = "appointment";
let isApplyingRemoteState = false;
let initialServerSyncDone = !SERVER_SYNC_ENABLED;
let syncTimer = null;
let activeTicketAppointmentId = "";
let queueSearch = "";
let queuePractitionerFilter = "all";
let queueRoomFilter = "all";
let queueStatusFilter = "all";
let auditFilter = "all";
let frontdeskSearch = "";
let frontdeskStaffScope = "";
let doctorPractitionerScope = "Dr Martin";
let assistantPractitionerScope = "Dr Martin";
let audioContext = null;
let recipeClearArmed = false;
let editingAppointmentId = "";
let appointmentDeleteArmedId = "";
let appointmentDeleteArmedTimer = null;
let closeDayArmed = false;
let closeDayArmedTimer = null;
let realTestCloseArmed = false;
let realTestCloseArmedTimer = null;
let kioskReturnTimer = null;
let kioskCountdownTimer = null;

const columns = [
  ["Présents", ["arrived", "waiting"]],
  ["En soin", ["in_care"]],
  ["Terminés", ["completed"]],
];

const trackedRooms = ["Salle 1", "Salle 2", "Salle 3", "Accueil"];

const labels = {
  arrived: "Présent",
  waiting: "En attente",
  in_care: "En soin",
  completed: "Terminé",
};

const appointmentLabels = {
  scheduled: "Planifié",
  confirmed: "Confirmé",
  arrived: "Présent",
  in_progress: "En cours",
  completed: "Terminé",
  canceled: "Annulé",
  no_show: "Absent",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCabinetConfig(config = {}) {
  const normalizedConfig = { ...defaultCabinetConfig, ...config };
  normalizedConfig.brand = normalizeBrand(config.brand || defaultCabinetConfig.brand);
  normalizedConfig.accessibility = normalizeAccessibility(config.accessibility || defaultCabinetConfig.accessibility);
  normalizedConfig.kioskBehavior = normalizeKioskBehavior(config.kioskBehavior || defaultCabinetConfig.kioskBehavior);
  normalizedConfig.teamCounts = normalizeTeamCounts(config.teamCounts || defaultCabinetConfig.teamCounts);
  normalizedConfig.teamNames = normalizeTeamNames(config.teamNames || defaultCabinetConfig.teamNames);
  normalizedConfig.teamPhotos = normalizeTeamPhotos(config.teamPhotos || defaultCabinetConfig.teamPhotos);
  normalizedConfig.teamLabels = normalizeTeamLabels(config.teamLabels || defaultCabinetConfig.teamLabels);
  normalizedConfig.patientInstructions = normalizePatientInstructions(
    config.patientInstructions || defaultCabinetConfig.patientInstructions,
  );
  normalizedConfig.kioskTitle = String(normalizedConfig.kioskTitle || defaultCabinetConfig.kioskTitle)
    .replace(/venue/gi, "présence")
    .replace(/arrivée/gi, "présence");
  normalizedConfig.kioskMessage = String(normalizedConfig.kioskMessage || defaultCabinetConfig.kioskMessage)
    .replace(/venue/gi, "présence")
    .replace(/arrivée/gi, "présence");
  return normalizedConfig;
}

function rebuildTeamMembers() {
  teamMembers = buildConfigurableTeamMembers(
    teamSetup,
    cabinetConfig.teamCounts,
    cabinetConfig.teamNames,
    cabinetConfig.teamPhotos,
    cabinetConfig.teamLabels,
  );
  if (!teamMembers.some((member) => member.id === selectedTeamMemberId)) {
    selectedTeamMemberId = teamMembers[0]?.id || "";
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
    if (Array.isArray(saved.appointments) && Array.isArray(saved.patients)) {
      return {
        appointments: saved.appointments,
        patients: saved.patients,
        activityLog: Array.isArray(saved.activityLog)
          ? saved.activityLog
          : clone(defaultActivityLog),
        cabinetConfig: normalizeCabinetConfig(saved.cabinetConfig),
      };
    }
  } catch {
    // La démo reste utilisable même si le stockage local est vide ou corrompu.
  }

  return {
    appointments: clone(defaultAppointments),
    patients: clone(defaultPatients),
    activityLog: clone(defaultActivityLog),
    cabinetConfig: clone(defaultCabinetConfig),
  };
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ appointments, patients, activityLog, cabinetConfig }),
  );
  if (initialServerSyncDone && !isApplyingRemoteState) scheduleServerSync();
}

function getStateSnapshot() {
  return { appointments, patients, activityLog, cabinetConfig };
}

function stateFingerprint(state) {
  return JSON.stringify({
    appointments: state.appointments || [],
    patients: state.patients || [],
    activityLog: state.activityLog || [],
    cabinetConfig: state.cabinetConfig || {},
  });
}

function scheduleServerSync() {
  if (!SERVER_SYNC_ENABLED || typeof fetch !== "function") return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncStateToServer, 250);
}

async function syncStateToServer() {
  if (!SERVER_SYNC_ENABLED || typeof fetch !== "function") return;
  try {
    await fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(getStateSnapshot()),
    });
  } catch {
    // La démo reste utilisable en local si le serveur n'est pas joignable.
  }
}

async function syncFromServer({ silent = true } = {}) {
  if (!SERVER_SYNC_ENABLED || typeof fetch !== "function") return;
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    const payload = await response.json();
    if (!payload.state) {
      initialServerSyncDone = true;
      scheduleServerSync();
      return;
    }

    const remoteFingerprint = stateFingerprint(payload.state);
    const localFingerprint = stateFingerprint(getStateSnapshot());
    initialServerSyncDone = true;
    if (remoteFingerprint === localFingerprint) return;

    try {
      isApplyingRemoteState = true;
      appointments = Array.isArray(payload.state.appointments) ? payload.state.appointments : [];
      patients = Array.isArray(payload.state.patients) ? payload.state.patients : [];
      activityLog = Array.isArray(payload.state.activityLog) ? payload.state.activityLog : [];
      cabinetConfig = normalizeCabinetConfig(payload.state.cabinetConfig);
      applyCabinetConfig();
      renderBoard();
    } finally {
      isApplyingRemoteState = false;
    }
    if (!silent) showToast("Données synchronisées depuis le serveur local.");
  } catch {
    initialServerSyncDone = true;
  }
}

function logEvent(title, detail, kind = "info") {
  const createdAt = Date.now();
  activityLog.unshift({
    id: `e${createdAt}`,
    createdAt,
    time: new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    title,
    detail,
    kind,
  });
  activityLog = activityLog.slice(0, 30);
  persistState();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.add("hidden"), 3600);
}

function showNotification(title, detail, { sound = true } = {}) {
  const pop = document.getElementById("notification-pop");
  document.getElementById("notification-title").textContent = title;
  document.getElementById("notification-detail").textContent = detail;
  pop.classList.remove("hidden");
  window.clearTimeout(showNotification.timeout);
  showNotification.timeout = window.setTimeout(() => pop.classList.add("hidden"), 4200);
  if (sound) playNotificationSound();
}

function playNotificationSound() {
  if (!cabinetConfig.soundEnabled || typeof AudioContext === "undefined") return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.28);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
}

function updateSoundButton() {
  const button = document.getElementById("toggle-sound");
  if (!button) return;
  button.textContent = cabinetConfig.soundEnabled ? "Son activé" : "Son désactivé";
  button.classList.toggle("sound-on", cabinetConfig.soundEnabled);
}

function toggleSound() {
  cabinetConfig.soundEnabled = !cabinetConfig.soundEnabled;
  persistState();
  updateSoundButton();
  showNotification(
    cabinetConfig.soundEnabled ? "Son activé" : "Son désactivé",
    cabinetConfig.soundEnabled ? "Les arrivées déclencheront un signal discret." : "Les notifications restent visuelles.",
    { sound: cabinetConfig.soundEnabled },
  );
}

function maskName(name) {
  const parts = name.split(" ").filter(Boolean);
  if (!cabinetConfig.privacyMode || parts.length === 0) return name;
  const first = parts[0];
  const lastInitial = parts[1] ? `${parts[1][0].toUpperCase()}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function getBrandInitial() {
  return (cabinetConfig.cabinetName || "ADIA").trim().charAt(0).toUpperCase() || "A";
}

function applyBrandIdentity() {
  document.documentElement.style.setProperty("--blue", cabinetConfig.brand.primaryColor);
  document.documentElement.style.setProperty("--teal", cabinetConfig.brand.accentColor);
  document.querySelectorAll(".brand span").forEach((mark) => {
    mark.innerHTML = cabinetConfig.brand.logo
      ? `<img alt="Logo ${escapeAttribute(cabinetConfig.cabinetName)}" src="${escapeAttribute(cabinetConfig.brand.logo)}" />`
      : getBrandInitial();
    mark.classList.toggle("has-logo", Boolean(cabinetConfig.brand.logo));
  });
}

function applyAccessibilitySettings() {
  document.body.classList.toggle("kiosk-text-large", cabinetConfig.accessibility.textSize === "large");
  document.body.classList.toggle("kiosk-text-xlarge", cabinetConfig.accessibility.textSize === "xlarge");
  document.body.classList.toggle("kiosk-high-contrast", cabinetConfig.accessibility.contrast === "high");
  document.body.classList.toggle("kiosk-large-buttons", cabinetConfig.accessibility.largeButtons);
  document.body.classList.toggle("kiosk-senior-mode", cabinetConfig.accessibility.seniorMode);
  document.body.classList.toggle("kiosk-guided-name", cabinetConfig.kioskBehavior.guidedName || cabinetConfig.accessibility.seniorMode);
}

function applyCabinetConfig() {
  rebuildTeamMembers();
  applyBrandIdentity();
  applyAccessibilitySettings();
  document.querySelectorAll(".cabinet-name").forEach((item) => {
    item.textContent = cabinetConfig.cabinetName;
  });
  document.getElementById("kiosk-title").textContent = cabinetConfig.kioskTitle;
  document.getElementById("kiosk-message").textContent = cabinetConfig.kioskMessage;
  document.getElementById("setting-cabinet-name").value = cabinetConfig.cabinetName;
  document.getElementById("setting-brand-logo").value = cabinetConfig.brand.logo;
  document.getElementById("setting-brand-primary").value = cabinetConfig.brand.primaryColor;
  document.getElementById("setting-brand-accent").value = cabinetConfig.brand.accentColor;
  document.getElementById("setting-text-size").value = cabinetConfig.accessibility.textSize;
  document.getElementById("setting-contrast").value = cabinetConfig.accessibility.contrast;
  document.getElementById("setting-large-buttons").checked = cabinetConfig.accessibility.largeButtons;
  document.getElementById("setting-senior-mode").checked = cabinetConfig.accessibility.seniorMode;
  document.getElementById("setting-confirmation-seconds").value = cabinetConfig.kioskBehavior.confirmationSeconds;
  document.getElementById("setting-auto-return").checked = cabinetConfig.kioskBehavior.autoReturn;
  document.getElementById("setting-guided-name").checked = cabinetConfig.kioskBehavior.guidedName;
  document.getElementById("setting-help-button").checked = cabinetConfig.kioskBehavior.helpButton;
  document.getElementById("setting-help-label").value = cabinetConfig.kioskBehavior.helpLabel;
  document.getElementById("setting-kiosk-title").value = cabinetConfig.kioskTitle;
  document.getElementById("setting-kiosk-message").value = cabinetConfig.kioskMessage;
  document.getElementById("setting-instruction-prompt").value = cabinetConfig.patientInstructions.prompt;
  document.getElementById("setting-instruction-appointment").value = cabinetConfig.patientInstructions.appointmentSuccess;
  document.getElementById("setting-instruction-secretariat").value = cabinetConfig.patientInstructions.secretariatSuccess;
  document.getElementById("setting-instruction-unmatched").value = cabinetConfig.patientInstructions.unmatchedSuccess;
  const scanStatus = document.getElementById("scan-status");
  const kioskSearch = document.getElementById("kiosk-search");
  if (scanStatus && (!kioskSearch || !kioskSearch.value.trim())) {
    setKioskScanStatus(cabinetConfig.patientInstructions.prompt);
  }
  document.getElementById("setting-practitioner-count").value = cabinetConfig.teamCounts.practitioners;
  document.getElementById("setting-secretary-count").value = cabinetConfig.teamCounts.secretaries;
  document.getElementById("setting-assistant-count").value = cabinetConfig.teamCounts.assistants;
  document.getElementById("setting-practitioner-names").value = cabinetConfig.teamNames.practitioners.join("\n");
  document.getElementById("setting-secretary-names").value = cabinetConfig.teamNames.secretaries.join("\n");
  document.getElementById("setting-assistant-names").value = cabinetConfig.teamNames.assistants.join("\n");
  document.getElementById("setting-practitioner-photos").value = cabinetConfig.teamPhotos.practitioners.join("\n");
  document.getElementById("setting-secretary-photos").value = cabinetConfig.teamPhotos.secretaries.join("\n");
  document.getElementById("setting-assistant-photos").value = cabinetConfig.teamPhotos.assistants.join("\n");
  document.getElementById("setting-label-practitioner").value = cabinetConfig.teamLabels.practitioner;
  document.getElementById("setting-label-practitioner-title").value = cabinetConfig.teamLabels.practitionerTitle;
  document.getElementById("setting-label-secretariat").value = cabinetConfig.teamLabels.secretariat;
  document.getElementById("setting-label-assistant").value = cabinetConfig.teamLabels.assistant;
  document.getElementById("setting-privacy-mode").checked = cabinetConfig.privacyMode;
  updateSoundButton();
  renderBrandPreview();
  renderKioskProfilePreview();
  renderAccessibilityPreview();
  renderKioskHelpPreview();
  updateKioskHelpButton();
  renderLaunchUrl();
  seedAssignmentEditorFromConfig();
}

function getAppUrl() {
  if (window.location.protocol.startsWith("http")) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
  }
  return "http://localhost:4173";
}

function getKioskUrl() {
  const url = new URL(getAppUrl());
  url.searchParams.set("borne", "1");
  return url.toString();
}

function getViewUrl(view) {
  const url = new URL(getAppUrl());
  url.searchParams.set("view", view);
  return url.toString();
}

function getScopedViewUrl(view, scope) {
  const url = new URL(getViewUrl(view));
  if (scope) {
    url.searchParams.set("scope", scope);
  }
  return url.toString();
}

function getStaffViewUrl(view, staff) {
  const url = new URL(getViewUrl(view));
  if (staff) {
    url.searchParams.set("staff", staff);
  }
  return url.toString();
}

function getConfiguredPractitioners() {
  return teamMembers.filter((member) => member.group === "practitioner");
}

function getConfiguredSecretaries() {
  return teamMembers.filter((member) => member.group === "secretariat");
}

function getConfiguredAssistants() {
  return teamMembers.filter((member) => member.group === "assistant");
}

function getPractitionerNames() {
  const names = getConfiguredPractitioners().map((member) => member.name);
  return names.length ? names : teamSetup.practitioners.map((item) => item.name);
}

function getWorkstationScopeStats(role, practitioner = "") {
  const activePatients = patients.filter((patient) => patient.status !== "completed");
  if (role === "Praticien") {
    const visible = getScopedPatients(practitioner);
    return {
      visible: visible.length,
      hidden: Math.max(activePatients.length - visible.length, 0),
    };
  }
  if (role === "Assistante clinique") {
    const statuses = ["arrived", "waiting", "in_preparation", "in_care"];
    const visible = getScopedPatients(practitioner, statuses);
    const hidden = activePatients.filter(
      (patient) => statuses.includes(patient.status) && patient.practitioner !== practitioner,
    );
    return {
      visible: visible.length,
      hidden: hidden.length,
    };
  }
  if (role === "Accueil") {
    return {
      visible: appointments.length + patients.length,
      hidden: 0,
    };
  }
  return {
    visible: activePatients.length,
    hidden: 0,
  };
}

function renderLaunchUrl() {
  const field = document.getElementById("launch-url");
  const status = document.getElementById("server-sync-status");
  if (!field) return;
  field.value = getKioskUrl();
  if (status) {
    status.textContent = SERVER_SYNC_ENABLED
      ? "Synchronisation multi-écrans active"
      : "Mode local: ouvrez http://localhost:4173 pour tester avec iPad";
    status.classList.toggle("active", SERVER_SYNC_ENABLED);
  }
}

function getDirectLinks() {
  return [
    {
      label: "Borne iPad patient",
      detail: "À ouvrir sur la tablette d'accueil",
      url: getKioskUrl(),
    },
    {
      label: "Accueil secrétariat",
      detail: "Console du jour pour les secrétaires",
      url: getViewUrl("frontdesk"),
    },
    {
      label: "Pilotage cabinet",
      detail: "Vue générale des présences",
      url: getViewUrl("dashboard"),
    },
    {
      label: "Administration",
      detail: "Paramétrage, équipe, exports et tests",
      url: getViewUrl("admin"),
    },
  ];
}

function renderDirectLinks() {
  const list = document.getElementById("direct-link-list");
  if (!list) return;

  list.innerHTML = getDirectLinks()
    .map(
      (item, index) => `
        <article class="direct-link-item">
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
            <code>${item.url}</code>
          </div>
          <button data-copy-direct-link="${index}" type="button">Copier</button>
        </article>
      `,
    )
    .join("");

  list.querySelectorAll("[data-copy-direct-link]").forEach((button) => {
    button.addEventListener("click", () => copyDirectLink(Number(button.dataset.copyDirectLink)));
  });
}

function getWorkstationLinks() {
  const practitioners = getPractitionerNames();
  const secretaries = getConfiguredSecretaries();
  const assistants = getConfiguredAssistants();
  const secretaryLinks = secretaries.map((member) => ({
    label: `Poste ${member.name}`,
    role: "Secrétariat",
    detail: `Accueil global · référent ${member.practitioner}`,
    url: getStaffViewUrl("frontdesk", member.name),
    stats: getWorkstationScopeStats("Accueil"),
  }));
  const practitionerLinks = practitioners.map((name) => ({
    label: `Poste ${name}`,
    role: "Praticien",
    detail: `File clinique limitée à ${name}`,
    url: getScopedViewUrl("praticien", name),
    stats: getWorkstationScopeStats("Praticien", name),
  }));

  const assistantLinks = assistants.map((member) => ({
    label: `Poste ${member.name}`,
    role: "Assistante clinique",
    detail: `Préparation patients pour ${member.practitioner}`,
    url: getScopedViewUrl("assistante", member.practitioner),
    stats: getWorkstationScopeStats("Assistante clinique", member.practitioner),
  }));

  return [
    ...(secretaryLinks.length
      ? secretaryLinks
      : [
          {
            label: "Poste secrétariat",
            role: "Accueil",
            detail: "Vue globale accueil, demandes sans rendez-vous et patients à vérifier",
            url: getViewUrl("frontdesk"),
            stats: getWorkstationScopeStats("Accueil"),
          },
        ]),
    ...practitionerLinks,
    ...assistantLinks,
    {
      label: "Poste direction",
      role: "Pilotage",
      detail: "Vue globale cabinet et exploitation de la journée",
      url: getViewUrl("dashboard"),
      stats: getWorkstationScopeStats("Pilotage"),
    },
    {
      label: "Poste administration",
      role: "Admin",
      detail: "Paramétrage équipe, borne, exports et installation",
      url: getViewUrl("admin"),
      stats: { visible: teamMembers.length, hidden: 0 },
    },
  ];
}

function renderWorkstationLinks() {
  const list = document.getElementById("workstation-link-list");
  if (!list) return;

  list.innerHTML = getWorkstationLinks()
    .map(
      (item, index) => `
        <article class="workstation-link-item">
          <div>
            <strong>${item.label}</strong>
            <small>${item.role} · ${item.detail}</small>
            <span class="workstation-link-meta">
              Visible aujourd'hui: ${item.stats.visible} · Masqué: ${item.stats.hidden}
            </span>
            <code>${item.url}</code>
          </div>
          <div class="workstation-link-actions">
            <button data-open-workstation-link="${index}" type="button">Ouvrir</button>
            <button data-copy-workstation-link="${index}" type="button">Copier</button>
          </div>
        </article>
      `,
    )
    .join("");

  list.querySelectorAll("[data-copy-workstation-link]").forEach((button) => {
    button.addEventListener("click", () => copyWorkstationLink(Number(button.dataset.copyWorkstationLink)));
  });
  list.querySelectorAll("[data-open-workstation-link]").forEach((button) => {
    button.addEventListener("click", () => openWorkstationLink(Number(button.dataset.openWorkstationLink)));
  });
}

async function copyDirectLink(index) {
  const link = getDirectLinks()[index];
  if (!link) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link.url);
      showToast(`${link.label}: adresse copiée.`);
      return;
    }
  } catch {
    // La copie automatique peut être bloquée selon le navigateur.
  }
  showToast(`${link.label}: ${link.url}`);
}

async function copyWorkstationLink(index) {
  const link = getWorkstationLinks()[index];
  if (!link) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link.url);
      showToast(`${link.label}: adresse copiée.`);
      return;
    }
  } catch {
    // La copie automatique peut être bloquée selon le navigateur.
  }
  showToast(`${link.label}: ${link.url}`);
}

function openWorkstationLink(index) {
  const link = getWorkstationLinks()[index];
  if (!link) return;
  window.location.href = link.url;
}

function activateView(viewId) {
  document.querySelectorAll("[data-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
}

function applyStartupRoute() {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view");
  const requestedScope = params.get("scope");
  const requestedStaff = params.get("staff");
  if (requestedStaff && requestedView === "frontdesk") {
    frontdeskStaffScope = requestedStaff;
  }
  if (requestedScope) {
    const practitioner = getConfiguredPractitioners().find((item) => normalize(item.name) === normalize(requestedScope));
    if (practitioner && requestedView === "praticien") {
      doctorPractitionerScope = practitioner.name;
    }
    if (practitioner && requestedView === "assistante") {
      assistantPractitionerScope = practitioner.name;
    }
  }
  const shouldOpenKiosk = params.get("borne") === "1" || params.get("view") === "kiosk";
  if (requestedView && document.getElementById(requestedView)) {
    activateView(requestedView);
  }
  if (!shouldOpenKiosk) return;

  activateView("kiosk");
  updateKioskMode("appointment");
  document.body.classList.add("kiosk-locked");
  document.getElementById("kiosk-fullscreen").textContent = params.get("borne") === "1"
    ? "Mode borne"
    : "Quitter borne";
}

function resetDemoState() {
  appointments = clone(defaultAppointments);
  patients = clone(defaultPatients);
  activityLog = clone(defaultActivityLog);
  cabinetConfig = clone(defaultCabinetConfig);
  kioskMode = "appointment";
  selectedAppointmentId = "a1";
  selectedTeamMemberId = "dr-martin";
  queueSearch = "";
  queuePractitionerFilter = "all";
  queueRoomFilter = "all";
  queueStatusFilter = "all";
  frontdeskSearch = "";
  editingAppointmentId = "";
  appointmentDeleteArmedId = "";
  window.clearTimeout(appointmentDeleteArmedTimer);
  closeDayArmed = false;
  window.clearTimeout(closeDayArmedTimer);
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  document.getElementById("kiosk-search").value = "";
  document.getElementById("queue-search").value = "";
  const frontdeskSearchField = document.getElementById("frontdesk-search");
  if (frontdeskSearchField) frontdeskSearchField.value = "";
  setKioskScanStatus("Sélectionnez une personne, puis indiquez votre nom et prénom.");
  document.getElementById("scan-preview").classList.add("hidden");
  document.getElementById("kiosk-success").classList.add("hidden");
  applyCabinetConfig();
  updateKioskMode("appointment");
  persistState();
  renderBoard();
  showToast("Démo réinitialisée avec les rendez-vous de départ.");
}

function getCleanTestDayState() {
  const operationalEvents = activityLog.filter((event) =>
    [
      "arrival",
      "watch",
      "care",
      "call",
      "help",
      "visitor",
      "scenario",
      "real_test_start",
      "real_patient_pass",
      "real_test_close",
      "frontdesk_preflight",
      "frontdesk_launch",
      "frontdesk_field_note",
      "support_incident",
      "note",
      "message",
    ].includes(event.kind),
  );
  const recipeAppointments = appointments.filter((appointment) => appointment.recipeTest).length;
  const nonScheduledAppointments = appointments.filter((appointment) =>
    ["arrived", "in_progress", "completed", "no_show"].includes(appointment.status),
  ).length;
  const activePatients = patients.filter((patient) => patient.status !== "completed").length;
  const clean = activePatients === 0 && patients.length === 0 && operationalEvents.length === 0 && nonScheduledAppointments === 0 && recipeAppointments === 0;
  return {
    clean,
    activePatients,
    patients: patients.length,
    appointments: appointments.length,
    nonScheduledAppointments,
    recipeAppointments,
    operationalEvents: operationalEvents.length,
  };
}

function renderCleanTestDayPanel() {
  const status = document.getElementById("clean-day-status");
  const summary = document.getElementById("clean-day-summary");
  if (!status || !summary) return;

  const state = getCleanTestDayState();
  status.textContent = state.clean ? "Prêt" : "À nettoyer";
  status.classList.toggle("success", state.clean);
  status.classList.toggle("warning", !state.clean);
  summary.innerHTML = `
    <article class="${state.patients === 0 ? "done" : "todo"}">
      <span>Patients actifs</span>
      <strong>${state.activePatients}</strong>
      <small>${state.patients} présence${state.patients > 1 ? "s" : ""} au total</small>
    </article>
    <article class="${state.nonScheduledAppointments === 0 ? "done" : "todo"}">
      <span>Planning</span>
      <strong>${state.appointments}</strong>
      <small>${state.nonScheduledAppointments} rendez-vous déjà marqué${state.nonScheduledAppointments > 1 ? "s" : ""}</small>
    </article>
    <article class="${state.operationalEvents === 0 ? "done" : "todo"}">
      <span>Traces journée</span>
      <strong>${state.operationalEvents}</strong>
      <small>Arrivées, appels, aides, recette réelle</small>
    </article>
    <article class="${state.recipeAppointments === 0 ? "done" : "todo"}">
      <span>Données test</span>
      <strong>${state.recipeAppointments}</strong>
      <small>Rendez-vous de recette rapide à retirer</small>
    </article>
  `;
}

function prepareCleanTestDay() {
  const keptAppointments = appointments
    .filter((appointment) => !appointment.recipeTest)
    .map((appointment) => ({
      ...appointment,
      status: ["canceled"].includes(appointment.status) ? appointment.status : "scheduled",
    }));
  appointments = keptAppointments;
  patients = [];
  activityLog = [];
  selectedAppointmentId = appointments[0]?.id || "";
  selectedTeamMemberId = teamMembers[0]?.id || "";
  kioskMode = "appointment";
  queueSearch = "";
  queuePractitionerFilter = "all";
  queueRoomFilter = "all";
  queueStatusFilter = "all";
  frontdeskSearch = "";
  recipeClearArmed = false;
  closeDayArmed = false;
  window.clearTimeout(closeDayArmedTimer);
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  document.getElementById("kiosk-search").value = "";
  document.getElementById("queue-search").value = "";
  const frontdeskSearchField = document.getElementById("frontdesk-search");
  if (frontdeskSearchField) frontdeskSearchField.value = "";
  setKioskScanStatus(cabinetConfig.patientInstructions.prompt);
  document.getElementById("scan-preview").classList.add("hidden");
  document.getElementById("kiosk-success").classList.add("hidden");
  updateKioskMode("appointment");
  logEvent("Journée test propre préparée", `${appointments.length} rendez-vous conservés · réglages cabinet conservés`, "settings");
  renderBoard();
  showToast("Journée test propre préparée. Réglages et rendez-vous conservés.");
}

function buildCleanDayProtocolText() {
  const state = getCleanTestDayState();
  return [
    "ADIA Accueil - Protocole journée test propre",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "État actuel",
    `- Statut: ${state.clean ? "Prêt" : "À nettoyer"}`,
    `- Rendez-vous conservés: ${state.appointments}`,
    `- Patients actifs: ${state.activePatients}`,
    `- Présences en mémoire: ${state.patients}`,
    `- Rendez-vous déjà marqués: ${state.nonScheduledAppointments}`,
    `- Traces opérationnelles: ${state.operationalEvents}`,
    "",
    "Ce que fait le bouton Préparer journée test propre",
    "- Conserve le paramétrage cabinet, les portraits, l'équipe et les textes borne.",
    "- Conserve les rendez-vous non annulés et les remet en statut planifié.",
    "- Supprime les présences, aides, appels, recettes rapides et sessions de test réel.",
    "- Replace la borne sur le parcours J'ai rendez-vous.",
    "",
    "Déroulé conseillé après nettoyage",
    "1. Ouvrir la borne iPad.",
    "2. Ouvrir la console accueil.",
    "3. Démarrer le test réel côté accueil.",
    "4. Faire passer 3 à 5 patients.",
    "5. Clôturer et exporter le rapport test réel.",
  ].join("\n");
}

function downloadCleanDayProtocol() {
  downloadText("adia-presence-protocole-journee-test-propre.txt", buildCleanDayProtocolText());
  logEvent("Protocole journée test propre téléchargé", getCleanTestDayState().clean ? "Prêt" : "À nettoyer", "export");
  renderBoard();
}

function addAppointment({ name, code, practitioner, reason, time, room }) {
  const existing = appointments.find(
    (appointment) => normalize(appointment.name) === normalize(name),
  );

  if (existing) {
    existing.code = code || existing.code;
    existing.practitioner = practitioner;
    existing.reason = reason;
    existing.time = time;
    existing.room = room;
    existing.status = ["arrived", "in_progress", "completed"].includes(existing.status)
      ? existing.status
      : "scheduled";
    syncPatientWithAppointment(existing);
    persistState();
    return existing;
  }

  const appointment = {
    id: `a${Date.now()}`,
    name,
    code,
    practitioner,
    reason,
    time,
    room,
    status: "scheduled",
  };
  appointments.push(appointment);
  persistState();
  return appointment;
}

function syncPatientWithAppointment(appointment) {
  const patient = patients.find((item) => item.appointmentId === appointment.id);
  if (!patient) return;
  patient.name = appointment.name;
  patient.practitioner = appointment.practitioner;
  patient.reason = appointment.reason;
  patient.time = appointment.time;
  patient.room = appointment.room;
}

function updateAppointment(appointmentId, payload) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return null;
  appointment.name = payload.name;
  appointment.code = payload.code;
  appointment.practitioner = payload.practitioner;
  appointment.reason = payload.reason;
  appointment.time = payload.time;
  appointment.room = payload.room;
  syncPatientWithAppointment(appointment);
  persistState();
  return appointment;
}

function ensureSelectContains(select, value) {
  if (!select || !value) return;
  if (![...select.options].some((option) => option.value === value)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

function generateAppointmentCode(name) {
  const base = normalize(name).split(/\s+/)[0] || "patient";
  let code = base;
  let suffix = 2;
  while (appointments.some((appointment) => normalize(appointment.code) === normalize(code))) {
    code = `${base}${suffix}`;
    suffix += 1;
  }
  return code;
}

function getDefaultAppointmentRoom(practitioner) {
  const practitionerMember = getConfiguredPractitioners().find(
    (member) => normalize(member.name) === normalize(practitioner),
  );
  if (practitionerMember?.room) return practitionerMember.room;
  return getTrackedRooms().find((room) => room !== "Accueil") || "Salle 1";
}

function getNextQuickAppointmentTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
  now.setMinutes(roundedMinutes === 60 ? 0 : roundedMinutes);
  if (roundedMinutes === 60) now.setHours(now.getHours() + 1);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function renderFrontdeskAppointmentFormOptions() {
  const practitionerSelect = document.getElementById("frontdesk-appointment-practitioner");
  const timeField = document.getElementById("frontdesk-appointment-time");
  if (practitionerSelect) {
    const current = practitionerSelect.value;
    const practitioners = getPractitionerNames();
    practitionerSelect.innerHTML = practitioners.map((name) => `<option value="${name}">${name}</option>`).join("");
    practitionerSelect.value = practitioners.includes(current) ? current : practitioners[0] || "Dr Martin";
  }
  if (timeField && !timeField.value) {
    timeField.value = getNextQuickAppointmentTime();
  }
}

function renderAppointmentFormOptions() {
  const practitionerSelect = document.getElementById("appointment-practitioner");
  const roomSelect = document.getElementById("appointment-room");
  if (practitionerSelect) {
    const current = practitionerSelect.value;
    const practitioners = [...getPractitionerNames()];
    if (current && !practitioners.includes(current)) practitioners.push(current);
    practitionerSelect.innerHTML = practitioners.map((name) => `<option>${name}</option>`).join("");
    practitionerSelect.value = practitioners.includes(current) ? current : practitioners[0] || "Dr Martin";
  }
  if (roomSelect) {
    const current = roomSelect.value;
    const rooms = getTrackedRooms().filter((room) => room !== "Accueil");
    if (current && !rooms.includes(current)) rooms.push(current);
    roomSelect.innerHTML = rooms.map((room) => `<option>${room}</option>`).join("");
    roomSelect.value = rooms.includes(current) ? current : rooms[0] || "Salle 1";
  }
}

function setAppointmentFormValues(appointment) {
  renderAppointmentFormOptions();
  ensureSelectContains(document.getElementById("appointment-practitioner"), appointment.practitioner);
  ensureSelectContains(document.getElementById("appointment-room"), appointment.room);
  document.getElementById("appointment-patient").value = appointment.name;
  document.getElementById("appointment-code").value = appointment.code || "";
  document.getElementById("appointment-time").value = appointment.time;
  document.getElementById("appointment-practitioner").value = appointment.practitioner;
  document.getElementById("appointment-room").value = appointment.room;
  document.getElementById("appointment-reason").value = appointment.reason;
}

function resetAppointmentForm() {
  editingAppointmentId = "";
  document.getElementById("appointment-form").reset();
  document.getElementById("appointment-time").value = "11:30";
  renderAppointmentFormState();
}

function renderAppointmentFormState() {
  renderAppointmentFormOptions();
  const title = document.getElementById("appointment-form-title");
  const status = document.getElementById("appointment-form-status");
  const submit = document.getElementById("appointment-submit");
  const cancel = document.getElementById("appointment-cancel-edit");
  if (!title || !status || !submit || !cancel) return;

  const appointment = appointments.find((item) => item.id === editingAppointmentId);
  if (!appointment) editingAppointmentId = "";
  const editing = Boolean(editingAppointmentId);
  title.textContent = editing ? "Corriger un rendez-vous" : "Créer un rendez-vous";
  status.textContent = editing ? "Correction" : "Création";
  status.classList.toggle("warning", editing);
  submit.textContent = editing ? "Enregistrer la correction" : "Ajouter le rendez-vous";
  cancel.classList.toggle("hidden", !editing);
}

function editAppointment(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  editingAppointmentId = appointment.id;
  setAppointmentFormValues(appointment);
  renderAppointmentFormState();
  showToast(`${appointment.name}: correction ouverte.`);
}

function deleteAppointment(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  if (appointmentDeleteArmedId !== appointmentId) {
    appointmentDeleteArmedId = appointmentId;
    window.clearTimeout(appointmentDeleteArmedTimer);
    appointmentDeleteArmedTimer = window.setTimeout(() => {
      appointmentDeleteArmedId = "";
      renderAppointments();
    }, 4500);
    renderAppointments();
    showToast(`Cliquez encore sur Supprimer pour retirer ${appointment.name}.`);
    return;
  }

  const linkedPatients = patients.filter((patient) => patient.appointmentId === appointment.id);
  appointments = appointments.filter((item) => item.id !== appointment.id);
  patients = patients.filter((patient) => patient.appointmentId !== appointment.id);
  if (editingAppointmentId === appointment.id) resetAppointmentForm();
  appointmentDeleteArmedId = "";
  window.clearTimeout(appointmentDeleteArmedTimer);
  logEvent(
    "Rendez-vous supprimé",
    `${appointment.name} · ${appointment.time}${linkedPatients.length ? " · présence liée retirée" : ""}`,
    "settings",
  );
  renderBoard();
  showToast(`${appointment.name}: rendez-vous supprimé.`);
}

function ensureSophieAppointment() {
  return addAppointment({
    name: "Sophie Lambert",
    code: "sophie",
    practitioner: "Dr Martin",
    reason: "Détartrage",
    time: "11:30",
    room: "Salle 2",
  });
}

function updateClock() {
  const value = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  document.getElementById("clock").textContent = value;
  const kioskClock = document.getElementById("kiosk-clock");
  if (kioskClock) kioskClock.textContent = value;
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = columns
    .map(([title, statuses]) => {
      const items = patients.filter(
        (patient) => statuses.includes(patient.status) && patientMatchesQueueSearch(patient),
      );
      const cards = items.length
        ? items.map(renderPatientCard).join("")
        : "<p>Aucun élément.</p>";
      return `<article class="column"><h2>${title}</h2>${cards}</article>`;
    })
    .join("");

  renderMetrics();
  renderFrontdeskAlerts();
  renderFrontdeskConsole();
  renderFrontdeskAppointmentFormOptions();
  renderFrontdeskLaunchCheck();
  renderPractitionerFlowPanel();
  renderOpeningChecklist();
  renderGoLiveChecklist();
  renderFinishLineCenter();
  renderRealTestPanel();
  renderFrontdeskRealTestPanel();
  renderFrontdeskFieldNotes();
  renderCleanTestDayPanel();
  renderDirectLinks();
  renderWorkstationLinks();
  renderExpectedAppointments();
  renderActionQueue();
  renderCallLog();
  renderTestGuide();
  renderDashboardFilters();
  renderRooms();
  renderDoctor();
  renderAssistant();
  renderAccessScopePanels();
  renderAppointmentFormState();
  renderAppointments();
  renderReceptionSheet();
  renderTeamChoices();
  renderTeamConfigPreview();
  renderPortraitQuality();
  renderPortraitGallery();
  renderKioskHelpPreview();
  renderKioskResults();
  renderActivityLog();
  renderOperations();
  renderPunctualityPanel();
  renderClosingSummary();
  renderOperationalReview();
  renderExecutiveSummary();
  renderAuditLog();
  renderNoteOptions();
  renderTransferOptions();
  renderPilotReadiness();
  renderCabinetTestScenarios();
  renderRecipeKit();
  renderQualityPanel();
  renderPilotVersion();
  renderProductSheet();
  renderUserManual();
  renderTrainingKit();
  renderDeploymentPack();
  renderCabinetDecision();
  renderValidationMinutes();
  renderIpadSupervision();
  renderPilotFeedback();
  renderPatientFeedback();
  renderSupportIncidents();
  renderPilotBacklog();
  renderPrivacyCenter();
  renderPermissionMatrix();
  renderRoutingMatrix();
  bindPatientActionButtons();
  dimEmptyMetrics();
  persistState();
}

function dimEmptyMetrics() {
  // Les KPI à zéro restent lisibles mais reculent visuellement pour laisser
  // ressortir les chiffres qui portent une information (conforme à la DA : calme, pas de data slop).
  document
    .querySelectorAll(".metrics strong, .frontdesk-summary strong")
    .forEach((el) => {
      const zero = /^0+$/.test(el.textContent.trim());
      el.classList.toggle("metric-zero", zero);
    });
}

function bindPatientActionButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.onclick = () => updatePatient(button.dataset.patient, button.dataset.action);
  });

  document.querySelectorAll("[data-call-patient]").forEach((button) => {
    button.onclick = () => callPatient(button.dataset.callPatient);
  });

}

function patientMatchesQueueSearch(patient) {
  const text = `${patient.name} ${patient.practitioner} ${patient.reason} ${patient.room} ${patient.time}`;
  return (
    matchesSearch(text) &&
    matchesPractitioner(patient.practitioner) &&
    matchesRoom(patient.room) &&
    matchesStatus(patient.status)
  );
}

function appointmentMatchesDashboardFilters(appointment) {
  const text = `${appointment.name} ${appointment.practitioner} ${appointment.reason} ${appointment.room} ${appointment.time} ${appointment.code}`;
  return (
    matchesSearch(text) &&
    matchesPractitioner(appointment.practitioner) &&
    matchesRoom(appointment.room) &&
    matchesStatus(appointment.status)
  );
}

function matchesSearch(text) {
  return !queueSearch || normalize(text).includes(queueSearch);
}

function matchesPractitioner(practitioner) {
  return queuePractitionerFilter === "all" || practitioner === queuePractitionerFilter;
}

function matchesRoom(room) {
  return queueRoomFilter === "all" || room === queueRoomFilter;
}

function matchesStatus(status) {
  if (queueStatusFilter === "all") return true;
  if (queueStatusFilter === "expected") return ["scheduled", "confirmed"].includes(status);
  if (queueStatusFilter === "waiting") return ["arrived", "waiting"].includes(status);
  return status === queueStatusFilter;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function renderDashboardFilters() {
  const practitionerSelect = document.getElementById("queue-practitioner-filter");
  const roomSelect = document.getElementById("queue-room-filter");
  const statusSelect = document.getElementById("queue-status-filter");
  if (!practitionerSelect || !roomSelect || !statusSelect) return;

  const practitioners = uniqueSorted([
    ...appointments.map((appointment) => appointment.practitioner),
    ...patients.map((patient) => patient.practitioner),
  ]);
  const rooms = uniqueSorted([
    ...appointments.map((appointment) => appointment.room),
    ...patients.map((patient) => patient.room),
  ]);

  practitionerSelect.innerHTML = [
    `<option value="all">Tous</option>`,
    ...practitioners.map((name) => `<option value="${name}">${name}</option>`),
  ].join("");
  roomSelect.innerHTML = [
    `<option value="all">Toutes</option>`,
    ...rooms.map((room) => `<option value="${room}">${room}</option>`),
  ].join("");
  practitionerSelect.value = practitioners.includes(queuePractitionerFilter) ? queuePractitionerFilter : "all";
  roomSelect.value = rooms.includes(queueRoomFilter) ? queueRoomFilter : "all";
  statusSelect.value = queueStatusFilter;

  practitionerSelect.onchange = (event) => {
    queuePractitionerFilter = event.target.value;
    renderBoard();
  };
  roomSelect.onchange = (event) => {
    queueRoomFilter = event.target.value;
    renderBoard();
  };
  statusSelect.onchange = (event) => {
    queueStatusFilter = event.target.value;
    renderBoard();
  };
}

function renderPatientCard(patient) {
  const alertLabel = patient.wait >= 25
    ? "Attente critique"
    : patient.wait >= 15
      ? "Attente à surveiller"
      : "";
  return `
    <div class="patient-card ${patient.priority}">
      <div class="patient-head">
        <div>
          <strong>${maskName(patient.name)}</strong>
          <span>${patient.practitioner}</span>
        </div>
        <em>${patient.time}</em>
      </div>
      <div class="meta">
        <span>${patient.reason}</span>
        <span>${patient.wait} min attente</span>
        ${patient.late ? `<span>${patient.late} min retard</span>` : ""}
        ${alertLabel ? `<span class="wait-alert">${alertLabel}</span>` : ""}
      </div>
      <span class="pill status-${patient.status}">${labels[patient.status]}</span>
      ${patient.notes?.length ? `<p class="internal-note">${patient.notes[patient.notes.length - 1]}</p>` : ""}
      <div class="inline-actions">
        <button data-call-patient="${patient.id}">Appeler</button>
        <button data-action="in_care" data-patient="${patient.id}">Prendre en charge</button>
        <button data-action="completed" data-patient="${patient.id}">Terminer</button>
      </div>
    </div>
  `;
}

function advanceWaitingTime() {
  patients.forEach((patient) => {
    if (patient.status === "completed" || patient.status === "in_care") return;
    patient.wait += 5;
    if (patient.wait >= 25) {
      patient.priority = "urgent";
      patient.late = Math.max(patient.late, patient.wait - 15);
    } else if (patient.wait >= 15) {
      patient.priority = "watch";
      patient.late = Math.max(patient.late, patient.wait - 15);
    }
  });
  logEvent("Temps d'attente avancé", "Simulation +5 minutes sur la file active", "watch");
  renderBoard();
  showToast("Temps d'attente avancé de 5 minutes.");
}

function applyTeamMessageTemplate() {
  const template = document.getElementById("team-message-template").value;
  if (!template) return;
  document.getElementById("team-message-text").value = template;
}

function sendTeamMessage() {
  const target = document.getElementById("team-message-target").value;
  const message = document.getElementById("team-message-text").value.trim();
  if (!message) {
    showToast("Saisissez un message interne.");
    return;
  }

  logEvent(`Message équipe · ${target}`, message, "message");
  document.getElementById("team-message-text").value = "";
  document.getElementById("team-message-template").value = "";
  renderBoard();
  showNotification(`Message · ${target}`, message, { sound: false });
  showToast(`Message envoyé à ${target}.`);
}

function renderMetrics() {
  const active = patients.filter((patient) => patient.status !== "completed");
  const avg = active.length
    ? Math.round(active.reduce((sum, patient) => sum + patient.wait, 0) / active.length)
    : 0;
  const late = active.filter((patient) => patient.late >= 5).length;
  const priority = active.find((patient) => patient.priority === "urgent") || active[0];

  document.getElementById("metric-active").textContent = String(active.length);
  document.getElementById("metric-wait").textContent = `${avg} min`;
  document.getElementById("metric-late").textContent = String(late);
  document.getElementById("metric-messages").textContent = String(activityLog.length);
  document.getElementById("priority-name").textContent = priority ? maskName(priority.name) : "File maîtrisée";
  document.getElementById("priority-detail").textContent = priority
    ? `${priority.reason} · ${priority.practitioner} · ${priority.late} min retard`
    : "Aucune action immédiate";
  document.getElementById("priority-action").textContent = priority ? "Prendre en charge" : "Surveiller";
}

function getPatientsToVerify() {
  return patients.filter(
    (patient) =>
      patient.status !== "completed" &&
      !patient.appointmentId &&
      patient.source === "unmatched_appointment",
  );
}

function getExpectedAppointments() {
  return appointments
    .filter((appointment) => ["scheduled", "confirmed"].includes(appointment.status))
    .filter(appointmentMatchesDashboardFilters)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function renderExpectedAppointments() {
  const list = document.getElementById("expected-list");
  const count = document.getElementById("expected-count");
  if (!list || !count) return;

  const expected = getExpectedAppointments();
  count.textContent = `${expected.length} attendu${expected.length > 1 ? "s" : ""}`;
  list.innerHTML = expected.length
    ? expected
        .map(
          (appointment) => `
            <article class="expected-row">
              <time>${appointment.time}</time>
              <div>
                <strong>${maskName(appointment.name)}</strong>
                <span>${appointment.practitioner} · ${appointment.reason} · ${appointment.room}</span>
              </div>
              <div class="expected-actions">
                <button data-arrive-expected="${appointment.id}" type="button">Présence</button>
                <button data-prefill-expected="${appointment.id}" type="button">Borne</button>
                <button data-noshow-expected="${appointment.id}" type="button">Absent</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Tous les rendez-vous sont traités pour le moment.</p>`;

  document.querySelectorAll("[data-arrive-expected]").forEach((button) => {
    button.addEventListener("click", () => registerManualArrival(button.dataset.arriveExpected));
  });

  document.querySelectorAll("[data-prefill-expected]").forEach((button) => {
    button.addEventListener("click", () => prefillKioskAppointment(button.dataset.prefillExpected));
  });

  document.querySelectorAll("[data-noshow-expected]").forEach((button) => {
    button.addEventListener("click", () => markNoShow(button.dataset.noshowExpected));
  });
}

function getActionQueueItems() {
  const helpRequests = getKioskHelpEvents({ unresolvedOnly: true }).slice(0, 2).map((event, index) => ({
    id: `help-${event.id}`,
    kind: "help",
    title: "Aide demandée sur la borne",
    detail: event.detail,
    eventId: event.id,
    weight: 130 - index,
  }));
  const toVerify = getPatientsToVerify().map((patient) => ({
    id: `verify-${patient.id}`,
    kind: "verify",
    title: `${maskName(patient.name)} à vérifier`,
    detail: "Rendez-vous non retrouvé sur la borne",
    patientId: patient.id,
    weight: 100,
  }));
  const waits = patients
    .filter((patient) => patient.status !== "completed" && patient.wait >= 15)
    .map((patient) => ({
      id: `wait-${patient.id}`,
      kind: patient.wait >= 25 ? "urgent" : "watch",
      title: `${maskName(patient.name)} attend depuis ${patient.wait} min`,
      detail: `${patient.practitioner} · ${patient.reason} · ${patient.room}`,
      patientId: patient.id,
      weight: patient.wait,
    }));
  const toCall = patients
    .filter(
      (patient) =>
        ["arrived", "waiting"].includes(patient.status) &&
        patient.wait >= 8 &&
        patient.wait < 15 &&
        !patient.lastCalledAt,
    )
    .map((patient) => ({
      id: `call-${patient.id}`,
      kind: "call",
      title: `${maskName(patient.name)} peut être appelé`,
      detail: `${patient.practitioner} · ${patient.reason} · ${patient.wait} min attente`,
      patientId: patient.id,
      weight: 12,
    }));
  const nextExpected = getExpectedAppointments().slice(0, 2).map((appointment, index) => ({
    id: `expected-${appointment.id}`,
    kind: "expected",
    title: `${maskName(appointment.name)} attendu à ${appointment.time}`,
    detail: `${appointment.practitioner} · ${appointment.reason} · ${appointment.room}`,
    appointmentId: appointment.id,
    weight: 5 - index,
  }));

  return [...helpRequests, ...toVerify, ...waits, ...toCall, ...nextExpected]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

function renderActionQueue() {
  const list = document.getElementById("action-list");
  const count = document.getElementById("action-count");
  if (!list || !count) return;

  const items = getActionQueueItems();
  count.textContent = `${items.length} action${items.length > 1 ? "s" : ""}`;
  list.innerHTML = items.length
    ? items
        .map((item) => {
          const action = item.kind === "help"
            ? `<button data-ack-help="${item.eventId}" type="button">Traiter</button>`
            : item.kind === "verify"
            ? `<button data-resolve-check="${item.patientId}" type="button">Vérifier</button>`
            : item.appointmentId
              ? `<button data-arrive-expected="${item.appointmentId}" type="button">Présence</button>`
              : item.kind === "call"
                ? `<button data-call-patient="${item.patientId}" type="button">Appeler</button>`
                : `<button data-action="in_care" data-patient="${item.patientId}" type="button">Prendre</button>`;
          return `
            <article class="action-item ${item.kind}">
              <div>
                <strong>${item.title}</strong>
                <span>${item.detail}</span>
              </div>
              ${action}
            </article>
          `;
        })
        .join("")
    : `<p>Aucune action prioritaire pour le moment.</p>`;

  list.querySelectorAll("[data-resolve-check]").forEach((button) => {
    button.addEventListener("click", () => resolveReceptionCheck(button.dataset.resolveCheck));
  });
  list.querySelectorAll("[data-arrive-expected]").forEach((button) => {
    button.addEventListener("click", () => registerManualArrival(button.dataset.arriveExpected));
  });
  list.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => updatePatient(button.dataset.patient, button.dataset.action));
  });
  list.querySelectorAll("[data-call-patient]").forEach((button) => {
    button.addEventListener("click", () => callPatient(button.dataset.callPatient));
  });
  list.querySelectorAll("[data-ack-help]").forEach((button) => {
    button.addEventListener("click", () => acknowledgeKioskHelp(button.dataset.ackHelp));
  });
}

function getRecentPatientCalls() {
  return activityLog.filter((event) => event.kind === "call").slice(0, 4);
}

function renderTestGuide() {
  const hasArrival = activityLog.some((event) => event.kind === "arrival");
  const hasExport = activityLog.some((event) => ["export", "close"].includes(event.kind));
  const steps = [
    {
      id: "guide-planning-step",
      done: appointments.length > 0,
      detail: `${appointments.length} rendez-vous chargé${appointments.length > 1 ? "s" : ""}.`,
    },
    {
      id: "guide-kiosk-step",
      done: hasArrival,
      detail: hasArrival ? "Au moins une présence validée." : "Valider une présence sur la borne.",
    },
    {
      id: "guide-team-step",
      done: patients.length > 0,
      detail: `${patients.length} patient${patients.length > 1 ? "s" : ""} visible${patients.length > 1 ? "s" : ""} par l'équipe.`,
    },
    {
      id: "guide-report-step",
      done: hasExport,
      detail: hasExport ? "Un export ou rapport a été préparé." : "Exporter un rapport en fin de test.",
    },
  ];

  steps.forEach((step) => {
    const card = document.getElementById(step.id);
    if (!card) return;
    card.classList.toggle("done", step.done);
    card.classList.toggle("todo", !step.done);
    const detail = card.querySelector("span");
    if (detail) detail.textContent = step.detail;
  });
}

function renderCallLog() {
  const list = document.getElementById("call-list");
  const count = document.getElementById("call-count");
  if (!list || !count) return;

  const calls = getRecentPatientCalls();
  count.textContent = `${calls.length} appel${calls.length > 1 ? "s" : ""}`;
  list.innerHTML = calls.length
    ? calls
        .map(
          (event) => `
            <article class="call-item">
              <time>${event.time}</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.detail}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun appel patient enregistré.</p>`;
}

function callPatient(patientId) {
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) return;

  patient.lastCalledAt = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  patient.callCount = (patient.callCount || 0) + 1;
  patient.priority = patient.wait >= 15 ? "watch" : patient.priority;
  logEvent(
    `${patient.name} appelé`,
    `${patient.practitioner} · ${patient.room} · appel ${patient.callCount}`,
    "call",
  );
  renderBoard();
  showNotification("Patient appelé", `${patient.name} · ${patient.practitioner}`, { sound: false });
  showToast(`${patient.name} appelé.`);
}

function renderFrontdeskAlerts() {
  const list = document.getElementById("frontdesk-alert-list");
  const count = document.getElementById("frontdesk-alert-count");
  if (!list || !count) return;

  const helpRequests = getKioskHelpEvents({ unresolvedOnly: true });
  const alerts = getPatientsToVerify();
  const total = helpRequests.length + alerts.length;
  count.textContent = `${total} demande${total > 1 ? "s" : ""}`;
  list.innerHTML = total
    ? helpRequests
        .map(
          (event) => `
            <article class="frontdesk-alert help">
              <div>
                <strong>Aide demandée sur la borne</strong>
                <span>${event.detail}</span>
              </div>
              <button data-ack-help="${event.id}" type="button">Traiter</button>
            </article>
          `,
        )
        .join("") +
      alerts
        .map(
          (patient) => `
            <article class="frontdesk-alert">
              <div>
                <strong>${maskName(patient.name)}</strong>
                <span>${patient.reason} · ${patient.wait} min attente</span>
              </div>
              <button data-resolve-check="${patient.id}" type="button">Marquer vérifié</button>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun patient à vérifier pour le moment.</p>`;

  document.querySelectorAll("[data-resolve-check]").forEach((button) => {
    button.addEventListener("click", () => resolveReceptionCheck(button.dataset.resolveCheck));
  });
  document.querySelectorAll("[data-ack-help]").forEach((button) => {
    button.addEventListener("click", () => acknowledgeKioskHelp(button.dataset.ackHelp));
  });
}

function getFrontdeskSearchResults() {
  const query = frontdeskSearch.trim();
  if (!query) return [];
  const normalizedQuery = normalize(query);
  const appointmentResults = appointments.map((appointment) => ({
    id: appointment.id,
    type: "appointment",
    time: appointment.time,
    name: appointment.name,
    practitioner: appointment.practitioner,
    room: appointment.room,
    reason: appointment.reason,
    code: appointment.code,
    status: appointment.status,
    statusLabel: appointmentLabels[appointment.status] || appointment.status,
    searchable: `${appointment.name} ${appointment.code} ${appointment.time} ${appointment.practitioner} ${appointment.room} ${appointment.reason}`,
  }));
  const patientResults = patients
    .filter((patient) => !patient.appointmentId || !appointments.some((appointment) => appointment.id === patient.appointmentId))
    .map((patient) => ({
      id: patient.id,
      type: "patient",
      time: patient.time,
      name: patient.name,
      practitioner: patient.practitioner,
      room: patient.room,
      reason: patient.reason,
      code: "",
      status: patient.status,
      statusLabel: labels[patient.status] || patient.status,
      searchable: `${patient.name} ${patient.time} ${patient.practitioner} ${patient.room} ${patient.reason}`,
    }));

  return [...appointmentResults, ...patientResults]
    .filter((item) => normalize(item.searchable).includes(normalizedQuery))
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 8);
}

function renderFrontdeskSearch() {
  const field = document.getElementById("frontdesk-search");
  const results = document.getElementById("frontdesk-search-results");
  if (!field || !results) return;

  if (field.value !== frontdeskSearch) field.value = frontdeskSearch;
  const items = getFrontdeskSearchResults();
  results.innerHTML = frontdeskSearch
    ? items.length
      ? items
          .map((item) => {
            const actions =
              item.type === "appointment"
                ? [
                    ["scheduled", "confirmed"].includes(item.status)
                      ? `<button data-arrive-search="${item.id}" type="button">Présence</button>`
                      : "",
                    `<button data-prefill-search="${item.id}" type="button">Borne</button>`,
                    ["scheduled", "confirmed"].includes(item.status)
                      ? `<button data-noshow-search="${item.id}" type="button">Absent</button>`
                      : "",
                  ].join("")
                : `<button data-call-search="${item.id}" type="button">Appeler</button>`;
            return `
              <article class="frontdesk-row search-result ${item.status}">
                <time>${item.time}</time>
                <div>
                  <strong>${maskName(item.name)}</strong>
                  <span>${item.practitioner} · ${item.reason} · ${item.room}</span>
                </div>
                <em>${item.statusLabel}</em>
                <div class="frontdesk-row-actions">${actions}</div>
              </article>
            `;
          })
          .join("")
      : `<p>Aucun patient trouvé. Le secrétariat peut l'ajouter comme visite.</p>`
    : `<p>Tapez un nom, un code, une heure ou un praticien.</p>`;

  results.querySelectorAll("[data-arrive-search]").forEach((button) => {
    button.addEventListener("click", () => registerManualArrival(button.dataset.arriveSearch));
  });
  results.querySelectorAll("[data-prefill-search]").forEach((button) => {
    button.addEventListener("click", () => prefillKioskAppointment(button.dataset.prefillSearch));
  });
  results.querySelectorAll("[data-noshow-search]").forEach((button) => {
    button.addEventListener("click", () => markNoShow(button.dataset.noshowSearch));
  });
  results.querySelectorAll("[data-call-search]").forEach((button) => {
    button.addEventListener("click", () => callPatient(button.dataset.callSearch));
  });
}

function getSecretaryNames() {
  const rawNames = teamMembers
    .filter((item) => item.group === "secretariat")
    .map((item) => item.name)
    .filter(Boolean);
  const occurrences = {};
  const names = rawNames.map((name) => {
    occurrences[name] = (occurrences[name] || 0) + 1;
    const repeated = rawNames.filter((item) => item === name).length > 1;
    return repeated ? `${name} ${occurrences[name]}` : name;
  });
  return names.length ? names : ["Secrétariat"];
}

function getSecretaryLoad() {
  const load = Object.fromEntries(getSecretaryNames().map((name) => [name, { assigned: 0, completed: 0 }]));
  patients
    .filter((patient) => patient.source === "secretariat")
    .forEach((patient) => {
      if (patient.assignedSecretary && load[patient.assignedSecretary] !== undefined) {
        if (patient.status === "completed") {
          load[patient.assignedSecretary].completed += 1;
        } else {
          load[patient.assignedSecretary].assigned += 1;
        }
      }
    });
  return load;
}

function getNextAvailableSecretary() {
  const load = getSecretaryLoad();
  return Object.entries(load).sort((a, b) => normalizeSecretaryStats(a[1]).assigned - normalizeSecretaryStats(b[1]).assigned || a[0].localeCompare(b[0], "fr"))[0]?.[0] || "Secrétariat";
}

function normalizeSecretaryStats(stats) {
  if (typeof stats === "number") {
    return { assigned: stats, completed: 0 };
  }
  return {
    assigned: Number(stats?.assigned || 0),
    completed: Number(stats?.completed || 0),
  };
}

function assignSecretariatRequest(patientId, secretaryName = "") {
  const patient = patients.find((item) => item.id === patientId && item.source === "secretariat");
  if (!patient) return;
  const assignedSecretary = secretaryName || getNextAvailableSecretary();
  patient.assignedSecretary = assignedSecretary;
  patient.secretariatAssignedAt = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  patient.priority = "normal";
  logEvent("Demande secrétariat prise en charge", `${patient.name} · ${assignedSecretary}`, "care");
  renderBoard();
  showToast(`${patient.name}: pris en charge par ${assignedSecretary}.`);
}

function assignNextSecretariatRequest(secretaryName) {
  const request = patients.find(
    (patient) => patient.source === "secretariat" && patient.status !== "completed" && !patient.assignedSecretary,
  );
  if (!request) {
    showToast("Aucune demande secrétariat libre à attribuer.");
    return;
  }
  assignSecretariatRequest(request.id, secretaryName);
}

function renderSecretariatLoadPanel() {
  const list = document.getElementById("secretariat-load-list");
  const status = document.getElementById("secretariat-load-status");
  if (!list || !status) return;

  const load = getSecretaryLoad();
  const openRequests = patients.filter(
    (patient) => patient.source === "secretariat" && patient.status !== "completed",
  );
  const unassigned = openRequests.filter((patient) => !patient.assignedSecretary).length;
  status.textContent = `${openRequests.length} ouverte${openRequests.length > 1 ? "s" : ""}`;

  list.innerHTML = Object.entries(load)
    .map(
      ([name, rawStats]) => {
        const stats = normalizeSecretaryStats(rawStats);
        return `
        <article class="secretariat-load-item ${stats.assigned ? "active" : ""}">
          <div>
            <strong>${name}</strong>
            <span>${stats.assigned} ouverte${stats.assigned > 1 ? "s" : ""} · ${stats.completed} traitée${stats.completed > 1 ? "s" : ""}</span>
          </div>
          <button ${unassigned ? "" : "disabled"} data-assign-next-secretary="${name}" type="button">
            Attribuer prochaine
          </button>
        </article>
      `;
      },
    )
    .join("");
}

function renderFrontdeskConsole() {
  const summary = document.getElementById("frontdesk-view-summary");
  const expectedList = document.getElementById("frontdesk-expected-list");
  const expectedCount = document.getElementById("frontdesk-expected-count");
  const verifyList = document.getElementById("frontdesk-verify-list");
  const verifyCount = document.getElementById("frontdesk-verify-count");
  const secretariatList = document.getElementById("frontdesk-secretariat-list");
  const secretariatCount = document.getElementById("frontdesk-secretariat-count");
  const visitorList = document.getElementById("frontdesk-visitor-list");
  const timeline = document.getElementById("frontdesk-timeline");
  const title = document.getElementById("frontdesk-main-title");
  const detail = document.getElementById("frontdesk-main-detail");
  if (!summary || !expectedList || !expectedCount || !verifyList || !verifyCount || !secretariatList || !secretariatCount || !visitorList || !timeline) return;

  const expected = getExpectedAppointments().slice(0, 6);
  const helpRequests = getKioskHelpEvents({ unresolvedOnly: true });
  const toVerify = getPatientsToVerify();
  const verifyTotal = helpRequests.length + toVerify.length;
  const secretariatRequests = patients
    .filter((patient) => patient.source === "secretariat" && patient.status !== "completed")
    .slice(0, 5);
  const visitors = patients
    .filter((patient) => !patient.appointmentId && patient.source !== "secretariat")
    .sort((a, b) => Number(b.source === "secretariat") - Number(a.source === "secretariat"))
    .slice(0, 5);
  const active = patients.filter((patient) => patient.status !== "completed").length;
  renderFrontdeskSearch();

  if (helpRequests.length) {
    title.textContent = "Aide demandée sur la borne";
    detail.textContent = `${helpRequests.length} demande${helpRequests.length > 1 ? "s" : ""} patient à traiter maintenant.`;
  } else if (toVerify.length) {
    title.textContent = "Accueil à vérifier";
    detail.textContent = `${toVerify.length} patient${toVerify.length > 1 ? "s" : ""} à contrôler avant installation.`;
  } else if (expected.length) {
    title.textContent = "Prochains patients attendus";
    detail.textContent = `${expected.length} rendez-vous à surveiller sur la borne.`;
  } else {
    title.textContent = "Accueil fluide";
    detail.textContent = "Aucun rendez-vous en attente immédiate.";
  }

  summary.innerHTML = [
    ["Actifs", active],
    ["Attendus", expected.length],
    ["Aide borne", helpRequests.length],
    ["Secrétariat", secretariatRequests.length],
    ["À vérifier", toVerify.length],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  expectedCount.textContent = `${expected.length} attendu${expected.length > 1 ? "s" : ""}`;
  expectedList.innerHTML = expected.length
    ? expected
        .map(
          (appointment) => `
            <article class="frontdesk-row">
              <time>${appointment.time}</time>
              <div>
                <strong>${maskName(appointment.name)}</strong>
                <span>${appointment.practitioner} · ${appointment.reason} · ${appointment.room}</span>
              </div>
              <div class="frontdesk-row-actions">
                <button data-arrive-frontdesk="${appointment.id}" type="button">Présence</button>
                <button data-prefill-frontdesk="${appointment.id}" type="button">Borne</button>
                <button data-noshow-frontdesk="${appointment.id}" type="button">Absent</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun patient attendu avec les filtres actuels.</p>`;

  verifyCount.textContent = `${verifyTotal} demande${verifyTotal > 1 ? "s" : ""}`;
  verifyList.innerHTML = verifyTotal
    ? helpRequests
        .map(
          (event) => `
            <article class="frontdesk-row help">
              <time>${event.time}</time>
              <div>
                <strong>Aide demandée sur la borne</strong>
                <span>${event.detail}</span>
              </div>
              <div class="frontdesk-row-actions">
                <button data-ack-help="${event.id}" type="button">Traiter</button>
              </div>
            </article>
          `,
        )
        .join("") +
      toVerify
        .map(
          (patient) => `
            <article class="frontdesk-row warning">
              <time>${patient.time}</time>
              <div>
                <strong>${maskName(patient.name)}</strong>
                <span>${patient.reason} · ${patient.wait} min d'attente</span>
              </div>
              <div class="frontdesk-row-actions">
                <button data-resolve-frontdesk="${patient.id}" type="button">Marquer vérifié</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun patient à vérifier.</p>`;

  secretariatCount.textContent =
    `${secretariatRequests.length} demande${secretariatRequests.length > 1 ? "s" : ""}`;
  secretariatList.innerHTML = secretariatRequests.length
    ? secretariatRequests
        .map(
          (patient) => `
            <article class="frontdesk-row secretariat-request ${patient.assignedSecretary ? "assigned" : ""}">
              <time>${patient.time}</time>
              <div>
                <strong>${maskName(patient.name)}</strong>
                <span>${
                  patient.assignedSecretary
                    ? `${patient.assignedSecretary} · pris en charge à ${patient.secretariatAssignedAt || "--:--"}`
                    : `Première secrétaire disponible · ${patient.wait} min d'attente`
                }</span>
              </div>
              <div class="frontdesk-row-actions">
                ${
                  patient.assignedSecretary
                    ? `<button data-assign-secretariat="${patient.id}" type="button">Réattribuer</button>`
                    : `<button data-assign-secretariat="${patient.id}" type="button">Prendre</button>`
                }
                <button data-call-patient="${patient.id}" type="button">Appeler</button>
                <button data-action="completed" data-patient="${patient.id}" type="button">Traité</button>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucune demande secrétariat en attente.</p>`;

  visitorList.innerHTML = visitors.length
    ? visitors
        .map(
          (patient) => `
            <article class="frontdesk-row ${patient.source === "secretariat" ? "secretariat-request" : ""}">
              <time>${patient.time}</time>
              <div>
                <strong>${maskName(patient.name)}</strong>
                <span>${patient.source === "secretariat" ? "À recevoir par le secrétariat" : patient.reason} · ${patient.practitioner}</span>
              </div>
              <em>${labels[patient.status] || patient.status}</em>
            </article>
          `,
        )
        .join("")
    : `<p>Aucune visite sans rendez-vous enregistrée.</p>`;

  timeline.innerHTML = activityLog.length
    ? activityLog
        .slice(0, 6)
        .map(
          (event) => `
            <article class="frontdesk-event">
              <time>${event.time}</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.detail}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucune action pour le moment.</p>`;

  expectedList.querySelectorAll("[data-arrive-frontdesk]").forEach((button) => {
    button.addEventListener("click", () => registerManualArrival(button.dataset.arriveFrontdesk));
  });
  expectedList.querySelectorAll("[data-prefill-frontdesk]").forEach((button) => {
    button.addEventListener("click", () => prefillKioskAppointment(button.dataset.prefillFrontdesk));
  });
  expectedList.querySelectorAll("[data-noshow-frontdesk]").forEach((button) => {
    button.addEventListener("click", () => markNoShow(button.dataset.noshowFrontdesk));
  });
  verifyList.querySelectorAll("[data-resolve-frontdesk]").forEach((button) => {
    button.addEventListener("click", () => resolveReceptionCheck(button.dataset.resolveFrontdesk));
  });
  verifyList.querySelectorAll("[data-ack-help]").forEach((button) => {
    button.addEventListener("click", () => acknowledgeKioskHelp(button.dataset.ackHelp));
  });
  secretariatList.querySelectorAll("[data-call-patient]").forEach((button) => {
    button.addEventListener("click", () => callPatient(button.dataset.callPatient));
  });
  secretariatList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => updatePatient(button.dataset.patient, button.dataset.action));
  });
  renderSecretariatLoadPanel();
}

function getOpeningChecklist() {
  const toVerify = getPatientsToVerify().length;
  const secretariatRequests = patients.filter(
    (patient) => patient.source === "secretariat" && patient.status !== "completed",
  ).length;
  const expectedTeam = cabinetConfig.teamCounts.practitioners + cabinetConfig.teamCounts.secretaries + cabinetConfig.teamCounts.assistants;
  const activePatients = patients.filter((patient) => patient.status !== "completed").length;

  return [
    {
      label: "Planning du jour",
      detail: `${appointments.length} rendez-vous disponibles`,
      done: appointments.length > 0,
    },
    {
      label: "Borne iPad",
      detail: getKioskUrl(),
      done: Boolean(getKioskUrl()),
    },
    {
      label: "Équipe affichée",
      detail: `${teamMembers.length}/${expectedTeam} portraits paramétrés`,
      done: teamMembers.length === expectedTeam && teamMembers.length > 0,
    },
    {
      label: "Demandes à vérifier",
      detail: toVerify ? `${toVerify} patient${toVerify > 1 ? "s" : ""} à contrôler` : "Aucune anomalie d'accueil",
      done: toVerify === 0,
    },
    {
      label: "Secrétariat",
      detail: secretariatRequests
        ? `${secretariatRequests} demande${secretariatRequests > 1 ? "s" : ""} à recevoir`
        : "File secrétariat propre",
      done: secretariatRequests <= 3,
    },
    {
      label: "Pilotage actif",
      detail: activePatients ? `${activePatients} présence${activePatients > 1 ? "s" : ""} en cours` : "Prêt à recevoir les premières présences",
      done: true,
    },
  ];
}

function renderOpeningChecklist() {
  const list = document.getElementById("opening-list");
  const score = document.getElementById("opening-score");
  if (!list || !score) return;

  const items = getOpeningChecklist();
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  score.textContent = `${percent}%`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  list.innerHTML = items
    .map(
      (item) => `
        <article class="opening-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À voir"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function buildOpeningGuide() {
  const checks = getOpeningChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A VOIR]"} ${item.label}: ${item.detail}`)
    .join("\n");
  return [
    "ADIA Accueil - Ouverture cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Borne iPad: ${getKioskUrl()}`,
    `Accueil secrétariat: ${getViewUrl("frontdesk")}`,
    `Administration: ${getViewUrl("admin")}`,
    "",
    "Checklist du matin",
    checks,
    "",
    "Routine recommandée",
    "1. Ouvrir la console Accueil sur l'ordinateur du secrétariat.",
    "2. Vérifier que la checklist d'ouverture est majoritairement verte.",
    "3. Ajouter un rendez-vous minute depuis Accueil si un créneau est donné par téléphone ou au comptoir.",
    "4. Utiliser Ajouter + borne si le patient est déjà devant la tablette.",
    "5. Ouvrir le lien Borne iPad sur la tablette.",
    "6. Faire valider une arrivée test si nécessaire.",
    "7. Laisser les demandes sans rendez-vous arriver dans Demandes secrétariat.",
    "8. En fin de journée, aller dans Exploitation et télécharger le rapport.",
  ].join("\n");
}

function downloadOpeningGuide() {
  downloadText("adia-presence-ouverture-cabinet.txt", buildOpeningGuide());
  logEvent("Guide ouverture téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getGoLiveChecklist() {
  const expectedTeam =
    cabinetConfig.teamCounts.practitioners + cabinetConfig.teamCounts.secretaries + cabinetConfig.teamCounts.assistants;
  const namedTeam = teamMembers.filter((member) => member.name && member.name.trim()).length;
  const workstationLinks = getWorkstationLinks();
  const scenarioCount = getCabinetTestScenarios().length;
  const exportsReady =
    Boolean(document.getElementById("download-day-archive")) &&
    Boolean(document.getElementById("download-operational-review")) &&
    Boolean(document.getElementById("download-scenario-tracker"));

  return [
    {
      label: "Poste accueil",
      detail: getViewUrl("frontdesk"),
      action: "Ouvrir ce lien sur l'ordinateur du secrétariat.",
      done: Boolean(getViewUrl("frontdesk")),
    },
    {
      label: "Borne patient",
      detail: getKioskUrl(),
      action: "Ouvrir ce lien sur l'iPad puis passer en plein écran.",
      done: Boolean(getKioskUrl()),
    },
    {
      label: "Équipe affichée",
      detail: `${namedTeam}/${expectedTeam} personnes paramétrées`,
      action: "Vérifier les portraits, noms, fonctions et rattachements.",
      done: expectedTeam > 0 && namedTeam === expectedTeam,
    },
    {
      label: "Rendez-vous du jour",
      detail: `${appointments.length} rendez-vous chargés`,
      action: "Importer le planning ou saisir les premiers rendez-vous à la main.",
      done: appointments.length > 0,
    },
    {
      label: "Postes ciblés",
      detail: `${workstationLinks.length} lien${workstationLinks.length > 1 ? "s" : ""} disponible${workstationLinks.length > 1 ? "s" : ""}`,
      action: "Donner à chaque praticien, assistante et secrétaire son lien nominatif.",
      done: workstationLinks.length >= 4,
    },
    {
      label: "Recette terrain",
      detail: `${scenarioCount} scénarios prêts à cocher`,
      action: "Tester une présence praticien, une présence secrétariat et un patient sans rendez-vous.",
      done: scenarioCount >= 5,
    },
    {
      label: "Exports fin de test",
      detail: "Bilan opérationnel, suivi terrain, rapport de journée",
      action: "Exporter les fichiers en fin de matinée pilote.",
      done: exportsReady,
    },
  ];
}

function getGoLiveTimeline() {
  return [
    {
      time: "Avant ouverture",
      title: "Préparer les postes",
      detail: "Ouvrir Accueil secrétariat, la borne patient et le pilotage cabinet.",
    },
    {
      time: "Premier patient",
      title: "Valider une présence avec rendez-vous",
      detail: "Le patient choisit la personne concernée, saisit nom et prénom, puis confirme sa présence.",
    },
    {
      time: "Cas accueil",
      title: "Tester sans rendez-vous",
      detail: "La demande doit arriver chez les secrétaires, avec réception par la première secrétaire disponible.",
    },
    {
      time: "Équipe",
      title: "Contrôler le périmètre de chacun",
      detail: "Chaque praticien ou assistante doit voir uniquement les patients qui la concernent.",
    },
    {
      time: "Fin du test",
      title: "Exporter et décider",
      detail: "Télécharger le bilan opérationnel, le suivi de recette et les corrections à traiter.",
    },
  ];
}

function renderGoLiveChecklist() {
  const grid = document.getElementById("go-live-grid");
  const timeline = document.getElementById("go-live-timeline");
  const score = document.getElementById("go-live-score");
  if (!grid || !score) return;

  const items = getGoLiveChecklist();
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  score.textContent = `${percent}% prêt`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  grid.innerHTML = items
    .map(
      (item) => `
        <article class="go-live-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À préparer"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
            <em>${item.action}</em>
          </div>
        </article>
      `,
    )
    .join("");
  if (timeline) {
    timeline.innerHTML = [
      "<h3>Déroulé conseillé du test</h3>",
      ...getGoLiveTimeline().map(
        (item) => `
          <article class="go-live-step">
            <span>${item.time}</span>
            <div>
              <strong>${item.title}</strong>
              <small>${item.detail}</small>
            </div>
          </article>
        `,
      ),
    ].join("");
  }
}

function buildGoLiveChecklistText() {
  const checks = getGoLiveChecklist()
    .map((item) => [
      `- ${item.done ? "[OK]" : "[A PREPARER]"} ${item.label}`,
      `  Etat: ${item.detail}`,
      `  Action: ${item.action}`,
    ].join("\n"))
    .join("\n");
  const timeline = getGoLiveTimeline()
    .map((item, index) => `${index + 1}. ${item.time} - ${item.title}\n   ${item.detail}`)
    .join("\n");

  return [
    "ADIA Accueil - Checklist mise en service test cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Borne patient: ${getKioskUrl()}`,
    `Accueil secrétariat: ${getViewUrl("frontdesk")}`,
    `Pilotage cabinet: ${getViewUrl("dashboard")}`,
    `Administration: ${getViewUrl("admin")}`,
    "",
    "À faire le matin du test",
    checks,
    "",
    "Déroulé conseillé du test",
    timeline,
  ].join("\n");
}

function downloadGoLiveChecklist() {
  downloadText("adia-presence-mise-en-service-test.txt", buildGoLiveChecklistText());
  logEvent("Checklist mise en service téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function addFrontdeskVisitor() {
  const field = document.getElementById("frontdesk-visitor-name");
  const kind = document.getElementById("frontdesk-visitor-kind").value;
  const name = field.value.trim();
  if (!name) {
    showToast("Indiquez un nom ou une société.");
    return;
  }
  const reason = kind === "secretariat" ? "Demande secrétariat" : "Visite externe";
  createVisitorArrival(name, reason, kind);
  field.value = "";
  renderBoard();
  showToast(`${name}: accueil enregistré.`);
}

function createFrontdeskQuickAppointment(openKiosk = false) {
  const nameField = document.getElementById("frontdesk-appointment-name");
  const timeField = document.getElementById("frontdesk-appointment-time");
  const practitionerField = document.getElementById("frontdesk-appointment-practitioner");
  const reasonField = document.getElementById("frontdesk-appointment-reason");
  const status = document.getElementById("frontdesk-appointment-status");
  const name = nameField.value.trim();
  const time = timeField.value || getNextQuickAppointmentTime();
  const practitioner = practitionerField.value || getPractitionerNames()[0] || "Dr Martin";
  const reason = reasonField.value.trim() || "Rendez-vous ajouté à l'accueil";
  const validationMessage = getFullNameValidationMessage(name);

  if (validationMessage) {
    status.textContent = "Nom + prénom";
    status.classList.add("warning");
    nameField.focus();
    showToast(validationMessage);
    return;
  }

  const existingAppointment = appointments.find((appointment) => normalize(appointment.name) === normalize(name));
  const appointment = addAppointment({
    name,
    code: generateAppointmentCode(name),
    practitioner,
    reason,
    time,
    room: getDefaultAppointmentRoom(practitioner),
  });

  logEvent(
    existingAppointment ? "Rendez-vous mis à jour par l'accueil" : "Rendez-vous ajouté par l'accueil",
    `${appointment.name} · ${appointment.time} · ${appointment.practitioner}`,
    "settings",
  );
  status.textContent = existingAppointment ? `${appointment.time} mis à jour` : `${appointment.time} ajouté`;
  status.classList.remove("warning");
  nameField.value = "";
  reasonField.value = "";
  timeField.value = getNextQuickAppointmentTime();
  renderBoard();
  if (openKiosk) {
    prefillKioskAppointment(appointment.id);
    return;
  }
  showToast(
    existingAppointment
      ? `${appointment.name}: rendez-vous mis à jour.`
      : `${appointment.name}: rendez-vous ajouté au planning.`,
  );
}

function buildSecretariatFollowupText() {
  const requests = patients.filter((patient) => patient.source === "secretariat");
  const lines = requests.length
    ? requests
        .map((patient) =>
          [
            patient.time,
            patient.name,
            labels[patient.status] || patient.status,
            patient.assignedSecretary || "Non attribué",
            patient.secretariatAssignedAt || "",
            `${patient.wait} min`,
            patient.reason,
          ].join(";"),
        )
        .join("\n")
    : "Aucune demande secrétariat";

  return [
    "ADIA Accueil - Suivi des demandes secrétariat",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Charge par secrétaire",
    ...Object.entries(getSecretaryLoad()).map(
      ([name, rawStats]) => {
        const stats = normalizeSecretaryStats(rawStats);
        return `- ${name}: ${stats.assigned} ouverte${stats.assigned > 1 ? "s" : ""}, ${stats.completed} traitée${stats.completed > 1 ? "s" : ""}`;
      },
    ),
    "",
    "Demandes",
    "Heure;Nom;Statut;Secrétaire assignée;Assigné à;Attente;Motif",
    lines,
  ].join("\n");
}

function downloadSecretariatFollowup() {
  downloadText("adia-presence-suivi-secretariat.txt", buildSecretariatFollowupText());
  logEvent("Suivi secrétariat téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function resolveReceptionCheck(patientId) {
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) return;
  patient.source = "verified_reception";
  patient.reason = "Vérifié par le secrétariat";
  patient.priority = "normal";
  logEvent("Patient vérifié par l'accueil", `${patient.name} · dossier retrouvé ou traitement manuel`, "info");
  renderBoard();
  showToast(`${patient.name} marqué vérifié.`);
}

function getTrackedRooms() {
  const detectedRooms = [
    ...appointments.map((appointment) => appointment.room),
    ...patients.map((patient) => patient.room),
  ].filter(Boolean);
  return [...new Set([...trackedRooms, ...detectedRooms])];
}

function getRoomState(room) {
  const activePatients = patients.filter(
    (patient) => patient.room === room && patient.status !== "completed",
  );
  const inCare = activePatients.find((patient) => patient.status === "in_care");
  if (inCare) {
    return {
      kind: "occupied",
      label: "Occupée",
      patient: inCare,
      detail: `${maskName(inCare.name)} · ${inCare.practitioner}`,
    };
  }

  const waiting = activePatients.filter((patient) => ["arrived", "waiting"].includes(patient.status));
  if (waiting.length) {
    const nextPatient = [...waiting].sort((a, b) => b.wait - a.wait)[0];
    return {
      kind: "prep",
      label: "À préparer",
      patient: nextPatient,
      detail: `${waiting.length} patient${waiting.length > 1 ? "s" : ""} en attente`,
    };
  }

  return {
    kind: "free",
    label: "Libre",
    patient: null,
    detail: "Aucun patient actif",
  };
}

function renderRooms() {
  const board = document.getElementById("room-board");
  const count = document.getElementById("room-count");
  if (!board || !count) return;

  const states = getTrackedRooms().map((room) => ({ room, ...getRoomState(room) }));
  const activeRooms = states.filter((state) => state.kind !== "free").length;
  count.textContent = `${activeRooms} salle${activeRooms > 1 ? "s" : ""} active${activeRooms > 1 ? "s" : ""}`;
  board.innerHTML = states
    .map(
      (state) => `
        <article class="room-card ${state.kind}">
          <div>
            <span>${state.room}</span>
            <strong>${state.label}</strong>
          </div>
          <p>${state.detail}</p>
          ${
            state.patient
              ? `<small>${state.patient.reason} · ${state.patient.wait} min attente</small>`
              : "<small>Disponible pour le prochain patient</small>"
          }
        </article>
      `,
    )
    .join("");
}

function renderCareScopeSelectors() {
  const practitioners = getPractitionerNames();
  const options = practitioners
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");
  const doctorSelect = document.getElementById("doctor-practitioner-select");
  const assistantSelect = document.getElementById("assistant-practitioner-select");

  if (doctorSelect) {
    doctorSelect.innerHTML = options;
    doctorSelect.value = practitioners.includes(doctorPractitionerScope)
      ? doctorPractitionerScope
      : practitioners[0];
    doctorSelect.onchange = (event) => {
      doctorPractitionerScope = event.target.value;
      renderBoard();
    };
  }

  if (assistantSelect) {
    assistantSelect.innerHTML = options;
    assistantSelect.value = practitioners.includes(assistantPractitionerScope)
      ? assistantPractitionerScope
      : practitioners[0];
    assistantSelect.onchange = (event) => {
      assistantPractitionerScope = event.target.value;
      renderBoard();
    };
  }
}

function getScopedPatients(practitioner, statuses = null) {
  return patients.filter(
    (patient) =>
      patient.practitioner === practitioner &&
      patient.status !== "completed" &&
      (!statuses || statuses.includes(patient.status)),
  );
}

function getAccessProfile(kind) {
  const activePatients = patients.filter((patient) => patient.status !== "completed");
  if (kind === "doctor") {
    const visible = getScopedPatients(doctorPractitionerScope);
    return {
      title: `Poste ${doctorPractitionerScope}`,
      role: "Praticien",
      scope: `Uniquement les patients affectés à ${doctorPractitionerScope}.`,
      visibleCount: visible.length,
      hiddenCount: Math.max(activePatients.length - visible.length, 0),
      visible: ["Patients présents du praticien", "Appels patient", "Statuts prise en charge et terminé"],
      hidden: ["Demandes des autres praticiens", "Demandes secrétariat globales", "Paramétrage cabinet"],
      actions: ["Appeler", "Prendre en charge", "Terminer"],
    };
  }

  if (kind === "assistant") {
    const statuses = ["arrived", "waiting", "in_preparation", "in_care"];
    const visible = getScopedPatients(assistantPractitionerScope, statuses);
    const hidden = activePatients.filter(
      (patient) => statuses.includes(patient.status) && patient.practitioner !== assistantPractitionerScope,
    );
    return {
      title: `Assistante de ${assistantPractitionerScope}`,
      role: "Assistante clinique",
      scope: `Préparation clinique liée à ${assistantPractitionerScope}.`,
      visibleCount: visible.length,
      hiddenCount: hidden.length,
      visible: ["Patients à préparer", "Patients en préparation", "Patients en soin du praticien rattaché"],
      hidden: ["Files des autres praticiens", "Exports administratifs", "Paramétrage cabinet"],
      actions: ["Appeler", "Marquer prêt", "Coordonner avec le praticien"],
    };
  }

  const secretariatRequests = patients.filter((patient) => patient.source === "secretariat" && patient.status !== "completed");
  const toVerify = patients.filter((patient) => patient.priority === "verify" && patient.status !== "completed");
  return {
    title: frontdeskStaffScope ? `Poste ${frontdeskStaffScope}` : "Poste secrétariat",
    role: "Secrétariat",
    scope: "Vue globale de l'accueil du cabinet.",
    visibleCount: appointments.length + patients.length,
    hiddenCount: 0,
    visible: [
      `${appointments.length} rendez-vous du jour`,
      `${secretariatRequests.length} demande${secretariatRequests.length > 1 ? "s" : ""} sans rendez-vous`,
      `${toVerify.length} patient${toVerify.length > 1 ? "s" : ""} à vérifier`,
    ],
    hidden: ["Dossier médical", "Données de santé détaillées", "Paramétrage SaaS"],
    actions: ["Valider présence", "Vérifier patient", "Traiter demande secrétariat"],
  };
}

function renderAccessScopeSummary(containerId, profile) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="access-scope-kpis">
      <article>
        <span>Rôle</span>
        <strong>${profile.role}</strong>
      </article>
      <article>
        <span>Visible</span>
        <strong>${profile.visibleCount}</strong>
      </article>
      <article>
        <span>Masqué</span>
        <strong>${profile.hiddenCount}</strong>
      </article>
    </div>
    <p>${profile.scope}</p>
    <div class="access-scope-columns">
      <div>
        <small>Ce poste voit</small>
        <ul>${profile.visible.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div>
        <small>Ce poste ne voit pas</small>
        <ul>${profile.hidden.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div>
        <small>Actions</small>
        <ul>${profile.actions.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

function renderAccessScopePanels() {
  const frontdeskProfile = getAccessProfile("frontdesk");
  const doctorProfile = getAccessProfile("doctor");
  const assistantProfile = getAccessProfile("assistant");

  const frontdeskTitle = document.getElementById("frontdesk-access-title");
  const doctorTitle = document.getElementById("doctor-access-title");
  const assistantTitle = document.getElementById("assistant-access-title");
  if (frontdeskTitle) frontdeskTitle.textContent = frontdeskProfile.title;
  if (doctorTitle) doctorTitle.textContent = doctorProfile.title;
  if (assistantTitle) assistantTitle.textContent = assistantProfile.title;

  renderAccessScopeSummary("frontdesk-access-summary", frontdeskProfile);
  renderAccessScopeSummary("doctor-access-summary", doctorProfile);
  renderAccessScopeSummary("assistant-access-summary", assistantProfile);
}

function renderDoctor() {
  renderCareScopeSelectors();
  const active = patients.filter(
    (patient) => patient.status !== "completed" && patient.practitioner === doctorPractitionerScope,
  );
  const next = active[0];
  document.getElementById("doctor-next").textContent = next ? maskName(next.name) : "Aucun patient";
  document.getElementById("doctor-next-detail").textContent = next
    ? `${next.reason} · ${next.room}`
    : "La file est vide.";
  document.getElementById("doctor-list").innerHTML = active.length
    ? active
        .map(
          (patient) => `
        <div class="row">
          <div>
            <strong>${maskName(patient.name)}</strong>
            <span>${patient.reason} · ${labels[patient.status]}</span>
          </div>
          <div class="inline-actions">
            <button data-action="in_care" data-patient="${patient.id}">Prendre en charge</button>
            <button data-call-patient="${patient.id}">Appeler</button>
            <button data-action="completed" data-patient="${patient.id}">Terminer</button>
          </div>
        </div>
      `,
        )
        .join("")
    : `<p>Aucun patient actif pour ${doctorPractitionerScope}.</p>`;
}

function renderAssistant() {
  renderCareScopeSelectors();
  const prep = patients.filter((patient) =>
    ["arrived", "waiting"].includes(patient.status) && patient.practitioner === assistantPractitionerScope,
  );
  document.getElementById("assistant-prep").textContent = String(prep.length);
  document.getElementById("assistant-scope-count").textContent = `${prep.length} à préparer`;
  document.getElementById("assistant-ready").textContent = String(
    patients.filter(
      (patient) => patient.status === "in_preparation" && patient.practitioner === assistantPractitionerScope,
    ).length,
  );
  document.getElementById("assistant-care").textContent = String(
    patients.filter(
      (patient) => patient.status === "in_care" && patient.practitioner === assistantPractitionerScope,
    ).length,
  );
  document.getElementById("assistant-list").innerHTML = prep.length
    ? prep
        .map(
          (patient) => `
        <div class="row">
          <div>
            <strong>${maskName(patient.name)}</strong>
            <span>${patient.room} · ${patient.reason}</span>
          </div>
          <div class="inline-actions">
            <button data-call-patient="${patient.id}">Appeler</button>
            <button data-action="in_care" data-patient="${patient.id}">Prêt</button>
          </div>
        </div>
      `,
        )
        .join("")
    : `<p>Aucun patient à préparer pour ${assistantPractitionerScope}.</p>`;
}

function updatePatient(id, status) {
  const patient = patients.find((item) => item.id === id);
  if (!patient) return;

  patient.status = status;
  const appointment = appointments.find((item) => item.id === patient.appointmentId);
  if (appointment) {
    appointment.status =
      status === "completed"
        ? "completed"
        : status === "in_care"
          ? "in_progress"
          : "arrived";
  }
  if (status === "completed") {
    patient.priority = "done";
  }
  const isSecretariatRequest = patient.source === "secretariat";
  logEvent(
    status === "completed"
      ? isSecretariatRequest
        ? `${patient.name} reçu par le secrétariat`
        : `${patient.name} terminé`
      : `${patient.name} pris en charge`,
    isSecretariatRequest
      ? `Demande sans rendez-vous traitée${patient.assignedSecretary ? ` · ${patient.assignedSecretary}` : ""}`
      : `${patient.practitioner} · ${patient.reason}`,
    status === "completed" ? "done" : "care",
  );
  renderBoard();
  showToast(
    status === "completed"
      ? isSecretariatRequest
        ? `${patient.name}: demande secrétariat traitée.`
        : `${patient.name} terminé.`
      : `${patient.name} mis à jour.`,
  );
}

function renderAppointments() {
  const list = document.getElementById("appointment-list");
  if (!list) return;

  list.innerHTML = appointments
    .map(
      (appointment) => `
        <div class="appointment-row ${appointment.status}">
          <div>
            <strong>${appointment.name}</strong>
            <span>${appointment.time} · ${appointment.practitioner} · ${appointment.reason}</span>
          </div>
          <div class="appointment-actions">
            ${["scheduled", "confirmed"].includes(appointment.status) ? `<button data-arrive-appointment="${appointment.id}" type="button">Présence</button>` : ""}
            <button data-edit-appointment="${appointment.id}" type="button">Modifier</button>
            <button data-prefill-appointment="${appointment.id}" type="button">Tester borne</button>
            <button data-ticket-appointment="${appointment.id}" type="button">Fiche patient</button>
            ${appointment.status !== "canceled" && appointment.status !== "completed" ? `<button data-cancel-appointment="${appointment.id}" type="button">Annuler</button>` : ""}
            ${["scheduled", "confirmed"].includes(appointment.status) ? `<button data-noshow-appointment="${appointment.id}" type="button">Absent</button>` : ""}
            <button class="${appointmentDeleteArmedId === appointment.id ? "armed" : "ghost-action"}" data-delete-appointment="${appointment.id}" type="button">${appointmentDeleteArmedId === appointment.id ? "Confirmer suppression" : "Supprimer"}</button>
            <em>${appointmentLabels[appointment.status] || appointment.status}</em>
          </div>
        </div>
      `,
    )
    .join("");

  document.querySelectorAll("[data-prefill-appointment]").forEach((button) => {
    button.addEventListener("click", () => prefillKioskAppointment(button.dataset.prefillAppointment));
  });

  document.querySelectorAll("[data-ticket-appointment]").forEach((button) => {
    button.addEventListener("click", () => showAppointmentTicket(button.dataset.ticketAppointment));
  });

  document.querySelectorAll("[data-edit-appointment]").forEach((button) => {
    button.addEventListener("click", () => editAppointment(button.dataset.editAppointment));
  });

  document.querySelectorAll("[data-delete-appointment]").forEach((button) => {
    button.addEventListener("click", () => deleteAppointment(button.dataset.deleteAppointment));
  });

  document.querySelectorAll("[data-arrive-appointment]").forEach((button) => {
    button.addEventListener("click", () => registerManualArrival(button.dataset.arriveAppointment));
  });

  document.querySelectorAll("[data-cancel-appointment]").forEach((button) => {
    button.addEventListener("click", () => cancelAppointment(button.dataset.cancelAppointment));
  });

  document.querySelectorAll("[data-noshow-appointment]").forEach((button) => {
    button.addEventListener("click", () => markNoShow(button.dataset.noshowAppointment));
  });
}

function getReceptionSheetRows() {
  return [...appointments]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((appointment) => ({
      ...appointment,
      visibleCode: (appointment.code || normalize(appointment.name.split(" ")[0] || appointment.name)).toUpperCase(),
      statusLabel: appointmentLabels[appointment.status] || appointment.status,
    }));
}

function getReceptionSecretariatRows() {
  return patients
    .filter((patient) => patient.source === "secretariat")
    .map((patient) => ({
      ...patient,
      visibleCode: "SANS RDV",
      statusLabel: labels[patient.status] || patient.status,
    }));
}

function renderReceptionSheet() {
  const summary = document.getElementById("reception-sheet-summary");
  const list = document.getElementById("reception-sheet-list");
  if (!summary || !list) return;

  const rows = getReceptionSheetRows();
  const secretariatRows = getReceptionSecretariatRows();
  const expected = rows.filter((item) => ["scheduled", "confirmed"].includes(item.status)).length;
  const arrived = rows.filter((item) => ["arrived", "in_progress", "completed"].includes(item.status)).length;

  summary.innerHTML = `
    <article>
      <span>Attendus</span>
      <strong>${expected}</strong>
    </article>
    <article>
      <span>Déjà validés</span>
      <strong>${arrived}</strong>
    </article>
    <article>
      <span>Secrétariat</span>
      <strong>${secretariatRows.length}</strong>
    </article>
    <article>
      <span>Codes prêts</span>
      <strong>${rows.length}</strong>
    </article>
  `;

  const appointmentRows = rows.length
    ? rows
        .slice(0, 8)
        .map(
          (appointment) => `
            <article class="reception-row ${appointment.status}">
              <time>${appointment.time}</time>
              <div>
                <strong>${appointment.name}</strong>
                <span>${appointment.practitioner} · ${appointment.room}</span>
              </div>
              <code>${appointment.visibleCode}</code>
              <em>${appointment.statusLabel}</em>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun rendez-vous prévu.</p>`;
  const secretariatList = secretariatRows.length
    ? secretariatRows
        .slice(0, 4)
        .map(
          (patient) => `
            <article class="reception-row secretariat-request">
              <time>${patient.time}</time>
              <div>
                <strong>${patient.name}</strong>
                <span>Demande secrétariat · ${patient.reason}</span>
              </div>
              <code>${patient.visibleCode}</code>
              <em>${patient.statusLabel}</em>
            </article>
          `,
        )
        .join("")
    : "";

  list.innerHTML = `${secretariatList}${appointmentRows}`;
}

function buildReceptionSheetText() {
  const rows = getReceptionSheetRows();
  const secretariatRows = getReceptionSecretariatRows();
  const lines = rows.length
    ? rows
        .map(
          (appointment) =>
            `${appointment.time};${appointment.name};${appointment.visibleCode};${appointment.practitioner};${appointment.room};${appointment.reason};${appointment.statusLabel}`,
        )
        .join("\n")
    : "Aucun rendez-vous";
  const secretariatLines = secretariatRows.length
    ? secretariatRows
        .map((patient) => `${patient.time};${patient.name};SANS RDV;Secrétariat;Accueil;${patient.reason};${patient.statusLabel}`)
        .join("\n")
    : "Aucune demande secrétariat";

  return [
    "ADIA Accueil - Feuille d'accueil du jour",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}`,
    "",
    "Heure;Patient;Code borne;Praticien;Salle;Motif;Statut",
    lines,
    "",
    "Demandes secrétariat",
    "Heure;Patient;Code borne;Destination;Salle;Motif;Statut",
    secretariatLines,
    "",
    "Usage cabinet: le patient peut saisir son nom ou le code court sur la borne.",
  ].join("\n");
}

function exportReceptionSheet() {
  const secretariatRows = getReceptionSecretariatRows();
  const rows = [
    ["Heure", "Patient", "Code borne", "Praticien", "Salle", "Motif", "Statut"],
    ...getReceptionSheetRows().map((appointment) => [
      appointment.time,
      appointment.name,
      appointment.visibleCode,
      appointment.practitioner,
      appointment.room,
      appointment.reason,
      appointment.statusLabel,
    ]),
    ...secretariatRows.map((patient) => [
      patient.time,
      patient.name,
      "SANS RDV",
      "Secrétariat",
      "Accueil",
      patient.reason,
      patient.statusLabel,
    ]),
  ];
  downloadText(
    "adia-presence-codes-accueil.csv",
    `\uFEFF${rows.map((row) => row.map(csvEscape).join(";")).join("\n")}`,
    "text/csv;charset=utf-8",
  );
  logEvent("Codes accueil exportés", `${rows.length - 1} rendez-vous`, "export");
  renderBoard();
}

function printReceptionSheet() {
  downloadText("adia-presence-feuille-accueil.txt", buildReceptionSheetText());
  logEvent("Feuille d'accueil préparée", "Liste du jour et codes borne", "export");
  renderBoard();
  document.body.classList.add("printing-reception");
  window.print();
  window.setTimeout(() => document.body.classList.remove("printing-reception"), 300);
}

function prefillKioskAppointment(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  selectedAppointmentId = appointment.id;
  updateKioskMode("appointment");
  document.getElementById("kiosk-search").value = appointment.code || appointment.name;
  renderKioskResults();
  activateView("kiosk");
  showToast(`${appointment.name} est prêt à tester sur la borne.`);
}

function registerManualArrival(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment || appointment.status === "canceled") return;
  const patient = createArrivalFromAppointment(appointment);
  logEvent(`Présence saisie par le secrétariat`, `${patient.name} · ${patient.practitioner}`, "arrival");
  renderBoard();
  showNotification("Présence patient", `${patient.name} est arrivé.`);
  showToast(`${patient.name} marqué présent par le secrétariat.`);
}

function cancelAppointment(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  appointment.status = "canceled";
  patients = patients.filter((patient) => patient.appointmentId !== appointment.id);
  logEvent(`Rendez-vous annulé`, `${appointment.name} · ${appointment.time}`, "cancel");
  renderBoard();
  showToast(`Rendez-vous annulé pour ${appointment.name}.`);
}

function markNoShow(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  appointment.status = "no_show";
  patients = patients.filter((patient) => patient.appointmentId !== appointment.id);
  logEvent(`Patient absent`, `${appointment.name} · ${appointment.time}`, "watch");
  renderBoard();
  showToast(`${appointment.name} marqué absent.`);
}

function buildTicketText(appointment) {
  return [
    "ADIA Accueil - Fiche de rendez-vous",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Patient: ${appointment.name}`,
    `Code: ${appointment.code || normalize(appointment.name.split(" ")[0] || appointment.name)}`,
    `Heure: ${appointment.time}`,
    `Praticien: ${appointment.practitioner}`,
    `Salle: ${appointment.room}`,
    `Motif: ${appointment.reason}`,
    "",
    "A l'arrivée, choisissez la personne du cabinet sur la borne d'accueil.",
  ].join("\n");
}

function showAppointmentTicket(appointmentId) {
  const appointment = appointments.find((item) => item.id === appointmentId);
  if (!appointment) return;
  activeTicketAppointmentId = appointment.id;
  const code = appointment.code || normalize(appointment.name.split(" ")[0] || appointment.name);
  document.getElementById("appointment-ticket").innerHTML = `
    <div class="ticket-brand">
      <span>A</span>
      <div>
        <strong>ADIA Accueil</strong>
        <small>${cabinetConfig.cabinetName}</small>
      </div>
    </div>
    <p class="eyebrow">Fiche de rendez-vous</p>
    <h1>${appointment.name}</h1>
    <div class="ticket-code">
      <span>Code borne</span>
      <strong>${code.toUpperCase()}</strong>
    </div>
    <dl>
      <div><dt>Heure</dt><dd>${appointment.time}</dd></div>
      <div><dt>Praticien</dt><dd>${appointment.practitioner}</dd></div>
      <div><dt>Salle</dt><dd>${appointment.room}</dd></div>
      <div><dt>Motif</dt><dd>${appointment.reason}</dd></div>
    </dl>
    <p class="ticket-help">A l'arrivée, choisissez la personne du cabinet sur la borne, puis confirmez simplement.</p>
  `;
  document.getElementById("ticket-modal").classList.remove("hidden");
}

function closeAppointmentTicket() {
  document.getElementById("ticket-modal").classList.add("hidden");
}

function printAppointmentTicket() {
  document.body.classList.add("printing-ticket");
  window.print();
  window.setTimeout(() => document.body.classList.remove("printing-ticket"), 300);
}

function downloadAppointmentTicket() {
  const appointment = appointments.find((item) => item.id === activeTicketAppointmentId);
  if (!appointment) return;
  downloadText(
    `fiche-rendez-vous-${normalize(appointment.name).replaceAll(" ", "-")}.txt`,
    buildTicketText(appointment),
  );
}

function renderActivityLog() {
  const list = document.getElementById("activity-list");
  const count = document.getElementById("activity-count");
  if (!list || !count) return;

  count.textContent = `${activityLog.length} événement${activityLog.length > 1 ? "s" : ""}`;
  list.innerHTML = activityLog.length
    ? activityLog
        .map(
          (event) => `
            <article class="activity-item ${event.kind}">
              <time>${event.time}</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.detail}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : "<p>Aucun événement pour le moment.</p>";
}

function renderNoteOptions() {
  const select = document.getElementById("note-patient-select");
  if (!select) return;
  const active = patients.filter((patient) => patient.status !== "completed");
  select.innerHTML = active.length
    ? active
        .map(
          (patient) => `
            <option value="${patient.id}">${maskName(patient.name)} · ${patient.practitioner}</option>
          `,
        )
        .join("")
    : `<option value="">Aucun patient actif</option>`;
}

function renderTransferOptions() {
  const select = document.getElementById("transfer-patient-select");
  if (!select) return;
  const active = patients.filter((patient) => patient.status !== "completed");
  select.innerHTML = active.length
    ? active
        .map(
          (patient) => `
            <option value="${patient.id}">${maskName(patient.name)} · ${patient.practitioner} · ${patient.room}</option>
          `,
        )
        .join("")
    : `<option value="">Aucun patient actif</option>`;
}

function transferPatient() {
  const patientId = document.getElementById("transfer-patient-select").value;
  const practitioner = document.getElementById("transfer-practitioner").value;
  const room = document.getElementById("transfer-room").value;
  const patient = patients.find((item) => item.id === patientId);
  if (!patient) {
    showToast("Aucun patient actif à transférer.");
    return;
  }

  patient.practitioner = practitioner;
  patient.room = room;
  const appointment = appointments.find((item) => item.id === patient.appointmentId);
  if (appointment) {
    appointment.practitioner = practitioner;
    appointment.room = room;
  }
  logEvent(`Patient transféré`, `${patient.name} · ${practitioner} · ${room}`, "care");
  renderBoard();
  showNotification("Transfert patient", `${patient.name} vers ${practitioner}, ${room}.`, { sound: false });
  showToast(`${patient.name} transféré vers ${practitioner}, ${room}.`);
}

function addInternalNote() {
  const patientId = document.getElementById("note-patient-select").value;
  const note = document.getElementById("note-text").value.trim();
  const patient = patients.find((item) => item.id === patientId);
  if (!patient || !note) {
    showToast("Sélectionnez un patient et saisissez une note.");
    return;
  }

  patient.notes = [...(patient.notes || []), note];
  logEvent(`Note ajoutée pour ${patient.name}`, note, "note");
  document.getElementById("note-text").value = "";
  renderBoard();
  showToast(`Note interne ajoutée pour ${patient.name}.`);
}

function getDaySummary() {
  const roomStates = getTrackedRooms().map((room) => getRoomState(room));
  const toVerify = getPatientsToVerify().length;
  const expected = getExpectedAppointments().length;
  const arrived = patients.filter((patient) => patient.status !== "completed").length;
  const completed = patients.filter((patient) => patient.status === "completed").length;
  const external = patients.filter((patient) => !patient.appointmentId).length;
  const late = patients.filter((patient) => patient.late >= 5 && patient.status !== "completed").length;
  const canceled = appointments.filter((appointment) => appointment.status === "canceled").length;
  const noShow = appointments.filter((appointment) => appointment.status === "no_show").length;
  const criticalWait = patients.filter(
    (patient) => patient.status !== "completed" && patient.wait >= 25,
  ).length;
  const patientCalls = activityLog.filter((event) => event.kind === "call").length;
  const avgWait = patients.length
    ? Math.round(patients.reduce((sum, patient) => sum + patient.wait, 0) / patients.length)
    : 0;

  return {
    arrived,
    completed,
    external,
    late,
    avgWait,
    canceled,
    noShow,
    criticalWait,
    patientCalls,
    occupiedRooms: roomStates.filter((state) => state.kind === "occupied").length,
    prepRooms: roomStates.filter((state) => state.kind === "prep").length,
    freeRooms: roomStates.filter((state) => state.kind === "free").length,
    toVerify,
    expected,
    scheduled: appointments.length,
    totalPatients: patients.length,
  };
}

function getPractitionerStats() {
  const counts = {};
  patients.forEach((patient) => {
    const key = patient.practitioner || "Accueil";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function renderOperations() {
  const metrics = document.getElementById("ops-metrics");
  const bars = document.getElementById("practitioner-bars");
  const report = document.getElementById("daily-report");
  if (!metrics || !bars || !report) return;

  const summary = getDaySummary();
  metrics.innerHTML = [
    ["RDV du jour", summary.scheduled],
    ["RDV attendus", summary.expected],
    ["Présences", summary.totalPatients],
    ["Terminés", summary.completed],
    ["Absents", summary.noShow],
    ["Attente critique", summary.criticalWait],
    ["Appels patients", summary.patientCalls],
    ["Salles occupées", summary.occupiedRooms],
    ["À vérifier", summary.toVerify],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  const stats = getPractitionerStats();
  const max = Math.max(...stats.map((item) => item.count), 1);
  bars.innerHTML = stats.length
    ? stats
        .map(
          (item) => `
            <div class="bar-row">
              <div>
                <strong>${item.name}</strong>
                <span>${item.count} arrivée${item.count > 1 ? "s" : ""}</span>
              </div>
              <div class="bar-track"><span style="width: ${(item.count / max) * 100}%"></span></div>
            </div>
          `,
        )
        .join("")
    : "<p>Aucune présence enregistrée.</p>";

  report.textContent = buildDailyReport();
}

function buildDailyReport() {
  const summary = getDaySummary();
  const review = getOperationalReviewItems();
  const practitioners = getPractitionerStats()
    .map((item) => `- ${item.name}: ${item.count} arrivée${item.count > 1 ? "s" : ""}`)
    .join("\n");
  const lastEvents = activityLog
    .slice(0, 5)
    .map((event) => `- ${event.time} · ${event.title}`)
    .join("\n");

  return [
    "ADIA Accueil - Rapport de journée",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}`,
    "",
    "Synthèse",
    `- Rendez-vous planifiés: ${summary.scheduled}`,
    `- Rendez-vous encore attendus: ${summary.expected}`,
    `- Présences enregistrées: ${summary.totalPatients}`,
    `- Patients terminés: ${summary.completed}`,
    `- Rendez-vous annulés: ${summary.canceled}`,
    `- Patients absents: ${summary.noShow}`,
    `- Attentes critiques: ${summary.criticalWait}`,
    `- Appels patients: ${summary.patientCalls}`,
    `- Salles occupées: ${summary.occupiedRooms}`,
    `- Salles à préparer: ${summary.prepRooms}`,
    `- Patients à vérifier à l'accueil: ${summary.toVerify}`,
    `- Visites externes / demandes accueil: ${summary.external}`,
    `- Retards à surveiller: ${summary.late}`,
    `- Attente moyenne: ${summary.avgWait} min`,
    "",
    "Par praticien",
    practitioners || "- Aucune donnée",
    "",
    "Bilan opérationnel",
    "Points positifs",
    ...review.positives.map((item) => `- ${item}`),
    "À reprendre",
    ...(review.unresolved.length ? review.unresolved.map((item) => `- ${item}`) : ["- Aucun point ouvert majeur"]),
    "Recommandation",
    review.recommendation,
    "",
    "Derniers événements",
    lastEvents || "- Aucun événement",
  ].join("\n");
}

function getPunctualityInsights() {
  const activePatients = patients.filter((patient) => patient.status !== "completed");
  const latePatients = activePatients.filter((patient) => patient.late >= 5);
  const longWaitPatients = activePatients.filter((patient) => patient.wait >= 15);
  const expectedAppointments = getExpectedAppointments();
  const verifyPatients = getPatientsToVerify();
  const handledAppointments = appointments.filter((appointment) =>
    ["arrived", "in_progress", "completed"].includes(appointment.status),
  );
  const punctualHandled = patients.filter((patient) => patient.appointmentId && patient.late < 5);
  const punctualityRate = handledAppointments.length
    ? Math.round((punctualHandled.length / handledAppointments.length) * 100)
    : 100;

  const alerts = [
    ...latePatients.map((patient) => ({
      kind: patient.late >= 10 ? "critical" : "warning",
      title: `${maskName(patient.name)} · ${patient.late} min retard`,
      detail: `${patient.practitioner} · ${patient.reason} · ${patient.wait} min attente`,
    })),
    ...longWaitPatients
      .filter((patient) => !latePatients.some((latePatient) => latePatient.id === patient.id))
      .map((patient) => ({
        kind: "warning",
        title: `${maskName(patient.name)} · attente longue`,
        detail: `${patient.practitioner} · ${patient.reason} · ${patient.wait} min`,
      })),
    ...verifyPatients.map((patient) => ({
      kind: "verify",
      title: `${maskName(patient.name)} · à vérifier`,
      detail: patient.reason || "Rendez-vous non retrouvé",
    })),
    ...expectedAppointments.slice(0, 4).map((appointment) => ({
      kind: "expected",
      title: `${appointment.name} attendu à ${appointment.time}`,
      detail: `${appointment.practitioner} · ${appointment.reason}`,
    })),
  ];

  const recommendation = latePatients.length
    ? "Prévenir le praticien concerné et prioriser l'appel du patient en retard."
    : verifyPatients.length
      ? "Traiter les patients à vérifier avant de clôturer la file."
      : expectedAppointments.length
        ? "Surveiller les prochains rendez-vous non pointés."
        : "Flux maîtrisé pour le moment.";

  return {
    alerts,
    expectedAppointments,
    latePatients,
    longWaitPatients,
    punctualityRate,
    recommendation,
    verifyPatients,
  };
}

function renderPunctualityPanel() {
  const container = document.getElementById("punctuality-summary");
  if (!container) return;

  const insights = getPunctualityInsights();
  container.innerHTML = `
    <div class="punctuality-kpis">
      <article>
        <span>Taux ponctuel</span>
        <strong>${insights.punctualityRate}%</strong>
      </article>
      <article class="${insights.latePatients.length ? "warning" : ""}">
        <span>Retards</span>
        <strong>${insights.latePatients.length}</strong>
      </article>
      <article class="${insights.longWaitPatients.length ? "warning" : ""}">
        <span>Attente longue</span>
        <strong>${insights.longWaitPatients.length}</strong>
      </article>
      <article class="${insights.expectedAppointments.length ? "todo" : ""}">
        <span>Non pointés</span>
        <strong>${insights.expectedAppointments.length}</strong>
      </article>
    </div>
    <div class="punctuality-guidance">
      <strong>Action conseillée</strong>
      <span>${insights.recommendation}</span>
    </div>
    <div class="punctuality-alerts">
      ${
        insights.alerts.length
          ? insights.alerts
              .slice(0, 8)
              .map(
                (alert) => `
                  <article class="${alert.kind}">
                    <strong>${alert.title}</strong>
                    <span>${alert.detail}</span>
                  </article>
                `,
              )
              .join("")
          : "<p>Aucun point de ponctualité à surveiller.</p>"
      }
    </div>
  `;
}

function buildPunctualityReport() {
  const insights = getPunctualityInsights();
  const alerts = insights.alerts.length
    ? insights.alerts.map((alert) => `- [${alert.kind}] ${alert.title}: ${alert.detail}`).join("\n")
    : "- Aucun point à surveiller";

  return [
    "ADIA Accueil - Bilan ponctualité",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Indicateurs",
    `- Taux ponctuel: ${insights.punctualityRate}%`,
    `- Patients en retard: ${insights.latePatients.length}`,
    `- Attentes longues: ${insights.longWaitPatients.length}`,
    `- Rendez-vous non pointés: ${insights.expectedAppointments.length}`,
    `- Patients à vérifier: ${insights.verifyPatients.length}`,
    "",
    "Action conseillée",
    insights.recommendation,
    "",
    "Points à surveiller",
    alerts,
  ].join("\n");
}

function downloadPunctualityReport() {
  downloadText("adia-presence-bilan-ponctualite.txt", buildPunctualityReport());
  logEvent("Bilan ponctualité téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getClosingChecklist() {
  const summary = getDaySummary();
  return [
    {
      label: "Patients actifs",
      value: summary.arrived,
      detail: summary.arrived ? "Patients encore non terminés" : "Aucun patient actif",
      done: summary.arrived === 0,
    },
    {
      label: "RDV attendus",
      value: summary.expected,
      detail: summary.expected ? "Rendez-vous encore planifiés" : "Aucun rendez-vous restant",
      done: summary.expected === 0,
    },
    {
      label: "À vérifier",
      value: summary.toVerify,
      detail: summary.toVerify ? "Patients non retrouvés à traiter" : "Aucune vérification restante",
      done: summary.toVerify === 0,
    },
    {
      label: "Rapports",
      value: "OK",
      detail: "Rapport, exports CSV et audit disponibles",
      done: true,
    },
  ];
}

function renderClosingSummary() {
  const container = document.getElementById("closing-summary");
  const headerButton = document.getElementById("close-day");
  const inlineButton = document.getElementById("close-day-inline");
  if (!container) return;

  const checks = getClosingChecklist();
  const ready = checks.every((item) => item.done);
  const buttonText = closeDayArmed ? "Confirmer clôture" : ready ? "Clôturer journée" : "Clôturer avec points ouverts";
  [headerButton, inlineButton].forEach((button) => {
    if (!button) return;
    button.textContent = buttonText;
    button.classList.toggle("armed", closeDayArmed);
    button.classList.toggle("warning", !ready && !closeDayArmed);
  });

  container.innerHTML = `
    <div class="closing-kpis">
      ${checks
        .map(
          (item) => `
            <article class="${item.done ? "done" : "todo"}">
              <span>${item.label}</span>
              <strong>${item.value}</strong>
              <small>${item.detail}</small>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="closing-guidance ${ready ? "ready" : "warning"}">
      <strong>${ready ? "Journée prête à clôturer" : "Points ouverts avant clôture"}</strong>
      <span>${
        ready
          ? "Vous pouvez exporter l'archive puis clôturer la journée."
          : "La clôture reste possible, mais ces points seront visibles dans l'archive."
      }</span>
    </div>
  `;
}

function buildDayArchiveText() {
  const checks = getClosingChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[OUVERT]"} ${item.label}: ${item.value} · ${item.detail}`)
    .join("\n");
  const events = activityLog.length
    ? activityLog.map((event) => `- ${event.time};${event.kind};${event.title};${event.detail}`).join("\n")
    : "- Aucun événement";

  return [
    "ADIA Accueil - Archive de journée",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Contrôle avant clôture",
    checks,
    "",
    buildDailyReport(),
    "",
    "Journal d'audit",
    events,
  ].join("\n");
}

function downloadDayArchive() {
  downloadText("adia-presence-archive-journee.txt", buildDayArchiveText());
  logEvent("Archive de journée téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getOperationalReviewItems() {
  const summary = getDaySummary();
  const insights = getPunctualityInsights();
  const secretariatRequests = patients.filter((patient) => patient.source === "secretariat");
  const openSecretariat = secretariatRequests.filter((patient) => patient.status !== "completed");
  const completedSecretariat = secretariatRequests.filter((patient) => patient.status === "completed");
  const quickAppointments = activityLog.filter((event) => event.title === "Rendez-vous ajouté par l'accueil").length;
  const unresolved = [
    ...insights.verifyPatients.map((patient) => `${patient.name}: rendez-vous à vérifier`),
    ...insights.expectedAppointments.map((appointment) => `${appointment.name}: rendez-vous non pointé à ${appointment.time}`),
    ...openSecretariat.map((patient) => `${patient.name}: demande secrétariat ouverte`),
  ];
  const positives = [
    summary.totalPatients ? `${summary.totalPatients} présence${summary.totalPatients > 1 ? "s" : ""} enregistrée${summary.totalPatients > 1 ? "s" : ""}` : "Borne prête pour les premières présences",
    completedSecretariat.length ? `${completedSecretariat.length} demande${completedSecretariat.length > 1 ? "s" : ""} secrétariat traitée${completedSecretariat.length > 1 ? "s" : ""}` : "File secrétariat suivie",
    quickAppointments ? `${quickAppointments} rendez-vous minute ajouté${quickAppointments > 1 ? "s" : ""} depuis l'accueil` : "Planning minute disponible",
    summary.patientCalls ? `${summary.patientCalls} appel${summary.patientCalls > 1 ? "s" : ""} patient tracé${summary.patientCalls > 1 ? "s" : ""}` : "Appels patients prêts à tracer",
  ];
  const recommendation = unresolved.length
    ? "Traiter les points ouverts avant de démarrer la prochaine journée."
    : summary.criticalWait
      ? "Revoir les créneaux ayant généré une attente critique."
      : "Flux propre: le cabinet peut repartir avec la même organisation.";

  return {
    positives,
    recommendation,
    unresolved: unresolved.slice(0, 8),
    summary,
  };
}

function renderOperationalReview() {
  const container = document.getElementById("operational-review");
  if (!container) return;

  const review = getOperationalReviewItems();
  container.innerHTML = `
    <div class="operational-review-columns">
      <article>
        <span>Points positifs</span>
        <ul>${review.positives.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="${review.unresolved.length ? "warning" : "ready"}">
        <span>À reprendre</span>
        ${
          review.unresolved.length
            ? `<ul>${review.unresolved.map((item) => `<li>${item}</li>`).join("")}</ul>`
            : "<p>Aucun point ouvert majeur.</p>"
        }
      </article>
    </div>
    <div class="operational-review-guidance ${review.unresolved.length ? "warning" : "ready"}">
      <strong>Recommandation</strong>
      <span>${review.recommendation}</span>
    </div>
  `;
}

function buildOperationalReviewText() {
  const review = getOperationalReviewItems();
  return [
    "ADIA Accueil - Bilan opérationnel",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Indicateurs",
    `- Rendez-vous du jour: ${review.summary.scheduled}`,
    `- Présences enregistrées: ${review.summary.totalPatients}`,
    `- Patients terminés: ${review.summary.completed}`,
    `- Rendez-vous non pointés: ${review.summary.expected}`,
    `- Points à vérifier: ${review.summary.toVerify}`,
    `- Attente moyenne: ${review.summary.avgWait} min`,
    "",
    "Points positifs",
    ...review.positives.map((item) => `- ${item}`),
    "",
    "À reprendre",
    ...(review.unresolved.length ? review.unresolved.map((item) => `- ${item}`) : ["- Aucun point ouvert majeur"]),
    "",
    "Recommandation",
    review.recommendation,
  ].join("\n");
}

function downloadOperationalReview() {
  downloadText("adia-presence-bilan-operationnel.txt", buildOperationalReviewText());
  logEvent("Bilan opérationnel téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getExecutiveDecision() {
  const summary = getDaySummary();
  const scenarios = getCabinetTestScenarios();
  const doneScenarios = scenarios.filter((scenario) => scenario.done).length;
  const quality = getQualityChecklist();
  const qualityDone = quality.filter((item) => item.done).length;
  const qualityPercent = Math.round((qualityDone / quality.length) * 100);
  const highPriorityFeedback = getPilotFeedback().filter((event) => getFeedbackMeta(event).priority === "Haute").length;
  const scenarioFixes = getScenarioFixItems().length;
  const blockers = summary.toVerify + summary.criticalWait + highPriorityFeedback + scenarioFixes;
  const status = blockers > 0
    ? "À sécuriser"
    : qualityPercent >= 85 && doneScenarios >= scenarios.length - 1
      ? "Prêt pilote"
      : "À compléter";

  return {
    status,
    qualityPercent,
    doneScenarios,
    totalScenarios: scenarios.length,
    highPriorityFeedback,
    scenarioFixes,
    blockers,
    summary,
  };
}

function renderExecutiveSummary() {
  const container = document.getElementById("executive-summary");
  const status = document.getElementById("executive-status");
  if (!container || !status) return;

  const decision = getExecutiveDecision();
  status.textContent = decision.status;
  status.classList.toggle("success", decision.status === "Prêt pilote");
  status.classList.toggle("warning", decision.status !== "Prêt pilote");
  container.innerHTML = [
    ["Décision", decision.status],
    ["Qualité", `${decision.qualityPercent}%`],
    ["Scénarios", `${decision.doneScenarios}/${decision.totalScenarios}`],
    ["Points à surveiller", decision.blockers],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

function buildExecutiveSummary() {
  const decision = getExecutiveDecision();
  const backlog = getPilotBacklogItems()
    .slice(0, 6)
    .map((item) => `- [${item.priority}] ${item.title}: ${item.description}`)
    .join("\n");
  return [
    "ADIA Accueil - Synthèse pilote cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Décision",
    `- Statut recommandé: ${decision.status}`,
    `- Qualité cabinet: ${decision.qualityPercent}%`,
    `- Scénarios validés: ${decision.doneScenarios}/${decision.totalScenarios}`,
    `- Scénarios à corriger: ${decision.scenarioFixes}`,
    `- Points à surveiller: ${decision.blockers}`,
    "",
    "Bénéfice observé",
    "- La borne confirme la présence patient sans solliciter immédiatement le secrétariat.",
    "- Les demandes sans rendez-vous remontent au secrétariat.",
    "- Les patients non retrouvés sont isolés pour vérification.",
    "- L'équipe dispose d'une vue d'accueil et d'un rapport de journée.",
    "",
    "Indicateurs du jour",
    `- Présences enregistrées: ${decision.summary.totalPatients}`,
    `- Patients à vérifier: ${decision.summary.toVerify}`,
    `- Demandes accueil / externes: ${decision.summary.external}`,
    `- Attente moyenne: ${decision.summary.avgWait} min`,
    `- Appels patients: ${decision.summary.patientCalls}`,
    "",
    "Actions suivantes",
    backlog || "- Aucun point prioritaire identifié",
  ].join("\n");
}

function downloadExecutiveSummary() {
  downloadText("adia-presence-synthese-pilote.txt", buildExecutiveSummary());
  logEvent("Synthèse pilote téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getFilteredAuditEvents() {
  return auditFilter === "all"
    ? activityLog
    : activityLog.filter((event) => event.kind === auditFilter);
}

function renderAuditLog() {
  const list = document.getElementById("audit-list");
  const count = document.getElementById("audit-count");
  const filter = document.getElementById("audit-filter");
  if (!list || !count || !filter) return;

  filter.value = auditFilter;
  filter.onchange = (event) => {
    auditFilter = event.target.value;
    renderAuditLog();
  };

  const events = getFilteredAuditEvents();
  count.textContent = `${events.length} événement${events.length > 1 ? "s" : ""}`;
  list.innerHTML = events.length
    ? events
        .slice(0, 10)
        .map(
          (event) => `
            <article class="audit-item ${event.kind}">
              <time>${event.time}</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.detail}</span>
              </div>
              <em>${event.kind}</em>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun événement pour ce filtre.</p>`;
}

function buildAuditLogText() {
  const events = getFilteredAuditEvents();
  const lines = events.length
    ? events.map((event) => `- ${event.time};${event.kind};${event.title};${event.detail}`).join("\n")
    : "- Aucun événement";
  return [
    "ADIA Accueil - Journal d'audit",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Filtre: ${auditFilter === "all" ? "Tous" : auditFilter}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Événements",
    lines,
  ].join("\n");
}

function exportAuditLog() {
  downloadText("adia-presence-journal-audit.txt", buildAuditLogText());
  logEvent("Journal d'audit exporté", auditFilter === "all" ? "Tous les événements" : auditFilter, "export");
  renderBoard();
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function exportArrivalsCsv() {
  const rows = [
    ["Patient", "Destination", "Motif", "Heure RDV", "Salle", "Statut", "Source", "Attente", "Retard"],
    ...patients.map((patient) => [
      patient.name,
      patient.practitioner,
      patient.reason,
      patient.time,
      patient.room,
      labels[patient.status] || patient.status,
      patient.source === "secretariat"
        ? "Sans rendez-vous secrétariat"
        : patient.source === "unmatched_appointment"
          ? "Rendez-vous non retrouvé"
          : patient.appointmentId
            ? "Rendez-vous"
            : "Visite",
      `${patient.wait} min`,
      patient.late ? `${patient.late} min` : "",
    ]),
  ];
  downloadText(
    "adia-presence-arrivees.csv",
    `\uFEFF${rows.map((row) => row.map(csvEscape).join(";")).join("\n")}`,
    "text/csv;charset=utf-8",
  );
  logEvent("Export des arrivées généré", "Fichier CSV prêt pour le cabinet", "export");
  renderBoard();
}

function exportAppointmentsCsv() {
  const rows = [
    ["Patient", "Code", "Heure", "Praticien", "Salle", "Motif", "Statut"],
    ...appointments.map((appointment) => [
      appointment.name,
      appointment.code,
      appointment.time,
      appointment.practitioner,
      appointment.room,
      appointment.reason,
      appointmentLabels[appointment.status] || appointment.status,
    ]),
  ];
  downloadText(
    "adia-presence-rendez-vous.csv",
    `\uFEFF${rows.map((row) => row.map(csvEscape).join(";")).join("\n")}`,
    "text/csv;charset=utf-8",
  );
  logEvent("Export des rendez-vous généré", "Planning du jour exporté en CSV", "export");
  renderBoard();
}

function downloadDailyReport() {
  downloadText("adia-presence-rapport-journee.txt", buildDailyReport());
  logEvent("Rapport de journée téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getPrivacyChecklist() {
  return [
    {
      label: "Mode discrétion",
      detail: cabinetConfig.privacyMode ? "Noms partiellement masqués sur les écrans équipe" : "Disponible dans le paramétrage cabinet",
      done: cabinetConfig.privacyMode,
    },
    {
      label: "Export des données",
      detail: "Sauvegarde JSON, exports CSV et rapport de journée disponibles",
      done: true,
    },
    {
      label: "Journal d'audit",
      detail: `${activityLog.length} événement${activityLog.length > 1 ? "s" : ""} tracés`,
      done: activityLog.length > 0,
    },
    {
      label: "Données de santé",
      detail: "La V1 pilote évite le dossier médical et se limite à l'accueil",
      done: true,
    },
    {
      label: "Déploiement SaaS",
      detail: "Authentification, rôles, chiffrement et rétention à implémenter en version commerciale",
      done: false,
    },
  ];
}

function renderPrivacyCenter() {
  const list = document.getElementById("privacy-list");
  const score = document.getElementById("privacy-score");
  if (!list || !score) return;

  const checks = getPrivacyChecklist();
  const done = checks.filter((item) => item.done).length;
  score.textContent = `${done}/${checks.length} contrôles`;
  score.classList.toggle("success", done >= 4);
  list.innerHTML = checks
    .map(
      (item) => `
        <article class="privacy-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À prévoir"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function getPermissionMatrix() {
  return [
    {
      role: "Super administrateur",
      scope: "Tous cabinets ADIA",
      access: ["Cabinets", "Sites", "Utilisateurs", "Audit", "Exports"],
      actions: ["Créer un cabinet", "Gérer les abonnements", "Auditer les accès"],
      status: "SaaS",
    },
    {
      role: "Administrateur cabinet",
      scope: cabinetConfig.cabinetName,
      access: ["Paramétrage", "Équipe", "Rendez-vous", "Statistiques", "Exports"],
      actions: ["Configurer la borne", "Ajouter praticiens et assistantes", "Exporter les rapports"],
      status: "Cabinet",
    },
    {
      role: "Secrétariat",
      scope: "Accueil global du cabinet",
      access: ["Présences", "Demandes sans rendez-vous", "File d'attente", "Rendez-vous du jour"],
      actions: ["Valider une présence", "Appeler un patient", "Traiter une demande secrétariat"],
      status: "Accueil",
    },
    {
      role: "Praticien",
      scope: "Patients qui le concernent",
      access: ["File personnelle", "Patients présents", "Historique de la journée"],
      actions: ["Appeler le patient", "Marquer pris en charge", "Marquer terminé"],
      status: "Soins",
    },
    {
      role: "Assistante clinique",
      scope: "Praticien rattaché",
      access: ["Patients du praticien", "Préparation clinique", "Alertes internes"],
      actions: ["Préparer le patient", "Coordonner avec le praticien", "Notifier le secrétariat"],
      status: "Clinique",
    },
    {
      role: "Lecture seule",
      scope: "Vue limitée cabinet",
      access: ["Tableau de bord", "Statistiques sans action", "Journal filtré"],
      actions: ["Consulter uniquement", "Aucun changement de statut", "Aucun export sensible"],
      status: "Contrôle",
    },
  ];
}

function renderPermissionMatrix() {
  const matrix = document.getElementById("permission-matrix");
  if (!matrix) return;

  matrix.innerHTML = getPermissionMatrix()
    .map(
      (item) => `
        <article class="permission-role">
          <div class="permission-role-head">
            <strong>${item.role}</strong>
            <span>${item.status}</span>
          </div>
          <p>${item.scope}</p>
          <small>Accès</small>
          <ul>
            ${item.access.map((access) => `<li>${access}</li>`).join("")}
          </ul>
          <small>Actions autorisées</small>
          <ul>
            ${item.actions.map((action) => `<li>${action}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderRoutingMatrix() {
  const grid = document.getElementById("routing-grid");
  if (!grid) return;

  const items = [
    ["Borne", "Enregistre la présence et prévient l'espace concerné."],
    ["Sans rendez-vous", "Visible par toutes les secrétaires du cabinet ou du site."],
    ["Praticien", "Voit uniquement les patients qui le concernent."],
    ["Assistante", "Voit les patients du praticien auquel elle est rattachée."],
    ["Secrétariat", "Voit la file globale, les demandes à vérifier et les demandes sans rendez-vous."],
    ["Cabinet", "Les données restent isolées du cabinet et du site configurés."],
  ];

  grid.innerHTML = items
    .map(
      ([title, detail]) => `
        <article>
          <strong>${title}</strong>
          <span>${detail}</span>
        </article>
      `,
    )
    .join("");
}

function buildRgpdRegister() {
  const checks = getPrivacyChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A PREVOIR]"} ${item.label}: ${item.detail}`)
    .join("\n");
  return [
    "ADIA Accueil - Registre RGPD pilote",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Finalité du traitement",
    "Gestion de l'arrivée des patients, coordination interne de l'accueil et suivi de la file d'attente.",
    "",
    "Données utilisées en V1 pilote",
    "- Identité courte du patient",
    "- Heure de rendez-vous",
    "- Praticien, salle et motif d'accueil",
    "- Statut de présence et événements de coordination",
    "",
    "Mesures disponibles dans cette V1",
    checks,
    "",
    "Matrice de rôles",
    "Une matrice d'accès cabinet est disponible dans l'administration et exportable séparément.",
    "",
    "Limites avant commercialisation",
    "- Authentification utilisateur à implémenter",
    "- Gestion complète des rôles à implémenter",
    "- Chiffrement serveur et politique de rétention à formaliser",
    "- Hébergement conforme santé/RGPD à définir",
    "",
    "Note",
    "Ce registre est un support pilote. Il ne remplace pas l'analyse RGPD complète de la version SaaS commercialisable.",
  ].join("\n");
}

function downloadRgpdRegister() {
  downloadText("adia-presence-registre-rgpd-pilote.txt", buildRgpdRegister());
  logEvent("Registre RGPD pilote téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function buildPermissionMatrixText() {
  const roles = getPermissionMatrix()
    .map((item) =>
      [
        item.role,
        `Périmètre: ${item.scope}`,
        `Statut: ${item.status}`,
        `Accès: ${item.access.join(", ")}`,
        `Actions: ${item.actions.join(", ")}`,
      ].join("\n"),
    )
    .join("\n\n");

  return [
    "ADIA Accueil - Matrice des rôles et permissions",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    roles,
    "",
    "Principe d'installation",
    "- Chaque utilisateur reçoit uniquement le périmètre utile à son poste.",
    "- Les demandes sans rendez-vous sont visibles par le secrétariat.",
    "- Les praticiens et assistantes voient les patients qui les concernent.",
    "- La version commerciale devra lier cette matrice à une authentification nominative.",
  ].join("\n");
}

function downloadPermissionMatrix() {
  downloadText("adia-presence-matrice-droits.txt", buildPermissionMatrixText());
  logEvent("Matrice des droits téléchargée", "Rôles cabinet et périmètres exportés", "export");
  renderBoard();
}

function buildAccessSheetText(kind) {
  const profile = getAccessProfile(kind);
  return [
    "ADIA Accueil - Fiche accès poste",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Poste: ${profile.title}`,
    `Rôle: ${profile.role}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Périmètre",
    profile.scope,
    "",
    "Ce poste voit",
    ...profile.visible.map((item) => `- ${item}`),
    "",
    "Ce poste ne voit pas",
    ...profile.hidden.map((item) => `- ${item}`),
    "",
    "Actions autorisées",
    ...profile.actions.map((item) => `- ${item}`),
    "",
    "Contrôle",
    `- Éléments visibles aujourd'hui: ${profile.visibleCount}`,
    `- Éléments masqués par le périmètre: ${profile.hiddenCount}`,
  ].join("\n");
}

function downloadAccessSheet(kind) {
  const profile = getAccessProfile(kind);
  const filename = `adia-presence-fiche-acces-${profile.role.toLowerCase().replaceAll(" ", "-")}.txt`;
  downloadText(filename, buildAccessSheetText(kind));
  logEvent("Fiche accès poste téléchargée", `${profile.role} · ${profile.title}`, "export");
  renderBoard();
}

function buildWorkstationPlanText() {
  const links = getWorkstationLinks()
    .map((item) =>
      [
        `${item.label} (${item.role})`,
        item.detail,
        `Visible aujourd'hui: ${item.stats.visible}`,
        `Masqué par le périmètre: ${item.stats.hidden}`,
        item.url,
      ].join("\n"),
    )
    .join("\n\n");

  return [
    "ADIA Accueil - Plan d'installation des postes",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Principe",
    "Chaque ordinateur du cabinet peut ouvrir un lien direct. Le poste praticien ou assistante arrive déjà sur le bon périmètre.",
    "",
    "Liens à installer",
    links,
    "",
    "Recommandation",
    "- Mettre le lien secrétariat en favori sur les ordinateurs d'accueil.",
    "- Mettre le lien praticien correspondant sur chaque ordinateur de salle.",
    "- Mettre le lien assistante correspondant sur les postes de préparation clinique.",
    "- Mettre le lien borne iPad uniquement sur la tablette d'accueil.",
  ].join("\n");
}

function downloadWorkstationPlan() {
  downloadText("adia-presence-plan-postes.txt", buildWorkstationPlanText());
  logEvent("Plan d'installation postes téléchargé", `${getWorkstationLinks().length} liens prêts`, "export");
  renderBoard();
}

function getPilotChecklist() {
  return [
    {
      label: "Application ouverte en adresse réseau",
      detail: SERVER_SYNC_ENABLED ? "Synchronisation multi-écrans active" : "Ouvrir l'application en http://localhost",
      done: SERVER_SYNC_ENABLED,
    },
    {
      label: "Adresse iPad disponible",
      detail: getKioskUrl(),
      done: Boolean(document.getElementById("launch-url")?.value || SERVER_SYNC_ENABLED),
    },
    {
      label: "Rendez-vous du jour chargés",
      detail: `${appointments.length} rendez-vous dans le planning`,
      done: appointments.length > 0,
    },
    {
      label: "Borne patient personnalisée",
      detail: cabinetConfig.cabinetName,
      done: Boolean(cabinetConfig.cabinetName && cabinetConfig.kioskTitle && cabinetConfig.kioskMessage),
    },
    {
      label: "Arrivées visibles dans le pilotage",
      detail: `${patients.length} présence${patients.length > 1 ? "s" : ""} dans la file`,
      done: patients.length > 0,
    },
    {
      label: "Journal et notifications testés",
      detail: `${activityLog.length} événement${activityLog.length > 1 ? "s" : ""} enregistrés`,
      done: activityLog.length >= 2,
    },
  ];
}

function renderPilotReadiness() {
  const list = document.getElementById("pilot-readiness");
  const score = document.getElementById("pilot-score");
  if (!list || !score) return;

  const checks = getPilotChecklist();
  const done = checks.filter((item) => item.done).length;
  const percent = Math.round((done / checks.length) * 100);
  score.textContent = `${percent}% prêt`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  list.innerHTML = checks
    .map(
      (item) => `
        <article class="pilot-check ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À faire"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function getCabinetTestScenarios() {
  const hasSecretariatRequest = patients.some((patient) => patient.source === "secretariat");
  const hasUnmatched = patients.some((patient) => patient.source === "unmatched_appointment");
  const hasCompletedSecretariat = patients.some(
    (patient) => patient.source === "secretariat" && patient.status === "completed",
  );

  return [
    {
      label: "Patient avec rendez-vous praticien",
      detail: "Choisir un praticien sur la borne, saisir nom et prénom, confirmer la présence.",
      done: patients.some((patient) => patient.appointmentId),
    },
    {
      label: "Rendez-vous secrétariat",
      detail: "Choisir une secrétaire, confirmer la présence, vérifier l'affichage accueil.",
      done: teamMembers.some((member) => member.group === "secretariat"),
    },
    {
      label: "Rendez-vous assistante clinique",
      detail: "Choisir une assistante, vérifier que l'équipe clinique voit le patient concerné.",
      done: teamMembers.some((member) => member.group === "assistant"),
    },
    {
      label: "Sans rendez-vous",
      detail: "Cliquer Je n'ai pas rendez-vous, confirmer, vérifier Demandes secrétariat.",
      done: hasSecretariatRequest,
    },
    {
      label: "Patient non retrouvé",
      detail: "Saisir un nom absent du planning et vérifier la demande de contrôle accueil.",
      done: hasUnmatched,
    },
    {
      label: "Traitement secrétariat",
      detail: "Depuis l'accueil, cliquer Traité et vérifier la disparition de la file prioritaire.",
      done: hasCompletedSecretariat,
    },
  ];
}

function getScenarioTrialEvents() {
  return activityLog.filter((event) => event.kind === "scenario");
}

function getScenarioTrialStatus(label) {
  const event = getScenarioTrialEvents().find((item) => item.detail.startsWith(`${label} · `));
  if (!event) return { status: "À tester", detail: "Aucune validation terrain", tone: "todo" };
  if (event.title.includes("Validé")) {
    return { status: "Validé terrain", detail: event.detail.split(" · ").slice(1).join(" · ") || event.time, tone: "done" };
  }
  return { status: "À corriger", detail: event.detail.split(" · ").slice(1).join(" · ") || event.time, tone: "warning" };
}

function getScenarioFixItems() {
  return getCabinetTestScenarios()
    .map((scenario, index) => ({
      id: `scenario-fix-${index}`,
      scenario,
      trial: getScenarioTrialStatus(scenario.label),
    }))
    .filter((item) => item.trial.tone === "warning")
    .map((item) => ({
      id: item.id,
      title: `Corriger scénario: ${item.scenario.label}`,
      description: `${item.trial.detail}. Scénario: ${item.scenario.detail}`,
      priority: "Haute",
      list: "À corriger avant pilote",
      source: "Essai terrain",
    }));
}

function markCabinetScenario(label, status) {
  const title = status === "done" ? "Scénario terrain · Validé" : "Scénario terrain · À corriger";
  const note = status === "done"
    ? "Validé pendant l'essai cabinet"
    : "À reprendre avant généralisation";
  logEvent(title, `${label} · ${note}`, "scenario");
  renderBoard();
  showToast(status === "done" ? `${label}: validé terrain.` : `${label}: marqué à corriger.`);
}

function renderCabinetTestScenarios() {
  const list = document.getElementById("scenario-list");
  const count = document.getElementById("scenario-count");
  if (!list || !count) return;

  const scenarios = getCabinetTestScenarios();
  const done = scenarios.filter((scenario) => scenario.done).length;
  count.textContent = `${done}/${scenarios.length} validés`;
  count.classList.toggle("success", done >= scenarios.length - 1);
  list.innerHTML = scenarios
    .map(
      (scenario, index) => {
        const trial = getScenarioTrialStatus(scenario.label);
        const statusClass = trial.tone === "done" ? "done" : trial.tone === "warning" ? "warning" : scenario.done ? "done" : "todo";
        const statusLabel = trial.tone === "done" || trial.tone === "warning"
          ? trial.status
          : scenario.done
            ? "OK auto"
            : "À tester";
        return `
        <article class="scenario-item ${statusClass}">
          <span>${statusLabel}</span>
          <div>
            <strong>${scenario.label}</strong>
            <small>${scenario.detail}</small>
            <em>${trial.detail}</em>
            <div class="scenario-actions">
              <button data-scenario-done="${index}" type="button">Valider</button>
              <button data-scenario-fix="${index}" type="button">À corriger</button>
            </div>
          </div>
        </article>
      `;
      },
    )
    .join("");

  list.querySelectorAll("[data-scenario-done]").forEach((button) => {
    button.addEventListener("click", () => markCabinetScenario(scenarios[Number(button.dataset.scenarioDone)].label, "done"));
  });
  list.querySelectorAll("[data-scenario-fix]").forEach((button) => {
    button.addEventListener("click", () => markCabinetScenario(scenarios[Number(button.dataset.scenarioFix)].label, "fix"));
  });
}

function buildScenarioTrackerText() {
  const scenarios = getCabinetTestScenarios();
  const lines = scenarios
    .map((scenario) => {
      const trial = getScenarioTrialStatus(scenario.label);
      return [
        scenario.label,
        `Automatique: ${scenario.done ? "OK" : "À tester"}`,
        `Terrain: ${trial.status}`,
        `Détail: ${trial.detail}`,
        `Scénario: ${scenario.detail}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "ADIA Accueil - Suivi des essais terrain",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    lines,
  ].join("\n");
}

function downloadScenarioTracker() {
  downloadText("adia-presence-suivi-essais-terrain.txt", buildScenarioTrackerText());
  logEvent("Suivi des essais terrain téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getRecipePatients() {
  return patients.filter((patient) => patient.recipeTest);
}

function getRecipeAppointments() {
  return appointments.filter((appointment) => appointment.recipeTest);
}

function renderRecipeKit() {
  const summary = document.getElementById("recipe-summary");
  const count = document.getElementById("recipe-count");
  const clearButton = document.getElementById("recipe-clear");
  if (!summary || !count) return;

  const recipePatients = getRecipePatients();
  const practitionerTests = recipePatients.filter((patient) => patient.appointmentId).length;
  const secretariatTests = recipePatients.filter((patient) => patient.source === "secretariat").length;
  const unmatchedTests = recipePatients.filter((patient) => patient.source === "unmatched_appointment").length;
  count.textContent = `${recipePatients.length} test${recipePatients.length > 1 ? "s" : ""}`;
  if (clearButton) {
    clearButton.textContent = recipeClearArmed ? "Confirmer nettoyage" : "Nettoyer tests";
    clearButton.classList.toggle("armed", recipeClearArmed);
  }
  summary.innerHTML = [
    ["Présences praticien", practitionerTests],
    ["Sans rendez-vous", secretariatTests],
    ["Non retrouvés", unmatchedTests],
    ["RDV test", getRecipeAppointments().length],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

function createRecipeAppointment() {
  const appointment = {
    id: `recipe-appointment-${Date.now()}`,
    name: "Test Praticien",
    code: "test-praticien",
    practitioner: teamMembers.find((member) => member.group === "practitioner")?.name || "Dr Martin",
    reason: "Recette borne",
    time: "12:10",
    room: "Salle 1",
    status: "scheduled",
    recipeTest: true,
  };
  appointments.push(appointment);
  return appointment;
}

function runRecipePractitioner() {
  const appointment = createRecipeAppointment();
  const patient = createArrivalFromAppointment(appointment);
  patient.recipeTest = true;
  logEvent("Recette rapide · présence praticien", `${patient.name} · ${patient.practitioner}`, "settings");
  renderBoard();
  activateView("frontdesk");
  showToast("Test praticien ajouté dans l'accueil.");
}

function runRecipeSecretariat() {
  const patient = createVisitorArrival("Test Sans RDV", "Demande secrétariat", "secretariat");
  patient.recipeTest = true;
  logEvent("Recette rapide · sans rendez-vous", "Demande secrétariat créée", "settings");
  renderBoard();
  activateView("frontdesk");
  showToast("Test sans rendez-vous ajouté au secrétariat.");
}

function runRecipeUnmatched() {
  const target = teamMembers.find((member) => member.group === "practitioner") || teamMembers[0];
  const patient = createVisitorArrival("Test Non Retrouvé", `Rendez-vous à vérifier · ${target?.name || "Accueil"}`, "unmatched", target);
  patient.recipeTest = true;
  logEvent("Recette rapide · patient non retrouvé", `${patient.name} · ${getMemberRoutingName(target)}`, "settings");
  renderBoard();
  activateView("frontdesk");
  showToast("Test patient non retrouvé ajouté à la vérification.");
}

function clearRecipeTests() {
  if (!recipeClearArmed) {
    recipeClearArmed = true;
    renderRecipeKit();
    showToast("Cliquez une seconde fois pour confirmer le nettoyage des tests.");
    window.setTimeout(() => {
      recipeClearArmed = false;
      renderRecipeKit();
    }, 5000);
    return;
  }
  const recipeAppointmentIds = new Set(getRecipeAppointments().map((appointment) => appointment.id));
  appointments = appointments.filter((appointment) => !appointment.recipeTest);
  patients = patients.filter((patient) => !patient.recipeTest && !recipeAppointmentIds.has(patient.appointmentId));
  recipeClearArmed = false;
  logEvent("Recette rapide nettoyée", "Données de test retirées", "settings");
  renderBoard();
  showToast("Données de recette rapide nettoyées.");
}

function getFeedbackMeta(event) {
  const parts = event.title.replace("Retour pilote · ", "").split(" · ");
  const type = parts[0] || "Retour terrain";
  const explicitPriority = ["Normale", "Moyenne", "Haute"].includes(parts[1]) ? parts[1] : "";
  const inferredPriority = type === "Point bloquant" || type === "Incident iPad"
    ? "Haute"
    : type === "Retour patient"
      ? "Moyenne"
      : "Normale";

  return {
    type,
    priority: explicitPriority || inferredPriority,
  };
}

function getQualityChecklist() {
  const scenarios = getCabinetTestScenarios();
  const doneScenarios = scenarios.filter((scenario) => scenario.done).length;
  const feedback = getPilotFeedback();
  const highPriority = feedback.filter((event) => getFeedbackMeta(event).priority === "Haute").length;
  const scenarioFixes = getScenarioFixItems().length;
  const secretariatRequests = patients.filter(
    (patient) => patient.source === "secretariat" && patient.status !== "completed",
  ).length;
  const expectedTeam = cabinetConfig.teamCounts.practitioners + cabinetConfig.teamCounts.secretaries + cabinetConfig.teamCounts.assistants;

  return [
    {
      label: "Équipe affichée sur la borne",
      detail: `${teamMembers.length}/${expectedTeam} emplacements paramétrés`,
      done: teamMembers.length === expectedTeam && teamMembers.length > 0,
    },
    {
      label: "Parcours sans rendez-vous contrôlé",
      detail: secretariatRequests
        ? `${secretariatRequests} demande${secretariatRequests > 1 ? "s" : ""} visible${secretariatRequests > 1 ? "s" : ""} au secrétariat`
        : "Aucune demande en attente, parcours prêt à tester",
      done: true,
    },
    {
      label: "Recette cabinet structurée",
      detail: `${doneScenarios}/${scenarios.length} scénarios validés`,
      done: doneScenarios >= Math.max(4, scenarios.length - 2),
    },
    {
      label: "Corrections terrain",
      detail: scenarioFixes
        ? `${scenarioFixes} scénario${scenarioFixes > 1 ? "s" : ""} à corriger avant pilote élargi`
        : "Aucun scénario terrain bloquant",
      done: scenarioFixes === 0,
    },
    {
      label: "Retours qualifiés",
      detail: highPriority
        ? `${highPriority} priorité haute à traiter avant élargissement`
        : "Priorité disponible pour chaque observation",
      done: highPriority === 0,
    },
    {
      label: "Export d'actions prêt",
      detail: "Backlog CSV compatible Trello pour suivre les corrections",
      done: Boolean(document.getElementById("export-backlog-trello")),
    },
    {
      label: "Lien iPad borne prêt",
      detail: getKioskUrl(),
      done: Boolean(getKioskUrl()),
    },
  ];
}

function renderQualityPanel() {
  const list = document.getElementById("quality-list");
  const score = document.getElementById("quality-score");
  if (!list || !score) return;

  const items = getQualityChecklist();
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  score.textContent = `${percent}%`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  list.innerHTML = items
    .map(
      (item) => `
        <article class="quality-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À suivre"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function getPilotVersionItems() {
  const decision = getExecutiveDecision();
  return [
    {
      title: "Prêt cabinet pilote",
      status: decision.status,
      detail: "Borne patient, accueil secrétariat, pilotage, paramétrage équipe, exports et manuel utilisateur.",
      tone: decision.status === "Prêt pilote" ? "done" : "watch",
    },
    {
      title: "À industrialiser",
      status: "Socle SaaS",
      detail: "Comptes utilisateurs, rôles, base PostgreSQL, API backend, synchronisation temps réel serveur.",
      tone: "todo",
    },
    {
      title: "Sécurité et RGPD",
      status: "À formaliser",
      detail: "Audit trail complet, rétention, consentement, sauvegardes, hébergement conforme et chiffrement.",
      tone: "todo",
    },
    {
      title: "Intégrations métier",
      status: "Phase suivante",
      detail: "Import Julie stabilisé, connecteurs Doctolib, Julie, Logos, Visiodent selon disponibilité API.",
      tone: "watch",
    },
  ];
}

function renderPilotVersion() {
  const grid = document.getElementById("pilot-version-grid");
  if (!grid) return;

  grid.innerHTML = getPilotVersionItems()
    .map(
      (item) => `
        <article class="pilot-version-item ${item.tone}">
          <span>${item.status}</span>
          <strong>${item.title}</strong>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");
}

function buildCommercialRoadmap() {
  const items = getPilotVersionItems()
    .map((item) => `- ${item.title} [${item.status}]: ${item.detail}`)
    .join("\n");
  const backlog = getPilotBacklogItems()
    .map((item) => `- [${item.priority}] ${item.list} · ${item.title}: ${item.description}`)
    .join("\n");
  return [
    "ADIA Accueil - Roadmap commercialisation",
    `Cabinet pilote: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "État de la version pilote",
    items,
    "",
    "Phase 1 - Pilote cabinet",
    "- Valider le parcours patient sur iPad.",
    "- Valider la console Accueil avec secrétariat.",
    "- Valider la configuration équipe et les consignes patient.",
    "- Recueillir les retours terrain et points bloquants.",
    "",
    "Phase 2 - Socle commercial SaaS",
    "- Backend NestJS, base PostgreSQL, authentification, rôles et permissions.",
    "- WebSocket temps réel, sauvegardes, audit trail et supervision.",
    "- Isolation multi-cabinets et multi-sites.",
    "",
    "Phase 3 - Intégrations et industrialisation",
    "- Connecteurs agenda et logiciels métier.",
    "- Exports avancés, statistiques et reporting cabinet.",
    "- Préparation hébergement, sécurité, RGPD et support.",
    "",
    "Backlog priorisé",
    backlog || "- Aucun backlog disponible",
  ].join("\n");
}

function downloadCommercialRoadmap() {
  downloadText("adia-presence-roadmap-commercialisation.txt", buildCommercialRoadmap());
  logEvent("Roadmap commercialisation téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getProductSheetItems() {
  return [
    {
      title: "Promesse",
      detail: "Permettre au patient de signaler simplement sa présence et prévenir immédiatement l'équipe concernée.",
      points: ["Borne tactile simple", "Présence confirmée", "Gel puis salle d'attente"],
    },
    {
      title: "Pour le secrétariat",
      detail: "Réduire les interruptions et garder une vue claire des arrivées, demandes sans rendez-vous et patients à vérifier.",
      points: ["Console Accueil", "Planning minute", "Charge secrétariat"],
    },
    {
      title: "Pour l'équipe clinique",
      detail: "Chaque praticien ou assistante voit uniquement les patients qui le concernent.",
      points: ["Postes filtrés", "Appel patient", "Statuts de prise en charge"],
    },
    {
      title: "Pilotage cabinet",
      detail: "Suivre la qualité du flux patient et documenter les essais terrain avant déploiement élargi.",
      points: ["Recette terrain", "Bilan opérationnel", "Exports et audit"],
    },
    {
      title: "Version pilote",
      detail: "Version locale testable en cabinet pour valider le parcours avant industrialisation SaaS.",
      points: ["Pas de dossier médical", "RGPD à industrialiser", "Connecteurs métier à préparer"],
    },
    {
      title: "Commercialisation",
      detail: "Socle prévu pour évoluer vers abonnement multi-cabinets avec rôles, sécurité et intégrations agenda.",
      points: ["Multi-cabinets", "Rôles utilisateurs", "Connecteurs Julie / Doctolib"],
    },
  ];
}

function getPilotOfferItems() {
  return [
    {
      title: "Inclus dans le pilote",
      points: [
        "Borne patient locale",
        "Console Accueil secrétariat",
        "Postes praticien et assistante filtrés",
        "Rendez-vous rapide et exports",
        "Suivi des essais terrain",
      ],
    },
    {
      title: "À prévoir au cabinet",
      points: [
        "Une tablette ou un écran tactile",
        "Un ordinateur pour le secrétariat",
        "Un planning du jour importé ou saisi",
        "Une personne référente pour les retours terrain",
      ],
    },
    {
      title: "Non inclus dans la V1 locale",
      points: [
        "Dossier médical patient",
        "Connexion réelle Julie / Doctolib automatique",
        "Comptes utilisateurs nominaux",
        "Hébergement SaaS certifié",
      ],
    },
  ];
}

function renderProductSheet() {
  const grid = document.getElementById("product-sheet-grid");
  const offerGrid = document.getElementById("pilot-offer-grid");
  if (!grid || !offerGrid) return;

  grid.innerHTML = getProductSheetItems()
    .map(
      (item) => `
        <article class="product-sheet-item">
          <strong>${item.title}</strong>
          <p>${item.detail}</p>
          <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
  offerGrid.innerHTML = getPilotOfferItems()
    .map(
      (item) => `
        <article class="pilot-offer-item">
          <strong>${item.title}</strong>
          <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
}

function buildProductSheetText() {
  return [
    "ADIA Accueil - Fiche produit cabinet",
    `Cabinet pilote: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    ...getProductSheetItems().flatMap((item) => [
      item.title,
      item.detail,
      ...item.points.map((point) => `- ${point}`),
      "",
    ]),
    "Offre pilote cabinet",
    ...getPilotOfferItems().flatMap((item) => [
      item.title,
      ...item.points.map((point) => `- ${point}`),
      "",
    ]),
    "Résumé",
    "ADIA Accueil est une solution d'accueil patient destinée aux cabinets dentaires qui souhaitent fluidifier la confirmation de présence, réduire les interruptions du secrétariat et mieux coordonner l'équipe clinique.",
  ].join("\n");
}

function downloadProductSheet() {
  downloadText("adia-presence-fiche-produit.txt", buildProductSheetText());
  logEvent("Fiche produit téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getUserManualSections() {
  return [
    {
      title: "Patient sur borne",
      role: "À l'entrée du cabinet",
      steps: [
        "Choisir J'ai rendez-vous ou Je n'ai pas rendez-vous.",
        "Appuyer sur le portrait de la personne concernée.",
        "Saisir nom et prénom.",
        "Confirmer la présence.",
        "Utiliser le gel hydroalcoolique, puis patienter en salle d'attente.",
      ],
    },
    {
      title: "Secrétariat",
      role: "Console Accueil",
      steps: [
        "Ouvrir la vue Accueil au début de la journée.",
        "Ajouter un rendez-vous minute depuis Planning minute si nécessaire.",
        "Utiliser Ajouter + borne lorsque le patient est déjà présent à l'accueil.",
        "Surveiller Demandes secrétariat et Patients non retrouvés.",
        "Cliquer Appeler si le patient doit être reçu.",
        "Cliquer Traité lorsque la demande est terminée.",
        "Utiliser Feuille accueil ou Exporter codes si besoin.",
      ],
    },
    {
      title: "Praticien et assistante",
      role: "Coordination clinique",
      steps: [
        "Ouvrir la vue Praticien ou Assistante.",
        "Vérifier uniquement la file liée au praticien.",
        "Appeler le patient si nécessaire.",
        "Passer le patient en prise en charge.",
        "Marquer terminé en fin de passage.",
      ],
    },
    {
      title: "Administrateur cabinet",
      role: "Paramétrage et pilote",
      steps: [
        "Renseigner le nom du cabinet et le message patient.",
        "Définir le nombre de praticiens, secrétaires et assistantes.",
        "Saisir les noms affichés sur la borne.",
        "Utiliser Recette rapide pour tester les cas clés.",
        "Dans Recette terrain, marquer chaque scénario Validé ou À corriger.",
        "Télécharger la synthèse pilote dans Exploitation.",
      ],
    },
  ];
}

function renderUserManual() {
  const grid = document.getElementById("manual-grid");
  if (!grid) return;

  grid.innerHTML = getUserManualSections()
    .map(
      (section) => `
        <article class="manual-item">
          <span>${section.role}</span>
          <strong>${section.title}</strong>
          <ol>
            ${section.steps.map((step) => `<li>${step}</li>`).join("")}
          </ol>
        </article>
      `,
    )
    .join("");
}

function buildUserManual() {
  return [
    "ADIA Accueil - Manuel utilisateur cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Borne iPad: ${getKioskUrl()}`,
    `Accueil secrétariat: ${getViewUrl("frontdesk")}`,
    `Administration: ${getViewUrl("admin")}`,
    `Exploitation: ${getViewUrl("operations")}`,
    "",
    ...getUserManualSections().flatMap((section) => [
      section.title,
      `Profil: ${section.role}`,
      ...section.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
    ]),
    "Routine recommandée",
    "1. Le matin: ouvrir Accueil, vérifier la checklist d'ouverture.",
    "2. Pendant la journée: laisser la borne enregistrer les présences.",
    "3. Si un rendez-vous doit être ajouté rapidement: utiliser Planning minute dans Accueil.",
    "4. Après un test réel: marquer le scénario Validé ou À corriger dans Recette terrain.",
    "5. En cas de doute: traiter les Patients non retrouvés depuis Accueil.",
    "6. En fin de journée: ouvrir Exploitation et télécharger le rapport.",
    "",
    "Important",
    "Cette version pilote sert à tester le parcours d'accueil. La version commercialisable devra intégrer comptes utilisateurs, rôles, hébergement, sécurité et RGPD complets.",
  ].join("\n");
}

function downloadUserManual() {
  downloadText("adia-presence-manuel-utilisateur.txt", buildUserManual());
  logEvent("Manuel utilisateur téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getTrainingModules() {
  return [
    {
      role: "Secrétariat",
      duration: "7 min",
      goal: "Savoir traiter les présences sans interrompre l'accueil physique.",
      steps: [
        "Ouvrir Accueil secrétariat et vérifier les patients attendus.",
        "Traiter une présence avec rendez-vous et une demande sans rendez-vous.",
        "Ajouter un rendez-vous minute si le patient n'est pas encore dans le planning.",
        "Utiliser les notes internes uniquement pour les informations d'organisation.",
      ],
    },
    {
      role: "Praticiens",
      duration: "4 min",
      goal: "Voir uniquement sa file et faire avancer le statut patient.",
      steps: [
        "Ouvrir le lien nominatif du praticien.",
        "Repérer les patients présents qui le concernent.",
        "Marquer Pris en charge puis Terminé.",
        "Signaler au secrétariat un retard ou une demande d'information.",
      ],
    },
    {
      role: "Assistantes cliniques",
      duration: "4 min",
      goal: "Préparer les patients concernés sans voir tout le cabinet.",
      steps: [
        "Ouvrir le lien nominatif assistante.",
        "Contrôler les patients liés au praticien rattaché.",
        "Mettre à jour le statut de préparation si nécessaire.",
        "Prévenir le praticien ou le secrétariat en cas de décalage.",
      ],
    },
    {
      role: "Référent pilote",
      duration: "6 min",
      goal: "Valider le test, noter les retours et exporter les preuves.",
      steps: [
        "Suivre la checklist Matin du test cabinet.",
        "Cocher les scénarios terrain Validé ou À corriger.",
        "Ajouter les observations dans Retour terrain.",
        "Exporter le bilan opérationnel et le suivi de recette.",
      ],
    },
  ];
}

function getAcceptanceCriteria() {
  const scenarios = getCabinetTestScenarios();
  const trialStatuses = scenarios.map((scenario) => getScenarioTrialStatus(scenario.label));
  const validatedTrials = trialStatuses.filter((trial) => trial.tone === "done").length;
  const fixTrials = trialStatuses.filter((trial) => trial.tone === "warning").length;

  return [
    {
      label: "Présence avec rendez-vous",
      proof: patients.some((patient) => patient.appointmentId)
        ? "Au moins une présence liée à un rendez-vous existe."
        : "Faire valider un patient attendu sur la borne.",
      done: patients.some((patient) => patient.appointmentId),
    },
    {
      label: "Patient sans rendez-vous",
      proof: patients.some((patient) => patient.source === "secretariat")
        ? "Une demande secrétariat a été créée."
        : "Tester Je n'ai pas rendez-vous sur la borne.",
      done: patients.some((patient) => patient.source === "secretariat"),
    },
    {
      label: "Vues par rôle",
      proof: `${getWorkstationLinks().length} liens de poste disponibles.`,
      done: getWorkstationLinks().length >= 4,
    },
    {
      label: "Scénarios terrain",
      proof: `${validatedTrials}/${scenarios.length} scénarios validés, ${fixTrials} à corriger.`,
      done: scenarios.length > 0 && validatedTrials >= Math.max(3, scenarios.length - 1) && fixTrials === 0,
    },
    {
      label: "Exports de fin de test",
      proof: "Kit formation, bilan opérationnel et suivi de recette sont disponibles.",
      done: Boolean(
        document.getElementById("download-training-kit") &&
        document.getElementById("download-operational-review") &&
        document.getElementById("download-scenario-tracker"),
      ),
    },
  ];
}

function renderTrainingKit() {
  const grid = document.getElementById("training-grid");
  const acceptanceList = document.getElementById("acceptance-list");
  const score = document.getElementById("acceptance-score");
  if (!grid || !acceptanceList || !score) return;

  grid.innerHTML = getTrainingModules()
    .map(
      (module) => `
        <article class="training-item">
          <span>${module.role} · ${module.duration}</span>
          <strong>${module.goal}</strong>
          <ol>${module.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
        </article>
      `,
    )
    .join("");

  const criteria = getAcceptanceCriteria();
  const done = criteria.filter((criterion) => criterion.done).length;
  const percent = Math.round((done / criteria.length) * 100);
  score.textContent = `${percent}% validé`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  acceptanceList.innerHTML = [
    "<h3>Critères de validation cabinet</h3>",
    ...criteria.map(
      (criterion) => `
        <article class="acceptance-item ${criterion.done ? "done" : "todo"}">
          <span>${criterion.done ? "OK" : "À tester"}</span>
          <div>
            <strong>${criterion.label}</strong>
            <small>${criterion.proof}</small>
          </div>
        </article>
      `,
    ),
  ].join("");
}

function buildTrainingKitText() {
  const modules = getTrainingModules()
    .map((module) => [
      `${module.role} - ${module.duration}`,
      module.goal,
      ...module.steps.map((step, index) => `${index + 1}. ${step}`),
    ].join("\n"))
    .join("\n\n");
  const criteria = getAcceptanceCriteria()
    .map((criterion) => `- ${criterion.done ? "[OK]" : "[A TESTER]"} ${criterion.label}: ${criterion.proof}`)
    .join("\n");

  return [
    "ADIA Accueil - Kit formation express",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Borne patient: ${getKioskUrl()}`,
    `Accueil secrétariat: ${getViewUrl("frontdesk")}`,
    "",
    "Brief équipe par rôle",
    modules,
    "",
    "Critères de validation cabinet",
    criteria,
    "",
    "Règle de décision",
    "Le test est acceptable si les présences avec rendez-vous et sans rendez-vous fonctionnent, si les vues par rôle sont correctes, et s'il ne reste aucun scénario critique à corriger.",
  ].join("\n");
}

function downloadTrainingKit() {
  downloadText("adia-presence-kit-formation.txt", buildTrainingKitText());
  logEvent("Kit formation téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getDeploymentPackItems() {
  const goLiveItems = getGoLiveChecklist();
  const goLiveReady = goLiveItems.filter((item) => item.done).length >= Math.ceil(goLiveItems.length * 0.85);
  const workstationLinks = getWorkstationLinks();

  return [
    {
      title: "Borne patient",
      detail: getKioskUrl(),
      done: Boolean(getKioskUrl()),
    },
    {
      title: "Accueil secrétariat",
      detail: getViewUrl("frontdesk"),
      done: Boolean(getViewUrl("frontdesk")),
    },
    {
      title: "Liens par poste",
      detail: `${workstationLinks.length} lien${workstationLinks.length > 1 ? "s" : ""} nominatif${workstationLinks.length > 1 ? "s" : ""}`,
      done: workstationLinks.length >= 4,
    },
    {
      title: "Mise en service",
      detail: goLiveReady ? "Checklist prête" : "Checklist à compléter",
      done: goLiveReady,
    },
    {
      title: "Formation équipe",
      detail: `${getTrainingModules().length} modules prêts`,
      done: getTrainingModules().length >= 4,
    },
    {
      title: "Recette cabinet",
      detail: `${getCabinetTestScenarios().length} scénarios terrain`,
      done: getCabinetTestScenarios().length >= 5,
    },
    {
      title: "Exports utiles",
      detail: "Manuel, kit formation, suivi recette, bilan opérationnel",
      done: Boolean(
        document.getElementById("download-user-manual") &&
        document.getElementById("download-training-kit") &&
        document.getElementById("download-scenario-tracker") &&
        document.getElementById("download-operational-review"),
      ),
    },
  ];
}

function renderDeploymentPack() {
  const grid = document.getElementById("deployment-pack-grid");
  const score = document.getElementById("deployment-pack-score");
  if (!grid || !score) return;

  const items = getDeploymentPackItems();
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);
  score.textContent = `${percent}% prêt`;
  score.classList.toggle("success", percent >= 85);
  score.classList.toggle("warning", percent < 85);
  grid.innerHTML = items
    .map(
      (item) => `
        <article class="deployment-pack-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À compléter"}</span>
          <strong>${item.title}</strong>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");
}

function buildDeploymentPackText() {
  const packItems = getDeploymentPackItems()
    .map((item) => `- ${item.done ? "[OK]" : "[A COMPLETER]"} ${item.title}: ${item.detail}`)
    .join("\n");
  const teamSummary = teamMembers
    .map((member) => `- ${member.name} · ${member.role}${member.practitioner ? ` · ${member.practitioner}` : ""}`)
    .join("\n");
  const workstationSummary = getWorkstationLinks()
    .map((link) => `- ${link.label}: ${link.url}`)
    .join("\n");
  const timeline = getGoLiveTimeline()
    .map((item, index) => `${index + 1}. ${item.time} - ${item.title}: ${item.detail}`)
    .join("\n");
  const acceptance = getAcceptanceCriteria()
    .map((criterion) => `- ${criterion.done ? "[OK]" : "[A TESTER]"} ${criterion.label}: ${criterion.proof}`)
    .join("\n");

  return [
    "ADIA Accueil - Dossier pilote cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Liens essentiels",
    `Borne patient: ${getKioskUrl()}`,
    `Accueil secrétariat: ${getViewUrl("frontdesk")}`,
    `Pilotage cabinet: ${getViewUrl("dashboard")}`,
    `Administration: ${getViewUrl("admin")}`,
    `Exploitation: ${getViewUrl("operations")}`,
    "",
    "État du dossier",
    packItems,
    "",
    "Équipe configurée",
    teamSummary || "- Aucune équipe configurée",
    "",
    "Liens par poste",
    workstationSummary || "- Aucun lien poste disponible",
    "",
    "Déroulé conseillé du test",
    timeline,
    "",
    "Critères de validation",
    acceptance,
    "",
    "Documents à exporter séparément si besoin",
    "- Manuel utilisateur",
    "- Kit formation express",
    "- Checklist mise en service",
    "- Suivi de recette terrain",
    "- Bilan opérationnel",
    "- Plan des postes",
  ].join("\n");
}

function downloadDeploymentPack() {
  downloadText("adia-presence-dossier-pilote.txt", buildDeploymentPackText());
  logEvent("Dossier pilote téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getPercentDone(items) {
  if (!items.length) return 0;
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

function getFinishLineItems() {
  const goLivePercent = getPercentDone(getGoLiveChecklist());
  const qualityPercent = getPercentDone(getQualityChecklist());
  const acceptancePercent = getPercentDone(getAcceptanceCriteria());
  const packPercent = getPercentDone(getDeploymentPackItems());
  const unresolvedHelp = getKioskHelpEvents({ unresolvedOnly: true }).length;
  const configuredTeam = cabinetConfig.teamCounts.practitioners + cabinetConfig.teamCounts.secretaries + cabinetConfig.teamCounts.assistants;
  const activeTeam = teamMembers.length;
  const realTest = getRealTestSession();

  return [
    {
      label: "Borne patient",
      value: cabinetConfig.kioskBehavior.helpButton ? "Prête" : "Aide masquée",
      detail: "Mode borne, portraits, nom/prénom, bouton aide",
      done: Boolean(getKioskUrl()) && cabinetConfig.kioskBehavior.helpButton,
    },
    {
      label: "Équipe cabinet",
      value: `${activeTeam}/${configuredTeam}`,
      detail: "Praticiens, secrétaires et assistantes affichés",
      done: configuredTeam > 0 && activeTeam === configuredTeam,
    },
    {
      label: "Rendez-vous",
      value: `${appointments.length}`,
      detail: "Planning testable sur la borne et à l'accueil",
      done: appointments.length >= 3,
    },
    {
      label: "Accueil",
      value: unresolvedHelp ? `${unresolvedHelp} aide` : "OK",
      detail: "Console secrétariat et actions prioritaires",
      done: unresolvedHelp === 0 && Boolean(getViewUrl("frontdesk")),
    },
    {
      label: "Mise en service",
      value: `${goLivePercent}%`,
      detail: "Checklist du matin de test",
      done: goLivePercent >= 80,
    },
    {
      label: "Recette terrain",
      value: `${acceptancePercent}%`,
      detail: "Critères à valider pendant le test réel",
      done: acceptancePercent >= 70,
    },
    {
      label: "Qualité",
      value: `${qualityPercent}%`,
      detail: "Contrôles avant essai cabinet",
      done: qualityPercent >= 75,
    },
    {
      label: "Test réel",
      value: `${realTest.passes.length}/3`,
      detail: "Passages patients réels notés et qualifiés",
      done: realTest.passes.length >= 3 && realTest.blockers === 0,
    },
    {
      label: "Dossier pilote",
      value: `${packPercent}%`,
      detail: "Liens, guides, exports et documents",
      done: packPercent >= 85,
    },
  ];
}

function getFinishLineDecision() {
  const items = getFinishLineItems();
  const percent = getPercentDone(items);
  const missing = items.filter((item) => !item.done);
  const realTest = getRealTestSession();
  let status = "Construction avancée";
  let eta = "Encore 3 à 5 lots utiles pour une version pilote vraiment propre.";
  let recommendation = "Terminer les réglages cabinet, puis jouer une vraie recette d'accueil.";

  if (percent >= 85 && realTest.passes.length >= 3 && realTest.blockers === 0) {
    status = "Prêt pour pilote élargi";
    eta = "On voit le bout : le test réel court est validé.";
    recommendation = "Élargir progressivement à une demi-journée, puis consolider les derniers retours.";
  } else if (percent >= 85) {
    status = "Prêt pour test réel";
    eta = "On voit le bout : il reste surtout à faire passer 3 à 5 patients réels.";
    recommendation = "Lancer la recette réelle cabinet, noter chaque passage, puis clôturer la session.";
  } else if (percent >= 70) {
    status = "Dernières validations";
    eta = "Il reste environ 1 à 2 lots avant un test cabinet propre.";
    recommendation = "Concentrer les prochains lots sur recette réelle, retours équipe et nettoyage des derniers points.";
  }

  return {
    status,
    percent,
    eta,
    recommendation,
    missing,
  };
}

function renderFinishLineCenter() {
  const grid = document.getElementById("finish-line-grid");
  const actions = document.getElementById("finish-line-actions");
  const status = document.getElementById("finish-line-status");
  if (!grid || !actions || !status) return;

  const decision = getFinishLineDecision();
  status.textContent = `${decision.percent}% · ${decision.status}`;
  status.classList.toggle("success", decision.percent >= 85);
  status.classList.toggle("warning", decision.percent < 85);
  grid.innerHTML = getFinishLineItems()
    .map(
      (item) => `
        <article class="finish-line-item ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À finir"}</span>
          <strong>${item.label}</strong>
          <em>${item.value}</em>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");

  const missing = decision.missing.slice(0, 5);
  actions.innerHTML = `
    <article>
      <span>Quand voit-on le bout ?</span>
      <strong>${decision.eta}</strong>
      <small>${decision.recommendation}</small>
    </article>
    <article>
      <span>Derniers points</span>
      ${
        missing.length
          ? `<ol>${missing.map((item) => `<li>${item.label}: ${item.detail}</li>`).join("")}</ol>`
          : "<strong>Tout est prêt pour lancer une recette cabinet.</strong>"
      }
    </article>
  `;
}

function buildFinishLineReportText() {
  const decision = getFinishLineDecision();
  const items = getFinishLineItems()
    .map((item) => `- ${item.done ? "[OK]" : "[A FINIR]"} ${item.label}: ${item.value} · ${item.detail}`)
    .join("\n");
  const missing = decision.missing.length
    ? decision.missing.map((item, index) => `${index + 1}. ${item.label}: ${item.detail}`).join("\n")
    : "Aucun point bloquant identifié pour une recette cabinet.";

  return [
    "ADIA Accueil - Fin de chantier pilote",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Synthèse",
    `Score: ${decision.percent}%`,
    `Statut: ${decision.status}`,
    decision.eta,
    decision.recommendation,
    "",
    "Indicateurs",
    items,
    "",
    "Derniers points à traiter",
    missing,
    "",
    "Prochaine étape conseillée",
    decision.percent >= 85
      ? "Tester avec 3 à 5 patients réels, noter les frictions et exporter le PV pilote."
      : "Finaliser les points listés ci-dessus, puis rejouer la recette rapide avant test réel.",
  ].join("\n");
}

function downloadFinishLineReport() {
  downloadText("adia-presence-fin-de-chantier.txt", buildFinishLineReportText());
  logEvent("Fin de chantier exportée", getFinishLineDecision().status, "export");
  renderBoard();
}

function getRealTestSession() {
  const startIndex = activityLog.findIndex((event) => event.kind === "real_test_start");
  if (startIndex === -1) {
    return {
      active: false,
      closed: false,
      start: null,
      close: null,
      passes: [],
      blockers: 0,
      smooth: 0,
    };
  }

  const closeIndex = activityLog.findIndex((event) => event.kind === "real_test_close");
  const active = closeIndex === -1 || startIndex < closeIndex;
  const sessionEvents = active
    ? activityLog.slice(0, startIndex)
    : activityLog.slice(closeIndex + 1, startIndex);
  const passes = sessionEvents.filter((event) => event.kind === "real_patient_pass").reverse();
  const blockers = passes.filter((event) => event.detail.includes("Bloquant") || event.detail.includes("À accompagner")).length;
  const smooth = passes.filter((event) => event.detail.includes("Très fluide") || event.detail.includes("Correct")).length;

  return {
    active,
    closed: !active && closeIndex !== -1 && closeIndex < startIndex,
    start: activityLog[startIndex],
    close: closeIndex !== -1 && closeIndex < startIndex ? activityLog[closeIndex] : null,
    passes,
    blockers,
    smooth,
  };
}

function getEventTimestamp(event) {
  if (!event) return null;
  if (Number.isFinite(event.createdAt)) return event.createdAt;
  const idTimestamp = Number.parseInt(String(event.id || "").replace(/^e/, ""), 10);
  return Number.isFinite(idTimestamp) && idTimestamp > 1000000000000 ? idTimestamp : null;
}

function formatDuration(milliseconds) {
  const safeMs = Math.max(0, Number.isFinite(milliseconds) ? milliseconds : 0);
  const totalMinutes = Math.floor(safeMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  if (minutes > 0) return `${minutes} min`;
  return "< 1 min";
}

function getRealTestTiming(session = getRealTestSession()) {
  const start = getEventTimestamp(session.start);
  if (!start) {
    return {
      durationMs: 0,
      durationLabel: "À lancer",
      averageMs: 0,
      averageLabel: "À mesurer",
    };
  }
  const end = getEventTimestamp(session.close) || Date.now();
  const durationMs = Math.max(0, end - start);
  const averageMs = session.passes.length ? durationMs / session.passes.length : 0;
  return {
    durationMs,
    durationLabel: formatDuration(durationMs),
    averageMs,
    averageLabel: session.passes.length ? formatDuration(averageMs) : "À mesurer",
  };
}

function getRealTestDecision() {
  const session = getRealTestSession();
  const count = session.passes.length;
  if (!session.start) return "À lancer";
  if (session.active && count < 3) return "En cours";
  if (session.active && count >= 3) return "Clôture possible";
  if (count >= 3 && session.blockers === 0) return "Test validé";
  if (count >= 3 && session.blockers <= 1) return "Ajustements mineurs";
  return "À corriger";
}

function getFrontdeskNextStep() {
  const session = getRealTestSession();
  const count = session.passes.length;
  const preflight = getFrontdeskPreflightItems();
  const missingPreflight = preflight.filter((item) => !item.done);
  if (missingPreflight.length && !session.start) {
    return {
      tone: "warning",
      title: "Préparer le poste accueil",
      detail: `À valider avant patient 1 : ${missingPreflight.map((item) => item.label).join(", ")}.`,
    };
  }
  if (!session.start) {
    return {
      tone: "todo",
      title: "Démarrer le test réel",
      detail: "Cliquez sur Démarrer avant le premier patient qui utilise la borne.",
    };
  }
  if (session.active && count > 0 && count < 3 && realTestCloseArmed) {
    return {
      tone: "warning",
      title: "Confirmer clôture incomplète",
      detail: "Le minimum conseillé est 3 patients. Cliquez à nouveau sur Confirmer clôture seulement si vous voulez arrêter maintenant.",
    };
  }
  if (session.active && count < 3) {
    return {
      tone: "todo",
      title: `Faire passer le patient ${count + 1}`,
      detail: "Après son passage, cliquez sur Passage fluide ou À accompagner.",
    };
  }
  if (session.active && count >= 3 && session.blockers === 0) {
    return {
      tone: "done",
      title: "Clôturer le test réel",
      detail: "Les 3 passages minimum sont notés sans blocage. Vous pouvez clôturer.",
    };
  }
  if (session.active && count >= 3) {
    return {
      tone: "warning",
      title: "Clôturer puis corriger",
      detail: "Le test contient un point à reprendre. Clôturez, puis regardez le rapport.",
    };
  }
  if (session.closed && count >= 3 && session.blockers === 0) {
    return {
      tone: "done",
      title: "Exporter le rapport",
      detail: "Le test court est validé. Exportez le rapport puis décidez le pilote élargi.",
    };
  }
  if (session.closed && count >= 3) {
    return {
      tone: "warning",
      title: "Analyser les hésitations",
      detail: "Exportez le rapport et corrigez les points d'accompagnement.",
    };
  }
  return {
    tone: "warning",
    title: "Compléter le test",
    detail: "Le test a été clôturé avec moins de 3 patients. Relancez une session courte.",
  };
}

function getFrontdeskPreflightItems() {
  const doneKeys = new Set(
    activityLog
      .filter((event) => event.kind === "frontdesk_preflight")
      .map((event) => event.detail.split(" · ")[0]),
  );
  return [
    {
      key: "kiosk",
      label: "Borne ouverte",
      detail: "iPad sur l'écran patient",
      done: doneKeys.has("kiosk"),
    },
    {
      key: "frontdesk",
      label: "Accueil visible",
      detail: "Console ouverte au secrétariat",
      done: doneKeys.has("frontdesk"),
    },
    {
      key: "gel",
      label: "Gel prêt",
      detail: "Consigne patient prête",
      done: doneKeys.has("gel"),
    },
  ];
}

function markFrontdeskPreflight(key) {
  const item = getFrontdeskPreflightItems().find((entry) => entry.key === key);
  if (!item || item.done) return;
  logEvent(`Préparation accueil · ${item.label}`, `${item.key} · ${item.detail}`, "frontdesk_preflight");
  renderBoard();
  showToast(`${item.label} validé.`);
}

function getFrontdeskLaunchEvent() {
  return activityLog.find((event) => event.kind === "frontdesk_launch") || null;
}

function getFrontdeskLaunchItems() {
  const preflight = getFrontdeskPreflightItems();
  const preflightDone = preflight.every((item) => item.done);
  const expectedTeam = cabinetConfig.teamCounts.practitioners + cabinetConfig.teamCounts.secretaries + cabinetConfig.teamCounts.assistants;
  const namedTeam = teamMembers.filter((member) => member.name && !member.name.startsWith("Secrétaire ") && !member.name.startsWith("Assistante ")).length;
  const openIncidents = getFrontdeskFieldEvents().filter((event) => event.kind === "support_incident").length;
  const realSession = getRealTestSession();
  return [
    {
      label: "Pré-vol accueil",
      detail: preflightDone ? "Borne, accueil et gel validés" : "Valider les 3 points sous Test réel cabinet",
      done: preflightDone,
    },
    {
      label: "Planning chargé",
      detail: `${appointments.length} rendez-vous disponible${appointments.length > 1 ? "s" : ""}`,
      done: appointments.length > 0,
    },
    {
      label: "Équipe affichée",
      detail: `${teamMembers.length}/${expectedTeam} emplacement${expectedTeam > 1 ? "s" : ""} configuré${expectedTeam > 1 ? "s" : ""}`,
      done: expectedTeam > 0 && teamMembers.length >= expectedTeam && namedTeam > 0,
    },
    {
      label: "Carnet terrain",
      detail: "Boutons rapides prêts pour aide, attente et incident",
      done: true,
    },
    {
      label: "Test réel",
      detail: realSession.active ? "Session en cours" : realSession.closed ? "Session précédente clôturée" : "Prêt à démarrer",
      done: !realSession.active || realSession.passes.length < 5,
    },
    {
      label: "Incident borne",
      detail: openIncidents ? `${openIncidents} incident${openIncidents > 1 ? "s" : ""} à traiter` : "Aucun incident borne ouvert",
      done: openIncidents === 0,
    },
  ];
}

function getFrontdeskLaunchScore(items = getFrontdeskLaunchItems()) {
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

function renderFrontdeskLaunchCheck() {
  const status = document.getElementById("frontdesk-launch-status");
  const list = document.getElementById("frontdesk-launch-list");
  const button = document.getElementById("frontdesk-launch-validate");
  if (!status || !list || !button) return;

  const items = getFrontdeskLaunchItems();
  const score = getFrontdeskLaunchScore(items);
  const launchEvent = getFrontdeskLaunchEvent();
  const ready = score === 100;
  status.textContent = launchEvent ? `Validé · ${launchEvent.time}` : `${score}% prêt`;
  status.classList.toggle("success", ready || Boolean(launchEvent));
  status.classList.toggle("warning", !ready && !launchEvent);
  button.disabled = !ready;
  button.textContent = launchEvent ? "Ouverture validée" : "Valider ouverture";

  list.innerHTML = items
    .map(
      (item) => `
        <article class="${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À faire"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function validateFrontdeskLaunch() {
  const items = getFrontdeskLaunchItems();
  const score = getFrontdeskLaunchScore(items);
  if (score < 100) {
    const missing = items.filter((item) => !item.done).map((item) => item.label).join(", ");
    showToast(`Lancement incomplet : ${missing}.`);
    return;
  }
  logEvent("Ouverture accueil validée", "Borne, planning, équipe et carnet terrain prêts", "frontdesk_launch");
  renderBoard();
  showToast("Ouverture accueil validée.");
}

function buildFrontdeskLaunchReportText() {
  const items = getFrontdeskLaunchItems();
  const launchEvent = getFrontdeskLaunchEvent();
  return [
    "ADIA Accueil - Lancement express accueil",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    `Statut: ${launchEvent ? `validé à ${launchEvent.time}` : `${getFrontdeskLaunchScore(items)}% prêt`}`,
    "",
    "Contrôles",
    ...items.map((item) => `- ${item.done ? "[OK]" : "[A FAIRE]"} ${item.label}: ${item.detail}`),
    "",
    "Usage",
    "Ce lancement express sert au secrétariat avant les premiers patients d'un essai cabinet.",
  ].join("\n");
}

function downloadFrontdeskLaunchReport() {
  downloadText("adia-presence-lancement-accueil.txt", buildFrontdeskLaunchReportText());
  logEvent("Lancement accueil exporté", `${getFrontdeskLaunchScore()}% prêt`, "export");
  renderBoard();
}

function getPractitionerFlowRows() {
  return getPractitionerNames().map((practitioner) => {
    const activePatients = patients.filter(
      (patient) => patient.practitioner === practitioner && patient.status !== "completed",
    );
    const waitingPatients = activePatients.filter((patient) => ["arrived", "waiting"].includes(patient.status));
    const inCare = activePatients.filter((patient) => patient.status === "in_care");
    const expectedAppointments = getExpectedAppointments().filter((appointment) => appointment.practitioner === practitioner);
    const nextPatient = waitingPatients[0] || activePatients[0] || null;
    const status = inCare.length
      ? "En soin"
      : waitingPatients.length
        ? "À appeler"
        : expectedAppointments.length
          ? "À venir"
          : "Libre";
    return {
      practitioner,
      expected: expectedAppointments.length,
      active: activePatients.length,
      waiting: waitingPatients.length,
      inCare: inCare.length,
      nextPatient,
      status,
    };
  });
}

function renderPractitionerFlowPanel() {
  const list = document.getElementById("practitioner-flow-list");
  const status = document.getElementById("practitioner-flow-status");
  if (!list || !status) return;

  const rows = getPractitionerFlowRows();
  const activeTotal = rows.reduce((total, row) => total + row.active, 0);
  const waitingTotal = rows.reduce((total, row) => total + row.waiting, 0);
  status.textContent = `${activeTotal} actif${activeTotal > 1 ? "s" : ""}`;
  status.classList.toggle("success", activeTotal > 0 && waitingTotal === 0);
  status.classList.toggle("warning", waitingTotal > 0);

  list.innerHTML = rows
    .map(
      (row) => `
        <article class="${row.waiting ? "waiting" : row.inCare ? "care" : row.expected ? "expected" : "idle"}">
          <div class="practitioner-flow-head">
            <strong>${row.practitioner}</strong>
            <span>${row.status}</span>
          </div>
          <div class="practitioner-flow-kpis">
            <div><span>Attendus</span><strong>${row.expected}</strong></div>
            <div><span>Présents</span><strong>${row.waiting}</strong></div>
            <div><span>En soin</span><strong>${row.inCare}</strong></div>
          </div>
          <small>${
            row.nextPatient
              ? `${maskName(row.nextPatient.name)} · ${row.nextPatient.reason} · ${row.nextPatient.wait} min`
              : row.expected
                ? "Aucun patient présent pour le moment"
                : "Aucun flux immédiat"
          }</small>
          <div class="practitioner-flow-actions">
            <button data-open-practitioner="${escapeAttribute(row.practitioner)}" type="button">Poste</button>
            <button data-call-practitioner="${escapeAttribute(row.practitioner)}" ${row.nextPatient ? "" : "disabled"} type="button">Appeler</button>
          </div>
        </article>
      `,
    )
    .join("");

  list.querySelectorAll("[data-open-practitioner]").forEach((button) => {
    button.addEventListener("click", () => openPractitionerDesk(button.dataset.openPractitioner));
  });
  list.querySelectorAll("[data-call-practitioner]").forEach((button) => {
    button.addEventListener("click", () => callNextPractitionerPatient(button.dataset.callPractitioner));
  });
}

function openPractitionerDesk(practitioner) {
  doctorPractitionerScope = practitioner;
  renderCareScopeSelectors();
  activateView("praticien");
  renderBoard();
  showToast(`Poste ${practitioner} ouvert.`);
}

function callNextPractitionerPatient(practitioner) {
  const row = getPractitionerFlowRows().find((item) => item.practitioner === practitioner);
  if (!row?.nextPatient) {
    showToast(`Aucun patient à appeler pour ${practitioner}.`);
    return;
  }
  callPatient(row.nextPatient.id);
}

function renderRealTestPanel() {
  const status = document.getElementById("real-test-status");
  const summary = document.getElementById("real-test-summary");
  const startButton = document.getElementById("real-test-start");
  const passButton = document.getElementById("real-test-pass");
  const closeButton = document.getElementById("real-test-close");
  if (!status || !summary || !startButton || !passButton || !closeButton) return;

  const session = getRealTestSession();
  const decision = getRealTestDecision();
  const timing = getRealTestTiming(session);
  const target = 5;
  const passCount = session.passes.length;
  const closeNeedsConfirmation = session.active && passCount > 0 && passCount < 3;
  status.textContent = `${passCount}/${target} · ${decision}`;
  status.classList.toggle("success", ["Test validé", "Clôture possible"].includes(decision));
  status.classList.toggle("warning", !["Test validé", "Clôture possible"].includes(decision));
  startButton.disabled = session.active;
  passButton.disabled = !session.active;
  closeButton.disabled = !session.active || passCount < 1;
  closeButton.textContent = closeNeedsConfirmation && realTestCloseArmed ? "Confirmer clôture" : "Clôturer";
  closeButton.classList.toggle("warning", closeNeedsConfirmation && !realTestCloseArmed);
  closeButton.classList.toggle("armed", closeNeedsConfirmation && realTestCloseArmed);

  summary.innerHTML = `
    <article>
      <span>Session</span>
      <strong>${session.active ? "En cours" : session.closed ? "Clôturée" : "À lancer"}</strong>
      <small>${session.start ? `Démarrée à ${session.start.time}` : "Aucun test réel lancé"}</small>
    </article>
    <article>
      <span>Patients testés</span>
      <strong>${passCount}</strong>
      <small>Objectif terrain : 3 à 5 passages</small>
    </article>
    <article>
      <span>Durée test</span>
      <strong>${timing.durationLabel}</strong>
      <small>Depuis le démarrage de la session</small>
    </article>
    <article>
      <span>Rythme moyen</span>
      <strong>${timing.averageLabel}</strong>
      <small>Temps moyen par passage noté</small>
    </article>
    <article>
      <span>Fluides</span>
      <strong>${session.smooth}</strong>
      <small>Très fluide ou correct</small>
    </article>
    <article class="${session.blockers ? "warning" : "done"}">
      <span>À reprendre</span>
      <strong>${session.blockers}</strong>
      <small>Accompagnement nécessaire ou blocage</small>
    </article>
    <article class="wide">
      <span>Derniers passages</span>
      ${
        session.passes.length
          ? `<ol>${session.passes.slice(-5).map((event) => `<li>${event.time} · ${event.detail}</li>`).join("")}</ol>`
          : "<strong>Aucun passage réel noté pour cette session.</strong>"
      }
    </article>
  `;
}

function renderFrontdeskRealTestPanel() {
  const status = document.getElementById("frontdesk-real-test-status");
  const summary = document.getElementById("frontdesk-real-test-summary");
  const feedbackSummary = document.getElementById("frontdesk-feedback-quick");
  const target = document.getElementById("frontdesk-real-test-target");
  const nextStep = document.getElementById("frontdesk-next-step");
  const preflightPanel = document.getElementById("frontdesk-preflight");
  const startButton = document.getElementById("frontdesk-real-test-start");
  const smoothButton = document.getElementById("frontdesk-real-test-smooth");
  const assistedButton = document.getElementById("frontdesk-real-test-assisted");
  const closeButton = document.getElementById("frontdesk-real-test-close");
  if (!status || !summary || !feedbackSummary || !target || !nextStep || !preflightPanel || !startButton || !smoothButton || !assistedButton || !closeButton) return;

  const session = getRealTestSession();
  const decision = getRealTestDecision();
  const recommendation = getFrontdeskNextStep();
  const preflight = getFrontdeskPreflightItems();
  const timing = getRealTestTiming(session);
  const feedback = getPatientFeedback();
  const patientScore = getPatientExperienceScore(feedback);
  const easyCount = feedback.filter((event) => ["Très simple", "Simple"].includes(getPatientFeedbackMeta(event).ease)).length;
  const difficultCount = feedback.filter((event) => getPatientFeedbackMeta(event).ease === "Difficile").length;
  const closeNeedsConfirmation = session.active && session.passes.length > 0 && session.passes.length < 3;
  status.textContent = `${session.passes.length}/5 · ${decision}`;
  status.classList.toggle("success", ["Test validé", "Clôture possible"].includes(decision));
  status.classList.toggle("warning", !["Test validé", "Clôture possible"].includes(decision));
  startButton.disabled = session.active || preflight.some((item) => !item.done);
  smoothButton.disabled = !session.active;
  assistedButton.disabled = !session.active;
  closeButton.disabled = !session.active || session.passes.length < 1;
  closeButton.textContent = closeNeedsConfirmation && realTestCloseArmed ? "Confirmer clôture" : "Clôturer";
  closeButton.classList.toggle("warning", closeNeedsConfirmation && !realTestCloseArmed);
  closeButton.classList.toggle("armed", closeNeedsConfirmation && realTestCloseArmed);
  nextStep.className = `frontdesk-next-step ${recommendation.tone}`;
  nextStep.innerHTML = `
    <span>Prochain geste</span>
    <strong>${recommendation.title}</strong>
    <small>${recommendation.detail}</small>
  `;
  preflightPanel.innerHTML = preflight
    .map(
      (item) => `
        <article class="${item.done ? "done" : "todo"}">
          <div>
            <span>${item.done ? "OK" : "À valider"}</span>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
          <button data-preflight="${item.key}" ${item.done ? "disabled" : ""} type="button">
            ${item.done ? "Validé" : "Valider"}
          </button>
        </article>
      `,
    )
    .join("");
  preflightPanel.querySelectorAll("[data-preflight]").forEach((button) => {
    button.addEventListener("click", () => markFrontdeskPreflight(button.dataset.preflight));
  });
  target.innerHTML = Array.from({ length: 3 }, (_, index) => {
    const pass = session.passes[index];
    const isAssisted = pass?.detail.includes("À accompagner") || pass?.detail.includes("Bloquant");
    return `
      <article class="${pass ? isAssisted ? "warning" : "done" : "todo"}">
        <span>Patient ${index + 1}</span>
        <strong>${pass ? isAssisted ? "À revoir" : "OK" : "À faire"}</strong>
        <small>${pass ? pass.detail.split(" · ").slice(1).join(" · ") : "Passage réel à noter"}</small>
      </article>
    `;
  }).join("");
  summary.innerHTML = `
    <article>
      <span>État</span>
      <strong>${session.active ? "En cours" : session.closed ? "Clôturé" : "À lancer"}</strong>
    </article>
    <article>
      <span>Durée</span>
      <strong>${timing.durationLabel}</strong>
    </article>
    <article>
      <span>Rythme</span>
      <strong>${timing.averageLabel}</strong>
    </article>
    <article>
      <span>Fluides</span>
      <strong>${session.smooth}</strong>
    </article>
    <article class="${session.blockers ? "warning" : "done"}">
      <span>À reprendre</span>
      <strong>${session.blockers}</strong>
    </article>
    <article>
      <span>Dernier</span>
      <strong>${session.passes.at(-1)?.detail.split(" · ").slice(1, 2).join("") || "Aucun"}</strong>
    </article>
  `;
  feedbackSummary.innerHTML = `
    <article>
      <span>Retours patients</span>
      <strong>${feedback.length}</strong>
    </article>
    <article class="${feedback.length && patientScore < 80 ? "warning" : "done"}">
      <span>Score ressenti</span>
      <strong>${feedback.length ? `${patientScore}%` : "À mesurer"}</strong>
    </article>
    <article>
      <span>Simples</span>
      <strong>${easyCount}</strong>
    </article>
    <article class="${difficultCount ? "warning" : "done"}">
      <span>Hésitants</span>
      <strong>${difficultCount}</strong>
    </article>
  `;
}

function startRealTestSession() {
  const session = getRealTestSession();
  if (session.active) {
    showToast("Un test réel est déjà en cours.");
    return;
  }
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  logEvent("Test réel cabinet démarré", "Objectif 3 à 5 patients · borne accueil", "real_test_start");
  renderBoard();
  showToast("Test réel démarré. Notez chaque passage patient.");
}

function recordRealPatientPassValue(profile, ease, note = "Aucune remarque") {
  const session = getRealTestSession();
  if (!session.active) {
    showToast("Démarrez d'abord le test réel.");
    return;
  }
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  logEvent("Passage patient réel", `${profile} · ${ease} · ${note}`, "real_patient_pass");
  const updatedSession = getRealTestSession();
  renderBoard();
  if (updatedSession.passes.length === 3 && updatedSession.blockers === 0) {
    showNotification("Test réel prêt à clôturer", "3 passages fluides notés.", { sound: false });
    showToast("3 passages notés. Vous pouvez clôturer le test réel.");
    return;
  }
  if (updatedSession.passes.length === 3) {
    showToast("3 passages notés. Regardez les points à reprendre avant de clôturer.");
    return;
  }
  showToast("Passage patient noté.");
}

function recordRealPatientPass() {
  const profile = document.getElementById("real-test-profile").value;
  const ease = document.getElementById("real-test-ease").value;
  const note = document.getElementById("real-test-note").value.trim() || "Aucune remarque";
  recordRealPatientPassValue(profile, ease, note);
  document.getElementById("real-test-note").value = "";
}

function recordFrontdeskRealPatientPass(ease) {
  const profile = ease === "À accompagner" ? "Patient accompagné" : "Patient accueil";
  const note = ease === "À accompagner"
    ? "Aide de l'équipe nécessaire"
    : "Passage autonome depuis la borne";
  recordRealPatientPassValue(profile, ease, note);
}

function addPatientFeedbackValue(profile, ease, text) {
  logEvent(`Retour patient · ${profile} · ${ease}`, text, "patient_feedback");
  renderBoard();
  showToast("Retour patient ajouté.");
}

function addFrontdeskPatientFeedback(ease) {
  if (ease === "Difficile") {
    addPatientFeedbackValue("Patient accueil", "Difficile", "Patient hésitant ou accompagné pendant le passage borne.");
    return;
  }
  addPatientFeedbackValue("Patient accueil", "Très simple", "Patient autonome, parcours compris rapidement.");
}

function getFrontdeskFieldEvents() {
  return activityLog.filter(
    (event) =>
      event.kind === "frontdesk_field_note" ||
      (event.kind === "support_incident" && getSupportIncidentMeta(event).owner === "Accueil"),
  );
}

function getFrontdeskFieldMeta(event) {
  if (event.kind === "support_incident") {
    const meta = getSupportIncidentMeta(event);
    return {
      type: meta.type,
      tone: meta.severity,
    };
  }
  const parts = event.title.replace("Carnet accueil · ", "").split(" · ");
  return {
    type: parts[0] || "Note accueil",
    tone: parts[1] || "Info",
  };
}

function getFrontdeskFieldNoteValue(fallback) {
  const field = document.getElementById("frontdesk-field-note");
  const value = field?.value.trim();
  return value || fallback;
}

function renderFrontdeskFieldNotes() {
  const count = document.getElementById("frontdesk-field-count");
  const summary = document.getElementById("frontdesk-field-summary");
  const list = document.getElementById("frontdesk-field-list");
  if (!count || !summary || !list) return;

  const events = getFrontdeskFieldEvents();
  const help = events.filter((event) => getFrontdeskFieldMeta(event).type === "Aide borne").length;
  const wait = events.filter((event) => getFrontdeskFieldMeta(event).type === "Attente longue").length;
  const issues = events.filter((event) => event.kind === "support_incident").length;
  count.textContent = `${events.length} note${events.length > 1 ? "s" : ""}`;
  count.classList.toggle("success", events.length > 0 && issues === 0);
  count.classList.toggle("warning", issues > 0);

  summary.innerHTML = [
    ["Notes", events.length],
    ["Aides borne", help],
    ["Attentes", wait],
    ["Incidents", issues],
  ]
    .map(
      ([label, value]) => `
        <article class="${label === "Incidents" && value ? "warning" : "done"}">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  list.innerHTML = events.length
    ? events
        .slice(0, 4)
        .map((event) => {
          const meta = getFrontdeskFieldMeta(event);
          return `
            <article class="frontdesk-field-event ${normalize(meta.tone)}">
              <time>${event.time}</time>
              <div>
                <strong>${meta.type}</strong>
                <small>${event.detail}</small>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p>Aucune note terrain enregistrée.</p>`;
}

function recordFrontdeskFieldNote(type, tone, fallback) {
  const detail = getFrontdeskFieldNoteValue(fallback);
  logEvent(`Carnet accueil · ${type} · ${tone}`, detail, "frontdesk_field_note");
  const field = document.getElementById("frontdesk-field-note");
  if (field) field.value = "";
  renderBoard();
  showToast(`${type} noté dans le carnet accueil.`);
}

function recordFrontdeskKioskIssue() {
  const detail = getFrontdeskFieldNoteValue("Incident borne signalé par l'accueil.");
  logEvent("Incident support · iPad / borne · Important · Accueil", detail, "support_incident");
  const field = document.getElementById("frontdesk-field-note");
  if (field) field.value = "";
  renderBoard();
  showToast("Incident borne ajouté au suivi support.");
}

function buildFrontdeskFieldReportText() {
  const events = getFrontdeskFieldEvents();
  const lines = events.length
    ? events
        .map((event) => {
          const meta = getFrontdeskFieldMeta(event);
          return `- ${event.time} · ${meta.type} · ${meta.tone}: ${event.detail}`;
        })
        .join("\n")
    : "- Aucune note terrain enregistrée";

  return [
    "ADIA Accueil - Synthèse terrain accueil",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Résumé",
    `- Notes terrain: ${events.length}`,
    `- Aides borne: ${events.filter((event) => getFrontdeskFieldMeta(event).type === "Aide borne").length}`,
    `- Attentes longues: ${events.filter((event) => getFrontdeskFieldMeta(event).type === "Attente longue").length}`,
    `- Incidents borne: ${events.filter((event) => event.kind === "support_incident").length}`,
    "",
    "Journal",
    lines,
    "",
    "Lecture conseillée",
    events.some((event) => event.kind === "support_incident")
      ? "Traiter les incidents borne avant d'élargir le pilote."
      : "Poursuivre le test en surveillant les aides et attentes répétées.",
  ].join("\n");
}

function downloadFrontdeskFieldReport() {
  downloadText("adia-presence-synthese-terrain-accueil.txt", buildFrontdeskFieldReportText());
  logEvent("Synthèse terrain accueil téléchargée", `${getFrontdeskFieldEvents().length} note(s)`, "export");
  renderBoard();
}

function closeRealTestSession() {
  const session = getRealTestSession();
  if (!session.active) {
    showToast("Aucun test réel en cours.");
    return;
  }
  if (session.passes.length > 0 && session.passes.length < 3 && !realTestCloseArmed) {
    realTestCloseArmed = true;
    window.clearTimeout(realTestCloseArmedTimer);
    realTestCloseArmedTimer = window.setTimeout(() => {
      realTestCloseArmed = false;
      renderBoard();
    }, 6000);
    renderBoard();
    showToast("Test incomplet : cliquez à nouveau pour confirmer la clôture.");
    return;
  }
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  const decision = getRealTestDecision();
  logEvent("Test réel cabinet clôturé", `${session.passes.length} patient(s) · ${decision}`, "real_test_close");
  renderBoard();
  showToast("Test réel clôturé. Rapport disponible.");
}

function resetRealTestSession() {
  realTestCloseArmed = false;
  window.clearTimeout(realTestCloseArmedTimer);
  activityLog = activityLog.filter(
    (event) => !["real_test_start", "real_patient_pass", "real_test_close"].includes(event.kind),
  );
  logEvent("Session test réel nettoyée", "Recette cabinet remise à zéro", "settings");
  renderBoard();
  showToast("Session de test réel nettoyée.");
}

function buildRealTestReportText() {
  const session = getRealTestSession();
  const decision = getRealTestDecision();
  const timing = getRealTestTiming(session);
  const passes = session.passes.length
    ? session.passes.map((event, index) => `${index + 1}. ${event.time} - ${event.detail}`).join("\n")
    : "Aucun passage patient réel noté.";

  return [
    "ADIA Accueil - Rapport de test réel cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Synthèse",
    `Statut: ${decision}`,
    `Session: ${session.active ? "en cours" : session.closed ? "clôturée" : "non démarrée"}`,
    `Patients testés: ${session.passes.length}`,
    `Durée du test: ${timing.durationLabel}`,
    `Rythme moyen: ${timing.averageLabel}`,
    `Passages fluides: ${session.smooth}`,
    `Points à reprendre: ${session.blockers}`,
    "",
    "Passages",
    passes,
    "",
    "Décision conseillée",
    session.passes.length < 3
      ? "Tester au moins 3 patients avant décision."
      : session.blockers === 0
        ? "Parcours validable pour un pilote élargi."
        : "Traiter les points à reprendre puis rejouer un test court.",
  ].join("\n");
}

function downloadRealTestReport() {
  downloadText("adia-presence-test-reel-cabinet.txt", buildRealTestReportText());
  logEvent("Rapport test réel téléchargé", getRealTestDecision(), "export");
  renderBoard();
}

function getCabinetDecision() {
  const qualityPercent = getPercentDone(getQualityChecklist());
  const acceptancePercent = getPercentDone(getAcceptanceCriteria());
  const packPercent = getPercentDone(getDeploymentPackItems());
  const patientFeedback = getPatientFeedback();
  const patientExperience = getPatientExperienceScore(patientFeedback);
  const difficultPatientReturns = patientFeedback.filter(
    (event) => getPatientFeedbackMeta(event).ease === "Difficile",
  ).length;
  const criticalSupportIncidents = getSupportIncidents().filter(
    (event) => getSupportIncidentMeta(event).severity === "Critique",
  ).length;
  const highPriorityFeedback = getPilotFeedback().filter((event) => getFeedbackMeta(event).priority === "Haute").length;
  const scenarioFixes = getScenarioFixItems().length;
  const blockers = difficultPatientReturns + criticalSupportIncidents + highPriorityFeedback + scenarioFixes;
  const patientReady = patientFeedback.length === 0 || patientExperience >= 80;

  let status = "Préparer le test";
  let recommendation = "Compléter le dossier pilote avant de tester en conditions réelles.";
  if (blockers > 0) {
    status = "Corriger avant élargissement";
    recommendation = "Traiter les points bloquants avant d'étendre l'usage à plus de patients.";
  } else if (qualityPercent >= 85 && acceptancePercent >= 80 && packPercent >= 85 && patientReady) {
    status = "Élargir le pilote";
    recommendation = "Continuer sur un créneau réel plus large avec suivi des retours patients.";
  } else if (packPercent >= 85 && qualityPercent >= 70) {
    status = "Tester en cabinet";
    recommendation = "Lancer un test court à l'accueil, puis qualifier les critères restants.";
  }

  return {
    status,
    recommendation,
    qualityPercent,
    acceptancePercent,
    packPercent,
    patientExperience,
    patientReturns: patientFeedback.length,
    difficultPatientReturns,
    criticalSupportIncidents,
    highPriorityFeedback,
    scenarioFixes,
    blockers,
  };
}

function getCabinetDecisionItems() {
  const decision = getCabinetDecision();
  return [
    {
      label: "Dossier pilote",
      value: `${decision.packPercent}%`,
      detail: "Liens, documents et déroulé prêts",
      done: decision.packPercent >= 85,
    },
    {
      label: "Qualité cabinet",
      value: `${decision.qualityPercent}%`,
      detail: "Contrôles avant essai réel",
      done: decision.qualityPercent >= 85,
    },
    {
      label: "Validation terrain",
      value: `${decision.acceptancePercent}%`,
      detail: "Critères cabinet confirmés",
      done: decision.acceptancePercent >= 80,
    },
    {
      label: "Expérience patient",
      value: decision.patientReturns ? `${decision.patientExperience}%` : "À mesurer",
      detail: `${decision.patientReturns} retour${decision.patientReturns > 1 ? "s" : ""} patient`,
      done: decision.patientReturns === 0 || decision.patientExperience >= 80,
    },
    {
      label: "Blocages",
      value: decision.blockers,
      detail: "Retours difficiles, scénarios ou priorités hautes",
      done: decision.blockers === 0,
    },
  ];
}

function getCabinetNextActions() {
  const decision = getCabinetDecision();
  if (decision.status === "Élargir le pilote") {
    return [
      "Tester sur une demi-journée complète avec la borne en conditions réelles.",
      "Collecter au moins 5 retours patients, dont un senior si possible.",
      "Exporter le bilan opérationnel et le dossier pilote en fin de test.",
    ];
  }
  if (decision.status === "Tester en cabinet") {
    return [
      "Faire passer 3 patients réels par la borne.",
      "Cocher les scénarios terrain non encore validés.",
      "Ajouter les retours patients juste après leur passage.",
    ];
  }
  if (decision.status === "Corriger avant élargissement") {
    return [
      "Traiter les actions haute priorité du backlog.",
      "Rejouer les scénarios marqués À corriger.",
      "Vérifier que les patients jugent le parcours simple ou très simple.",
    ];
  }
  return [
    "Finaliser l'équipe affichée et les liens par poste.",
    "Charger ou saisir les rendez-vous du jour.",
    "Ouvrir la checklist Matin du test cabinet avant le premier essai.",
  ];
}

function renderCabinetDecision() {
  const grid = document.getElementById("cabinet-decision-grid");
  const actions = document.getElementById("cabinet-next-actions");
  const status = document.getElementById("cabinet-decision-status");
  if (!grid || !actions || !status) return;

  const decision = getCabinetDecision();
  status.textContent = decision.status;
  status.classList.toggle("success", decision.status === "Élargir le pilote" || decision.status === "Tester en cabinet");
  status.classList.toggle("warning", decision.status !== "Élargir le pilote" && decision.status !== "Tester en cabinet");

  grid.innerHTML = getCabinetDecisionItems()
    .map(
      (item) => `
        <article class="cabinet-decision-item ${item.done ? "done" : "todo"}">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");

  actions.innerHTML = [
    `<strong>${decision.recommendation}</strong>`,
    "<ol>",
    ...getCabinetNextActions().map((item) => `<li>${item}</li>`),
    "</ol>",
  ].join("");
}

function buildCabinetDecisionText() {
  const decision = getCabinetDecision();
  const indicators = getCabinetDecisionItems()
    .map((item) => `- ${item.done ? "[OK]" : "[A COMPLETER]"} ${item.label}: ${item.value} · ${item.detail}`)
    .join("\n");
  const actions = getCabinetNextActions()
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return [
    "ADIA Accueil - Décision cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Décision recommandée",
    decision.status,
    decision.recommendation,
    "",
    "Indicateurs",
    indicators,
    "",
    "Points bloquants",
    `- Retours patients difficiles: ${decision.difficultPatientReturns}`,
    `- Incidents support critiques: ${decision.criticalSupportIncidents}`,
    `- Retours équipe priorité haute: ${decision.highPriorityFeedback}`,
    `- Scénarios à corriger: ${decision.scenarioFixes}`,
    "",
    "Actions suivantes",
    actions,
  ].join("\n");
}

function downloadCabinetDecision() {
  downloadText("adia-presence-decision-cabinet.txt", buildCabinetDecisionText());
  logEvent("Décision cabinet téléchargée", getCabinetDecision().status, "export");
  renderBoard();
}

function getValidationMinutesForm() {
  return {
    owner: document.getElementById("validation-minutes-owner")?.value.trim() || "Référent cabinet non renseigné",
    role: document.getElementById("validation-minutes-role")?.value.trim() || "Fonction non renseignée",
    decision: document.getElementById("validation-minutes-decision")?.value || getCabinetDecision().status,
    notes: document.getElementById("validation-minutes-notes")?.value.trim() || "Aucune réserve ajoutée.",
  };
}

function renderValidationMinutes() {
  const preview = document.getElementById("validation-minutes-preview");
  if (!preview) return;

  const form = getValidationMinutesForm();
  const decision = getCabinetDecision();
  preview.innerHTML = `
    <article>
      <span>Décision calculée</span>
      <strong>${decision.status}</strong>
    </article>
    <article>
      <span>Décision PV</span>
      <strong>${form.decision}</strong>
    </article>
    <article>
      <span>Qualité</span>
      <strong>${decision.qualityPercent}%</strong>
    </article>
    <article>
      <span>Blocages</span>
      <strong>${decision.blockers}</strong>
    </article>
  `;
}

function buildValidationMinutesText() {
  const form = getValidationMinutesForm();
  const decision = getCabinetDecision();
  const indicators = getCabinetDecisionItems()
    .map((item) => `- ${item.label}: ${item.value} · ${item.detail}`)
    .join("\n");
  const nextActions = getCabinetNextActions()
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return [
    "ADIA Accueil - PV de validation pilote",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Référent cabinet",
    `Nom: ${form.owner}`,
    `Fonction: ${form.role}`,
    "",
    "Décision",
    `Décision calculée par ADIA Accueil: ${decision.status}`,
    `Décision retenue dans le PV: ${form.decision}`,
    decision.recommendation,
    "",
    "Indicateurs retenus",
    indicators,
    "",
    "Points de vigilance",
    `- Retours patients difficiles: ${decision.difficultPatientReturns}`,
    `- Incidents support critiques: ${decision.criticalSupportIncidents}`,
    `- Retours équipe priorité haute: ${decision.highPriorityFeedback}`,
    `- Scénarios à corriger: ${decision.scenarioFixes}`,
    "",
    "Réserves / remarques",
    form.notes,
    "",
    "Actions suivantes",
    nextActions,
    "",
    "Validation",
    "Ce PV formalise l'état de l'essai cabinet et les conditions de poursuite du pilote.",
  ].join("\n");
}

function downloadValidationMinutes() {
  downloadText("adia-presence-pv-validation-pilote.txt", buildValidationMinutesText());
  logEvent("PV validation pilote téléchargé", getValidationMinutesForm().decision, "export");
  renderBoard();
}

function buildPilotGuide() {
  const checks = getPilotChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A FAIRE]"} ${item.label}: ${item.detail}`)
    .join("\n");
  const scenarios = getCabinetTestScenarios()
    .map((item) => `- ${item.done ? "[OK]" : "[A TESTER]"} ${item.label}: ${item.detail}`)
    .join("\n");
  const quality = getQualityChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A SURVEILLER]"} ${item.label}: ${item.detail}`)
    .join("\n");
  return [
    "ADIA Accueil - Guide pilote cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Adresse de test borne: ${getKioskUrl()}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Objectif du pilote",
    "Valider en conditions réelles que la borne permet de signaler l'arrivée du patient et que l'équipe voit immédiatement l'information.",
    "",
    "Checklist avant test",
    checks,
    "",
    "Scénarios de recette cabinet",
    scenarios,
    "",
    "Contrôle qualité avant essai réel",
    quality,
    "",
    "Déroulé recommandé",
    "1. Ouvrir le pilotage sur l'ordinateur du secrétariat.",
    "2. Ouvrir la borne sur l'iPad avec l'adresse de test.",
    "3. Charger ou vérifier les rendez-vous du jour.",
    "4. Ajouter un rendez-vous minute depuis Accueil, puis tester Ajouter + borne.",
    "5. Faire valider une arrivée depuis la borne.",
    "6. Vérifier la notification, la file patients, les salles et les actions prioritaires.",
    "7. Tester un patient non retrouvé et le marquer vérifié.",
    "8. Marquer chaque scénario Validé ou À corriger dans Recette terrain.",
    "9. Exporter le suivi des essais terrain.",
    "10. Appeler un patient, puis le passer en prise en charge.",
    "11. Exporter le rapport de journée.",
    "",
    "Limite de cette V1",
    "Cette version reste une V1 pilote locale. La version commercialisable nécessitera comptes utilisateurs, base de données, sécurité RGPD et intégrations métier.",
  ].join("\n");
}

function downloadPilotGuide() {
  downloadText("adia-presence-guide-pilote.txt", buildPilotGuide());
  logEvent("Guide pilote téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getIpadChecklist() {
  return [
    {
      label: "Ouverture réseau",
      detail: SERVER_SYNC_ENABLED ? "Adresse serveur active" : "Ouvrir avec l'adresse http://localhost",
      done: SERVER_SYNC_ENABLED,
    },
    {
      label: "Adresse à saisir sur iPad",
      detail: getKioskUrl(),
      done: Boolean(getKioskUrl()),
    },
    {
      label: "Mode borne disponible",
      detail: document.body.classList.contains("kiosk-locked") ? "Mode borne actuellement actif" : "Bouton Mode borne prêt",
      done: Boolean(document.getElementById("kiosk-fullscreen")),
    },
    {
      label: "Planning chargé",
      detail: `${appointments.length} rendez-vous disponibles`,
      done: appointments.length > 0,
    },
    {
      label: "Retour automatique",
      detail: "Après validation, la borne revient à l'accueil",
      done: true,
    },
    {
      label: "Lien anti-cache",
      detail: "Utiliser le lien complet transmis après chaque lot de corrections",
      done: true,
    },
  ];
}

function renderIpadSupervision() {
  const list = document.getElementById("ipad-status-list");
  if (!list) return;
  list.innerHTML = getIpadChecklist()
    .map(
      (item) => `
        <article class="ipad-status ${item.done ? "done" : "todo"}">
          <span>${item.done ? "OK" : "À faire"}</span>
          <div>
            <strong>${item.label}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function buildIpadGuide() {
  const checks = getIpadChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A FAIRE]"} ${item.label}: ${item.detail}`)
    .join("\n");
  return [
    "ADIA Accueil - Guide iPad accueil",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Adresse à ouvrir sur iPad: ${getKioskUrl()}`,
    "",
    "Installation rapide",
    "1. Connecter le Mac et l'iPad au même Wi-Fi.",
    "2. Lancer l'application sur le Mac en adresse réseau.",
    "3. Ouvrir l'adresse ci-dessus dans Safari sur l'iPad.",
    "4. Aller dans Borne accueil.",
    "5. Appuyer sur Mode borne.",
    "6. Faire un test avec un rendez-vous attendu.",
    "7. Si l'iPad garde une ancienne page, rouvrir le lien complet avec le paramètre fresh indiqué.",
    "",
    "Checklist iPad",
    checks,
    "",
    "Consigne d'usage",
    "La tablette sert uniquement à confirmer une arrivée. En cas de patient non retrouvé, l'accueil est prévenu pour vérifier.",
  ].join("\n");
}

function downloadIpadGuide() {
  downloadText("adia-presence-guide-ipad.txt", buildIpadGuide());
  logEvent("Guide iPad téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getPilotFeedback() {
  return activityLog.filter((event) => event.kind === "feedback");
}

function getPatientFeedback() {
  return activityLog.filter((event) => event.kind === "patient_feedback");
}

function getPatientFeedbackMeta(event) {
  const parts = event.title.split(" · ");
  return {
    profile: parts[1] || "Patient",
    ease: parts[2] || "Non précisé",
  };
}

function getSupportIncidents() {
  return activityLog.filter((event) => event.kind === "support_incident");
}

function getSupportIncidentMeta(event) {
  const parts = event.title.replace("Incident support · ", "").split(" · ");
  return {
    type: parts[0] || "Incident",
    severity: parts[1] || "Mineur",
    owner: parts[2] || "Non assigné",
  };
}

function getPatientExperienceScore(feedback = getPatientFeedback()) {
  if (!feedback.length) return 0;
  const points = feedback.reduce((total, event) => {
    const ease = getPatientFeedbackMeta(event).ease;
    if (ease === "Très simple") return total + 100;
    if (ease === "Simple") return total + 75;
    return total + 25;
  }, 0);
  return Math.round(points / feedback.length);
}

function renderPilotFeedback() {
  const list = document.getElementById("feedback-list");
  const count = document.getElementById("feedback-count");
  const summary = document.getElementById("feedback-summary");
  if (!list || !count || !summary) return;

  const feedback = getPilotFeedback();
  count.textContent = `${feedback.length} retour${feedback.length > 1 ? "s" : ""}`;
  summary.innerHTML = renderPilotFeedbackSummary(feedback);
  list.innerHTML = feedback.length
    ? feedback
        .slice(0, 5)
        .map(
          (event) => `
            <article class="feedback-item">
              <time>${event.time}</time>
              <div>
                <strong>${event.title}</strong>
                <span>${event.detail}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucun retour pilote enregistré.</p>`;
}

function renderPilotFeedbackSummary(feedback = getPilotFeedback()) {
  const blockers = feedback.filter((event) => event.title.includes("Point bloquant")).length;
  const ipadIncidents = feedback.filter((event) => event.title.includes("Incident iPad")).length;
  const patientReturns = feedback.filter((event) => event.title.includes("Retour patient")).length;
  const highPriority = feedback.filter((event) => getFeedbackMeta(event).priority === "Haute").length;
  return [
    ["Retours", feedback.length],
    ["Points bloquants", blockers],
    ["Incidents iPad", ipadIncidents],
    ["Retours patients", patientReturns],
    ["Priorité haute", highPriority],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderPatientFeedback() {
  const summary = document.getElementById("patient-feedback-summary");
  const list = document.getElementById("patient-feedback-list");
  const score = document.getElementById("patient-experience-score");
  if (!summary || !list || !score) return;

  const feedback = getPatientFeedback();
  const easyCount = feedback.filter((event) => ["Très simple", "Simple"].includes(getPatientFeedbackMeta(event).ease)).length;
  const difficultCount = feedback.filter((event) => getPatientFeedbackMeta(event).ease === "Difficile").length;
  const seniorCount = feedback.filter((event) => getPatientFeedbackMeta(event).profile === "Senior").length;
  const percent = getPatientExperienceScore(feedback);
  score.textContent = feedback.length ? `${percent}%` : "À mesurer";
  score.classList.toggle("success", percent >= 80 && feedback.length > 0);
  score.classList.toggle("warning", percent < 80 || feedback.length === 0);

  summary.innerHTML = [
    ["Retours patients", feedback.length],
    ["Simple ou très simple", easyCount],
    ["Difficile", difficultCount],
    ["Seniors observés", seniorCount],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  list.innerHTML = feedback.length
    ? feedback
        .slice(0, 5)
        .map((event) => {
          const meta = getPatientFeedbackMeta(event);
          return `
            <article class="patient-feedback-item ${normalize(meta.ease)}">
              <span>${meta.ease}</span>
              <div>
                <strong>${meta.profile}</strong>
                <small>${event.detail}</small>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p>Aucun retour patient enregistré.</p>`;
}

function renderSupportIncidents() {
  const summary = document.getElementById("support-incident-summary");
  const list = document.getElementById("support-incident-list");
  const count = document.getElementById("support-incident-count");
  if (!summary || !list || !count) return;

  const incidents = getSupportIncidents();
  const critical = incidents.filter((event) => getSupportIncidentMeta(event).severity === "Critique").length;
  const important = incidents.filter((event) => getSupportIncidentMeta(event).severity === "Important").length;
  const ipad = incidents.filter((event) => getSupportIncidentMeta(event).type === "iPad / borne").length;
  count.textContent = `${incidents.length} incident${incidents.length > 1 ? "s" : ""}`;
  count.classList.toggle("success", incidents.length === 0);
  count.classList.toggle("warning", incidents.length > 0);

  summary.innerHTML = [
    ["Total", incidents.length],
    ["Critiques", critical],
    ["Importants", important],
    ["iPad / borne", ipad],
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `,
    )
    .join("");

  list.innerHTML = incidents.length
    ? incidents
        .slice(0, 5)
        .map((event) => {
          const meta = getSupportIncidentMeta(event);
          return `
            <article class="support-incident-item ${normalize(meta.severity)}">
              <span>${meta.severity}</span>
              <div>
                <strong>${meta.type} · ${meta.owner}</strong>
                <small>${event.detail}</small>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p>Aucun incident support enregistré.</p>`;
}

function getPilotBacklogItems() {
  const feedbackItems = getPilotFeedback().map((event, index) => {
    const meta = getFeedbackMeta(event);
    const isBlocker = meta.priority === "Haute";
    return {
      id: `feedback-${index}`,
      title: meta.type,
      description: event.detail,
      priority: meta.priority,
      list: isBlocker ? "À corriger avant pilote" : "Améliorations",
      source: "Retour terrain",
    };
  });
  const patientFeedbackItems = getPatientFeedback()
    .filter((event) => getPatientFeedbackMeta(event).ease === "Difficile")
    .map((event, index) => ({
      id: `patient-feedback-${index}`,
      title: `Simplifier borne: ${getPatientFeedbackMeta(event).profile}`,
      description: event.detail,
      priority: "Haute",
      list: "À corriger avant pilote",
      source: "Retour patient",
    }));
  const supportItems = getSupportIncidents().map((event, index) => {
    const meta = getSupportIncidentMeta(event);
    return {
      id: `support-incident-${index}`,
      title: `Traiter incident: ${meta.type}`,
      description: `${event.detail} · Responsable: ${meta.owner}`,
      priority: meta.severity === "Critique" ? "Haute" : meta.severity === "Important" ? "Moyenne" : "Normale",
      list: meta.severity === "Critique" ? "À corriger avant pilote" : "Support pilote",
      source: "Incident support",
    };
  });
  const scenarioFixItems = getScenarioFixItems();

  const structuralItems = [
    {
      id: "security-saas",
      title: "Préparer authentification et rôles",
      description: "Transformer la V1 locale en version SaaS avec comptes, rôles et droits.",
      priority: "Haute",
      list: "Socle SaaS",
      source: "RGPD",
    },
    {
      id: "database",
      title: "Remplacer stockage local par base de données",
      description: "Créer une persistance PostgreSQL avec sauvegardes et isolation cabinet.",
      priority: "Haute",
      list: "Socle SaaS",
      source: "Architecture",
    },
    {
      id: "julie-integration",
      title: "Industrialiser l'import Julie",
      description: "Stabiliser le format d'import et préparer le connecteur métier.",
      priority: "Moyenne",
      list: "Intégrations",
      source: "Planning",
    },
  ];

  return [...feedbackItems, ...patientFeedbackItems, ...supportItems, ...scenarioFixItems, ...structuralItems];
}

function renderPilotBacklog() {
  const list = document.getElementById("backlog-list");
  const count = document.getElementById("backlog-count");
  if (!list || !count) return;

  const items = getPilotBacklogItems();
  count.textContent = `${items.length} action${items.length > 1 ? "s" : ""}`;
  list.innerHTML = items.length
    ? items
        .slice(0, 6)
        .map(
          (item) => `
            <article class="backlog-item ${normalize(item.priority)}">
              <span>${item.priority}</span>
              <div>
                <strong>${item.title}</strong>
                <small>${item.list} · ${item.source}</small>
              </div>
            </article>
          `,
        )
        .join("")
    : `<p>Aucune action post-pilote pour le moment.</p>`;
}

function exportBacklogTrello() {
  const rows = [
    ["Card Name", "Description", "List Name", "Labels"],
    ...getPilotBacklogItems().map((item) => [
      item.title,
      item.description,
      item.list,
      `${item.priority}, ${item.source}`,
    ]),
  ];
  downloadText(
    "adia-presence-backlog-trello.csv",
    `\uFEFF${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}`,
    "text/csv;charset=utf-8",
  );
  logEvent("Backlog Trello exporté", `${rows.length - 1} actions post-pilote`, "export");
  renderBoard();
}

function addPilotFeedback() {
  const type = document.getElementById("pilot-feedback-type").value;
  const priority = document.getElementById("pilot-feedback-priority").value;
  const text = document.getElementById("pilot-feedback-text").value.trim();
  if (!text) {
    showToast("Saisissez une observation pilote.");
    return;
  }

  logEvent(`Retour pilote · ${type} · ${priority}`, text, "feedback");
  document.getElementById("pilot-feedback-text").value = "";
  document.getElementById("pilot-feedback-priority").value = "Normale";
  renderBoard();
  showToast("Observation pilote ajoutée.");
}

function addPatientFeedback() {
  const profile = document.getElementById("patient-feedback-profile").value;
  const ease = document.getElementById("patient-feedback-ease").value;
  const text = document.getElementById("patient-feedback-text").value.trim();
  if (!text) {
    showToast("Saisissez le ressenti patient.");
    return;
  }

  addPatientFeedbackValue(profile, ease, text);
  document.getElementById("patient-feedback-text").value = "";
  document.getElementById("patient-feedback-ease").value = "Très simple";
}

function buildPatientFeedbackText() {
  const feedback = getPatientFeedback();
  const lines = feedback.length
    ? feedback
        .map((event) => {
          const meta = getPatientFeedbackMeta(event);
          return `- ${event.time} · ${meta.profile} · ${meta.ease}: ${event.detail}`;
        })
        .join("\n")
    : "- Aucun retour patient enregistré";
  return [
    "ADIA Accueil - Retours patients borne",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Score expérience: ${feedback.length ? `${getPatientExperienceScore(feedback)}%` : "À mesurer"}`,
    `Nombre de retours: ${feedback.length}`,
    "",
    "Retours collectés",
    lines,
    "",
    "Lecture recommandée",
    "Un retour Difficile doit créer une action de simplification avant déploiement plus large.",
  ].join("\n");
}

function downloadPatientFeedback() {
  downloadText("adia-presence-retours-patients.txt", buildPatientFeedbackText());
  logEvent("Retours patients téléchargés", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function addSupportIncident() {
  const type = document.getElementById("support-incident-type").value;
  const severity = document.getElementById("support-incident-severity").value;
  const owner = document.getElementById("support-incident-owner").value.trim() || "Non assigné";
  const text = document.getElementById("support-incident-text").value.trim();
  if (!text) {
    showToast("Décrivez l'incident support.");
    return;
  }

  logEvent(`Incident support · ${type} · ${severity} · ${owner}`, text, "support_incident");
  document.getElementById("support-incident-text").value = "";
  document.getElementById("support-incident-severity").value = "Mineur";
  renderBoard();
  showToast("Incident support ajouté.");
}

function buildSupportIncidentsText() {
  const incidents = getSupportIncidents();
  const lines = incidents.length
    ? incidents
        .map((event) => {
          const meta = getSupportIncidentMeta(event);
          return `- ${event.time} · ${meta.severity} · ${meta.type} · ${meta.owner}: ${event.detail}`;
        })
        .join("\n")
    : "- Aucun incident support enregistré";

  return [
    "ADIA Accueil - Registre incidents support pilote",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Synthèse",
    `- Total incidents: ${incidents.length}`,
    `- Critiques: ${incidents.filter((event) => getSupportIncidentMeta(event).severity === "Critique").length}`,
    `- Importants: ${incidents.filter((event) => getSupportIncidentMeta(event).severity === "Important").length}`,
    "",
    "Incidents",
    lines,
    "",
    "Règle de traitement",
    "Tout incident Critique doit être traité avant un pilote élargi.",
  ].join("\n");
}

function downloadSupportIncidents() {
  downloadText("adia-presence-incidents-support.txt", buildSupportIncidentsText());
  logEvent("Incidents support téléchargés", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function buildPilotDebrief() {
  const summary = getDaySummary();
  const feedback = getPilotFeedback();
  const patientFeedback = getPatientFeedback();
  const supportIncidents = getSupportIncidents();
  const scenarioLines = getCabinetTestScenarios()
    .map((scenario) => {
      const trial = getScenarioTrialStatus(scenario.label);
      return `- ${scenario.label}: ${trial.status} · ${trial.detail}`;
    })
    .join("\n");
  const feedbackLines = feedback.length
    ? feedback.map((event) => `- ${event.time} · ${event.title}: ${event.detail}`).join("\n")
    : "- Aucun retour terrain enregistré";
  const patientFeedbackLines = patientFeedback.length
    ? patientFeedback
        .map((event) => {
          const meta = getPatientFeedbackMeta(event);
          return `- ${event.time} · ${meta.profile} · ${meta.ease}: ${event.detail}`;
        })
        .join("\n")
    : "- Aucun retour patient enregistré";
  const supportIncidentLines = supportIncidents.length
    ? supportIncidents
        .map((event) => {
          const meta = getSupportIncidentMeta(event);
          return `- ${event.time} · ${meta.severity} · ${meta.type} · ${meta.owner}: ${event.detail}`;
        })
        .join("\n")
    : "- Aucun incident support enregistré";
  const checks = getPilotChecklist()
    .map((item) => `- ${item.done ? "[OK]" : "[A FAIRE]"} ${item.label}: ${item.detail}`)
    .join("\n");

  return [
    "ADIA Accueil - Bilan pilote cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Indicateurs observés",
    `- Rendez-vous planifiés: ${summary.scheduled}`,
    `- Rendez-vous encore attendus: ${summary.expected}`,
    `- Présences enregistrées: ${summary.totalPatients}`,
    `- Patients à vérifier: ${summary.toVerify}`,
    `- Appels patients: ${summary.patientCalls}`,
    `- Salles occupées: ${summary.occupiedRooms}`,
    `- Attente moyenne: ${summary.avgWait} min`,
    "",
    "Préparation pilote",
    checks,
    "",
    "Contrôle qualité",
    getQualityChecklist()
      .map((item) => `- ${item.done ? "[OK]" : "[A SURVEILLER]"} ${item.label}: ${item.detail}`)
      .join("\n"),
    "",
    "Suivi des essais terrain",
    scenarioLines,
    "",
    "Retours terrain",
    feedbackLines,
    "",
    "Retours patients",
    `Score expérience: ${patientFeedback.length ? `${getPatientExperienceScore(patientFeedback)}%` : "À mesurer"}`,
    patientFeedbackLines,
    "",
    "Incidents support",
    supportIncidentLines,
    "",
    "Décision recommandée",
    feedback.some((event) => event.title.includes("Point bloquant")) ||
      patientFeedback.some((event) => getPatientFeedbackMeta(event).ease === "Difficile") ||
      supportIncidents.some((event) => getSupportIncidentMeta(event).severity === "Critique")
      ? "Corriger les points bloquants avant un pilote plus large."
      : "Poursuivre le pilote sur un créneau réel avec observation secrétariat.",
  ].join("\n");
}

function downloadPilotDebrief() {
  downloadText("adia-presence-bilan-pilote.txt", buildPilotDebrief());
  logEvent("Bilan pilote téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function closeDay() {
  if (!closeDayArmed) {
    closeDayArmed = true;
    window.clearTimeout(closeDayArmedTimer);
    closeDayArmedTimer = window.setTimeout(() => {
      closeDayArmed = false;
      renderClosingSummary();
    }, 6500);
    renderClosingSummary();
    showToast("Cliquez encore pour confirmer la clôture de journée.");
    return;
  }

  patients.forEach((patient) => {
    patient.status = "completed";
  });
  appointments.forEach((appointment) => {
    if (["scheduled", "confirmed"].includes(appointment.status)) {
      appointment.status = "no_show";
    } else if (appointment.status !== "canceled") {
      appointment.status = "completed";
    }
  });
  closeDayArmed = false;
  window.clearTimeout(closeDayArmedTimer);
  logEvent("Journée clôturée", "Patients actifs terminés, rendez-vous restants marqués absents", "done");
  renderBoard();
  activateView("operations");
  showToast("Journée clôturée. Le rapport reste disponible dans Exploitation.");
}

function saveCabinetSettings(event) {
  event.preventDefault();
  cabinetConfig = {
    ...cabinetConfig,
    cabinetName: document.getElementById("setting-cabinet-name").value.trim() || defaultCabinetConfig.cabinetName,
    brand: normalizeBrand({
      logo: document.getElementById("setting-brand-logo").value,
      primaryColor: document.getElementById("setting-brand-primary").value,
      accentColor: document.getElementById("setting-brand-accent").value,
    }),
    accessibility: normalizeAccessibility({
      textSize: document.getElementById("setting-text-size").value,
      contrast: document.getElementById("setting-contrast").value,
      largeButtons: document.getElementById("setting-large-buttons").checked,
      seniorMode: document.getElementById("setting-senior-mode").checked,
    }),
    kioskBehavior: normalizeKioskBehavior({
      confirmationSeconds: document.getElementById("setting-confirmation-seconds").value,
      autoReturn: document.getElementById("setting-auto-return").checked,
      guidedName: document.getElementById("setting-guided-name").checked,
      helpButton: document.getElementById("setting-help-button").checked,
      helpLabel: document.getElementById("setting-help-label").value,
    }),
    kioskTitle: document.getElementById("setting-kiosk-title").value.trim() || defaultCabinetConfig.kioskTitle,
    kioskMessage: document.getElementById("setting-kiosk-message").value.trim() || defaultCabinetConfig.kioskMessage,
    patientInstructions: normalizePatientInstructions({
      prompt: document.getElementById("setting-instruction-prompt").value,
      appointmentSuccess: document.getElementById("setting-instruction-appointment").value,
      secretariatSuccess: document.getElementById("setting-instruction-secretariat").value,
      unmatchedSuccess: document.getElementById("setting-instruction-unmatched").value,
    }),
    teamCounts: normalizeTeamCounts({
      practitioners: document.getElementById("setting-practitioner-count").value,
      secretaries: document.getElementById("setting-secretary-count").value,
      assistants: document.getElementById("setting-assistant-count").value,
    }),
    teamNames: normalizeTeamNames({
      practitioners: document.getElementById("setting-practitioner-names").value,
      secretaries: document.getElementById("setting-secretary-names").value,
      assistants: document.getElementById("setting-assistant-names").value,
    }),
    teamPhotos: normalizeTeamPhotos({
      practitioners: document.getElementById("setting-practitioner-photos").value,
      secretaries: document.getElementById("setting-secretary-photos").value,
      assistants: document.getElementById("setting-assistant-photos").value,
    }),
    teamLabels: normalizeTeamLabels({
      practitioner: document.getElementById("setting-label-practitioner").value,
      practitionerTitle: document.getElementById("setting-label-practitioner-title").value,
      secretariat: document.getElementById("setting-label-secretariat").value,
      assistant: document.getElementById("setting-label-assistant").value,
    }),
    privacyMode: document.getElementById("setting-privacy-mode").checked,
  };
  applyCabinetConfig();
  logEvent("Paramétrage cabinet mis à jour", cabinetConfig.cabinetName, "settings");
  renderBoard();
  showToast("Paramétrage de la borne enregistré.");
}

function getClinicTeamPreset() {
  return {
    counts: {
      practitioners: 5,
      secretaries: 5,
      assistants: 5,
    },
    names: {
      practitioners: ["Dr Martin", "Dr Cohen", "Dr Benamou", "Dr Levy", "Dr Moreau"],
      secretaries: [
        "Sarah | Dr Martin",
        "Nadia | Dr Cohen",
        "Claire | Dr Benamou",
        "Amélie | Dr Levy",
        "Lina | Dr Moreau",
      ],
      assistants: [
        "Julie | Dr Martin",
        "Emma | Dr Cohen",
        "Inès | Dr Benamou",
        "Manon | Dr Levy",
        "Chloé | Dr Moreau",
      ],
    },
  };
}

function applyClinicTeamPreset() {
  const preset = getClinicTeamPreset();
  cabinetConfig = {
    ...cabinetConfig,
    teamCounts: normalizeTeamCounts(preset.counts),
    teamNames: normalizeTeamNames(preset.names),
    teamPhotos: normalizeTeamPhotos(preset.photos || defaultCabinetConfig.teamPhotos),
  };
  applyCabinetConfig();
  logEvent("Équipe exemple chargée", "5 praticiens, 5 secrétaires, 5 assistantes", "settings");
  renderBoard();
  showToast("Équipe exemple chargée. Vous pouvez remplacer les noms ensuite.");
}

function getTeamStructureTemplates() {
  return [
    {
      id: "secretaire-par-praticien",
      label: "Une secrétaire par praticien",
      desc: "Chaque praticien a sa secrétaire dédiée qui gère son agenda.",
      counts: { practitioners: 3, secretaries: 3, assistants: 0 },
      names: {
        practitioners: ["Dr Martin", "Dr Cohen", "Dr Benamou"],
        secretaries: ["Secrétaire | Dr Martin", "Secrétaire | Dr Cohen", "Secrétaire | Dr Benamou"],
        assistants: [],
      },
    },
    {
      id: "mixte-agenda",
      label: "Secrétaires + assistante par agenda",
      desc: "Des secrétaires gèrent leur agenda et une assistante gère l'agenda d'un praticien.",
      counts: { practitioners: 4, secretaries: 3, assistants: 1 },
      names: {
        practitioners: ["Dr Martin", "Dr Cohen", "Dr Benamou", "Dr Levy"],
        secretaries: ["Secrétaire | Dr Martin", "Secrétaire | Dr Cohen", "Secrétaire | Dr Benamou"],
        assistants: ["Assistante | Dr Levy"],
      },
    },
    {
      id: "cabinet-solo",
      label: "Cabinet solo",
      desc: "Un praticien et une secrétaire.",
      counts: { practitioners: 1, secretaries: 1, assistants: 0 },
      names: {
        practitioners: ["Dr Martin"],
        secretaries: ["Secrétaire | Dr Martin"],
        assistants: [],
      },
    },
    {
      id: "secretariat-mutualise",
      label: "Secrétariat mutualisé",
      desc: "Un secrétariat commun accueille tous les patients, sans rattachement à un praticien.",
      counts: { practitioners: 3, secretaries: 2, assistants: 0 },
      names: {
        practitioners: ["Dr Martin", "Dr Cohen", "Dr Benamou"],
        secretaries: [`Accueil | ${SHARED_AGENDA}`, `Accueil | ${SHARED_AGENDA}`],
        assistants: [],
      },
    },
    {
      id: "grand-cabinet",
      label: "Grand cabinet (5 praticiens)",
      desc: "Cinq praticiens, chacun avec une secrétaire et une assistante dédiées.",
      counts: getClinicTeamPreset().counts,
      names: getClinicTeamPreset().names,
    },
  ];
}

function renderStructureTemplateOptions() {
  const select = document.getElementById("team-structure-template");
  if (!select) return;
  const templates = getTeamStructureTemplates();
  select.innerHTML = templates
    .map((tpl) => `<option value="${tpl.id}">${tpl.label}</option>`)
    .join("");
  updateStructureTemplateDesc();
}

function updateStructureTemplateDesc() {
  const select = document.getElementById("team-structure-template");
  const desc = document.getElementById("team-structure-desc");
  if (!select || !desc) return;
  const tpl = getTeamStructureTemplates().find((item) => item.id === select.value);
  desc.textContent = tpl ? tpl.desc : "";
}

function applyStructureTemplate() {
  const select = document.getElementById("team-structure-template");
  if (!select) return;
  const tpl = getTeamStructureTemplates().find((item) => item.id === select.value);
  if (!tpl) return;
  cabinetConfig = {
    ...cabinetConfig,
    teamCounts: normalizeTeamCounts(tpl.counts),
    teamNames: normalizeTeamNames(tpl.names),
    teamPhotos: normalizeTeamPhotos(defaultCabinetConfig.teamPhotos),
  };
  applyCabinetConfig();
  logEvent(
    "Modèle de structure appliqué",
    `${tpl.label} · ${tpl.counts.practitioners} praticien(s), ${tpl.counts.secretaries} secrétaire(s), ${tpl.counts.assistants} assistante(s)`,
    "settings",
  );
  renderBoard();
  showToast(`Modèle « ${tpl.label} » appliqué. Ajustez les noms si besoin.`);
}

/* ---- Éditeur d'affectation d'agenda (personne → praticien) ------ */
function clampTeamCount(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), 12);
}

function readAssignmentEditor() {
  const editor = document.getElementById("team-assignment-editor");
  if (!editor) return null;
  const read = (group) =>
    [...editor.querySelectorAll(`[data-team-group="${group}"] .team-row-edit`)].map((row) => ({
      name: row.querySelector(".team-name-input") ? row.querySelector(".team-name-input").value : "",
      practitioner: row.querySelector(".team-agenda-select") ? row.querySelector(".team-agenda-select").value : "",
    }));
  return {
    practitioners: read("practitioner"),
    secretaries: read("secretariat"),
    assistants: read("assistant"),
  };
}

function syncAssignmentEditorToConfigFields() {
  const state = readAssignmentEditor();
  if (!state) return;
  const practLine = (p, i) => (p.name || "").trim() || `Praticien ${i + 1}`;
  const boundLine = (s) => {
    const nm = (s.name || "").trim();
    const pr = (s.practitioner || "").trim();
    if (pr) return `${nm} | ${pr}`.trim();
    return nm;
  };
  document.getElementById("setting-practitioner-names").value = state.practitioners.map(practLine).join("\n");
  document.getElementById("setting-secretary-names").value = state.secretaries.map(boundLine).join("\n");
  document.getElementById("setting-assistant-names").value = state.assistants.map(boundLine).join("\n");
}

function renderTeamAssignmentEditor(seed) {
  const editor = document.getElementById("team-assignment-editor");
  if (!editor) return;
  const counts = {
    practitioner: clampTeamCount(document.getElementById("setting-practitioner-count").value),
    secretariat: clampTeamCount(document.getElementById("setting-secretary-count").value),
    assistant: clampTeamCount(document.getElementById("setting-assistant-count").value),
  };
  const current = seed || readAssignmentEditor() || { practitioners: [], secretaries: [], assistants: [] };

  const practNames = [];
  for (let i = 0; i < counts.practitioner; i += 1) {
    const c = current.practitioners[i] && current.practitioners[i].name;
    practNames.push(
      (c && c.trim()) ||
        (teamSetup.practitioners[i] && teamSetup.practitioners[i].name) ||
        `Praticien ${i + 1}`,
    );
  }

  const options = (selected) => {
    const isShared = normalize(selected) === normalize(SHARED_AGENDA);
    const hasPract = practNames.some((n) => normalize(n) === normalize(selected || ""));
    let sel = selected;
    if (!isShared && !hasPract) sel = practNames[0] || SHARED_AGENDA;
    const sharedOption = `<option value="${SHARED_AGENDA}"${normalize(sel) === normalize(SHARED_AGENDA) ? " selected" : ""}>${SHARED_AGENDA_LABEL}</option>`;
    const practOptions = practNames
      .map(
        (n) =>
          `<option value="${escapeAttribute(n)}"${normalize(n) === normalize(sel) ? " selected" : ""}>${escapeAttribute(n)}</option>`,
      )
      .join("");
    return sharedOption + practOptions;
  };

  const practRows = practNames
    .map(
      (name, i) => `
        <div class="team-row-edit">
          <span class="team-row-index">${i + 1}</span>
          <input class="team-name-input" type="text" value="${escapeAttribute(name)}" placeholder="Dr ${i + 1}" aria-label="Nom du praticien ${i + 1}" />
        </div>`,
    )
    .join("");

  const boundRows = (list, count, fallbackName) => {
    let html = "";
    for (let i = 0; i < count; i += 1) {
      const entry = list[i] || {};
      const name = entry.name || "";
      const practitioner = entry.practitioner || practNames[i % Math.max(practNames.length, 1)] || "";
      html += `
        <div class="team-row-edit">
          <span class="team-row-index">${i + 1}</span>
          <input class="team-name-input" type="text" value="${escapeAttribute(name)}" placeholder="${escapeAttribute(fallbackName)}" aria-label="Nom" />
          <label class="agenda-pick">gère l'agenda de
            <select class="team-agenda-select" aria-label="Agenda géré">${options(practitioner)}</select>
          </label>
        </div>`;
    }
    return html;
  };

  const groupLabels = (cabinetConfig && cabinetConfig.teamLabels) || defaultCabinetConfig.teamLabels;
  editor.innerHTML = `
    <div class="team-assign-group" data-team-group="practitioner">
      <h4>${escapeAttribute(groupLabels.practitioner)}</h4>
      <div class="team-assign-rows">${practRows || '<p class="team-assign-empty">Aucun praticien.</p>'}</div>
    </div>
    <div class="team-assign-group" data-team-group="secretariat">
      <h4>${escapeAttribute(groupLabels.secretariat)}</h4>
      <div class="team-assign-rows">${boundRows(current.secretaries, counts.secretariat, "Secrétaire") || '<p class="team-assign-empty">Aucune secrétaire.</p>'}</div>
    </div>
    <div class="team-assign-group" data-team-group="assistant">
      <h4>${escapeAttribute(groupLabels.assistant)}</h4>
      <div class="team-assign-rows">${boundRows(current.assistants, counts.assistant, "Assistante clinique") || '<p class="team-assign-empty">Aucune assistante.</p>'}</div>
    </div>
  `;
  syncAssignmentEditorToConfigFields();
}

function seedAssignmentEditorFromConfig() {
  const map = (list) =>
    (list || []).map((v) => {
      const e = parseTeamNameEntry(v);
      return { name: e.name, practitioner: e.practitioner };
    });
  renderTeamAssignmentEditor({
    practitioners: map(cabinetConfig.teamNames.practitioners),
    secretaries: map(cabinetConfig.teamNames.secretaries),
    assistants: map(cabinetConfig.teamNames.assistants),
  });
}

function buildTeamSheetText() {
  const formatMembers = (group) => {
    const members = teamMembers.filter((member) => member.group === group);
    if (!members.length) return "- Aucun affichage";
    return members
      .map((member, index) => {
        const assignment = member.role && member.role !== member.name ? ` - rattachement: ${member.role}` : "";
        const photo = member.photo ? " - photo personnalisée" : " - portrait automatique";
        return `${index + 1}. ${member.name}${assignment}${photo}`;
      })
      .join("\n");
  };

  return [
    "ADIA Accueil - Fiche équipe cabinet",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Export: ${new Date().toLocaleString("fr-FR")}`,
    "",
    "Objectif",
    "Cette fiche sert à préparer les personnes affichées sur la borne patient et les rattachements visibles côté équipe.",
    "",
    "Praticiens",
    formatMembers("practitioner"),
    "",
    "Secrétariat",
    formatMembers("secretariat"),
    "",
    "Assistantes cliniques",
    formatMembers("assistant"),
    "",
    "Règle de saisie dans Administration",
    "- Une personne par ligne.",
    "- Pour une secrétaire ou une assistante rattachée à un praticien: Nom | Dr Nom.",
    "- Les patients sans rendez-vous sont orientés vers la première secrétaire disponible.",
  ].join("\n");
}

function downloadTeamSheet() {
  downloadText("adia-presence-fiche-equipe.txt", buildTeamSheetText());
  logEvent("Fiche équipe téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
  showToast("Fiche équipe téléchargée.");
}

function resizePhotoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture image impossible"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Image non reconnue"));
      image.onload = () => {
        const targetWidth = 480;
        const targetHeight = 640;
        const scale = Math.max(targetWidth / image.width, targetHeight / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        context.fillStyle = "#f8fbfc";
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function importTeamPhotoFiles(inputId, textareaId, label) {
  const input = document.getElementById(inputId);
  const textarea = document.getElementById(textareaId);
  const files = Array.from(input.files || []).filter((file) => file.type.startsWith("image/")).slice(0, 12);
  if (!files.length || !textarea) return;

  try {
    const dataUrls = await Promise.all(files.map(resizePhotoFile));
    textarea.value = dataUrls.join("\n");
    saveCabinetSettings(new Event("submit", { cancelable: true }));
    showToast(`${files.length} photo${files.length > 1 ? "s" : ""} ${label} importée${files.length > 1 ? "s" : ""}.`);
  } catch (error) {
    showToast("Impossible d'importer ces photos. Essayez des fichiers JPG ou PNG.");
  } finally {
    input.value = "";
  }
}

function resizeLogoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture logo impossible"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Logo non reconnu"));
      image.onload = () => {
        const size = 320;
        const scale = Math.min(size / image.width, size / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function importBrandLogoFile() {
  const input = document.getElementById("setting-brand-logo-file");
  const file = Array.from(input.files || []).find((item) => item.type.startsWith("image/"));
  if (!file) return;
  try {
    const logo = await resizeLogoFile(file);
    document.getElementById("setting-brand-logo").value = logo;
    saveCabinetSettings(new Event("submit", { cancelable: true }));
    showToast("Logo du cabinet importé.");
  } catch (error) {
    showToast("Impossible d'importer ce logo. Essayez un fichier JPG ou PNG.");
  } finally {
    input.value = "";
  }
}

function renderBrandPreview() {
  const preview = document.getElementById("brand-preview");
  if (!preview) return;
  preview.innerHTML = `
    <article>
      <span class="brand-preview-mark">${cabinetConfig.brand.logo ? `<img alt="Logo ${escapeAttribute(cabinetConfig.cabinetName)}" src="${escapeAttribute(cabinetConfig.brand.logo)}" />` : getBrandInitial()}</span>
      <div>
        <strong>${cabinetConfig.cabinetName}</strong>
        <small>${cabinetConfig.kioskTitle}</small>
      </div>
    </article>
    <article>
      <span style="background:${escapeAttribute(cabinetConfig.brand.primaryColor)}"></span>
      <div>
        <strong>Couleur principale</strong>
        <small>${cabinetConfig.brand.primaryColor}</small>
      </div>
    </article>
    <article>
      <span style="background:${escapeAttribute(cabinetConfig.brand.accentColor)}"></span>
      <div>
        <strong>Couleur accent</strong>
        <small>${cabinetConfig.brand.accentColor}</small>
      </div>
    </article>
  `;
}

function buildBrandGuideText() {
  return [
    "ADIA Accueil - Fiche identité borne",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    "",
    "Identité visuelle",
    `- Logo: ${cabinetConfig.brand.logo ? "logo personnalisé configuré" : "initiale automatique"}`,
    `- Couleur principale: ${cabinetConfig.brand.primaryColor}`,
    `- Couleur accent: ${cabinetConfig.brand.accentColor}`,
    "",
    "Texte patient",
    `- Titre: ${cabinetConfig.kioskTitle}`,
    `- Message: ${cabinetConfig.kioskMessage}`,
    "",
    "Recommandations",
    "- Utiliser un logo lisible sur fond clair.",
    "- Éviter les couleurs trop pâles pour les boutons principaux.",
    "- Garder un message patient court, direct et rassurant.",
    "- Tester la borne en paysage iPad après chaque changement visuel.",
  ].join("\n");
}

function downloadBrandGuide() {
  downloadText("adia-presence-identite-borne.txt", buildBrandGuideText());
  logEvent("Fiche identité borne téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getAccessibilityItems() {
  const textLabels = { standard: "Standard", large: "Grand", xlarge: "Très grand" };
  return [
    {
      label: "Texte",
      value: textLabels[cabinetConfig.accessibility.textSize],
      detail: "Lisibilité de la borne",
    },
    {
      label: "Contraste",
      value: cabinetConfig.accessibility.contrast === "high" ? "Renforcé" : "Normal",
      detail: "Lisibilité en accueil lumineux",
    },
    {
      label: "Boutons",
      value: cabinetConfig.accessibility.largeButtons ? "Larges" : "Standard",
      detail: "Confort tactile",
    },
    {
      label: "Senior",
      value: cabinetConfig.accessibility.seniorMode ? "Activé" : "Standard",
      detail: "Parcours plus explicite",
    },
    {
      label: "Confirmation",
      value: `${cabinetConfig.kioskBehavior.confirmationSeconds}s`,
      detail: cabinetConfig.kioskBehavior.autoReturn ? "Retour automatique actif" : "Retour manuel",
    },
    {
      label: "Saisie",
      value: cabinetConfig.kioskBehavior.guidedName ? "Guidée" : "Simple",
      detail: "Aide nom et prénom",
    },
  ];
}

function renderAccessibilityPreview() {
  const preview = document.getElementById("accessibility-preview");
  if (!preview) return;
  preview.innerHTML = getAccessibilityItems()
    .map(
      (item) => `
        <article>
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");
}

function buildAccessibilityGuideText() {
  return [
    "ADIA Accueil - Fiche accessibilité borne",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    "",
    "Réglages actuels",
    ...getAccessibilityItems().map((item) => `- ${item.label}: ${item.value} · ${item.detail}`),
    "",
    "Recommandations",
    "- Activer Texte grand ou Très grand si la borne est utilisée par beaucoup de seniors.",
    "- Activer Contraste renforcé si l'iPad est placé dans une zone lumineuse.",
    "- Activer Boutons plus larges si les patients hésitent ou touchent les mauvais boutons.",
    "- Activer Mode senior si l'équipe observe des incompréhensions répétées.",
  ].join("\n");
}

function downloadAccessibilityGuide() {
  downloadText("adia-presence-accessibilite-borne.txt", buildAccessibilityGuideText());
  logEvent("Fiche accessibilité borne téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getKioskHelpEvents({ unresolvedOnly = false } = {}) {
  return activityLog.filter((event) => event.kind === "help" && (!unresolvedOnly || !event.helpAcknowledged));
}

function updateKioskHelpButton() {
  const button = document.getElementById("kiosk-help-button");
  if (!button) return;
  button.textContent = cabinetConfig.kioskBehavior.helpLabel;
  button.classList.toggle("hidden", !cabinetConfig.kioskBehavior.helpButton);
}

function renderKioskHelpPreview() {
  const preview = document.getElementById("kiosk-help-preview");
  if (!preview) return;
  const unresolved = getKioskHelpEvents({ unresolvedOnly: true });
  preview.innerHTML = `
    <article class="${cabinetConfig.kioskBehavior.helpButton ? "active" : "custom"}">
      <span>Bouton aide</span>
      <strong>${cabinetConfig.kioskBehavior.helpButton ? "Visible" : "Masqué"}</strong>
      <small>${escapeAttribute(cabinetConfig.kioskBehavior.helpLabel)}</small>
    </article>
    <article class="${unresolved.length ? "warning" : "active"}">
      <span>Accueil</span>
      <strong>${unresolved.length}</strong>
      <small>Demande${unresolved.length > 1 ? "s" : ""} d'aide à traiter</small>
    </article>
    <article>
      <span>Procédure</span>
      <strong>Simple</strong>
      <small>Appui patient, alerte accueil, prise en compte.</small>
    </article>
  `;
}

function buildKioskHelpGuideText() {
  const unresolved = getKioskHelpEvents({ unresolvedOnly: true });
  return [
    "ADIA Accueil - Procédure aide borne",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    "",
    "Réglage actuel",
    `- Bouton visible: ${cabinetConfig.kioskBehavior.helpButton ? "oui" : "non"}`,
    `- Texte affiché: ${cabinetConfig.kioskBehavior.helpLabel}`,
    `- Demandes à traiter: ${unresolved.length}`,
    "",
    "Procédure accueil",
    "1. Le patient appuie sur le bouton aide de la borne.",
    "2. L'accueil voit une action prioritaire dans la console.",
    "3. Une personne se rend auprès du patient ou le prend en charge au comptoir.",
    "4. L'équipe clique sur Traiter pour retirer l'action de la file.",
    "",
    "Recommandation",
    "- Garder un libellé court, rassurant et visible en bas de l'écran.",
    "- Tester le bouton au début de chaque journée pilote.",
  ].join("\n");
}

function downloadKioskHelpGuide() {
  downloadText("adia-presence-procedure-aide-borne.txt", buildKioskHelpGuideText());
  logEvent("Fiche aide borne téléchargée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getKioskProfiles() {
  return {
    standard: {
      label: "Standard",
      detail: "Usage quotidien équilibré pour la majorité des cabinets.",
      accessibility: { textSize: "standard", contrast: "normal", largeButtons: false, seniorMode: false },
      kioskBehavior: { confirmationSeconds: 8, autoReturn: true, guidedName: true, helpButton: true, helpLabel: "J'ai besoin d'aide" },
    },
    senior: {
      label: "Senior",
      detail: "Texte plus grand, contraste renforcé et consignes plus explicites.",
      accessibility: { textSize: "xlarge", contrast: "high", largeButtons: true, seniorMode: true },
      kioskBehavior: { confirmationSeconds: 12, autoReturn: true, guidedName: true, helpButton: true, helpLabel: "Appeler l'accueil" },
    },
    fast: {
      label: "Affluence rapide",
      detail: "Confirmation courte et retour automatique rapide pendant les pics d'arrivée.",
      accessibility: { textSize: "standard", contrast: "normal", largeButtons: false, seniorMode: false },
      kioskBehavior: { confirmationSeconds: 5, autoReturn: true, guidedName: false, helpButton: true, helpLabel: "Besoin d'aide" },
    },
    premium: {
      label: "Premium",
      detail: "Parcours confortable, lisible et rassurant pour une expérience haut de gamme.",
      accessibility: { textSize: "large", contrast: "normal", largeButtons: true, seniorMode: false },
      kioskBehavior: { confirmationSeconds: 10, autoReturn: true, guidedName: true, helpButton: true, helpLabel: "Une aide ?" },
    },
  };
}

function getActiveKioskProfileKey() {
  const currentAccessibility = JSON.stringify(cabinetConfig.accessibility);
  const currentBehavior = JSON.stringify(cabinetConfig.kioskBehavior);
  return Object.entries(getKioskProfiles()).find(([, profile]) =>
    JSON.stringify(normalizeAccessibility(profile.accessibility)) === currentAccessibility &&
    JSON.stringify(normalizeKioskBehavior(profile.kioskBehavior)) === currentBehavior
  )?.[0] || "custom";
}

function applyKioskProfile(key) {
  const profile = getKioskProfiles()[key];
  if (!profile) return;
  cabinetConfig = {
    ...cabinetConfig,
    accessibility: normalizeAccessibility(profile.accessibility),
    kioskBehavior: normalizeKioskBehavior(profile.kioskBehavior),
  };
  applyCabinetConfig();
  renderBoard();
  logEvent("Profil borne appliqué", profile.label, "settings");
  showToast(`Profil ${profile.label} appliqué.`);
}

function renderKioskProfilePreview() {
  const preview = document.getElementById("kiosk-profile-preview");
  if (!preview) return;
  const profiles = getKioskProfiles();
  const activeKey = getActiveKioskProfileKey();
  const activeProfile = profiles[activeKey];
  preview.innerHTML = `
    <article class="${activeKey === "custom" ? "custom" : "active"}">
      <span>Profil actif</span>
      <strong>${activeProfile?.label || "Personnalisé"}</strong>
      <small>${activeProfile?.detail || "Réglages modifiés manuellement par le cabinet."}</small>
    </article>
    ${Object.entries(profiles)
      .map(
        ([key, profile]) => `
          <article class="${key === activeKey ? "active" : ""}">
            <span>${profile.label}</span>
            <strong>${profile.kioskBehavior.confirmationSeconds}s</strong>
            <small>${profile.detail}</small>
          </article>
        `,
      )
      .join("")}
  `;
}

function buildKioskProfilesText() {
  const profiles = Object.entries(getKioskProfiles())
    .map(([key, profile]) => [
      profile.label,
      profile.detail,
      `- Texte: ${profile.accessibility.textSize}`,
      `- Contraste: ${profile.accessibility.contrast}`,
      `- Boutons larges: ${profile.accessibility.largeButtons ? "oui" : "non"}`,
      `- Mode senior: ${profile.accessibility.seniorMode ? "oui" : "non"}`,
      `- Confirmation: ${profile.kioskBehavior.confirmationSeconds}s`,
      `- Retour automatique: ${profile.kioskBehavior.autoReturn ? "oui" : "non"}`,
      `- Aide nom/prénom: ${profile.kioskBehavior.guidedName ? "oui" : "non"}`,
      `- Bouton aide: ${profile.kioskBehavior.helpButton ? "oui" : "non"}`,
      `- Libellé aide: ${profile.kioskBehavior.helpLabel}`,
      `- Identifiant technique: ${key}`,
    ].join("\n"))
    .join("\n\n");

  return [
    "ADIA Accueil - Profils borne patient",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Profil actif: ${getKioskProfiles()[getActiveKioskProfileKey()]?.label || "Personnalisé"}`,
    "",
    profiles,
  ].join("\n");
}

function downloadKioskProfiles() {
  downloadText("adia-presence-profils-borne.txt", buildKioskProfilesText());
  logEvent("Profils borne téléchargés", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function getPortraitQualityItems() {
  const groups = [
    ["practitioner", "Praticiens"],
    ["secretariat", "Secrétariat"],
    ["assistant", "Assistantes"],
  ];
  const groupItems = groups.map(([group, label]) => {
    const members = teamMembers.filter((member) => member.group === group);
    const custom = members.filter((member) => member.photo).length;
    return {
      label,
      value: `${custom}/${members.length}`,
      detail: custom === members.length && members.length ? "Photos personnalisées complètes" : "Portrait automatique disponible si besoin",
      done: members.length > 0 && custom === members.length,
    };
  });
  const totalCustom = teamMembers.filter((member) => member.photo).length;
  return [
    ...groupItems,
    {
      label: "Couverture globale",
      value: `${totalCustom}/${teamMembers.length}`,
      detail: "Photos verticales recommandées, visage centré",
      done: totalCustom === teamMembers.length && teamMembers.length > 0,
    },
  ];
}

function renderPortraitQuality() {
  const container = document.getElementById("portrait-quality");
  if (!container) return;
  container.innerHTML = getPortraitQualityItems()
    .map(
      (item) => `
        <article class="${item.done ? "done" : "todo"}">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
          <small>${item.detail}</small>
        </article>
      `,
    )
    .join("");
}

function getTeamPhotoConfigKey(group) {
  return group === "practitioner" ? "practitioners" : group === "secretariat" ? "secretaries" : "assistants";
}

function clearTeamPhotos(group) {
  const key = getTeamPhotoConfigKey(group);
  cabinetConfig = {
    ...cabinetConfig,
    teamPhotos: {
      ...cabinetConfig.teamPhotos,
      [key]: [],
    },
  };
  applyCabinetConfig();
  logEvent("Photos équipe vidées", key, "settings");
  renderBoard();
  showToast("Photos supprimées. Les portraits automatiques restent affichés.");
}

function renderPortraitGallery() {
  const gallery = document.getElementById("portrait-gallery");
  if (!gallery) return;

  gallery.innerHTML = teamMembers
    .map(
      (member) => `
        <article class="portrait-gallery-item ${member.photo ? "custom" : "auto"}">
          <img alt="Aperçu ${member.name}" data-fallback="${escapeAttribute(buildGeneratedTeamPortrait(member))}" src="${escapeAttribute(buildTeamPortrait(member))}" />
          <div>
            <strong>${member.name}</strong>
            <span>${member.role}</span>
            <small>${member.photo ? "Photo personnalisée" : "Portrait automatique"}</small>
          </div>
        </article>
      `,
    )
    .join("");

  gallery.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      image.src = image.dataset.fallback;
    }, { once: true });
  });
}

function buildPhotoGuideText() {
  const quality = getPortraitQualityItems()
    .map((item) => `- ${item.done ? "[OK]" : "[AUTO]"} ${item.label}: ${item.value} · ${item.detail}`)
    .join("\n");
  return [
    "ADIA Accueil - Guide photos équipe",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    "",
    "Recommandations",
    "- Utiliser des portraits verticaux.",
    "- Cadrer le visage au centre avec une lumière homogène.",
    "- Garder un fond clair ou discret.",
    "- Éviter les photos de groupe, les captures floues et les photos trop sombres.",
    "- Importer les photos dans le même ordre que les noms.",
    "",
    "État actuel",
    quality,
    "",
    "Sécurité de la borne",
    "Si une photo manque ou ne charge pas, ADIA Accueil affiche automatiquement un portrait premium généré.",
  ].join("\n");
}

function downloadPhotoGuide() {
  downloadText("adia-presence-guide-photos-equipe.txt", buildPhotoGuideText());
  logEvent("Guide photos équipe téléchargé", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function renderTeamConfigPreview() {
  const list = document.getElementById("team-config-preview");
  const count = document.getElementById("team-config-count");
  if (!list || !count) return;

  const groups = teamGroupLabels();
  count.textContent = `${teamMembers.length} personne${teamMembers.length > 1 ? "s" : ""}`;
  list.innerHTML = groups
    .map(([group, label]) => {
      const members = teamMembers.filter((member) => member.group === group);
      return `
        <article class="team-config-group">
          <strong>${label}</strong>
          <div>
            ${
              members.length
                ? members
                    .map(
                      (member) => `
                        <span>
                          <b>${member.name}</b>
                          <small>${member.role} · ${member.photo ? "photo personnalisée" : "portrait automatique"}</small>
                        </span>
                      `,
                    )
                    .join("")
                : "<em>Aucun affichage</em>"
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function openKioskFullscreen() {
  const isLocked = document.body.classList.toggle("kiosk-locked");
  document.getElementById("kiosk-fullscreen").textContent = isLocked
    ? "Quitter borne"
    : "Mode borne";
  activateView("kiosk");
  if (!isLocked) {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    logEvent("Mode borne désactivé", "Tablette accueil", "settings");
    renderIpadSupervision();
    showToast("Mode borne désactivé.");
    return;
  }

  const target = document.getElementById("kiosk");
  logEvent("Mode borne activé", "Tablette accueil prête pour test", "settings");
  renderIpadSupervision();
  if (target.requestFullscreen) {
    target.requestFullscreen();
    showToast("Mode borne activé.");
    return;
  }
  showToast("Mode borne activé. Plein écran navigateur indisponible.");
}

async function copyLaunchUrl() {
  const url = document.getElementById("launch-url").value || getAppUrl();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      showToast("Adresse copiée.");
      return;
    }
  } catch {
    // La copie peut être bloquée en file:// ou sur certains navigateurs.
  }
  document.getElementById("launch-url").select();
  showToast("Adresse sélectionnée, vous pouvez la copier.");
}

function backupState() {
  const payload = {
    version: "adia-presence-demo-v1",
    exportedAt: new Date().toISOString(),
    appointments,
    patients,
    activityLog,
    cabinetConfig,
  };
  downloadText(
    "adia-presence-sauvegarde-demo.json",
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
  logEvent("Sauvegarde de démonstration exportée", cabinetConfig.cabinetName, "export");
  renderBoard();
}

function restoreStateFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      if (!Array.isArray(payload.appointments) || !Array.isArray(payload.patients)) {
        throw new Error("Sauvegarde incomplète");
      }
      appointments = payload.appointments;
      patients = payload.patients;
      activityLog = Array.isArray(payload.activityLog) ? payload.activityLog : [];
      cabinetConfig = normalizeCabinetConfig(payload.cabinetConfig);
      applyCabinetConfig();
      persistState();
      renderBoard();
      showToast("Sauvegarde restaurée.");
    } catch {
      showToast("Impossible de restaurer cette sauvegarde.");
    }
  });
  reader.readAsText(file);
}

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeAttribute(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getSelectedTeamMember() {
  return teamMembers.find((member) => member.id === selectedTeamMemberId) || teamMembers[0];
}

function setKioskScanStatus(message, tone = "") {
  const status = document.getElementById("scan-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("danger", tone === "danger");
  status.classList.toggle("warning", tone === "warning");
}

function getMemberRoutingName(member) {
  if (!member) return "Accueil";
  if (member.group === "secretariat") return "Secrétariat";
  return member.practitioner || member.name || "Accueil";
}

function getMemberSelectionDetail(member) {
  if (!member) return "Sélectionnez une personne.";
  if (member.group === "practitioner") return "Votre praticien sera prévenu.";
  if (member.group === "secretariat") return `${member.name} ou la première secrétaire disponible sera prévenue.`;
  if (member.group === "assistant") return `${member.name} et l'équipe clinique de ${member.practitioner} seront prévenues.`;
  return "L'accueil sera prévenu.";
}

function renderSelectedTeamSummary() {
  const summary = document.getElementById("selected-team-summary");
  if (!summary) return;
  if (kioskMode === "secretariat") {
    summary.innerHTML = `
      <span>Sans rendez-vous</span>
      <strong>Première secrétaire disponible</strong>
      <small>Votre présence sera visible par le secrétariat.</small>
    `;
    return;
  }
  const selectedMember = getSelectedTeamMember();
  if (!selectedMember) {
    summary.innerHTML = "";
    return;
  }
  summary.innerHTML = `
    <span>Vous avez choisi</span>
    <strong>${selectedMember.name}</strong>
    <small>${selectedMember.role} · ${getMemberSelectionDetail(selectedMember)}</small>
  `;
}

function getPortraitInitials(member) {
  const raw = String((member && member.name) || "").trim();
  if (!raw) return "•";
  const titles = /^(dr|dre|pr|pre|m|mme|mlle)\.?$/i;
  const words = raw
    .replace(/\|.*$/, "")
    .split(/[\s.'-]+/)
    .filter((word) => word && !titles.test(word));
  const source = words.length ? words : raw.split(/\s+/);
  const initials = source.slice(0, 2).map((word) => word.charAt(0).toUpperCase());
  return initials.join("") || raw.charAt(0).toUpperCase();
}

function buildGeneratedTeamPortrait(member) {
  // Placeholder premium et uniforme (photo à venir) — porcelaine + encre
  // institutionnelle, sans dégradés colorés, conforme à la direction artistique.
  const initials = escapeAttribute(getPortraitInitials(member));
  const fontSize = initials.length > 1 ? 118 : 142;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="440" viewBox="0 0 320 440">
      <rect width="320" height="440" rx="30" fill="#F4EFE4"/>
      <rect x="1" y="1" width="318" height="438" rx="29" fill="none" stroke="#E6E0D4" stroke-width="1.5"/>
      <circle cx="160" cy="196" r="104" fill="#FFFFFF"/>
      <circle cx="160" cy="196" r="104" fill="none" stroke="#E6E0D4" stroke-width="1.5"/>
      <text x="160" y="200" fill="#153E75" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="500" text-anchor="middle" dominant-baseline="central" letter-spacing="1">${initials}</text>
      <rect x="134" y="360" width="52" height="3" rx="1.5" fill="#D6B56D"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildTeamPortrait(member) {
  return member.photo || buildGeneratedTeamPortrait(member);
}

function teamGroupLabels() {
  const l = (cabinetConfig && cabinetConfig.teamLabels) || defaultCabinetConfig.teamLabels;
  return [
    ["practitioner", l.practitioner],
    ["secretariat", l.secretariat],
    ["assistant", l.assistant],
  ];
}

function renderTeamChoices() {
  const grid = document.getElementById("team-choice-grid");
  if (!grid) return;

  const groups = teamGroupLabels();

  grid.innerHTML = groups
    .map(([group, title]) => {
      const members = teamMembers.filter((member) => member.group === group);
      return `
        <section class="team-row">
          <h3>${title}</h3>
          <div class="team-row-grid">
            ${members
              .map(
                (member) => `
                  <button class="team-card ${member.id === selectedTeamMemberId ? "selected" : ""}" data-team-member="${member.id}" type="button">
                    <img alt="Portrait ${member.name} ${member.practitioner || ""}" data-fallback="${escapeAttribute(buildGeneratedTeamPortrait(member))}" src="${escapeAttribute(buildTeamPortrait(member))}" />
                    <strong>${member.name}</strong>
                    <span>${member.role}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");

  grid.querySelectorAll("[data-team-member]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTeamMemberId = button.dataset.teamMember;
      renderTeamChoices();
      renderSelectedTeamSummary();
      renderKioskResults();
    });
  });
  renderSelectedTeamSummary();
}

function renderNoAppointmentNotice() {
  const grid = document.getElementById("team-choice-grid");
  if (!grid) return;
  grid.innerHTML = `
    <section class="no-appointment-notice">
      <div class="no-appointment-badge">Accueil</div>
      <div>
        <small>Sans rendez-vous</small>
        <strong>Une secrétaire va vous recevoir.</strong>
        <span>Indiquez nom et prénom, puis confirmez votre présence.</span>
      </div>
      <div class="no-appointment-steps">
        <span>Nom et prénom</span>
        <span>Présence confirmée</span>
        <span>Secrétariat prévenu</span>
      </div>
    </section>
  `;
  renderSelectedTeamSummary();
}

function getKioskMatches() {
  const query = normalize(document.getElementById("kiosk-search").value || "");
  const selectedMember = getSelectedTeamMember();
  const openAppointments = appointments.filter((appointment) =>
    ["scheduled", "confirmed"].includes(appointment.status),
  );
  const practitionerTarget = selectedMember?.practitioner || selectedMember?.name;
  const memberAppointments = practitionerTarget
    ? openAppointments.filter((appointment) => appointment.practitioner === practitionerTarget)
    : openAppointments;

  if (!query) return [];

  return memberAppointments
    .filter((appointment) =>
      normalize(`${appointment.name} ${appointment.code} ${appointment.reason}`).includes(query),
    )
    .slice(0, 5);
}

function renderKioskResults() {
  const container = document.getElementById("kiosk-results");
  if (!container) return;

  const matches = getKioskMatches();
  const hasQuery = Boolean(document.getElementById("kiosk-search").value.trim());

  if (!hasQuery) {
    selectedAppointmentId = "";
    container.innerHTML = "";
    return;
  }

  if (!matches.length) {
    selectedAppointmentId = "";
    container.innerHTML = `
      <div class="empty-result">
        <strong>Rendez-vous non retrouvé automatiquement</strong>
        <span>Confirmez votre arrivée : l'accueil sera prévenu pour vérifier avec vous.</span>
      </div>
    `;
    return;
  }

  if (!matches.some((appointment) => appointment.id === selectedAppointmentId)) {
    selectedAppointmentId = matches[0].id;
  }

  container.innerHTML = matches
    .map(
      (appointment) => `
        <button class="appointment-result ${appointment.id === selectedAppointmentId ? "selected" : ""}" data-select-appointment="${appointment.id}" type="button">
          <strong>${appointment.name}</strong>
          <span>${appointment.time} · ${appointment.practitioner} · ${appointment.reason}</span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll("[data-select-appointment]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedAppointmentId = button.dataset.selectAppointment;
      renderKioskResults();
    });
  });
  grid.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => {
      image.src = image.dataset.fallback;
    }, { once: true });
  });
}

function simulateAppointmentScan(fileName) {
  const normalizedName = normalize(fileName);
  const knownMatch =
    appointments.find((appointment) =>
      normalizedName.includes(normalize(appointment.name.split(" ")[0])),
    ) || appointments[0];

  document.getElementById("kiosk-search").value = knownMatch.code || knownMatch.name;
  selectedAppointmentId = knownMatch.id;
  setKioskScanStatus(`Fiche lue: ${knownMatch.name}, ${knownMatch.time}, ${knownMatch.practitioner}.`);
  renderKioskResults();
}

function showSampleCapture() {
  const appointment = ensureSophieAppointment();
  selectedAppointmentId = appointment.id;
  const preview = document.getElementById("scan-preview");
  const image = document.getElementById("scan-preview-image");
  const caption = document.getElementById("scan-preview-caption");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="860" height="540" viewBox="0 0 860 540">
      <rect width="860" height="540" rx="34" fill="#ffffff"/>
      <rect x="34" y="34" width="792" height="472" rx="26" fill="#f5f8fb" stroke="#dce5ef"/>
      <text x="74" y="104" fill="#153e75" font-family="Arial" font-size="42" font-weight="700">ADIA Accueil</text>
      <text x="74" y="154" fill="#627083" font-family="Arial" font-size="25">Fiche de rendez-vous patient</text>
      <text x="74" y="235" fill="#17202a" font-family="Arial" font-size="38" font-weight="700">${appointment.name}</text>
      <text x="74" y="292" fill="#17202a" font-family="Arial" font-size="28">${appointment.time} · ${appointment.practitioner}</text>
      <text x="74" y="342" fill="#17202a" font-family="Arial" font-size="28">${appointment.reason} · ${appointment.room}</text>
      <rect x="618" y="172" width="146" height="146" rx="18" fill="#153e75"/>
      <rect x="638" y="192" width="36" height="36" fill="#ffffff"/>
      <rect x="704" y="192" width="40" height="40" fill="#ffffff"/>
      <rect x="638" y="262" width="42" height="42" fill="#ffffff"/>
      <rect x="704" y="264" width="22" height="22" fill="#ffffff"/>
      <rect x="732" y="292" width="18" height="18" fill="#ffffff"/>
      <text x="620" y="352" fill="#627083" font-family="Arial" font-size="18">Code: SOPHIE</text>
    </svg>
  `;
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  caption.textContent = "Capture exemple générée: sophie.png";
  preview.classList.remove("hidden");
  setKioskScanStatus("Analyse du document exemple...");
  window.setTimeout(() => simulateAppointmentScan("capture-sophie-lambert.png"), 550);
  renderAppointments();
}

function clearKioskReturnTimers() {
  window.clearTimeout(kioskReturnTimer);
  window.clearInterval(kioskCountdownTimer);
  kioskReturnTimer = null;
  kioskCountdownTimer = null;
}

function startKioskReturnCountdown(seconds = cabinetConfig.kioskBehavior.confirmationSeconds) {
  clearKioskReturnTimers();
  const returnText = document.getElementById("kiosk-success-return");
  if (!cabinetConfig.kioskBehavior.autoReturn) {
    if (returnText) returnText.textContent = "La borne restera sur cette confirmation.";
    return;
  }
  let remaining = seconds;
  const renderCountdown = () => {
    if (returnText) {
      returnText.textContent = `Retour automatique à l'accueil dans ${remaining} seconde${remaining > 1 ? "s" : ""}.`;
    }
  };
  renderCountdown();
  kioskCountdownTimer = window.setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      window.clearInterval(kioskCountdownTimer);
      kioskCountdownTimer = null;
      return;
    }
    renderCountdown();
  }, 1000);
  kioskReturnTimer = window.setTimeout(resetKioskForm, seconds * 1000);
}

function showKioskSuccess(title, detail) {
  document.getElementById("kiosk-success-title").textContent = title;
  document.getElementById("kiosk-success-detail").textContent = detail;
  document.getElementById("kiosk-success-return").textContent = cabinetConfig.kioskBehavior.autoReturn
    ? "Retour automatique à l'accueil."
    : "Confirmation maintenue à l'écran.";
  document.getElementById("kiosk-success").classList.remove("hidden");
}

function requestKioskHelp() {
  if (!cabinetConfig.kioskBehavior.helpButton) return;
  const selectedMember = getSelectedTeamMember();
  const target = kioskMode === "appointment" && selectedMember
    ? getMemberRoutingName(selectedMember)
    : "Secrétariat";
  const enteredName = document.getElementById("kiosk-search").value.trim();
  const detail = enteredName
    ? `${enteredName} · aide demandée · ${target}`
    : `Patient à accompagner · ${target}`;

  logEvent("Aide demandée sur la borne", detail, "help");
  activityLog[0].helpAcknowledged = false;
  activityLog[0].helpTarget = target;
  showNotification("Aide demandée sur la borne", detail);
  showKioskSuccess("Accueil prévenu", "Une personne de l'équipe va venir vous aider.");
  setKioskScanStatus("Accueil prévenu. Merci de patienter près de la borne.");
  renderBoard();
  if (document.body.classList.contains("kiosk-locked")) {
    startKioskReturnCountdown();
  } else {
    window.setTimeout(() => activateView("frontdesk"), 850);
  }
}

function acknowledgeKioskHelp(eventId) {
  const event = activityLog.find((item) => item.id === eventId);
  if (!event) return;
  event.helpAcknowledged = true;
  logEvent("Aide borne prise en compte", event.detail, "care");
  renderBoard();
  showToast("Demande d'aide traitée.");
}

function resetKioskForm() {
  clearKioskReturnTimers();
  selectedAppointmentId = "";
  document.getElementById("kiosk-search").value = "";
  setKioskScanStatus(cabinetConfig.patientInstructions.prompt);
  document.getElementById("scan-preview").classList.add("hidden");
  document.getElementById("scan-preview-image").removeAttribute("src");
  document.getElementById("kiosk-success").classList.add("hidden");
  updateKioskMode("appointment");
  renderKioskResults();
}

function updateKioskMode(mode) {
  kioskMode = mode;
  document.body.classList.toggle("kiosk-mode-appointment", mode === "appointment");
  document.body.classList.toggle("kiosk-mode-secretariat", mode === "secretariat");
  document.querySelectorAll("[data-kiosk-mode]").forEach((item) => {
    item.classList.toggle("active-choice", item.dataset.kioskMode === mode);
  });

  const modeStatus = document.getElementById("kiosk-mode-status");
  const search = document.getElementById("kiosk-search");
  const isAppointment = mode === "appointment";
  document.getElementById("team-choice-panel").classList.remove("hidden");
  document.getElementById("scan-appointment").classList.add("hidden");
  document.getElementById("import-appointment-file").classList.add("hidden");
  document.getElementById("sample-capture").classList.add("hidden");
  document.getElementById("scan-dropzone").classList.add("hidden");
  document.getElementById("scan-preview").classList.add("hidden");
  document.getElementById("kiosk-results").classList.toggle("hidden", !isAppointment);

  if (mode === "appointment") {
    modeStatus.textContent = "Choisissez votre contact, indiquez nom et prénom, puis confirmez.";
    search.placeholder = "Ex. Camille Martin";
    renderTeamChoices();
  }
  if (mode === "secretariat") {
    modeStatus.textContent = "Indiquez nom et prénom : la première secrétaire disponible sera prévenue.";
    search.placeholder = "Nom et prénom";
    selectedAppointmentId = "";
    document.getElementById("kiosk-results").innerHTML = "";
    renderNoAppointmentNotice();
  }
  if (mode === "visitor") {
    modeStatus.textContent = "Livraison, fournisseur, représentant ou intervention technique.";
    search.placeholder = "Nom ou société";
    selectedAppointmentId = "";
  }
}

function analyzeAppointmentCapture(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setKioskScanStatus("Format non reconnu. Utilisez une capture JPEG ou PNG.", "danger");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const preview = document.getElementById("scan-preview");
    const image = document.getElementById("scan-preview-image");
    const caption = document.getElementById("scan-preview-caption");
    image.src = reader.result;
    caption.textContent = `Capture chargée: ${file.name}`;
    preview.classList.remove("hidden");
    setKioskScanStatus("Analyse du document en cours...");
    window.setTimeout(() => simulateAppointmentScan(file.name), 550);
  });
  reader.readAsDataURL(file);
}

function createArrivalFromAppointment(appointment) {
  appointment.status = "arrived";
  const existing = patients.find((patient) => patient.appointmentId === appointment.id);
  if (existing) {
    existing.status = "arrived";
    existing.wait = 0;
    existing.late = 0;
    existing.priority = "normal";
    logEvent(
      `${appointment.name} a revalidé sa présence`,
      `${appointment.practitioner} · ${appointment.reason}`,
      "arrival",
    );
    return existing;
  }

  const patient = {
    id: `p${Date.now()}`,
    appointmentId: appointment.id,
    name: appointment.name,
    practitioner: appointment.practitioner,
    reason: appointment.reason,
    time: appointment.time,
    room: appointment.room,
    status: "arrived",
    wait: 0,
    late: 0,
    priority: "normal",
  };
  patients.unshift(patient);
  logEvent(
    `${appointment.name} a validé sa présence`,
    `${appointment.practitioner} · ${appointment.reason}`,
    "arrival",
  );
  showNotification("Nouvelle arrivée", `${appointment.name} · ${appointment.practitioner}`);
  return patient;
}

function createVisitorArrival(name, reason, kind, targetMember = null) {
  const isUnmatchedAppointment = kind === "unmatched";
  const practitioner = targetMember
    ? getMemberRoutingName(targetMember)
    : kind === "secretariat" || isUnmatchedAppointment
      ? "Secrétariat"
      : "Accueil";
  const patient = {
    id: `p${Date.now()}`,
    appointmentId: "",
    name,
    practitioner,
    reason,
    time: "Sans RDV",
    room: targetMember?.room || "Accueil",
    status: "arrived",
    wait: 0,
    late: 0,
    priority: kind === "secretariat" || isUnmatchedAppointment ? "watch" : "normal",
    source: isUnmatchedAppointment ? "unmatched_appointment" : kind,
  };
  patients.unshift(patient);
  logEvent(
    isUnmatchedAppointment ? "Patient à vérifier à l'accueil" : `${name} est arrivé`,
    isUnmatchedAppointment ? `${name} · rendez-vous non retrouvé sur la borne` : reason,
    kind === "secretariat" || isUnmatchedAppointment ? "watch" : "visitor",
  );
  showNotification(
    isUnmatchedAppointment ? "Patient à vérifier" : "Arrivée accueil",
    `${name} · ${reason}`,
  );
  return patient;
}

function parseBulkAppointmentRows() {
  const field = document.getElementById("bulk-appointments");
  return field.value
    .split(/(?:\n|\\n)+/)
    .map((line, index) => {
      const raw = line.trim();
      if (!raw) return null;
      const [name, code, time, practitioner, room, reason] = raw.split(/[;\t,]/).map((item) => item.trim());
      const errors = [];
      if (!name) errors.push("Nom patient manquant");
      if (!/^\d{2}:\d{2}$/.test(time || "")) errors.push("Heure attendue au format HH:MM");
      return {
        code: code || normalize((name || "").split(" ")[0] || name),
        errors,
        line: index + 1,
        name,
        practitioner: practitioner || "Dr Martin",
        raw,
        reason: reason || "Consultation",
        room: room || "Salle 1",
        time,
        valid: errors.length === 0,
      };
    })
    .filter(Boolean);
}

function getImportAnalysis() {
  const source = document.getElementById("import-source")?.value || "Import manuel";
  const rows = parseBulkAppointmentRows();
  const seen = new Set();
  const existingKeys = new Set(
    appointments.map((appointment) => `${normalize(appointment.name)}|${appointment.time}|${normalize(appointment.practitioner)}`),
  );

  const analyzedRows = rows.map((row) => {
    const key = `${normalize(row.name)}|${row.time}|${normalize(row.practitioner)}`;
    const duplicateInFile = row.valid && seen.has(key);
    if (row.valid) seen.add(key);
    const duplicateExisting = row.valid && existingKeys.has(key);
    const warnings = [
      duplicateInFile ? "Doublon dans la liste collée" : "",
      duplicateExisting ? "Rendez-vous déjà présent dans le planning" : "",
      row.practitioner === "Dr Martin" && !row.raw.includes("Dr Martin") ? "Praticien remplacé par défaut" : "",
      row.room === "Salle 1" && !row.raw.includes("Salle 1") ? "Salle remplacée par défaut" : "",
    ].filter(Boolean);

    return {
      ...row,
      duplicateExisting,
      duplicateInFile,
      importable: row.valid && !duplicateInFile,
      status: !row.valid ? "invalid" : duplicateInFile ? "duplicate" : duplicateExisting ? "update" : "valid",
      warnings,
    };
  });

  const importable = analyzedRows.filter((row) => row.importable);
  const invalid = analyzedRows.filter((row) => !row.valid);
  const duplicates = analyzedRows.filter((row) => row.duplicateInFile || row.duplicateExisting);
  const quality = rows.length ? Math.round((importable.length / rows.length) * 100) : 0;

  return {
    source,
    rows: analyzedRows,
    importable,
    invalid,
    duplicates,
    quality: Math.max(0, Math.min(100, quality)),
  };
}

function renderImportPreview() {
  const preview = document.getElementById("import-preview");
  if (!preview) return;
  const analysis = getImportAnalysis();

  preview.innerHTML = analysis.rows.length
    ? `
      <div class="import-preview-head">
        <div>
          <strong>${analysis.importable.length} ligne${analysis.importable.length > 1 ? "s" : ""} importable${analysis.importable.length > 1 ? "s" : ""}</strong>
          <small>${analysis.source}</small>
        </div>
        <span class="${analysis.invalid.length ? "danger" : analysis.duplicates.length ? "warning" : "success"}">${analysis.quality}% qualité</span>
      </div>
      <div class="import-quality-grid">
        <article><span>Prêtes</span><strong>${analysis.importable.length}</strong></article>
        <article><span>Erreurs</span><strong>${analysis.invalid.length}</strong></article>
        <article><span>Doublons</span><strong>${analysis.duplicates.length}</strong></article>
      </div>
      <div class="import-preview-list">
        ${analysis.rows
          .slice(0, 10)
          .map(
            (row) => `
              <article class="${row.status}">
                <span>${row.status === "valid" ? "OK" : row.status === "update" ? "Maj" : row.status === "duplicate" ? "Double" : "Erreur"}</span>
                <strong>${row.name || `Ligne ${row.line}`}</strong>
                <small>${
                  row.valid
                    ? `${row.time} · ${row.practitioner} · ${row.room} · ${row.reason}${row.warnings.length ? ` · ${row.warnings.join(" · ")}` : ""}`
                    : row.errors.join(" · ")
                }</small>
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : `<p>Aucune ligne à prévisualiser.</p>`;
}

function importBulkAppointments() {
  const analysis = getImportAnalysis();
  const validRows = analysis.importable;

  validRows.forEach((row) => {
    addAppointment({
      name: row.name,
      code: row.code,
      practitioner: row.practitioner,
      reason: row.reason,
      time: row.time,
      room: row.room,
    });
  });

  renderImportPreview();
  const detail = `${analysis.source} · ${analysis.invalid.length} erreur${analysis.invalid.length > 1 ? "s" : ""} · ${analysis.duplicates.length} doublon${analysis.duplicates.length > 1 ? "s" : ""}`;
  logEvent(`${validRows.length} rendez-vous importé${validRows.length > 1 ? "s" : ""}`, detail, "import");
  renderBoard();
  showToast(`${validRows.length} rendez-vous importé${validRows.length > 1 ? "s" : ""}, ${analysis.invalid.length} erreur${analysis.invalid.length > 1 ? "s" : ""}.`);
}

function downloadImportTemplate() {
  const source = document.getElementById("import-source").value;
  const content = [
    "Patient;Code;Heure;Praticien;Salle;Motif",
    "Alice Moreau;alice;12:00;Dr Martin;Salle 1;Contrôle",
    "Yanis Petit;yanis;12:15;Dr Cohen;Salle 3;Urgence douleur",
    "Jeanne Vidal;jeanne;12:30;Dr Benamou;Salle 2;Détartrage",
    "",
    `Source prévue: ${source}`,
  ].join("\n");
  downloadText("adia-presence-modele-import-rdv.csv", `\uFEFF${content}`, "text/csv;charset=utf-8");
  logEvent("Modèle d'import téléchargé", source, "export");
  renderBoard();
}

function buildImportLogText() {
  const analysis = getImportAnalysis();
  const rows = analysis.rows.length
    ? analysis.rows
        .map((row) =>
          [
            `Ligne ${row.line}`,
            row.status.toUpperCase(),
            row.name || "Nom manquant",
            row.time || "Heure manquante",
            row.practitioner,
            row.room,
            row.reason,
            [...row.errors, ...row.warnings].join(" | ") || "Aucune alerte",
          ].join(";"),
        )
        .join("\n")
    : "Aucune ligne analysée";

  return [
    "ADIA Accueil - Journal d'import rendez-vous",
    `Cabinet: ${cabinetConfig.cabinetName}`,
    `Source: ${analysis.source}`,
    `Date: ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "Synthèse",
    `- Lignes importables: ${analysis.importable.length}`,
    `- Erreurs: ${analysis.invalid.length}`,
    `- Doublons: ${analysis.duplicates.length}`,
    `- Qualité: ${analysis.quality}%`,
    "",
    "Détail",
    "Ligne;Statut;Patient;Heure;Praticien;Salle;Motif;Alertes",
    rows,
  ].join("\n");
}

function downloadImportLog() {
  downloadText("adia-presence-journal-import-rdv.txt", buildImportLogText());
  logEvent("Journal d'import rendez-vous téléchargé", document.getElementById("import-source").value, "export");
  renderBoard();
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    activateView(button.dataset.view);
  });
});

document.getElementById("simulate-arrival").addEventListener("click", () => {
  const appointment = {
    id: `a${Date.now()}`,
    name: "Lina P.",
    code: "lina",
    practitioner: "Dr Cohen",
    reason: "Consultation enfant",
    time: "11:15",
    room: "Salle 1",
    status: "scheduled",
  };
  appointments.push(appointment);
  createArrivalFromAppointment(appointment);
  renderBoard();
  showToast("Arrivée test: Lina P. apparaît dans le pilotage.");
});

document.getElementById("run-test-scenario").addEventListener("click", () => {
  resetDemoState();
  const appointment = ensureSophieAppointment();
  selectedAppointmentId = appointment.id;
  selectedTeamMemberId = "dr-martin";
  activateView("kiosk");
  document.getElementById("kiosk-search").value = appointment.name.split(" ")[0] || appointment.name;
  renderTeamChoices();
  renderKioskResults();
  showToast("Test prêt: choisissez le portrait puis cliquez sur Confirmer mon arrivée.");
});

document.getElementById("reset-demo").addEventListener("click", resetDemoState);

document.getElementById("toggle-sound").addEventListener("click", toggleSound);

document.getElementById("queue-search").addEventListener("input", (event) => {
  queueSearch = normalize(event.target.value || "");
  renderBoard();
});

document.getElementById("clear-queue-search").addEventListener("click", () => {
  queueSearch = "";
  queuePractitionerFilter = "all";
  queueRoomFilter = "all";
  queueStatusFilter = "all";
  document.getElementById("queue-search").value = "";
  renderBoard();
});

document.getElementById("advance-time").addEventListener("click", advanceWaitingTime);

document.getElementById("team-message-template").addEventListener("change", applyTeamMessageTemplate);

document.getElementById("send-team-message").addEventListener("click", sendTeamMessage);

document.getElementById("add-note").addEventListener("click", addInternalNote);

document.getElementById("transfer-patient").addEventListener("click", transferPatient);

document.getElementById("cabinet-settings-form").addEventListener("submit", saveCabinetSettings);

document.getElementById("kiosk-fullscreen").addEventListener("click", openKioskFullscreen);

document.getElementById("close-ticket").addEventListener("click", closeAppointmentTicket);

document.getElementById("print-ticket").addEventListener("click", printAppointmentTicket);

document.getElementById("download-ticket").addEventListener("click", downloadAppointmentTicket);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("kiosk-locked")) {
    document.body.classList.remove("kiosk-locked");
    document.getElementById("kiosk-fullscreen").textContent = "Mode borne";
    showToast("Mode borne désactivé.");
  }
});

document.getElementById("pair-device").addEventListener("click", () => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  logEvent("Code tablette régénéré", `Code ${code}`, "settings");
  renderBoard();
  showToast(`Nouveau code tablette: ${code}`);
});

document.getElementById("test-notification").addEventListener("click", () => {
  logEvent("Notification test envoyée", "Secrétariat, praticien et assistante", "info");
  renderBoard();
  showToast("Notification test visible dans le journal.");
});

document.getElementById("copy-launch-url").addEventListener("click", copyLaunchUrl);

document.getElementById("backup-state").addEventListener("click", backupState);

document.getElementById("load-team-preset").addEventListener("click", applyClinicTeamPreset);

renderStructureTemplateOptions();
document
  .getElementById("team-structure-template")
  .addEventListener("change", updateStructureTemplateDesc);
document
  .getElementById("apply-structure-template")
  .addEventListener("click", applyStructureTemplate);

(function initTeamAssignmentEditor() {
  const editor = document.getElementById("team-assignment-editor");
  if (!editor) return;
  editor.addEventListener("input", () => {
    syncAssignmentEditorToConfigFields();
  });
  editor.addEventListener("change", (event) => {
    if (event.target.closest('[data-team-group="practitioner"]') && event.target.classList.contains("team-name-input")) {
      renderTeamAssignmentEditor();
    }
  });
  ["setting-practitioner-count", "setting-secretary-count", "setting-assistant-count"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener("input", () => renderTeamAssignmentEditor());
  });
  seedAssignmentEditorFromConfig();
})();

document.getElementById("clear-practitioner-photos").addEventListener("click", () => clearTeamPhotos("practitioner"));

document.getElementById("clear-secretary-photos").addEventListener("click", () => clearTeamPhotos("secretariat"));

document.getElementById("clear-assistant-photos").addEventListener("click", () => clearTeamPhotos("assistant"));

document.getElementById("download-team-sheet").addEventListener("click", downloadTeamSheet);

document.getElementById("download-photo-guide").addEventListener("click", downloadPhotoGuide);

document.getElementById("download-brand-guide").addEventListener("click", downloadBrandGuide);

document.getElementById("download-accessibility-guide").addEventListener("click", downloadAccessibilityGuide);

document.getElementById("download-kiosk-profiles").addEventListener("click", downloadKioskProfiles);

document.getElementById("download-kiosk-help-guide").addEventListener("click", downloadKioskHelpGuide);

document.querySelectorAll("[data-kiosk-profile]").forEach((button) => {
  button.addEventListener("click", () => applyKioskProfile(button.dataset.kioskProfile));
});

document.getElementById("setting-brand-logo-file").addEventListener("change", importBrandLogoFile);

["setting-brand-primary", "setting-brand-accent", "setting-brand-logo"].forEach((id) => {
  const field = document.getElementById(id);
  field.addEventListener("input", () => {
    cabinetConfig.brand = normalizeBrand({
      logo: document.getElementById("setting-brand-logo").value,
      primaryColor: document.getElementById("setting-brand-primary").value,
      accentColor: document.getElementById("setting-brand-accent").value,
    });
    applyBrandIdentity();
    renderBrandPreview();
  });
});

[
  "setting-text-size",
  "setting-contrast",
  "setting-large-buttons",
  "setting-senior-mode",
  "setting-confirmation-seconds",
  "setting-auto-return",
  "setting-guided-name",
  "setting-help-button",
  "setting-help-label",
].forEach((id) => {
  const field = document.getElementById(id);
  field.addEventListener("input", () => {
    cabinetConfig.accessibility = normalizeAccessibility({
      textSize: document.getElementById("setting-text-size").value,
      contrast: document.getElementById("setting-contrast").value,
      largeButtons: document.getElementById("setting-large-buttons").checked,
      seniorMode: document.getElementById("setting-senior-mode").checked,
    });
    cabinetConfig.kioskBehavior = normalizeKioskBehavior({
      confirmationSeconds: document.getElementById("setting-confirmation-seconds").value,
      autoReturn: document.getElementById("setting-auto-return").checked,
      guidedName: document.getElementById("setting-guided-name").checked,
      helpButton: document.getElementById("setting-help-button").checked,
      helpLabel: document.getElementById("setting-help-label").value,
    });
    applyAccessibilitySettings();
    renderKioskProfilePreview();
    renderAccessibilityPreview();
    renderKioskHelpPreview();
    updateKioskHelpButton();
  });
  field.addEventListener("change", () => {
    cabinetConfig.accessibility = normalizeAccessibility({
      textSize: document.getElementById("setting-text-size").value,
      contrast: document.getElementById("setting-contrast").value,
      largeButtons: document.getElementById("setting-large-buttons").checked,
      seniorMode: document.getElementById("setting-senior-mode").checked,
    });
    cabinetConfig.kioskBehavior = normalizeKioskBehavior({
      confirmationSeconds: document.getElementById("setting-confirmation-seconds").value,
      autoReturn: document.getElementById("setting-auto-return").checked,
      guidedName: document.getElementById("setting-guided-name").checked,
      helpButton: document.getElementById("setting-help-button").checked,
      helpLabel: document.getElementById("setting-help-label").value,
    });
    applyAccessibilitySettings();
    renderKioskProfilePreview();
    renderAccessibilityPreview();
    renderKioskHelpPreview();
    updateKioskHelpButton();
  });
});

document.getElementById("setting-practitioner-photo-files").addEventListener("change", () => {
  importTeamPhotoFiles("setting-practitioner-photo-files", "setting-practitioner-photos", "praticien");
});

document.getElementById("setting-secretary-photo-files").addEventListener("change", () => {
  importTeamPhotoFiles("setting-secretary-photo-files", "setting-secretary-photos", "secrétariat");
});

document.getElementById("setting-assistant-photo-files").addEventListener("change", () => {
  importTeamPhotoFiles("setting-assistant-photo-files", "setting-assistant-photos", "assistante");
});

document.getElementById("download-pilot-guide").addEventListener("click", downloadPilotGuide);

document.getElementById("download-scenario-tracker").addEventListener("click", downloadScenarioTracker);

document.getElementById("download-ipad-guide").addEventListener("click", downloadIpadGuide);

document.getElementById("download-opening-guide").addEventListener("click", downloadOpeningGuide);

document.getElementById("download-go-live-checklist").addEventListener("click", downloadGoLiveChecklist);

document.getElementById("download-user-manual").addEventListener("click", downloadUserManual);

document.getElementById("download-training-kit").addEventListener("click", downloadTrainingKit);

document.getElementById("download-deployment-pack").addEventListener("click", downloadDeploymentPack);

document.getElementById("download-finish-line-report").addEventListener("click", downloadFinishLineReport);

document.getElementById("real-test-start").addEventListener("click", startRealTestSession);

document.getElementById("real-test-pass").addEventListener("click", recordRealPatientPass);

document.getElementById("real-test-close").addEventListener("click", closeRealTestSession);

document.getElementById("real-test-reset").addEventListener("click", resetRealTestSession);

document.getElementById("download-real-test-report").addEventListener("click", downloadRealTestReport);

document.getElementById("prepare-clean-test-day").addEventListener("click", prepareCleanTestDay);

document.getElementById("download-clean-day-protocol").addEventListener("click", downloadCleanDayProtocol);

document.getElementById("frontdesk-real-test-start").addEventListener("click", startRealTestSession);

document.getElementById("frontdesk-real-test-smooth").addEventListener("click", () => {
  recordFrontdeskRealPatientPass("Très fluide");
});

document.getElementById("frontdesk-real-test-assisted").addEventListener("click", () => {
  recordFrontdeskRealPatientPass("À accompagner");
});

document.getElementById("frontdesk-feedback-ok").addEventListener("click", () => {
  addFrontdeskPatientFeedback("Très simple");
});

document.getElementById("frontdesk-feedback-hesitant").addEventListener("click", () => {
  addFrontdeskPatientFeedback("Difficile");
});

document.getElementById("frontdesk-real-test-close").addEventListener("click", closeRealTestSession);

document.getElementById("frontdesk-real-test-report").addEventListener("click", downloadRealTestReport);

document.getElementById("frontdesk-launch-validate").addEventListener("click", validateFrontdeskLaunch);

document.getElementById("frontdesk-launch-export").addEventListener("click", downloadFrontdeskLaunchReport);

document.getElementById("frontdesk-field-help").addEventListener("click", () => {
  recordFrontdeskFieldNote("Aide borne", "Info", "Patient aidé sur la borne par le secrétariat.");
});

document.getElementById("frontdesk-field-wait").addEventListener("click", () => {
  recordFrontdeskFieldNote("Attente longue", "Attention", "Attente longue signalée à l'accueil.");
});

document.getElementById("frontdesk-field-issue").addEventListener("click", recordFrontdeskKioskIssue);

document.getElementById("frontdesk-field-note-add").addEventListener("click", () => {
  recordFrontdeskFieldNote("Note accueil", "Info", "Observation accueil ajoutée.");
});

document.getElementById("frontdesk-field-export").addEventListener("click", downloadFrontdeskFieldReport);

document.getElementById("download-cabinet-decision").addEventListener("click", downloadCabinetDecision);

document.getElementById("download-validation-minutes").addEventListener("click", downloadValidationMinutes);

[
  "validation-minutes-owner",
  "validation-minutes-role",
  "validation-minutes-decision",
  "validation-minutes-notes",
].forEach((id) => {
  const field = document.getElementById(id);
  field.addEventListener("input", renderValidationMinutes);
  field.addEventListener("change", renderValidationMinutes);
});

document.getElementById("download-commercial-roadmap").addEventListener("click", downloadCommercialRoadmap);

document.getElementById("download-product-sheet").addEventListener("click", downloadProductSheet);

document.getElementById("recipe-practitioner").addEventListener("click", runRecipePractitioner);

document.getElementById("recipe-secretariat").addEventListener("click", runRecipeSecretariat);

document.getElementById("recipe-unmatched").addEventListener("click", runRecipeUnmatched);

document.getElementById("recipe-clear").addEventListener("click", clearRecipeTests);

document.getElementById("add-pilot-feedback").addEventListener("click", addPilotFeedback);

document.getElementById("add-patient-feedback").addEventListener("click", addPatientFeedback);

document.getElementById("download-patient-feedback").addEventListener("click", downloadPatientFeedback);

document.getElementById("add-support-incident").addEventListener("click", addSupportIncident);

document.getElementById("download-support-incidents").addEventListener("click", downloadSupportIncidents);

document.getElementById("download-pilot-debrief").addEventListener("click", downloadPilotDebrief);

document.getElementById("export-backlog-trello").addEventListener("click", exportBacklogTrello);

document.getElementById("download-rgpd-register").addEventListener("click", downloadRgpdRegister);

document.getElementById("download-permission-matrix").addEventListener("click", downloadPermissionMatrix);

document.getElementById("download-frontdesk-access-sheet").addEventListener("click", () => downloadAccessSheet("frontdesk"));

document.getElementById("download-doctor-access-sheet").addEventListener("click", () => downloadAccessSheet("doctor"));

document.getElementById("download-assistant-access-sheet").addEventListener("click", () => downloadAccessSheet("assistant"));

document.getElementById("download-workstation-plan").addEventListener("click", downloadWorkstationPlan);

document.getElementById("export-privacy-data").addEventListener("click", backupState);

document.getElementById("print-reception-sheet").addEventListener("click", printReceptionSheet);

document.getElementById("export-reception-sheet").addEventListener("click", exportReceptionSheet);

document.getElementById("frontdesk-print-reception").addEventListener("click", printReceptionSheet);

document.getElementById("frontdesk-export-reception").addEventListener("click", exportReceptionSheet);

document.getElementById("download-secretariat-followup").addEventListener("click", downloadSecretariatFollowup);

document.getElementById("frontdesk-add-visitor").addEventListener("click", addFrontdeskVisitor);

document.getElementById("frontdesk-add-appointment").addEventListener("click", () => createFrontdeskQuickAppointment(false));

document.getElementById("frontdesk-add-appointment-kiosk").addEventListener("click", () => createFrontdeskQuickAppointment(true));

document.getElementById("frontdesk-search").addEventListener("input", (event) => {
  frontdeskSearch = event.target.value;
  renderFrontdeskSearch();
});

document.getElementById("frontdesk-clear-search").addEventListener("click", () => {
  frontdeskSearch = "";
  document.getElementById("frontdesk-search").value = "";
  renderFrontdeskSearch();
});

document.getElementById("restore-state").addEventListener("click", () => {
  document.getElementById("restore-state-file").click();
});

document.getElementById("restore-state-file").addEventListener("change", (event) => {
  restoreStateFromFile(event.target.files?.[0]);
});

document.querySelectorAll("[data-view-shortcut]").forEach((button) => {
  button.addEventListener("click", () => activateView(button.dataset.viewShortcut));
});

document.addEventListener("click", (event) => {
  const assignButton = event.target.closest?.("[data-assign-secretariat]");
  if (!assignButton) return;
  assignSecretariatRequest(assignButton.dataset.assignSecretariat);
});

document.addEventListener("click", (event) => {
  const assignNextButton = event.target.closest?.("[data-assign-next-secretary]");
  if (!assignNextButton || assignNextButton.disabled) return;
  assignNextSecretariatRequest(assignNextButton.dataset.assignNextSecretary);
});

document.getElementById("kiosk-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedMember = getSelectedTeamMember();
  const enteredName = document.getElementById("kiosk-search").value.trim();
  const selected = kioskMode === "appointment"
    ? appointments.find((appointment) => appointment.id === selectedAppointmentId)
    : null;
  const selectedCode = selected?.code || "";
  const selectedName = selected?.name || "";
  const appointmentAlreadyIdentified =
    selected &&
    (normalize(enteredName) === normalize(selectedCode) || normalize(enteredName) === normalize(selectedName));
  const validationMessage = appointmentAlreadyIdentified
    ? ""
    : getFullNameValidationMessage(enteredName, { allowOrganization: kioskMode === "visitor" });
  if (validationMessage) {
    setKioskScanStatus(validationMessage, "danger");
    document.getElementById("kiosk-search").focus();
    showToast(validationMessage);
    return;
  }
  if (selected) {
    const patient = createArrivalFromAppointment(selected);
    showKioskSuccess(
      "Présence validée",
      formatPatientInstruction(cabinetConfig.patientInstructions.appointmentSuccess, {
        name: patient.name,
        practitioner: patient.practitioner,
        target: patient.practitioner,
      }),
    );
    showToast(`Présence validée: ${patient.name}. ${patient.practitioner} est prévenu.`);
  } else {
    const query = enteredName;
    const unmatchedAppointment = kioskMode === "appointment";
    const reason = kioskMode === "secretariat"
      ? "Demande secrétariat"
      : kioskMode === "visitor"
        ? "Visite externe"
        : `Rendez-vous à vérifier · ${selectedMember.name}`;
    const patient = createVisitorArrival(
      query,
      reason,
      unmatchedAppointment ? "unmatched" : kioskMode,
      unmatchedAppointment ? selectedMember : null,
    );
    const notifiedTarget = unmatchedAppointment && selectedMember
      ? getMemberRoutingName(selectedMember)
      : "Secrétariat";
    showKioskSuccess(
      unmatchedAppointment ? "Présence transmise" : "Présence enregistrée",
      unmatchedAppointment
        ? formatPatientInstruction(cabinetConfig.patientInstructions.unmatchedSuccess, {
            name: patient.name,
            practitioner: patient.practitioner,
            target: notifiedTarget,
          })
        : kioskMode === "secretariat"
          ? formatPatientInstruction(cabinetConfig.patientInstructions.secretariatSuccess, {
              name: patient.name,
              practitioner: patient.practitioner,
              target: "Secrétariat",
            })
          : `${patient.name}, l'accueil est prévenu.`,
    );
    showToast(`${patient.name}: présence enregistrée.`);
  }
  renderBoard();
  if (document.body.classList.contains("kiosk-locked")) {
    startKioskReturnCountdown();
  } else {
    window.setTimeout(() => activateView("dashboard"), 850);
  }
});

document.getElementById("kiosk-help-button").addEventListener("click", requestKioskHelp);

document.getElementById("kiosk-search").addEventListener("input", () => {
  setKioskScanStatus(cabinetConfig.patientInstructions.prompt);
  renderKioskResults();
});

document.getElementById("scan-appointment").addEventListener("click", () => {
  simulateAppointmentScan("fiche-camille-rendez-vous");
});

document.getElementById("import-appointment-file").addEventListener("click", () => {
  document.getElementById("scan-file").click();
});

document.getElementById("sample-capture").addEventListener("click", showSampleCapture);

document.getElementById("scan-file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  analyzeAppointmentCapture(file);
});

const scanDropzone = document.getElementById("scan-dropzone");
scanDropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  scanDropzone.classList.add("dragging");
});
scanDropzone.addEventListener("dragleave", () => {
  scanDropzone.classList.remove("dragging");
});
scanDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  scanDropzone.classList.remove("dragging");
  analyzeAppointmentCapture(event.dataTransfer.files?.[0]);
});

document.getElementById("appointment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("appointment-patient").value.trim();
  const code = document.getElementById("appointment-code").value.trim();
  const time = document.getElementById("appointment-time").value;
  const practitioner = document.getElementById("appointment-practitioner").value;
  const room = document.getElementById("appointment-room").value;
  const reason = document.getElementById("appointment-reason").value.trim();

  if (editingAppointmentId) {
    const appointment = updateAppointment(editingAppointmentId, {
      name,
      code,
      practitioner,
      reason,
      time,
      room,
    });
    if (appointment) {
      logEvent("Rendez-vous corrigé", `${appointment.name} · ${appointment.time} · ${appointment.practitioner}`, "settings");
      resetAppointmentForm();
      renderBoard();
      showToast(`${appointment.name}: rendez-vous corrigé.`);
    }
    return;
  }

  const appointment = addAppointment({
    name,
    code,
    practitioner,
    reason,
    time,
    room,
  });

  event.currentTarget.reset();
  document.getElementById("appointment-time").value = "11:30";
  renderBoard();
  activateView("kiosk");
  document.getElementById("kiosk-search").value = name.split(" ")[0] || name;
  selectedAppointmentId = appointment.id;
  renderKioskResults();
  showToast(`Rendez-vous créé: ${name}. Passage sur la borne patient.`);
});

document.getElementById("appointment-cancel-edit").addEventListener("click", () => {
  resetAppointmentForm();
  showToast("Correction annulée.");
});

document.getElementById("add-sophie-demo").addEventListener("click", () => {
  const appointment = ensureSophieAppointment();
  selectedAppointmentId = appointment.id;
  renderBoard();
  showToast("Rendez-vous test Sophie ajouté. Vous pouvez le sélectionner sur la borne.");
});

document.getElementById("load-import-example").addEventListener("click", () => {
  document.getElementById("bulk-appointments").value = [
    "Alice Moreau;alice;12:00;Dr Martin;Salle 1;Contrôle",
    "Yanis Petit;yanis;12:15;Dr Cohen;Salle 3;Urgence douleur",
    "Jeanne Vidal;jeanne;12:30;Dr Benamou;Salle 2;Détartrage",
  ].join("\n");
  renderImportPreview();
  showToast("Exemple chargé et prévisualisé.");
});

document.getElementById("preview-import").addEventListener("click", renderImportPreview);

document.getElementById("download-import-template").addEventListener("click", downloadImportTemplate);

document.getElementById("download-import-log").addEventListener("click", downloadImportLog);

document.getElementById("bulk-appointments").addEventListener("input", renderImportPreview);

document.getElementById("import-appointments").addEventListener("click", importBulkAppointments);

document.getElementById("export-arrivals").addEventListener("click", exportArrivalsCsv);

document.getElementById("export-appointments").addEventListener("click", exportAppointmentsCsv);

document.getElementById("export-audit-log").addEventListener("click", exportAuditLog);

document.getElementById("download-report").addEventListener("click", downloadDailyReport);

document.getElementById("download-punctuality-report").addEventListener("click", downloadPunctualityReport);

document.getElementById("download-day-archive").addEventListener("click", downloadDayArchive);

document.getElementById("download-operational-review").addEventListener("click", downloadOperationalReview);

document.getElementById("download-executive-summary").addEventListener("click", downloadExecutiveSummary);

document.getElementById("refresh-report").addEventListener("click", () => {
  renderOperations();
  showToast("Rapport de journée actualisé.");
});

document.getElementById("print-report").addEventListener("click", () => {
  renderOperations();
  window.print();
});

document.getElementById("close-day").addEventListener("click", closeDay);

document.getElementById("close-day-inline").addEventListener("click", closeDay);

document.querySelectorAll("[data-kiosk-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    updateKioskMode(button.dataset.kioskMode);
  });
});

updateClock();
window.setInterval(updateClock, 10000);
applyCabinetConfig();
updateKioskMode(kioskMode);
applyStartupRoute();
renderBoard();
syncFromServer();
if (SERVER_SYNC_ENABLED) {
  window.setInterval(() => syncFromServer(), 2500);
}


/* ADIA Accueil — écran de veille borne (idle) */
(function () {
  var IDLE_MS = 60000;
  var timer = null;
  var body = document.body;
  function onBorne() {
    var k = document.getElementById("kiosk");
    return body.classList.contains("kiosk-locked") || (k && k.classList.contains("active"));
  }
  function updateIdleClock() {
    var el = document.getElementById("kiosk-idle-clock");
    if (el) {
      el.textContent = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
  }
  function goIdle() {
    if (onBorne()) {
      updateIdleClock();
      body.classList.add("kiosk-idle");
    }
  }
  function reset() {
    clearTimeout(timer);
    timer = setTimeout(goIdle, IDLE_MS);
  }
  function wake() {
    if (body.classList.contains("kiosk-idle")) body.classList.remove("kiosk-idle");
    reset();
  }
  ["pointerdown", "keydown", "touchstart", "mousemove", "wheel"].forEach(function (ev) {
    document.addEventListener(ev, wake, { passive: true });
  });
  setInterval(updateIdleClock, 1000);
  updateIdleClock();
  reset();
})();


/* ADIA Accueil — état hors-ligne rassurant */
(function () {
  var body = document.body;
  function sync() { body.classList.toggle("is-offline", navigator.onLine === false); }
  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);
  sync();
})();
