const button = document.querySelector("#fill");
const status = document.querySelector("#status");
const country = document.getElementById("country");
const settings = () => ({ country: country.value });
function showError(error) {
  status.className = "error";
  status.textContent = /cannot access|missing host permission|extensions gallery|cannot be scripted|restricted|receiving end/i.test(error.message)
    ? "This page blocks extensions. Open a regular website. For local HTML files, enable ‘Allow access to file URLs’ in extension details."
    : error.message;
}
(async () => {
  try {
    const saved = await chrome.storage.local.get(affDefaults);
    country.value = saved.country;
    if (!country.value) country.value = "US";
    await chrome.storage.local.remove(["overwrite", "selects", "checkboxes"]);
    country.addEventListener("change", () => chrome.storage.local.set(settings()).catch(showError));
    status.textContent = "Ready. Existing values are replaced. Required boxes stay checked.";
    button.disabled = false;
  } catch (error) { showError(error); }
})();
button.addEventListener("click", async () => {
  button.disabled = true;
  status.className = "";
  status.textContent = "Finding fields and selecting options…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await affRun(tab?.id, settings());
    status.textContent = result.filled ? `Filled ${result.filled} fields.` : "No supported fields needed a change.";
    if (result.invalid) status.textContent += ` ${result.invalid} fields need review for validation.`;
    if (result.unsupported) status.textContent += ` ${result.unsupported} controls had no matching or supported option.`;
  } catch (error) { showError(error); }
  finally { button.disabled = false; }
});
