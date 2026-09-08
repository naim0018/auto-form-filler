if (typeof importScripts === "function") importScripts("runner.js");
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "fill-form") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const options = await chrome.storage.local.get(affDefaults);
    const result = await affRun(tab?.id, options);
    await chrome.action.setBadgeBackgroundColor({ color: "#176b54", tabId: tab.id });
    await chrome.action.setBadgeText({ text: String(result.filled), tabId: tab.id });
    await chrome.action.setTitle({ title: `${result.filled} fields filled; ${result.invalid} need review`, tabId: tab.id });
  } catch (error) {
    if (tab?.id) {
      await chrome.action.setBadgeText({ text: "!", tabId: tab.id });
      await chrome.action.setTitle({ title: "Could not fill this page. Open the popup for details.", tabId: tab.id });
    }
    console.warn("Auto Form Filler:", error.message);
  }
});
