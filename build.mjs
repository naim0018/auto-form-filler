import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
const files = ['filler.js', 'runner.js', 'background.js', 'popup.html', 'popup.js', 'popup.css'];
const base = JSON.parse(await readFile(new URL('./manifest.json', import.meta.url), 'utf8'));
for (const browser of ['chrome-edge', 'firefox']) {
  const directory = new URL(`./dist/${browser}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  await mkdir(new URL('icons/', directory), { recursive: true });
  for (const size of [16,32,48,128]) await copyFile(new URL(`icons/icon-${size}.png`, import.meta.url), new URL(`icons/icon-${size}.png`, directory));
  const manifest = structuredClone(base);
  if (browser === 'firefox') {
    manifest.background = { scripts: ['runner.js', 'background.js'] };
    manifest.browser_specific_settings = { gecko: { id: 'auto-form-filler@local.test', strict_min_version: '140.0', data_collection_permissions: { required: ['none'] } } };
  }
  await writeFile(new URL('manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n');
  for (const file of files) await copyFile(new URL(file, import.meta.url), new URL(file, directory));
  console.log(`Built ${browser}`);
}
