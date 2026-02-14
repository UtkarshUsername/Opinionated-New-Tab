import browser from "webextension-polyfill";

const STORAGE_KEY = "ont_v1";

function getDefaultState() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: {
      theme: "dark",
      showCompletedTasks: true,
      countdown: {
        label: "Launch",
        targetIso: "2026-03-01T18:00:00.000Z",
      },
    },
    tasks: [],
    projects: [],
  };
}

function sanitizeState(raw) {
  const defaults = getDefaultState();
  return {
    version: 1,
    updatedAt: raw.updatedAt || defaults.updatedAt,
    settings: {
      ...defaults.settings,
      ...(raw.settings && typeof raw.settings === "object" ? raw.settings : {}),
      countdown: {
        ...defaults.settings.countdown,
        ...(raw.settings &&
        typeof raw.settings === "object" &&
        raw.settings.countdown &&
        typeof raw.settings.countdown === "object"
          ? raw.settings.countdown
          : {}),
      },
    },
    tasks: Array.isArray(raw.tasks) ? raw.tasks : defaults.tasks,
    projects: Array.isArray(raw.projects) ? raw.projects : defaults.projects,
  };
}

function generateId(prefix) {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${time}${rand}`;
}

async function load() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY];
    if (data && typeof data === "object" && data.version === 1) {
      return sanitizeState(data);
    }
  } catch {
    // fall through to default
  }
  return getDefaultState();
}

async function save(state) {
  state.updatedAt = new Date().toISOString();
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

async function exportData() {
  const state = await load();
  return JSON.stringify(state, null, 2);
}

async function importData(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
    throw new Error("Invalid data: version must be 1");
  }
  const sanitized = sanitizeState(parsed);
  await save(sanitized);
}

export { load, save, getDefaultState, generateId, exportData, importData };
