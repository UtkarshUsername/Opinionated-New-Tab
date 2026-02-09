import browser from "webextension-polyfill";

const STORAGE_KEY = "ont_v1";

function getDefaultState() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: {
      theme: "dark",
      showCompletedTasks: false,
      countdown: {
        label: "Launch",
        targetIso: "2026-03-01T18:00:00.000Z",
      },
    },
    tasks: [],
    projects: [],
  };
}

function generateId(prefix) {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${rand}`;
}

async function load() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const data = result[STORAGE_KEY];
    if (data && typeof data === "object" && data.version === 1) {
      return data;
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
  return JSON.stringify(state);
}

async function importData(jsonString) {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
    throw new Error("Invalid data: version must be 1");
  }
  await save(parsed);
}

export { load, save, getDefaultState, generateId, exportData, importData };
