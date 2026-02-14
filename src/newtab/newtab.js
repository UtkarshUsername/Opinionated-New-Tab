import { load, save, generateId, exportData, importData } from "./store.js";

let state = null;
let selectedTaskIndex = -1;
let undoStack = [];
let countdownInterval = null;
let clockInterval = null;
let busy = false;

async function init() {
  state = await load();
  renderDayContext();
  renderClock();
  renderTasks();
  renderProjects();
  renderCountdown();
  updateToggleCompletedBtn();
  bindEvents();
  bindKeyboard();
  clockInterval = setInterval(renderClock, 1000);
  countdownInterval = setInterval(renderCountdown, 1000);
}

function guard(fn) {
  return async (...args) => {
    if (busy) return;
    busy = true;
    try { await fn(...args); } finally { busy = false; }
  };
}

function renderDayContext() {
  const el = document.getElementById("day-context");
  if (!el) return;
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  const rest = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  el.textContent = `${day} \u2022 ${rest}`;
}

function renderClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function getVisibleTasks() {
  const showCompleted = state.settings.showCompletedTasks;
  return state.tasks.filter(t => showCompleted || !t.completedAt);
}

function clampSelection() {
  const visible = getVisibleTasks();
  if (visible.length === 0) {
    selectedTaskIndex = -1;
  } else if (selectedTaskIndex >= visible.length) {
    selectedTaskIndex = visible.length - 1;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTasks() {
  const list = document.getElementById("task-list");
  if (!list) return;
  list.innerHTML = "";
  const tasks = getVisibleTasks();

  if (tasks.length === 0) {
    list.innerHTML = `<li class="text-xs opacity-40 py-2">No tasks yet. Press <kbd class="kbd kbd-xs">/</kbd> to add one.</li>`;
    return;
  }

  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    const isCompleted = !!task.completedAt;
    const isSelected = i === selectedTaskIndex;
    li.className = `group flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none ${isSelected ? "task-selected" : "hover:bg-base-100/50"} ${isCompleted ? "opacity-40" : ""}`;
    li.dataset.index = i;
    li.dataset.id = task.id;
    li.tabIndex = isSelected ? 0 : -1;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", isSelected ? "true" : "false");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = isCompleted;
    cb.className = "checkbox checkbox-xs checkbox-primary focus-ring";
    cb.tabIndex = -1;
    cb.addEventListener("change", guardedToggleTask.bind(null, task.id));

    const span = document.createElement("span");
    span.className = `flex-1 text-sm truncate ${isCompleted ? "line-through" : ""}`;
    span.textContent = task.text;

    const delBtn = document.createElement("button");
    delBtn.className = "group-action btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-error focus-ring";
    delBtn.textContent = "\u00d7";
    delBtn.tabIndex = -1;
    delBtn.addEventListener("click", (e) => { e.stopPropagation(); guardedDeleteTask(task.id); });

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(delBtn);
    li.addEventListener("click", () => { selectedTaskIndex = i; guardedToggleTask(task.id); });
    list.appendChild(li);

    if (isSelected) {
      li.scrollIntoView({ block: "nearest" });
    }
  });
}

function updateToggleCompletedBtn() {
  const btn = document.getElementById("toggle-completed");
  if (!btn) return;
  const completedCount = state.tasks.filter(t => t.completedAt).length;
  btn.textContent = state.settings.showCompletedTasks
    ? `Hide completed (${completedCount})`
    : `Show completed (${completedCount})`;
}

async function addTask(text) {
  if (!text.trim()) return;
  const task = {
    id: generateId("t"),
    text: text.trim(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    order: state.tasks.length > 0 ? state.tasks[0].order - 1000 : 0,
  };
  state.tasks.unshift(task);
  await save(state);
  selectedTaskIndex = 0;
  renderTasks();
  updateToggleCompletedBtn();
}

async function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  pushUndo("toggle", { id, prev: task.completedAt });
  task.completedAt = task.completedAt ? null : new Date().toISOString();
  await save(state);
  clampSelection();
  renderTasks();
  updateToggleCompletedBtn();
}

async function deleteTask(id) {
  const idx = state.tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const removed = state.tasks.splice(idx, 1)[0];
  pushUndo("delete", { task: removed, index: idx });
  await save(state);
  clampSelection();
  renderTasks();
  updateToggleCompletedBtn();
  showUndoToast(`Deleted "${removed.text}"`);
}

const guardedToggleTask = guard(toggleTask);
const guardedDeleteTask = guard(deleteTask);
const guardedAddTask = guard(addTask);

function pushUndo(type, data) {
  undoStack.push({ type, data });
  if (undoStack.length > 20) undoStack.shift();
}

async function undo() {
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  if (action.type === "delete") {
    state.tasks.splice(action.data.index, 0, action.data.task);
  } else if (action.type === "delete-project") {
    state.projects.splice(action.data.index, 0, action.data.project);
  } else if (action.type === "toggle") {
    const task = state.tasks.find(t => t.id === action.data.id);
    if (task) task.completedAt = action.data.prev;
  }
  await save(state);
  clampSelection();
  renderTasks();
  renderProjects();
  updateToggleCompletedBtn();
  hideUndoToast();
}

const guardedUndo = guard(undo);

let undoToastTimer = null;
let undoToastHandler = null;

function showUndoToast(msg) {
  const toast = document.getElementById("undo-toast");
  if (!toast) return;
  toast.querySelector("span").textContent = msg;
  toast.classList.remove("hidden");

  if (undoToastTimer) clearTimeout(undoToastTimer);

  const undoBtn = toast.querySelector("button");
  if (undoToastHandler) undoBtn.removeEventListener("click", undoToastHandler);
  undoToastHandler = () => guardedUndo();
  undoBtn.addEventListener("click", undoToastHandler);

  undoToastTimer = setTimeout(() => hideUndoToast(), 5000);
}

function hideUndoToast() {
  const toast = document.getElementById("undo-toast");
  if (!toast) return;
  toast.classList.add("hidden");
  if (undoToastTimer) { clearTimeout(undoToastTimer); undoToastTimer = null; }
  const undoBtn = toast.querySelector("button");
  if (undoToastHandler) { undoBtn.removeEventListener("click", undoToastHandler); undoToastHandler = null; }
}

function renderProjects() {
  const container = document.getElementById("projects-list");
  if (!container) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const active = state.projects
    .filter(p => p.startDate <= today && p.endDate >= today)
    .sort((a, b) => a.endDate.localeCompare(b.endDate));

  container.innerHTML = "";

  if (active.length === 0) {
    container.innerHTML = `<div class="text-xs opacity-40 py-2">No active projects. Press <kbd class="kbd kbd-xs">t</kbd> to open Timeline.</div>`;
    return;
  }

  active.forEach(p => {
    const end = new Date(p.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const color = p.color || "#7dd3fc";
    const div = document.createElement("div");
    div.className = "group flex items-center gap-2 px-2 py-1 rounded hover:bg-base-100/50";

    const dot = document.createElement("span");
    dot.className = "w-2 h-2 rounded-full flex-shrink-0";
    dot.style.background = color;

    const name = document.createElement("span");
    name.className = "flex-1 text-sm truncate";
    name.textContent = p.name;

    const endLabel = document.createElement("span");
    endLabel.className = "text-xs opacity-50 font-mono";
    endLabel.textContent = `ends ${end}`;

    const delBtn = document.createElement("button");
    delBtn.className = "group-action btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-error text-sm px-1 focus-ring";
    delBtn.textContent = "\u00d7";
    delBtn.addEventListener("click", (e) => { e.stopPropagation(); guardedDeleteProject(p.id); });

    div.appendChild(dot);
    div.appendChild(name);
    div.appendChild(endLabel);
    div.appendChild(delBtn);
    container.appendChild(div);
  });


}

async function deleteProject(id) {
  const idx = state.projects.findIndex(p => p.id === id);
  if (idx === -1) return;
  const removed = state.projects.splice(idx, 1)[0];
  pushUndo("delete-project", { project: removed, index: idx });
  await save(state);
  renderProjects();
  showUndoToast(`Deleted "${removed.name}"`);
}

const guardedDeleteProject = guard(deleteProject);

function renderCountdown() {
  const cd = state.settings.countdown;
  const labelEl = document.getElementById("countdown-label");
  const remainingEl = document.getElementById("countdown-remaining");
  const targetEl = document.getElementById("countdown-target");
  if (!labelEl || !remainingEl || !targetEl) return;

  remainingEl.onclick = null;

  if (!cd || !cd.targetIso) {
    labelEl.textContent = "";
    remainingEl.textContent = "Set countdown";
    remainingEl.className = "text-lg opacity-50 cursor-pointer";
    remainingEl.onclick = openCountdownEdit;
    targetEl.textContent = "";
    return;
  }

  const target = new Date(cd.targetIso);
  if (isNaN(target.getTime())) {
    labelEl.textContent = cd.label || "";
    remainingEl.textContent = "Invalid date";
    remainingEl.className = "text-lg opacity-50 cursor-pointer text-warning";
    remainingEl.onclick = openCountdownEdit;
    targetEl.textContent = "";
    return;
  }

  labelEl.textContent = cd.label || "";
  targetEl.textContent = target.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const diff = target - new Date();
  if (diff <= 0) {
    remainingEl.textContent = "Reached";
    remainingEl.className = "text-3xl font-mono tabular-nums font-bold text-success";
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  remainingEl.textContent = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  remainingEl.className = "text-3xl font-mono tabular-nums font-bold";
}

function openCountdownEdit() {
  const modal = document.getElementById("countdown-modal");
  const labelInput = document.getElementById("countdown-label-input");
  const targetInput = document.getElementById("countdown-target-input");
  if (!modal || !labelInput || !targetInput) return;

  const cd = state.settings.countdown;
  labelInput.value = cd?.label || "";
  if (cd?.targetIso) {
    const d = new Date(cd.targetIso);
    if (!isNaN(d.getTime())) {
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      targetInput.value = local;
    } else {
      targetInput.value = "";
    }
  } else {
    targetInput.value = "";
  }
  modal.showModal();
  labelInput.focus();
}

async function saveCountdown() {
  const labelInput = document.getElementById("countdown-label-input");
  const targetInput = document.getElementById("countdown-target-input");
  if (!labelInput || !targetInput) return;

  let targetIso = null;
  if (targetInput.value) {
    const parsed = new Date(targetInput.value);
    if (!isNaN(parsed.getTime())) {
      targetIso = parsed.toISOString();
    }
  }

  state.settings.countdown = {
    label: labelInput.value.trim() || "Countdown",
    targetIso,
  };
  await save(state);
  renderCountdown();
  document.getElementById("countdown-modal")?.close();
}

function isModalOrOverlayOpen() {
  const helpOverlay = document.getElementById("help-overlay");
  const modal = document.getElementById("countdown-modal");
  if (helpOverlay && !helpOverlay.classList.contains("hidden")) return true;
  if (modal && modal.open) return true;
  return false;
}

function bindEvents() {
  const quickAdd = document.getElementById("quick-add");
  if (quickAdd) {
    quickAdd.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        guardedAddTask(quickAdd.value);
        quickAdd.value = "";
      }
      if (e.key === "Escape") {
        quickAdd.blur();
      }
    });
  }

  const toggleBtn = document.getElementById("toggle-completed");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      state.settings.showCompletedTasks = !state.settings.showCompletedTasks;
      await save(state);
      selectedTaskIndex = -1;
      renderTasks();
      updateToggleCompletedBtn();
    });
  }

  const editBtn = document.getElementById("countdown-edit-btn");
  if (editBtn) editBtn.addEventListener("click", openCountdownEdit);

  const saveBtn = document.getElementById("countdown-save-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveCountdown);

  const cancelBtn = document.getElementById("countdown-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", () => document.getElementById("countdown-modal")?.close());

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      const json = await exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ont-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const importBtn = document.getElementById("import-btn");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          await importData(text);
          state = await load();
          selectedTaskIndex = -1;
          undoStack = [];
          renderTasks();
          renderProjects();
          renderCountdown();
          updateToggleCompletedBtn();
        } catch (err) {
          alert("Import failed: " + err.message);
        }
      });
      input.click();
    });
  }

  const timelineLink = document.getElementById("timeline-link");
  if (timelineLink) {
    timelineLink.addEventListener("click", (e) => {
      e.preventDefault();
      openTimeline();
    });
  }
}

function openTimeline() {
  const url = new URL("timeline/timeline.html", location.href.replace(/newtab\/.*$/, ""));
  window.location.href = url.toString();
}

function isInputFocused() {
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function bindKeyboard() {
  document.addEventListener("keydown", (e) => {
    const helpOverlay = document.getElementById("help-overlay");
    const modal = document.getElementById("countdown-modal");

    if (e.key === "Escape") {
      if (helpOverlay && !helpOverlay.classList.contains("hidden")) {
        helpOverlay.classList.add("hidden");
        return;
      }
      if (modal && modal.open) {
        modal.close();
        return;
      }
      if (isInputFocused()) {
        document.activeElement.blur();
        return;
      }
      return;
    }

    if (isInputFocused()) return;
    if (isModalOrOverlayOpen()) return;

    if (e.key === "/") {
      e.preventDefault();
      document.getElementById("quick-add")?.focus();
      return;
    }

    if (e.key === "t") {
      openTimeline();
      return;
    }

    if (e.key === "c") {
      openCountdownEdit();
      return;
    }

    if (e.key === "?") {
      if (helpOverlay) helpOverlay.classList.toggle("hidden");
      return;
    }

    if (e.key === "u") {
      guardedUndo();
      return;
    }

    const visibleTasks = getVisibleTasks();

    if (e.key === "Tab" && !e.shiftKey && selectedTaskIndex < 0 && visibleTasks.length > 0) {
      e.preventDefault();
      selectedTaskIndex = 0;
      renderTasks();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (visibleTasks.length === 0) return;
      selectedTaskIndex = Math.min(selectedTaskIndex + 1, visibleTasks.length - 1);
      if (selectedTaskIndex < 0) selectedTaskIndex = 0;
      renderTasks();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (visibleTasks.length === 0) return;
      selectedTaskIndex = Math.max(selectedTaskIndex - 1, 0);
      renderTasks();
      return;
    }

    if (e.key === " " && selectedTaskIndex >= 0 && selectedTaskIndex < visibleTasks.length) {
      e.preventDefault();
      guardedToggleTask(visibleTasks[selectedTaskIndex].id);
      return;
    }

    if (e.key === "Backspace" && selectedTaskIndex >= 0 && selectedTaskIndex < visibleTasks.length) {
      e.preventDefault();
      guardedDeleteTask(visibleTasks[selectedTaskIndex].id);
      return;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
