import assert from 'node:assert/strict';
import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const demo = await readFile(new URL('demo.html', import.meta.url));
const bundled = await build({ entryPoints: [fileURLToPath(new URL('fixtures/popover-app.tsx', import.meta.url))], bundle: true, write: false, format: 'iife', platform: 'browser' });
const popoverPage = '<!doctype html><html><head><meta charset="utf-8"><style>body{font:16px system-ui;padding:30px}form{width:500px}label{display:block;margin-top:20px}button{padding:12px}label+button{width:100%;display:flex;justify-content:space-between}svg{width:16px;height:16px}div[style] button{width:100%;display:flex;justify-content:space-between}output{display:block;margin-top:20px}</style></head><body><div id="root"></div><script src="/select-popover.js"></script></body></html>';
const server = createServer((req, res) => {
  res.setHeader('Content-Type', req.url === '/select-popover.js' ? 'text/javascript' : 'text/html');
  res.end(req.url === '/select-popover.js' ? bundled.outputFiles[0].contents : req.url === '/select-popover' ? popoverPage : demo);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = `http://127.0.0.1:${server.address().port}`;
const harness = new URL('test-results/extension-harness/', root);
await mkdir(harness, { recursive: true });
await mkdir(new URL('icons/', harness), { recursive: true });
for (const size of [16,32,48,128]) await copyFile(new URL(`icons/icon-${size}.png`, root), new URL(`icons/icon-${size}.png`, harness));
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
// Automated clicks cannot grant activeTab. Only this test copy gets localhost access.
manifest.host_permissions = ['http://127.0.0.1/*'];
await writeFile(new URL('manifest.json', harness), JSON.stringify(manifest));
for (const file of ['filler.js','runner.js','background.js','popup.html','popup.css','popup.js']) await copyFile(new URL(file, root), new URL(file, harness));
const extension = fileURLToPath(harness);
const launch = channel => chromium.launchPersistentContext('', { channel, headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] });
let context;
try { context = await launch(process.env.AFF_BROWSER || 'chromium'); }
catch (error) {
  if (process.env.AFF_BROWSER || process.platform !== 'win32') throw error;
  console.log('Bundled Chromium unavailable; testing with installed Microsoft Edge.');
  context = await launch('msedge');
}
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const extensionId = new URL(worker.url()).host;
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const run = async (settings = {}) => {
    await page.addScriptTag({ path: fileURLToPath(new URL('filler.js', root)) });
    return page.evaluate(options => autoFormFiller.fill(options), settings);
  };
  await page.goto(address);
  let result = await run();
  assert.equal(result.invalid, 0, JSON.stringify(await page.locator('input,textarea,select').evaluateAll(elements => elements.filter(el => el.willValidate && !el.validity.valid).map(el => ({ name: el.name, value: el.value, message: el.validationMessage })))));
  assert.equal(result.unsupported, 0);
  assert.ok(result.filled >= 24);
  assert.equal(await page.inputValue('[name=country]'), 'US');
  assert.equal(await page.inputValue('[name=state]'), 'MA');
  assert.equal(await page.inputValue('[name=city]'), 'Boston');
  assert.equal(await page.inputValue('[name=email]'), await page.inputValue('[name=confirmEmail]'));
  assert.equal(await page.inputValue('[name=password]'), await page.inputValue('[name=confirmPassword]'));
  assert.equal(await page.inputValue('[name=jobTitle]'), 'Software Engineer');
  assert.ok(['product','pricing'].includes(await page.inputValue('[name=topic]')));
  assert.ok(['Engineering','Support'].includes(await page.locator('#department').getAttribute('aria-valuetext')));
  assert.equal(await page.locator('input[type=radio]:checked').count(), 1);
  assert.equal(await page.locator('#terms').isChecked(), true);
  assert.equal(await page.locator('#disabledCheck').isChecked(), false);
  assert.notEqual(await page.inputValue('#existing'), 'Keep my original text');
  assert.equal(await page.inputValue('#readonly'), 'Do not change');
  assert.equal(await page.inputValue('#hidden'), 'secret');
  assert.equal(await page.inputValue('#hiddenText'), '');
  assert.equal(await page.evaluate(() => submitCount), 0);
  assert.ok(await page.evaluate(() => inputs > 10 && changes > 10));
  const previousTopic = await page.inputValue('[name=topic]');
  const previousDepartment = await page.locator('#department').getAttribute('aria-valuetext');
  const previousRadio = await page.locator('input[type=radio]:checked').inputValue();
  result = await run();
  assert.notEqual(await page.inputValue('[name=topic]'), previousTopic, 'Native dropdown must change when alternatives exist');
  assert.notEqual(await page.locator('#department').getAttribute('aria-valuetext'), previousDepartment, 'Custom dropdown must change when alternatives exist');
  assert.notEqual(await page.locator('input[type=radio]:checked').inputValue(), previousRadio);
  assert.ok(result.filled > 0, 'Repeated filling replaces populated fields');
  await page.screenshot({ path: fileURLToPath(new URL('test-results/filled-form.png', root)), fullPage: true });
  for (const country of ['BD', 'GB']) {
    await page.goto(address);
    result = await run({ country });
    assert.equal(result.invalid, 0);
    assert.equal(await page.inputValue('[name=country]'), country);
    assert.equal(await page.inputValue('[name=city]'), country === 'BD' ? 'ঢাকা' : 'London');
    assert.match(await page.inputValue('[name=phone]'), country === 'BD' ? /^01\d{9}$/ : /^07\d{9}$/);
  }
  await page.goto(address);
  await run({ selects: false, checkboxes: false });
  assert.equal(await page.inputValue('[name=country]'), 'US');
  assert.equal(await page.locator('input[type=radio]:checked').count(), 1);
  assert.equal(await page.locator('#terms').isChecked(), true);
  await page.goto(address);
  await page.fill('[name=password]', 'Existing!Password1');
  await page.fill('[name=email]', 'existing@example.com');
  await page.selectOption('[name=country]', 'BD');
  await run();
  assert.notEqual(await page.inputValue('[name=password]'), 'Existing!Password1');
  assert.notEqual(await page.inputValue('[name=email]'), 'existing@example.com');
  assert.equal(await page.inputValue('[name=confirmPassword]'), await page.inputValue('[name=password]'));
  assert.equal(await page.inputValue('[name=confirmEmail]'), await page.inputValue('[name=email]'));
  assert.equal(await page.inputValue('[name=city]'), 'Boston');
  await run({ overwrite: true });
  assert.notEqual(await page.inputValue('#existing'), 'Keep my original text');
  await page.goto(address);
  await page.evaluate(() => {
    const host = document.createElement('div'); document.body.append(host);
    host.attachShadow({mode:'open'}).innerHTML='<label>Email<input type="email" name="email" required></label>';
    const input = document.createElement('input'); input.name = 'email'; input.id = 'controlled';
    document.body.append(input); let tracked = '';
    Object.defineProperty(input, 'value', { get() { return HTMLInputElement.prototype.__lookupGetter__('value').call(this); }, set(value) { tracked = value; HTMLInputElement.prototype.__lookupSetter__('value').call(this,value); } });
    input.addEventListener('input', () => { window.nativeSetterWorked = tracked !== input.value; });
  });
  await run();
  assert.equal(await page.evaluate(() => nativeSetterWorked), true);
  assert.match(await page.locator('div >> input[name=email]').last().inputValue(), /@example\.com$/);
  // Screenshot regression: gamer IDs, social placeholders, and selective checkbox groups.
  await page.goto(address);
  await page.setContent(`<form>
    <label>User ID/ GamerTag<input id="gamer" name="field1" required></label>
    <label>ID<input id="identifier" required></label><label>Tag<input id="tag"></label>
    <input id="numericId" placeholder="Enter account ID" inputmode="numeric">
    <div id="socialChecks"><label><input type="checkbox" name="social" value="instagram">Instagram</label><label><input type="checkbox" name="social" value="facebook">Facebook</label><label><input type="checkbox" name="social" value="youtube">YouTube</label></div>
    <div id="interests"><label><input type="checkbox" name="interests" value="games">Games</label><label><input type="checkbox" name="interests" value="music">Music</label></div>
    <label><input type="checkbox" id="consent" required>Required agreement</label>
    <label><input type="checkbox" id="marketing">Optional newsletter</label>
    <label>Your Instagram Handle<input id="instagramHandle" name="value"></label>
    <label>Your TikTok Handle<input id="tiktokHandle"></label>
    <label>Your X (Twitter) Handle<input id="twitterHandle"></label>
    <label>Your Facebook Name<input id="facebookName"></label>
    <input id="youtubeHandle" name="value" placeholder="Enter Your YouTube Channel/Handle">
    <label>Link<input id="instagramUrl" name="url" placeholder="https://www.instagram.com/yourname"></label>
    <input id="youtubeUrl" type="url" placeholder="Enter your YouTube channel link" required>
    <input id="tiktokUrl" type="url" placeholder="TikTok profile URL" required>
    <input id="facebookUrl" type="url" placeholder="Facebook profile URL" required>
    <input id="twitterUrl" type="url" placeholder="X (Twitter) link" required>
    <input id="linkedinUrl" type="url" placeholder="LinkedIn URL" required>
    <label>Your email<input id="labelPriority" name="name" required type="email"></label>
    <fieldset id="ariaGroup"><legend>Genres</legend><button type="button" role="checkbox" aria-checked="false">Racing</button><button type="button" role="checkbox" aria-checked="false">Sports</button></fieldset>
  </form>`);
  await page.evaluate(() => document.querySelectorAll('[role=checkbox]').forEach(el => el.addEventListener('click', () => el.setAttribute('aria-checked', String(el.getAttribute('aria-checked') !== 'true')))));
  result = await run();
  assert.equal(result.invalid, 0);
  assert.match(await page.inputValue('#gamer'), /^PixelFalcon\d+$/);
  assert.match(await page.inputValue('#identifier'), /^USER\d+$/);
  assert.match(await page.inputValue('#numericId'), /^\d+$/);
  assert.equal(await page.inputValue('#tag'), 'gaming');
  assert.ok(await page.locator('#socialChecks input:checked').count() >= 1);
  assert.ok(await page.locator('#interests input:checked').count() >= 1);
  assert.equal(await page.locator('#consent').isChecked(), true);
  assert.ok(await page.locator('#ariaGroup [aria-checked=true]').count() >= 1);
  for (const platform of ['instagram','tiktok','twitter','youtube']) assert.match(await page.inputValue(`#${platform}Handle`), /^@[a-z0-9]+$/);
  assert.match(await page.inputValue('#facebookName'), /^[A-Z][a-z]+ [A-Z][a-z]+$/);
  for (const [platform, domain] of Object.entries({instagram:'www.instagram.com',youtube:'www.youtube.com',tiktok:'www.tiktok.com',facebook:'www.facebook.com',twitter:'x.com',linkedin:'www.linkedin.com'})) {
    const url = new URL(await page.inputValue(`#${platform}Url`));
    assert.equal(url.protocol, 'https:'); assert.equal(url.hostname, domain); assert.ok(url.pathname.length > 1);
  }
  assert.match(await page.inputValue('#labelPriority'), /@example\.com$/);
  await page.evaluate(() => { window.originalRandom = Math.random; Math.random = () => 0.2; });
  await run();
  assert.equal(await page.locator('#socialChecks input:checked').count(), 3, 'Random choices can select multiple boxes');
  assert.equal(await page.locator('#marketing').isChecked(), true);
  await page.evaluate(() => { Math.random = () => 0.8; });
  await run();
  assert.equal(await page.locator('#socialChecks input:checked').count(), 1, 'Random choices can select a smaller subset');
  assert.equal(await page.locator('#marketing').isChecked(), false);
  assert.equal(await page.locator('#consent').isChecked(), true);
  await page.evaluate(() => { Math.random = window.originalRandom; });
  const phoneRules = {
    US: { local: /^\d{10}$/, intl: /^\+1\d{10}$/ },
    BD: { local: /^01[3-9]\d{8}$/, intl: /^\+8801[3-9]\d{8}$/ },
    GB: { local: /^07\d{9}$/, intl: /^\+447\d{9}$/ },
    IN: { local: /^[6-9]\d{9}$/, intl: /^\+91[6-9]\d{9}$/ },
    PK: { local: /^03\d{9}$/, intl: /^\+923\d{9}$/ },
    CA: { local: /^\d{10}$/, intl: /^\+1\d{10}$/ },
    AU: { local: /^04\d{8}$/, intl: /^\+614\d{8}$/ },
    DE: { local: /^01[5-7]\d{8}$/, intl: /^\+491[5-7]\d{8}$/ },
    FR: { local: /^0[67]\d{8}$/, intl: /^\+33[67]\d{8}$/ },
    JP: { local: /^0[789]0\d{8}$/, intl: /^\+81[789]0\d{8}$/ },
    SG: { local: /^[89]\d{7}$/, intl: /^\+65[89]\d{7}$/ },
    AE: { local: /^05[024568]\d{7}$/, intl: /^\+9715[024568]\d{7}$/ }
  };
  for (const [code, rule] of Object.entries(phoneRules)) {
    await page.setContent('<form><input name="country"><input name="city"><input name="postalCode"><input type="tel" name="phone"><input type="tel" name="internationalPhone"></form>');
    result = await run({ country: code });
    assert.match(await page.inputValue('[name=phone]'), rule.local, `${code} local phone format error`);
    assert.match(await page.inputValue('[name=internationalPhone]'), rule.intl, `${code} international phone format error`);
    assert.equal(result.invalid, 0);
  }
  for (const [code, script, language] of [['JP', /[\u3040-\u30ff\u4e00-\u9fff]/, 'ja'], ['BD', /[\u0980-\u09ff]/, 'bn'], ['US', /^[\x20-\x7e]+$/, 'en']]) {
    await page.setContent(`<form>
      <input name="firstName"><input name="lastName"><input name="fullName">
      <input type="email" name="email" required><input type="url" name="instagramUrl" required>
      <input name="city"><input name="address"><input name="company"><input name="jobTitle">
      <textarea name="message"></textarea><input name="subject"><input name="language">
      <select name="country"><option value="US" selected>United States</option><option value="JP">Japan</option><option value="BD">Bangladesh</option></select>
      <select name="preferredLanguage"><option value="en" selected>English</option><option value="ja">Japanese</option><option value="bn">Bengali</option></select>
      <select name="gender"><option selected>Male</option><option>Female</option><option>Other</option></select>
      <select name="ageBand"><option selected>18-24</option><option>25-34</option><option>35-44</option></select>
    </form>`);
    result = await run({ country: code });
    assert.equal(result.invalid, 0);
    for (const field of ['firstName','lastName','fullName','city','address','company','jobTitle','message','subject','language']) assert.match(await page.inputValue(`[name=${field}]`), script, `${code} ${field} must be localized`);
    assert.match(await page.inputValue('[name=email]'), /^[a-z0-9.]+@example\.com$/);
    assert.equal(new URL(await page.inputValue('[name=instagramUrl]')).hostname, 'www.instagram.com');
    assert.equal(await page.inputValue('[name=country]'), code);
    assert.equal(await page.inputValue('[name=preferredLanguage]'), language);
    assert.notEqual(await page.inputValue('[name=gender]'), 'Male');
    assert.notEqual(await page.inputValue('[name=ageBand]'), '18-24');
    const gender = await page.inputValue('[name=gender]');
    const age = await page.inputValue('[name=ageBand]');
    await run({country:code});
    assert.notEqual(await page.inputValue('[name=gender]'), gender);
    assert.notEqual(await page.inputValue('[name=ageBand]'), age);
    assert.equal(await page.inputValue('[name=preferredLanguage]'), language);
  }
  await page.setContent('<select name="country"><option selected>United States</option></select><input name="firstName">');
  result = await run({country:'JP'});
  assert.match(await page.inputValue('[name=firstName]'), /[\u3040-\u30ff\u4e00-\u9fff]/);
  assert.equal(result.unsupported, 1, 'Unavailable country must be reported without replacing the chosen locale');
  await page.setContent('<button type="button" role="combobox" aria-controls="pointerMenu" aria-expanded="false" id="pointerSelect">Alpha</button><div role="listbox" id="pointerMenu" hidden><div role="option" aria-selected="true">Alpha</div><div role="option" aria-selected="false">Beta</div></div>');
  await page.evaluate(() => {
    const trigger = document.querySelector('#pointerSelect'), menu = document.querySelector('#pointerMenu');
    trigger.addEventListener('pointerdown', () => { menu.hidden = false; trigger.setAttribute('aria-expanded','true'); });
    menu.addEventListener('pointerup', event => {
      const option = event.target.closest('[role=option]'); if (!option) return;
      trigger.textContent = option.textContent;
      menu.querySelectorAll('[role=option]').forEach(el => el.setAttribute('aria-selected', String(el === option)));
      menu.hidden = true; trigger.setAttribute('aria-expanded','false');
    });
  });
  result = await run();
  assert.equal(await page.locator('#pointerSelect').textContent(), 'Beta');
  assert.equal(result.unsupported, 0);
  await run();
  assert.equal(await page.locator('#pointerSelect').textContent(), 'Alpha');
  // Exercise the actual extension popup -> scripting API -> content script path.
  await page.goto(address);
  await page.bringToFront();
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await popup.waitForFunction(() => !document.querySelector('#fill').disabled);
  assert.equal(await popup.locator('h1').textContent(), 'Auto Form Filler');
  assert.equal(await popup.locator('input[type=checkbox]').count(), 0);
  assert.equal(await popup.locator('#country option').count(), 12);
  await popup.selectOption('#country', 'BD');
  await popup.waitForFunction(async () => (await chrome.storage.local.get('country')).country === 'BD');
  await popup.screenshot({ path: fileURLToPath(new URL('test-results/popup.png', root)) });
  await page.bringToFront();
  await popup.evaluate(() => document.querySelector('#fill').click());
  await popup.waitForFunction(() => !document.querySelector('#fill').disabled);
  assert.match(await popup.locator('#status').textContent(), /^Filled \d+ fields\.$/);
  assert.equal(await page.inputValue('[name=country]'), 'BD');
  assert.equal(await page.locator('#terms').isChecked(), true);
  assert.equal(await page.evaluate(() => submitCount), 0);
  await page.evaluate(() => {
    const frame = document.createElement('iframe'); frame.srcdoc = '<label>Email<input type="email" required></label>'; document.body.append(frame);
  });
  await page.frameLocator('iframe').locator('input').waitFor();
  await popup.evaluate(() => document.querySelector('#fill').click());
  await popup.waitForFunction(() => !document.querySelector('#fill').disabled);
  assert.match(await page.frameLocator('iframe').locator('input').inputValue(), /@example\.com$/);
  // Test the exact unmodified React component used by the user's failing form.
  await page.goto(`${address}/select-popover`);
  await page.locator('#favoriteConsole').waitFor();
  await page.bringToFront();
  for (let pass = 0; pass < 3; pass++) {
    const before = JSON.parse(await page.locator('#state').textContent());
    await popup.evaluate(() => document.querySelector('#fill').click());
    await popup.waitForFunction(() => !document.querySelector('#fill').disabled);
    const after = JSON.parse(await page.locator('#state').textContent());
    for (const key of ['consoleName','game','registeringAs']) assert.notEqual(after[key], before[key], `Original React SelectPopover ${key} must change on fill ${pass + 1}`);
    assert.equal(after.actions, 0, 'Never click Cancel or Submit');
    assert.match(await popup.locator('#status').textContent(), /^Filled 3 fields\.$/);
    assert.equal(await page.locator('div[style]').count(), 0, 'All popup panels must close');
  }
  await page.screenshot({path:fileURLToPath(new URL('test-results/original-react-dropdowns.png',root)),fullPage:true});
  assert.deepEqual(errors, []);
  console.log('PASS: Popup and iframe filling; 12 country profiles; native-language data; locale matching; native and pointer-driven dropdown replacement; random checks; validation; events; shadow DOM; no auto-submit.');
} finally { await context.close(); await new Promise(resolve => server.close(resolve)); }
