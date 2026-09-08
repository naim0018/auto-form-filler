/* Shared by the popup and background. No network requests or remote code. */
globalThis.affDefaults = { country: "US" };
globalThis.affRun = async function (tabId, options) {
  if (!Number.isInteger(tabId)) throw new Error("Open a website with a form first.");
  await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files: ["filler.js"] });
  const frames = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: async (settings) => globalThis.autoFormFiller.fill(settings),
    args: [options]
  });
  return frames.reduce((total, frame) => {
    if (frame.error) throw new Error("A frame could not be filled. Try filling the embedded form in its own tab.");
    for (const key of Object.keys(total)) total[key] += frame.result?.[key] || 0;
    return total;
  }, { filled: 0, invalid: 0, unsupported: 0 });
};
