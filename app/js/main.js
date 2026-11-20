// Vice Ledger — boot, routing, events and keyboard shortcuts.
// URL parameters (for screenshots and deep links): ?seed=13 earns a fixed
// early-game set, ?view=roadmap|missables|planner|chapters|save picks the
// section, ?detail=<id> opens a trophy, ?spoilers=on turns the spoiler
// setting on. Everything else is local state.

import { loadTrophies, SEED_EARNED } from "./data.js";
import {
  loadState, saveState, toggleEarned, setProgress, setNote,
  exportText, parseImport, download, STORAGE_KEY,
} from "./store.js";
import {
  renderChecklist, renderChapters, renderRoadmap, renderMissables,
  renderPlanner, renderSave, headerStats, trophyById,
} from "./views.js";

const VIEWS = ["checklist", "chapters", "roadmap", "missables", "planner", "save"];

const state = loadState();
let trophies = [];
const ui = {
  view: "checklist",
  q: "",
  kind: "all",
  grade: "all",
  sort: "roadmap",
  selected: null,
  sessionMinutes: 120,
};

function applyParams() {
  const params = new URLSearchParams(location.search);
  if (params.get("seed") === "13") {
    state.earned = SEED_EARNED.slice();
    state.progress = { 15: 41, 31: 23, 35: 57 };
    state.notes = {};
    saveState(state);
  }
  if (params.get("spoilers") === "on") {
    state.spoiler = true;
    saveState(state);
  }
  const view = params.get("view");
  if (view && VIEWS.includes(view)) ui.view = view;
  const detail = Number(params.get("detail"));
  if (Number.isInteger(detail) && detail >= 1 && detail <= 55) ui.selected = detail;
}

function renderHeader() {
  const stats = headerStats(trophies, state);
  document.getElementById("earnedCount").textContent = String(stats.earned);
  document.getElementById("gradeLine").innerHTML = stats.gradeLine;
  document.getElementById("forecastLine").textContent =
    "Platinum forecast: about " + Math.round(stats.forecast.left) +
    " h of play left by our per-trophy model (about " + Math.round(stats.forecast.total) +
    " h in total; PowerPyx says about 200 h, Push Square 250+ h).";
  const fill = document.getElementById("progressFill");
  fill.style.width = Math.round((stats.earned / 55) * 100) + "%";
  fill.parentElement.setAttribute("aria-valuenow", String(stats.earned));
  const plat = document.getElementById("platState");
  plat.textContent = state.earned.includes(1)
    ? "Platinum earned — you are a Leonida Legend."
    : "Platinum locked — earn the other 54.";
  const toggle = document.getElementById("spoilerToggle");
  toggle.textContent = "Spoilers: " + (state.spoiler ? "on" : "off");
  toggle.setAttribute("aria-pressed", String(state.spoiler));
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === ui.view);
  });
}

function render() {
  renderHeader();
  const view = document.getElementById("view");
  if (ui.view === "checklist") view.innerHTML = renderChecklist(trophies, state, ui);
  else if (ui.view === "chapters") view.innerHTML = renderChapters(trophies, state);
  else if (ui.view === "roadmap") view.innerHTML = renderRoadmap(trophies, state);
  else if (ui.view === "missables") view.innerHTML = renderMissables(trophies, state);
  else if (ui.view === "planner") view.innerHTML = renderPlanner(trophies, state, ui);
  else view.innerHTML = renderSave(trophies, state);
  const exportBox = document.getElementById("exportBox");
  if (exportBox) exportBox.value = exportText(state);
}

function rerenderKeepFocus() {
  const active = document.activeElement;
  const wasSearch = active && active.id === "searchBox";
  render();
  if (wasSearch) {
    const search = document.getElementById("searchBox");
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  }
}

function bindEvents() {
  document.getElementById("spoilerToggle").addEventListener("click", () => {
    state.spoiler = !state.spoiler;
    saveState(state);
    render();
  });
  document.getElementById("exportBtn").addEventListener("click", () => {
    download("vice-ledger-save.json", exportText(state));
  });
  document.getElementById("importFile").addEventListener("change", async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const next = parseImport(text);
      Object.assign(state, next);
      saveState(state);
      render();
    } catch (err) {
      alert("That file is not a Vice Ledger save.");
    }
    ev.target.value = "";
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      ui.view = tab.dataset.view;
      render();
    });
  });

  document.getElementById("view").addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    const id = Number(el.dataset.id);
    if (action === "toggle") {
      toggleEarned(state, id);
      render();
    } else if (action === "select") {
      ui.selected = id;
      if (ui.view !== "checklist") ui.view = "checklist";
      render();
    } else if (action === "kind") {
      ui.kind = el.dataset.value;
      render();
    } else if (action === "session") {
      ui.sessionMinutes = Number(el.dataset.value);
      render();
    } else if (action === "count-up" || action === "count-down") {
      const t = trophyById(trophies, id);
      if (!t || t.target == null) return;
      const cur = state.progress[id] || 0;
      const next = action === "count-up"
        ? Math.min(t.target, cur + 1)
        : Math.max(0, cur - 1);
      setProgress(state, id, next);
      render();
    } else if (action === "export") {
      download("vice-ledger-save.json", exportText(state));
    } else if (action === "import") {
      const box = document.getElementById("importBox");
      const msg = document.getElementById("importMsg");
      try {
        const next = parseImport(box.value);
        Object.assign(state, next);
        saveState(state);
        if (msg) msg.textContent = "Imported " + next.earned.length + " earned trophies.";
        render();
      } catch (err) {
        if (msg) msg.textContent = "Could not read that save — check it is the JSON this ledger exports.";
      }
    } else if (action === "reset") {
      if (confirm("Reset all progress, counters and notes in this browser?")) {
        localStorage.removeItem(STORAGE_KEY);
        const fresh = loadState();
        Object.assign(state, fresh);
        render();
      }
    }
  });

  document.getElementById("view").addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.id === "searchBox") {
      ui.q = el.value;
      rerenderKeepFocus();
    } else if (el.id === "counterInput") {
      const t = trophyById(trophies, Number(el.dataset.id));
      if (!t || t.target == null) return;
      setProgress(state, t.id, Math.min(t.target, Math.max(0, Number(el.value) || 0)));
      renderHeader();
    }
  });
  document.getElementById("view").addEventListener("change", (ev) => {
    const el = ev.target;
    if (el.id === "gradeFilter") {
      ui.grade = el.value;
      render();
    } else if (el.id === "sortFilter") {
      ui.sort = el.value;
      render();
    } else if (el.id === "noteBox") {
      setNote(state, Number(el.dataset.id), el.value);
    } else if (el.id === "counterInput") {
      render();
    }
  });

  document.addEventListener("keydown", (ev) => {
    const typing = ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "SELECT");
    if (ev.key === "/" && !typing) {
      ev.preventDefault();
      ui.view = "checklist";
      render();
      const search = document.getElementById("searchBox");
      if (search) search.focus();
      return;
    }
    if (typing) return;
    if (ev.key >= "1" && ev.key <= "6") {
      ui.view = VIEWS[Number(ev.key) - 1];
      render();
    } else if (ev.key === "s" || ev.key === "S") {
      state.spoiler = !state.spoiler;
      saveState(state);
      render();
    } else if (ev.key === "e" || ev.key === "E") {
      download("vice-ledger-save.json", exportText(state));
    }
  });
}

async function boot() {
  trophies = await loadTrophies();
  applyParams();
  bindEvents();
  render();
}

boot().catch((err) => {
  document.getElementById("view").innerHTML =
    '<p class="empty">Vice Ledger could not load its trophy data. Serve the app/ folder with a static server and open index.html again.</p>';
  console.error(err);
});
