# Auto Form Filler 1.3.1

Version 1.3.1 adds support for dropdowns implemented as plain labeled buttons with down-chevron icons and floating button options, including the original Fan Registration SelectPopover. The extension verifies the displayed selection after clicking. Regression tests mount the unchanged React component and confirm all three selections change through the extension popup across three consecutive fills, without clicking Cancel or Submit.

Offline test form filling. Plain JavaScript, HTML, and CSS. No backend or API key.

## Install or update

1. Open `chrome://extensions` or `edge://extensions` and enable Developer mode.
2. Click Load unpacked and select `D:\Projects\Auto Form Filler`.
3. Open a form and click Fill this page in the extension. Shortcut: Alt+Shift+F.

For an existing installation, click Reload on the extension card, then refresh the form page.

## Always-on behavior

Every fill replaces existing editable values and selects dropdowns and radios. Country, state, city, language, and currency choices match the profile when available. Other dropdowns and radios choose a different eligible option when one exists, including common pointer-driven custom dropdowns. Checkbox groups receive a random subset, with at least one choice in otherwise empty groups. Required checkboxes stay checked. Optional standalone boxes randomly turn on or off. Checkbox outcomes may repeat. Old toggle preferences are ignored and removed when the popup opens.

Hidden, disabled, readonly, CAPTCHA, file-upload, and submit controls are skipped. Forms are never automatically submitted.

## Countries

United States, Bangladesh, United Kingdom, India, Pakistan, Canada, Australia, Germany, France, Japan, Singapore, and United Arab Emirates.

Profiles include sample city, region, street, postal code, currency, and phone format. Japan uses Japanese names and text; Bangladesh uses Bangla. India defaults to Hindi, Pakistan to Urdu, Germany to German, France to French, and UAE to Arabic. US, UK, Canada, Australia, and Singapore default to English. These are extension defaults, not claims that a country has only one language.

Names, addresses, company/job descriptions, subjects, messages, generic sample text, and language fields use the profile language. A small bilingual name pool supplies native-script names and Latin spellings for valid email addresses and social URLs. Phone numbers, dates, passwords, and machine identifiers keep compatible formats. Existing dropdown options are matched by native names, English aliases, or codes; the extension does not translate website option labels. If the selected country or language is unavailable, the control is reported for review without silently changing the test profile.

Addresses and numbers are not verified or provisioned. UAE uses 00000 as a test placeholder for postal fields.

## Field detection

Reads autocomplete, names, IDs, labels, nearby labels, and placeholders. Supports personal/contact details, gamer tags, IDs, tags, company/job, dates, quantities, amounts, URLs, and messages. Confirmation emails/passwords match the newly generated values.

Social fields support Instagram, TikTok, YouTube, Facebook, X/Twitter, LinkedIn, GitHub, Twitch, and Discord. URL fields receive platform-specific HTTPS URLs; handle fields receive handles; Facebook name fields receive names. Generated URLs have valid structure but may not point to existing accounts.

Native and common ARIA controls, open shadow roots, and accessible frames are supported. Native setters and input/change events support controlled fields. Brief rescans fill fields revealed by selections.

## Limits

Rules-based detection cannot infer arbitrary business rules. Unknown fields receive sample text. Unusual validation patterns, proprietary widgets, closed shadow roots, slow-loading options, and inaccessible frames may require manual input. Checkbox groups are inferred from shared names, explicit groups, or nearby containers. Required checkbox detection relies on required or aria-required attributes. Native validation feedback does not guarantee server acceptance.

Browser settings/store pages block scripts. Local HTML requires Allow access to file URLs in extension details.

## Build and verify

Run `npm ci`, `npx playwright install chromium`, `npm test`, then `npm run build`. Windows tests fall back to installed Edge if bundled Chromium cannot start. Set AFF_BROWSER=msedge to require Edge.

Build outputs: dist/chrome-edge and dist/firefox. For Firefox 140+, open about:debugging#/runtime/this-firefox, choose Load Temporary Add-on, and select dist/firefox/manifest.json. Permanent Firefox installation requires Mozilla signing. Firefox runtime testing and Safari packaging are not included.

Automated tests run in Edge and cover replacement, random checkbox outcomes, required checks, country profiles, relevant/social values, validation, native/ARIA controls, events, shadow roots, frames, and popup integration. tests/demo.html is a playground that never sends data.

The isolated test extension under test-results/extension-harness receives localhost permission because automated clicks cannot grant activeTab. The shipped extension requests only activeTab, scripting, and storage.

## Privacy

No network requests or analytics. Only the country preference is stored locally. Websites can observe input events as they can observe typing.
