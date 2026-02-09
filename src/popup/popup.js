import browser from "webextension-polyfill";

function openDashboard() {
  browser.tabs.create({ url: browser.runtime.getURL("newtab/newtab.html") });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("open-dashboard");
  if (btn) btn.addEventListener("click", openDashboard);
});
