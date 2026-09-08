(() => {
  if (globalThis.autoFormFiller?.version === "1.3.1") return;
  const pick = values => values[Math.floor(Math.random() * values.length)];
  const normalize = value => String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const locations = {
    US: { country: "United States", countryCode: "US", countryAliases: ["USA", "United States of America"], city: "Boston", state: "Massachusetts", stateCode: "MA", postal: "02108", address: "24 Beacon Street", phone: "2025550147", dial: "+1", currency: "USD" },
    BD: { country: "Bangladesh", countryCode: "BD", countryAliases: ["BGD"], city: "Dhaka", state: "Dhaka", stateCode: "Dhaka", postal: "1207", address: "24 College Road", phone: "01712345678", dial: "+880", currency: "BDT" },
    GB: { country: "United Kingdom", countryCode: "GB", countryAliases: ["UK", "Great Britain"], city: "London", state: "London", stateCode: "London", postal: "SW1A 1AA", address: "24 Sample Road", phone: "07700900123", dial: "+44", currency: "GBP" }
  };
  for (const [code, country, city, state, stateCode, postal, address, phone, dial, currency] of [
    ["IN", "India", "Mumbai", "Maharashtra", "MH", "400001", "24 Sample Road", "9876543210", "+91", "INR"],
    ["PK", "Pakistan", "Lahore", "Punjab", "PB", "54000", "24 Sample Road", "03001234567", "+92", "PKR"],
    ["CA", "Canada", "Toronto", "Ontario", "ON", "M5V 2T6", "24 King Street", "4165550147", "+1", "CAD"],
    ["AU", "Australia", "Sydney", "New South Wales", "NSW", "2000", "24 George Street", "0491570006", "+61", "AUD"],
    ["DE", "Germany", "Berlin", "Berlin", "BE", "10115", "Musterstrasse 24", "01701234567", "+49", "EUR"],
    ["FR", "France", "Paris", "Ile-de-France", "IDF", "75001", "24 Rue Exemple", "0612345678", "+33", "EUR"],
    ["JP", "Japan", "Tokyo", "Tokyo", "Tokyo", "100-0001", "1-1 Sample Chiyoda", "09012345678", "+81", "JPY"],
    ["SG", "Singapore", "Singapore", "Singapore", "Singapore", "238801", "24 Orchard Road", "81234567", "+65", "SGD"],
    ["AE", "United Arab Emirates", "Dubai", "Dubai", "DU", "00000", "24 Sample Street", "0501234567", "+971", "AED"]
  ]) locations[code] = { country, countryCode: code, countryAliases: [], city, state, stateCode, postal, address, phone, dial, currency };
  const languages = {
    BD: { language: "বাংলা", languageCode: "bn", languageAliases: ["Bengali", "Bangla"], first: [["আরিফ", "arif"], ["নাদিয়া", "nadia"], ["সামিরা", "samira"]], last: [["রহমান", "rahman"], ["হাসান", "hasan"], ["আহমেদ", "ahmed"]], country: "বাংলাদেশ", city: "ঢাকা", state: "ঢাকা", address: "২৪ কলেজ রোড", address2: "ফ্ল্যাট ৪", company: "নমুনা প্রতিষ্ঠান", job: "সফটওয়্যার প্রকৌশলী", subject: "পণ্যের তথ্য জানতে চাই", message: "আপনাদের সেবা সম্পর্কে আরও জানতে চাই। অনুগ্রহ করে বিস্তারিত তথ্য ও পরবর্তী ধাপগুলো জানান। ধন্যবাদ।", unknown: "নমুনা তথ্য", tag: "খেলা" },
    JP: { language: "日本語", languageCode: "ja", languageAliases: ["Japanese"], first: [["太郎", "taro"], ["花子", "hanako"], ["結衣", "yui"]], last: [["山田", "yamada"], ["佐藤", "sato"], ["田中", "tanaka"]], country: "日本", city: "東京", state: "東京都", address: "東京都千代田区千代田１丁目１番", address2: "４号室", company: "サンプル株式会社", job: "ソフトウェアエンジニア", subject: "商品情報のお問い合わせ", message: "サービスについて詳しく知りたいです。利用できるプランと手続きについて教えてください。よろしくお願いいたします。", unknown: "サンプル情報", tag: "ゲーム" },
    IN: { language: "हिन्दी", languageCode: "hi", languageAliases: ["Hindi", "हिंदी"], first: [["आरव", "aarav"], ["प्रिया", "priya"]], last: [["शर्मा", "sharma"], ["पटेल", "patel"]], country: "भारत", city: "मुंबई", state: "महाराष्ट्र", address: "२४ नमूना मार्ग", address2: "फ्लैट ४", company: "नमूना कंपनी", job: "सॉफ्टवेयर इंजीनियर", subject: "उत्पाद की जानकारी", message: "कृपया अपनी सेवाओं और उपलब्ध विकल्पों के बारे में अधिक जानकारी दें। धन्यवाद।", unknown: "नमूना जानकारी", tag: "खेल" },
    PK: { language: "اردو", languageCode: "ur", languageAliases: ["Urdu"], first: [["علی", "ali"], ["عائشہ", "aisha"]], last: [["خان", "khan"], ["احمد", "ahmed"]], country: "پاکستان", city: "لاہور", state: "پنجاب", address: "۲۴ نمونہ روڈ", address2: "فلیٹ ۴", company: "نمونہ کمپنی", job: "سافٹ ویئر انجینئر", subject: "مصنوعات کی معلومات", message: "براہ کرم اپنی خدمات اور دستیاب اختیارات کے بارے میں مزید معلومات فراہم کریں۔ شکریہ۔", unknown: "نمونہ معلومات", tag: "کھیل" },
    DE: { language: "Deutsch", languageCode: "de", languageAliases: ["German"], first: [["Lukas", "lukas"], ["Anna", "anna"]], last: [["Müller", "mueller"], ["Schmidt", "schmidt"]], country: "Deutschland", company: "Musterfirma", job: "Softwareentwickler", subject: "Anfrage zu Produktinformationen", message: "Bitte senden Sie mir weitere Informationen zu Ihren Dienstleistungen und verfügbaren Optionen. Vielen Dank.", unknown: "Beispieldaten", address2: "Wohnung 4", tag: "Spiele" },
    FR: { language: "Français", languageCode: "fr", languageAliases: ["French"], first: [["Émilie", "emilie"], ["Lucas", "lucas"]], last: [["Martin", "martin"], ["Dubois", "dubois"]], state: "Île-de-France", company: "Entreprise Exemple", job: "Ingénieur logiciel", subject: "Demande de renseignements", message: "Je souhaite obtenir plus de renseignements sur vos services et les options disponibles. Merci.", unknown: "Données exemple", address2: "Appartement 4", tag: "Jeux" },
    AE: { language: "العربية", languageCode: "ar", languageAliases: ["Arabic"], first: [["أحمد", "ahmad"], ["مريم", "maryam"]], last: [["المنصوري", "almansoori"], ["الحامدي", "alhamadi"]], country: "الإمارات العربية المتحدة", city: "دبي", state: "دبي", address: "٢٤ شارع المثال", address2: "شقة ٤", company: "شركة المثال", job: "مهندس برمجيات", subject: "طلب معلومات عن المنتج", message: "أرغب في معرفة المزيد عن خدماتكم والخيارات المتاحة. يرجى إرسال التفاصيل. شكراً لكم.", unknown: "بيانات تجريبية", tag: "ألعاب" },
    SG: { first: [["Wei Ming", "weiming"], ["Jia Hui", "jiahui"]], last: [["Tan", "tan"], ["Lim", "lim"]] }
  };
  function makeProfile(country) {
    const base = locations[country] || locations.US;
    const locale = languages[country] || {};
    const [first, latinFirst] = pick(locale.first || [["Alex", "alex"], ["Jordan", "jordan"], ["Taylor", "taylor"], ["Morgan", "morgan"]]);
    const [last, latinLast] = pick(locale.last || [["Carter", "carter"], ["Bennett", "bennett"], ["Parker", "parker"], ["Hayes", "hayes"]]);
    const username = `${latinFirst}.${latinLast}${Math.floor(Math.random() * 900 + 100)}`;
    return { language: "English", languageCode: "en", languageAliases: ["English"],
      company: "Example Labs", job: "Software Engineer", dob: "1995-06-15", gender: "Other",
      ...base, ...locale, countryAliases: [...base.countryAliases, base.country], stateAliases: [base.state], cityAliases: [base.city],
      first, last, name: country === "JP" ? `${last} ${first}` : `${first} ${last}`, username,
      email: `${username}@example.com`, password: `Test!${Math.floor(Math.random() * 900000 + 100000)}Aa` };
  }
  function roots() {
    const result = [document];
    for (let i = 0; i < result.length; i++) for (const el of result[i].querySelectorAll("*")) if (el.shadowRoot) result.push(el.shadowRoot);
    return result;
  }
  const all = selector => roots().flatMap(root => [...root.querySelectorAll(selector)]);
  function usable(el) {
    if (!el.isConnected || el.matches(":disabled,[readonly],[aria-disabled='true'],[aria-readonly='true']")) return false;
    if (el.closest("[hidden],[inert],[aria-hidden='true']")) return false;
    const style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none" && el.getClientRects().length > 0 && !/captcha/i.test(`${el.name || ""} ${el.id} ${el.getAttribute("aria-label") || ""}`);
  }
  function hints(el) {
    const root = el.getRootNode();
    const labelled = (el.getAttribute("aria-labelledby") || "").split(/\s+/).map(id => root.getElementById?.(id)?.textContent || "").join(" ");
    const nearby = el.previousElementSibling?.matches("label") ? el.previousElementSibling.textContent : "";
    return [el.autocomplete?.split(/\s+/).at(-1), el.name, el.id, el.getAttribute("aria-label"), labelled,
      [...el.labels || []].map(label => label.textContent).join(" "), nearby, el.getAttribute("placeholder")].map(normalize).filter(Boolean)
      .sort((a, b) => Number(/^(name|id|url|link|value|text)$/.test(a)) - Number(/^(name|id|url|link|value|text)$/.test(b)));
  }
  function social(el) {
    const hint = hints(el).join(" ");
    const platform = [["instagram", /instagram|insta\b/], ["tiktok", /tik\s?tok/], ["youtube", /you\s?tube|youtu\.be/],
      ["facebook", /facebook|fb\.com/], ["twitter", /twitter|\bx\.com|\bx (?:handle|profile|username|url|link)/],
      ["linkedin", /linked\s?in/], ["github", /git\s?hub/], ["twitch", /twitch/], ["discord", /discord/]].find(([, pattern]) => pattern.test(hint))?.[0];
    if (!platform) return null;
    const url = el.type === "url" || /\b(url|link|website)\b|https?:\/\/|www\.|(?:instagram|tiktok|youtube|facebook|twitter|linkedin|github|twitch|discord|x)\.com/.test(hint);
    const name = platform === "facebook" && /\bname\b/.test(hint) && !/user\s?name|handle/.test(hint);
    return { platform, format: url ? "url" : name ? "name" : "handle" };
  }
  function kind(el) {
    if (social(el)) return "social";
    const context = hints(el).join(" ");
    if (/gamer\s?tag|game\s?tag|gaming\s?(?:id|name)|player\s?(?:id|tag)|user\s?id|\bign\b/.test(context)) return "gamertag";
    if (hints(el).some(hint => /^(?:enter (?:your )?)?(?:id|identifier|account id|member id|reference id)$/.test(hint))) return "identifier";
    if (hints(el).some(hint => /^(?:enter (?:your )?)?tags?$/.test(hint))) return "tag";
    for (const hint of hints(el)) {
      if (/given name|first.?name|^fname$/.test(hint)) return "first";
      if (/family name|last.?name|surname|^lname$/.test(hint)) return "last";
      if (/user.?name|nickname|screen name/.test(hint)) return "username";
      if (/pass(word)?|confirm password/.test(hint)) return "password";
      if (/e.?mail/.test(hint)) return "email";
      if (/country.*(code|dial)|dial.*code|tel country code/.test(hint)) return "dial";
      if (/phone|mobile|telephone|^tel/.test(hint)) return "phone";
      if (/country|nationality/.test(hint)) return "country";
      if (/postal|post.?code|zip/.test(hint)) return "postal";
      if (/address.*(2|two)|address line2|apartment|suite/.test(hint)) return "address2";
      if (/city|town|address level2/.test(hint)) return "city";
      if (/state|province|region|county|address level1/.test(hint)) return "state";
      if (/street|address|address line1/.test(hint)) return "address";
      if (/company|organisation|organization|business name/.test(hint)) return "company";
      if (/job|occupation|designation/.test(hint)) return "job";
      if (/birth|^dob$|^bday$/.test(hint)) return "dob";
      if (/gender|^sex$/.test(hint)) return "gender";
      if (/currency/.test(hint)) return "currency";
      if (/language|locale|ভাষা|言語/.test(hint)) return "language";
      if (/website|\burl\b|homepage|\blink\b|https?:\/\//.test(hint)) return "url";
      if (/age/.test(hint) && /\bage\b/.test(hint)) return "age";
      if (/quantity|qty|count|number of/.test(hint)) return "quantity";
      if (/price|amount|salary|budget|cost/.test(hint)) return "amount";
      if (/subject|title/.test(hint)) return "subject";
      if (/message|comment|description|feedback|notes|bio/.test(hint)) return "message";
      if (/full.?name|^name$|your name|contact name/.test(hint)) return "name";
    }
    return ({ email: "email", tel: "phone", password: "password", url: "url", number: "quantity", range: "quantity" })[el.type] || (el.tagName === "TEXTAREA" || el.isContentEditable ? "message" : "unknown");
  }
  function textValue(el, p) {
    const type = kind(el);
    const handle = p.username.replace(/[^a-z0-9]/g, "").slice(0, 15);
    if (type === "social") {
      const { platform, format } = social(el);
      if (format === "name") return p.name;
      if (format === "handle") return ["linkedin", "github", "facebook", "discord"].includes(platform) ? handle : `@${handle}`;
      const base = { instagram: "https://www.instagram.com/", tiktok: "https://www.tiktok.com/@", youtube: "https://www.youtube.com/@",
        facebook: "https://www.facebook.com/", twitter: "https://x.com/", linkedin: "https://www.linkedin.com/in/", github: "https://github.com/", twitch: "https://www.twitch.tv/", discord: "https://discord.com/users/" };
      return base[platform] + (platform === "discord" ? "123456789012345678" : handle);
    }
    if (type === "gamertag") return `PixelFalcon${p.username.match(/\d+$/)?.[0] || "123"}`;
    if (type === "identifier") return `USER${p.username.match(/\d+$/)?.[0] || "123"}01`;
    if (type === "tag") return p.tag || "gaming";
    if (type === "country") return p.country;
    if (type === "phone") return hints(el).some(h => /international|intl|country.*code|dial|\bcode\b|\+/i.test(h)) || el.getAttribute("placeholder")?.includes("+") ? p.dial + p.phone.replace(/^0/, "") : p.phone;
    if (type in p) return p[type];
    return ({ address2: "Apartment 4", url: "https://example.com", age: "31", quantity: "2", amount: "100",
      subject: "Product information request", message: "Hello, I would like more information about your services. Please share the available options and next steps. Thank you.", unknown: "Sample value" })[type] || "Sample value";
  }
  function numberValue(el, preferred) {
    const min = el.min !== "" ? Number(el.min) : (el.type === "range" ? 0 : -Infinity);
    const max = el.max !== "" ? Number(el.max) : (el.type === "range" ? 100 : Infinity);
    let value = Math.max(min, Math.min(max, Number(preferred) || 2));
    if (el.step !== "any") {
      const step = Number(el.step) || 1;
      const base = Number.isFinite(min) ? min : Number(el.getAttribute("value")) || 0;
      value = base + Math.round((value - base) / step) * step;
      if (value > max) value -= step;
      if (value < min) value += step;
    }
    return String(Number(value.toFixed(8)));
  }
  function valueFor(el, p) {
    let value = String(textValue(el, p));
    if (el.inputMode === "numeric" && ["identifier", "gamertag"].includes(kind(el))) value = value.replace(/\D/g, "");
    if (["number", "range"].includes(el.type)) return numberValue(el, value);
    const today = new Date().toISOString().slice(0, 10);
    const date = kind(el) === "dob" ? p.dob : today;
    const temporal = { date, "datetime-local": `${date}T10:30`, month: date.slice(0, 7), week: `${date.slice(0, 4)}-W24`, time: "10:30", color: "#176b54" };
    if (el.type in temporal) {
      value = temporal[el.type];
      if (el.min && value < el.min) value = el.min;
      if (el.max && value > el.max) value = el.max;
      return value;
    }
    if (el.pattern) {
      // ponytail: support common digit-only masks; arbitrary regex constraints are reported for review.
      const digits = el.pattern.match(/^(?:\^)?(?:\\d|\[0-9\])\{(\d+)(?:,(\d+))?\}(?:\$)?$/);
      if (digits) {
        const length = Math.min(1000, Number(digits[1]));
        value = (value.replace(/\D/g, "") || "1234567890").repeat(Math.ceil(length / Math.max(1, value.replace(/\D/g, "").length)) + 1).slice(0, length);
      }
    }
    if (el.minLength > 0 && value.length < el.minLength) value = value.padEnd(Math.min(el.minLength, 10000), kind(el) === "password" ? "Aa1!" : ` ${p.unknown || "sample"}`);
    if (el.maxLength >= 0) value = value.slice(0, el.maxLength);
    return value;
  }
  function signal(el) {
    el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    el.dispatchEvent(new FocusEvent("blur", { bubbles: false, composed: true }));
    el.dispatchEvent(new FocusEvent("focusout", { bubbles: true, composed: true }));
  }
  function setValue(el, value) {
    const win = el.ownerDocument.defaultView;
    const proto = el.tagName === "TEXTAREA" ? win.HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? win.HTMLSelectElement.prototype : win.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    signal(el);
  }
  function optionText(option) { return option.label || [...option.labels || []].map(label => label.textContent).join(" ") || option.textContent || option.getAttribute("aria-label") || ""; }
  const checked = el => el.type === "checkbox" ? el.checked : el.getAttribute("aria-checked") === "true";
  function checkboxGroup(el) {
    const selector = "input[type='checkbox'],[role='checkbox']";
    const sameName = el.name ? [...el.getRootNode().querySelectorAll(selector)].filter(other => other.name === el.name && other.form === el.form) : [];
    if (sameName.length > 1) return sameName;
    const explicit = el.closest("fieldset,[role='group']");
    if (explicit) return [...explicit.querySelectorAll(selector)];
    // ponytail: infer checkbox groups from the nearest local container.
    for (let parent = el.parentElement; parent && !parent.matches("form,body,html"); parent = parent.parentElement) {
      const siblings = [...parent.querySelectorAll(selector)];
      if (siblings.length > 1) return siblings;
    }
    return [el];
  }
  function validOption(option) {
    return !option.disabled && !option.closest("optgroup[disabled]") && option.getAttribute("aria-disabled") !== "true" && !option.hidden && option.getAttribute("aria-hidden") !== "true"
      && (option.tagName !== "OPTION" || option.value.trim() !== "")
      && !/^(?:[-–—\s]*|(?:please\s+)?(?:select|choose|pick)(?:\s.*|\.{2,}|…)?|loading(?:\.{2,}|…)?|none)$/i.test(optionText(option).trim());
  }
  function choose(el, options, p) {
    const type = kind(el);
    const desired = { country: [p.country, p.countryCode, ...p.countryAliases], state: [p.state, p.stateCode, ...p.stateAliases],
      city: [p.city, ...p.cityAliases], language: [p.language, p.languageCode, `${p.languageCode}-${p.countryCode}`, ...p.languageAliases], currency: [p.currency] }[type];
    for (const value of desired || []) {
      const found = options.find(option => [option.value, optionText(option)].some(text => normalize(text) === normalize(value)));
      if (found) return found;
    }
    // Keep the popup's locale authoritative; never silently switch the entire profile.
    if (["country", "language"].includes(type)) return undefined;
    const current = normalize(el.getAttribute("aria-valuetext") || el.value || el.textContent);
    const alternatives = options.filter(option => {
      if (option.selected || option.checked || option.getAttribute("aria-selected") === "true" || option.getAttribute("aria-checked") === "true" || option.getAttribute("data-state") === "checked") return false;
      if (el.tagName === "SELECT" || el.type === "radio" || el.getAttribute("role") === "radio") return true;
      return normalize(optionText(option)) !== current && normalize(option.value) !== current;
    });
    return pick(alternatives.length ? alternatives : options);
  }
  function pointerClick(el) {
    const rect = el.getBoundingClientRect();
    const event = { bubbles: true, composed: true, cancelable: true, pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    el.dispatchEvent(new PointerEvent("pointermove", event));
    el.dispatchEvent(new PointerEvent("pointerdown", { ...event, buttons: 1 }));
    el.dispatchEvent(new MouseEvent("mousedown", { ...event, buttons: 1 }));
    el.dispatchEvent(new PointerEvent("pointerup", event));
    el.dispatchEvent(new MouseEvent("mouseup", event));
    el.click();
  }
  function unmarkedSelect(el) {
    // Some custom selects expose no ARIA at all. Require a field label and a down-chevron.
    if (!el.matches("button[type='button']") || !el.previousElementSibling?.matches("label")) return false;
    return [...el.querySelectorAll("svg path")].some(path => /m\s*19\s+9\s*l\s*-7\s+7\s*-7\s*-7|m\s*6\s+9\s*l\s*6\s+6\s*6\s*-6/i.test(path.getAttribute("d") || ""));
  }
  function floatingOptions(el, before) {
    const trigger = el.getBoundingClientRect();
    return all("button[type='button']").filter(button => {
      if (before.has(button) || !usable(button) || !validOption(button)) return false;
      const panel = button.parentElement;
      if (!panel || !["fixed", "absolute"].includes(getComputedStyle(panel).position)) return false;
      const box = panel.getBoundingClientRect();
      return Math.abs(box.left - trigger.left) < 24 && Math.abs(box.width - trigger.width) < 24;
    });
  }
  async function customSelect(el, p) {
    const root = el.getRootNode();
    const before = new Set(all("[role='option']").filter(usable));
    const unmarked = unmarkedSelect(el);
    const beforeButtons = unmarked ? new Set(all("button[type='button']").filter(usable)) : null;
    pointerClick(el);
    let options = [];
    for (let attempt = 0; attempt < 5 && !options.length; attempt++) {
      await wait(80);
      const ids = `${el.getAttribute("aria-controls") || ""} ${el.getAttribute("aria-owns") || ""}`.trim().split(/\s+/);
      const containers = ids.map(id => root.getElementById?.(id) || document.getElementById(id)).filter(Boolean);
      options = (containers.length ? containers.flatMap(container => [...container.querySelectorAll("[role='option']")]) : all("[role='option']").filter(option => !before.has(option))).filter(option => usable(option) && validOption(option));
      if (!options.length && unmarked) options = floatingOptions(el, beforeButtons);
    }
    const selected = choose(el, options, p);
    if (selected) {
      const target = normalize(optionText(selected));
      pointerClick(selected);
      for (let attempt = 0; attempt < 5; attempt++) {
        await wait(60);
        const current = normalize(el.getAttribute("aria-valuetext") || el.value || el.textContent);
        if (current === target || (selected.value && current === normalize(selected.value)) || (selected.isConnected && selected.getAttribute("aria-selected") === "true")) return true;
      }
      return false;
    }
    if (unmarked) { el.click(); return false; }
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    return false;
  }
  async function fill(options = {}) {
    if (globalThis.autoFormFiller.running) throw new Error("A fill is already in progress.");
    globalThis.autoFormFiller.running = true;
    const settings = { country: options.country || "US" };
    const p = makeProfile(settings.country);
    const changed = new Set();
    const visited = new WeakSet();
    const unsupported = new Set();
    try {
      // Bounded rescans allow dependent fields to appear after a dropdown or checkbox changes.
      for (let pass = 0; pass < 3; pass++) {
        {
          for (const el of all("select").sort((a, b) => Number(kind(b) === "country") - Number(kind(a) === "country"))) {
            if (!usable(el) || visited.has(el)) continue;
            const candidates = [...el.options].filter(validOption);
            const selected = choose(el, candidates, p);
            if (selected) visited.add(el);
            if (!selected && candidates.length) unsupported.add(el);
            if (!selected || (el.value === selected.value && !el.multiple)) continue;
            if (el.multiple) { for (const option of el.options) option.selected = option === selected; signal(el); }
            else setValue(el, selected.value);
            changed.add(el);
          }
          for (const el of all("[role='combobox']:not(select),button[aria-haspopup='listbox']:not([role='combobox']),button[type='button']").filter(el => el.matches("[role='combobox'],[aria-haspopup='listbox']") || unmarkedSelect(el))) {
            if (!usable(el) || visited.has(el)) continue;
            visited.add(el);
            if (await customSelect(el, p)) changed.add(el);
            else unsupported.add(el);
          }
        }
        for (const el of all("input,textarea,[contenteditable='true'],[role='checkbox'],[role='radio']")) {
          if (!usable(el) || visited.has(el) || el.getAttribute("role") === "combobox") continue;
          const type = el.type;
          const role = el.getAttribute("role");
          if (["hidden", "submit", "button", "reset", "image", "file"].includes(type) && !["checkbox", "radio"].includes(role)) continue;
          if (type === "checkbox" || role === "checkbox") {
            const group = checkboxGroup(el);
            group.forEach(other => visited.add(other));
            const available = group.filter(usable);
            const required = available.filter(other => other.required || other.getAttribute("aria-required") === "true");
            const selected = new Set(required);
            available.filter(other => !selected.has(other) && Math.random() < 0.5).forEach(other => selected.add(other));
            if (!selected.size && group.length > 1 && available.length) selected.add(pick(available));
            for (const other of available) {
              const target = selected.has(other);
              if (checked(other) !== target) {
                other.click();
                if (checked(other) === target) changed.add(other); else unsupported.add(other);
              }
            }
            continue;
          }
          if (type === "radio" || role === "radio") {
            const group = type === "radio"
              ? (el.name ? [...el.getRootNode().querySelectorAll("input[type='radio']")].filter(other => other.name === el.name && other.form === el.form) : [el])
              : [...(el.closest("[role='radiogroup']") || el.parentElement).querySelectorAll("[role='radio']")];
            group.forEach(other => visited.add(other));
            const selected = choose(el, group.filter(usable), p);
            if (selected) { selected.click(); if (selected.checked || selected.getAttribute("aria-checked") === "true") changed.add(selected); else unsupported.add(selected); }
            continue;
          }
          if (el.isContentEditable) {
            visited.add(el);
            el.textContent = textValue(el, p); signal(el); changed.add(el);
            continue;
          }
          visited.add(el);
          const value = valueFor(el, p);
          if (el.value !== value) { setValue(el, value); if (el.value) changed.add(el); }
        }
        await wait(150);
      }
      const invalid = all("input,textarea,select").filter(el => usable(el) && el.willValidate && !el.validity.valid).length;
      return { filled: [...changed].filter(el => el.isConnected).length, invalid, unsupported: unsupported.size };
    } finally { globalThis.autoFormFiller.running = false; }
  }
  globalThis.autoFormFiller = { fill, running: false, version: "1.3.1" };
})();
