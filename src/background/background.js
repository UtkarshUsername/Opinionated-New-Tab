import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("ONT V1 installed");
});
