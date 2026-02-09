import { load, save, generateId } from "../newtab/store.js";

let state = null;
let selectedProjectId = null;
let dragState = null;

const DAY_WIDTH = 36;
const ROW_HEIGHT = 36;
const COLORS = [
  "#7dd3fc", "#93c5fd", "#a5b4fc", "#c4b5fd",
  "#f0abfc", "#fda4af", "#fca5a5", "#fdba74",
  "#fcd34d", "#bef264", "#86efac", "#5eead4",
];

async function init() {
  state = await load();
  render();
  bindEvents();
  bindKeyboard();
}

function getVisibleRange() {
  const projects = state.projects.filter(p => !p.archivedAt);
  const today = new Date();
  let minDate = new Date(today);
  let maxDate = new Date(today);

  minDate.setDate(minDate.getDate() - 14);
  maxDate.setDate(maxDate.getDate() + 60);

  projects.forEach(p => {
    const s = new Date(p.startDate);
    const e = new Date(p.endDate);
    if (s < minDate) minDate = new Date(s.getTime() - 7 * 86400000);
    if (e > maxDate) maxDate = new Date(e.getTime() + 14 * 86400000);
  });

  const days = [];
  const d = new Date(minDate);
  while (d <= maxDate) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function render() {
  renderProjectList();
  renderTimeline();
}

function renderProjectList() {
  const list = document.getElementById("project-list");
  if (!list) return;
  const projects = state.projects.filter(p => !p.archivedAt);
  list.innerHTML = "";

  if (projects.length === 0) {
    list.innerHTML = `<li class="text-xs opacity-40 px-2 py-3">No projects yet.</li>`;
    return;
  }

  projects.forEach(p => {
    const li = document.createElement("li");
    const isSelected = p.id === selectedProjectId;
    li.className = `flex items-center gap-2 px-2 py-1.5 cursor-pointer select-none text-sm ${isSelected ? "bg-base-100 ring-1 ring-primary/40" : "hover:bg-base-100/50"}`;
    li.dataset.id = p.id;

    const dot = document.createElement("span");
    dot.className = "w-2 h-2 rounded-full flex-shrink-0";
    dot.style.background = p.color || "#7dd3fc";

    const name = document.createElement("span");
    name.className = "flex-1 truncate";
    name.textContent = p.name;

    li.appendChild(dot);
    li.appendChild(name);
    li.addEventListener("click", () => {
      selectedProjectId = p.id;
      renderProjectList();
    });
    li.addEventListener("dblclick", () => openEditProject(p.id));
    list.appendChild(li);
  });
}

function renderTimeline() {
  const header = document.getElementById("timeline-header");
  const body = document.getElementById("timeline-body");
  if (!header || !body) return;

  const days = getVisibleRange();
  const projects = state.projects.filter(p => !p.archivedAt);
  const totalWidth = days.length * DAY_WIDTH;

  const todayStr = toDateStr(new Date());
  const sidebarWidth = 0;

  let headerHtml = `<div class="flex" style="width:${totalWidth}px;min-width:100%">`;
  let currentMonth = "";
  let monthStart = 0;
  let monthCells = "";

  days.forEach((day, i) => {
    const m = formatMonthLabel(day);
    if (m !== currentMonth) {
      if (currentMonth) {
        const mw = (i - monthStart) * DAY_WIDTH;
        monthCells += `<div class="inline-flex items-center border-r border-base-content/10 text-xs font-semibold opacity-50 px-1 uppercase tracking-wider" style="width:${mw}px">${currentMonth}</div>`;
      }
      currentMonth = m;
      monthStart = i;
    }
  });
  if (currentMonth) {
    const mw = (days.length - monthStart) * DAY_WIDTH;
    monthCells += `<div class="inline-flex items-center border-r border-base-content/10 text-xs font-semibold opacity-50 px-1 uppercase tracking-wider" style="width:${mw}px">${currentMonth}</div>`;
  }

  headerHtml += `<div class="flex h-6">${monthCells}</div></div>`;

  let dayRow = `<div class="flex" style="width:${totalWidth}px;min-width:100%">`;
  days.forEach(day => {
    const ds = toDateStr(day);
    const isToday = ds === todayStr;
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const dayNum = day.getDate();
    dayRow += `<div class="flex items-center justify-center text-[10px] font-mono border-r border-base-content/5 ${isToday ? "text-primary font-bold" : isWeekend ? "opacity-30" : "opacity-50"}" style="width:${DAY_WIDTH}px;min-width:${DAY_WIDTH}px">${dayNum}</div>`;
  });
  dayRow += `</div>`;

  header.innerHTML = `<div class="overflow-hidden">${headerHtml}${dayRow}</div>`;

  let bodyHtml = `<div class="relative" style="width:${totalWidth}px;min-width:100%;height:${Math.max(projects.length * ROW_HEIGHT + 20, 200)}px">`;

  const todayIdx = days.findIndex(d => toDateStr(d) === todayStr);
  if (todayIdx >= 0) {
    bodyHtml += `<div class="absolute top-0 bottom-0 border-l-2 border-primary/30 z-0" style="left:${todayIdx * DAY_WIDTH + DAY_WIDTH / 2}px"></div>`;
  }

  days.forEach((day, i) => {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    if (isWeekend) {
      bodyHtml += `<div class="absolute top-0 bottom-0 bg-base-content/[0.02]" style="left:${i * DAY_WIDTH}px;width:${DAY_WIDTH}px"></div>`;
    }
  });

  projects.forEach((p, rowIdx) => {
    const startIdx = days.findIndex(d => toDateStr(d) === p.startDate);
    const endIdx = days.findIndex(d => toDateStr(d) === p.endDate);
    if (startIdx < 0 && endIdx < 0) return;

    const si = Math.max(startIdx, 0);
    const ei = endIdx >= 0 ? endIdx : days.length - 1;
    const left = si * DAY_WIDTH + DAY_WIDTH / 2;
    const width = Math.max((ei - si) * DAY_WIDTH, DAY_WIDTH / 2);
    const top = rowIdx * ROW_HEIGHT + 8;
    const color = p.color || "#7dd3fc";

    bodyHtml += `<div class="absolute flex items-center group" style="left:${left}px;width:${width}px;top:${top}px;height:20px" data-project-id="${p.id}">`;

    bodyHtml += `<div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full cursor-ew-resize z-10 border-2 border-base-300 hover:scale-125 transition-transform drag-handle-start" style="background:${color}" data-handle="start" data-project-id="${p.id}"></div>`;

    bodyHtml += `<div class="w-full h-1.5 rounded-full opacity-70 group-hover:opacity-100 cursor-pointer transition-opacity bar-segment" style="background:${color}" data-project-id="${p.id}"></div>`;

    bodyHtml += `<div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full cursor-ew-resize z-10 border-2 border-base-300 hover:scale-125 transition-transform drag-handle-end" style="background:${color}" data-handle="end" data-project-id="${p.id}"></div>`;

    bodyHtml += `<div class="absolute left-1/2 -translate-x-1/2 -top-4 text-[10px] opacity-0 group-hover:opacity-80 pointer-events-none whitespace-nowrap font-mono">${p.name}</div>`;

    bodyHtml += `</div>`;
  });

  bodyHtml += `</div>`;
  body.innerHTML = bodyHtml;

  syncScroll();
  bindDragHandles();
  bindBarClicks();
}

function syncScroll() {
  const header = document.getElementById("timeline-header");
  const body = document.getElementById("timeline-body");
  if (!header || !body) return;
  body.addEventListener("scroll", () => {
    header.scrollLeft = body.scrollLeft;
  });
}

function bindDragHandles() {
  const body = document.getElementById("timeline-body");
  if (!body) return;

  body.querySelectorAll("[data-handle]").forEach(handle => {
    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const projectId = handle.dataset.projectId;
      const handleType = handle.dataset.handle;
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;

      dragState = {
        projectId,
        handleType,
        startX: e.clientX,
        origStart: project.startDate,
        origEnd: project.endDate,
      };

      document.addEventListener("mousemove", onDragMove);
      document.addEventListener("mouseup", onDragEnd);
    });
  });
}

function onDragMove(e) {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const daysDelta = Math.round(dx / DAY_WIDTH);
  if (daysDelta === 0) return;

  const project = state.projects.find(p => p.id === dragState.projectId);
  if (!project) return;

  if (dragState.handleType === "start") {
    const newStart = addDays(dragState.origStart, daysDelta);
    if (newStart < project.endDate) {
      project.startDate = newStart;
    }
  } else {
    const newEnd = addDays(dragState.origEnd, daysDelta);
    if (newEnd > project.startDate) {
      project.endDate = newEnd;
    }
  }

  renderTimeline();
}

async function onDragEnd() {
  document.removeEventListener("mousemove", onDragMove);
  document.removeEventListener("mouseup", onDragEnd);
  if (dragState) {
    dragState = null;
    await save(state);
  }
}

function bindBarClicks() {
  const body = document.getElementById("timeline-body");
  if (!body) return;

  body.querySelectorAll(".bar-segment").forEach(bar => {
    bar.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      openEditProject(bar.dataset.projectId);
    });
    bar.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedProjectId = bar.dataset.projectId;
      renderProjectList();
    });
  });
}

function openNewProject() {
  const modal = document.getElementById("project-modal");
  document.getElementById("project-modal-title").textContent = "New Project";
  document.getElementById("project-edit-id").value = "";
  document.getElementById("project-name-input").value = "";

  const today = toDateStr(new Date());
  const twoWeeks = addDays(today, 14);
  document.getElementById("project-start-input").value = today;
  document.getElementById("project-end-input").value = twoWeeks;

  document.getElementById("project-delete-btn").classList.add("hidden");
  renderColorPicker(COLORS[Math.floor(Math.random() * COLORS.length)]);
  modal.showModal();
  document.getElementById("project-name-input").focus();
}

function openEditProject(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById("project-modal");
  document.getElementById("project-modal-title").textContent = "Edit Project";
  document.getElementById("project-edit-id").value = project.id;
  document.getElementById("project-name-input").value = project.name;
  document.getElementById("project-start-input").value = project.startDate;
  document.getElementById("project-end-input").value = project.endDate;
  document.getElementById("project-delete-btn").classList.remove("hidden");
  renderColorPicker(project.color || "#7dd3fc");
  modal.showModal();
  document.getElementById("project-name-input").focus();
}

function renderColorPicker(activeColor) {
  const container = document.getElementById("color-picker");
  if (!container) return;
  container.innerHTML = COLORS.map(c => {
    const isActive = c === activeColor;
    return `<button type="button" data-color="${c}" class="w-5 h-5 rounded-full border-2 transition-transform ${isActive ? "border-white scale-110" : "border-transparent hover:scale-110"}" style="background:${c}"></button>`;
  }).join("");

  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("button").forEach(b => {
        b.classList.remove("border-white", "scale-110");
        b.classList.add("border-transparent");
      });
      btn.classList.add("border-white", "scale-110");
      btn.classList.remove("border-transparent");
    });
  });
}

function getSelectedColor() {
  const active = document.querySelector("#color-picker button.border-white");
  return active ? active.dataset.color : COLORS[0];
}

async function saveProject() {
  const id = document.getElementById("project-edit-id").value;
  const name = document.getElementById("project-name-input").value.trim();
  const startDate = document.getElementById("project-start-input").value;
  const endDate = document.getElementById("project-end-input").value;
  const color = getSelectedColor();

  if (!name) return;
  if (!startDate || !endDate) return;
  if (startDate > endDate) return;

  if (id) {
    const project = state.projects.find(p => p.id === id);
    if (project) {
      project.name = name;
      project.startDate = startDate;
      project.endDate = endDate;
      project.color = color;
    }
  } else {
    state.projects.push({
      id: generateId("p"),
      name,
      startDate,
      endDate,
      archivedAt: null,
      color,
    });
  }

  await save(state);
  document.getElementById("project-modal").close();
  render();
}

async function deleteProject() {
  const id = document.getElementById("project-edit-id").value;
  if (!id) return;

  const idx = state.projects.findIndex(p => p.id === id);
  if (idx === -1) return;

  state.projects[idx].archivedAt = new Date().toISOString();
  await save(state);
  document.getElementById("project-modal").close();
  if (selectedProjectId === id) selectedProjectId = null;
  render();
}

function goToDashboard() {
  const url = new URL("newtab/newtab.html", location.href.replace(/timeline\/.*$/, ""));
  window.location.href = url.toString();
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function isInputFocused() {
  const el = document.activeElement;
  return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

function bindEvents() {
  document.getElementById("new-project-btn")?.addEventListener("click", openNewProject);
  document.getElementById("back-link")?.addEventListener("click", (e) => { e.preventDefault(); goToDashboard(); });
  document.getElementById("project-save-btn")?.addEventListener("click", saveProject);
  document.getElementById("project-cancel-btn")?.addEventListener("click", () => document.getElementById("project-modal")?.close());
  document.getElementById("project-delete-btn")?.addEventListener("click", deleteProject);
}

function bindKeyboard() {
  document.addEventListener("keydown", (e) => {
    const helpOverlay = document.getElementById("help-overlay");
    const modal = document.getElementById("project-modal");

    if (e.key === "Escape") {
      if (helpOverlay && !helpOverlay.classList.contains("hidden")) {
        helpOverlay.classList.add("hidden");
        return;
      }
      if (modal && modal.open) {
        modal.close();
        return;
      }
    }

    if (isInputFocused()) {
      if (e.key === "Enter" && modal && modal.open) {
        e.preventDefault();
        saveProject();
      }
      return;
    }

    if (e.key === "n") {
      openNewProject();
      return;
    }

    if (e.key === "b") {
      goToDashboard();
      return;
    }

    if (e.key === "?") {
      if (helpOverlay) helpOverlay.classList.toggle("hidden");
      return;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
