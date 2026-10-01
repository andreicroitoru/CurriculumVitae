const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const now = new Date();
function fmtMonth(ym, t) {
  if (!ym) return t.present;
  const [y, m] = ym.split("-").map(Number);
  return m ? `${t.months[m - 1]} ${y}` : String(y);
}
// LinkedIn-style duration (inclusive of the start month)
function duration(start, end, t) {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const total = (ey - sy) * 12 + (em - sm) + 1;
  const y = Math.floor(total / 12), m = total % 12;
  return [y && t.y(y), m && t.m(m)].filter(Boolean).join(" ");
}
function yearsSince(start) {
  const [sy, sm] = start.split("-").map(Number);
  return Math.floor(((now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm)) / 12);
}

function render(lang) {
  const t = T[lang];
  const L = v => (v && typeof v === "object" ? v[lang] : v);
  const firstStart = CV.experience.map(e => e.start).sort()[0];
  const edu = CV.education[0];

  document.getElementById("app").innerHTML = `
    <div class="hero">
      <div class="avatar" aria-hidden="true">${esc(CV.initials)}</div>
      <div>
        <div class="eyebrow">${esc(L(CV.location))}</div>
        <h1>${esc(CV.name)}</h1>
      </div>
      <p class="headline"><b>${esc(L(CV.role))}</b> ${t.at} ${esc(CV.company)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${CV.linkedin}" target="_blank" rel="noopener">${t.linkedin}</a>
        <a class="btn btn-ghost" href="#contact">${t.contactMe} ›</a>
      </div>
    </div>

    <div class="glance">
      <div><strong>${t.yearsBig(yearsSince(firstStart))}</strong><span>${t["g.years"]}</span></div>
      <div><strong>${CV.certifications.length}</strong><span>${t["g.certs"]}</span></div>
      <div><strong>${esc(edu.start)}–${String(edu.end).slice(2)}</strong><span>${t["g.edu"]}</span></div>
    </div>

    <section id="despre" aria-labelledby="h-about">
      <h2 id="h-about">${t.about}</h2>
      <p class="prose">${esc(L(CV.about))}</p>
    </section>

    <section id="experienta" aria-labelledby="h-exp">
      <h2 id="h-exp">${t.exp}</h2>
      <ul class="group">
        ${CV.experience.map(e => `
          <li class="row">
            <div class="mark" style="background:${e.color}" aria-hidden="true">${esc(e.mark)}</div>
            <div>
              <h3>${esc(L(e.title))}</h3>
              <p class="org">${esc(e.org)}</p>
              ${e.place ? `<p class="meta">${esc(L(e.place))}</p>` : ""}
              ${!e.end ? `<span class="pill">${t.current}</span>` : ""}
            </div>
            <div class="side">${fmtMonth(e.start, t)} – ${fmtMonth(e.end, t)}<br>${duration(e.start, e.end, t)}</div>
          </li>`).join("")}
      </ul>
    </section>

    <section id="educatie" aria-labelledby="h-edu">
      <h2 id="h-edu">${t.edu}</h2>
      <ul class="group">
        ${CV.education.map(e => `
          <li class="row">
            <div class="mark" style="background:${e.color}" aria-hidden="true">${esc(e.mark)}</div>
            <div>
              <h3>${esc(L(e.org))}</h3>
              <p class="org">${esc(L(e.degree))}</p>
            </div>
            <div class="side">${esc(e.start)} – ${esc(e.end)}</div>
          </li>`).join("")}
      </ul>
    </section>

    <section id="certificari" aria-labelledby="h-certs">
      <h2 id="h-certs">${t.certs}</h2>
      <div class="certs">
        ${CV.certifications.map(c => `
          <div class="cert">
            <span class="lvl">${t.lvl[c.level - 1]}</span>
            <span class="name">${esc(c.name)}</span>
            <div class="lvl-bar" aria-label="${t.lvl[c.level - 1]}">${[1,2,3].map(i => `<i class="${i <= c.level ? "on" : ""}"></i>`).join("")}</div>
            <span class="src">${esc(c.issuer)} · ${t.issued} ${fmtMonth(c.date, t)}</span>
          </div>`).join("")}
      </div>
    </section>

    <section aria-labelledby="h-skills">
      <h2 id="h-skills">${t.skills}</h2>
      <ul class="chips">${L(CV.skills).map(s => `<li>${esc(s)}</li>`).join("")}</ul>
    </section>

    <section id="contact" aria-labelledby="h-contact">
      <div class="contact">
        <h2 id="h-contact">${t["contact.h"]}</h2>
        <p>${t["contact.p"]}</p>
        <a class="btn btn-primary" href="${CV.linkedin}" target="_blank" rel="noopener">${t.linkedin}</a>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t[el.dataset.t]; });
  document.getElementById("updated").textContent = `${t.updated} ${fmtMonth(CV.updated.slice(0, 7), t)}`;
  document.documentElement.lang = lang;
}

/* ---------- Segmented control: spring-driven, interruptible, draggable ---------- */
const seg = document.getElementById("lang");
const thumb = document.getElementById("thumb");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let lang = "ro";
try { const saved = localStorage.getItem("cv-lang"); if (saved === "en" || saved === "ro") lang = saved; } catch (e) {}

// Spring state: x is the live on-screen value, always animated from where it is now.
let x = 0, v = 0, target = 0, raf = 0;
const travel = () => seg.clientWidth / 2 - 2;
function setX(px) { x = px; thumb.style.transform = `translateX(${px}px)`; }
function step(prev) {
  return now => {
    const dt = Math.min(0.032, (now - prev) / 1000);
    // Critically damped spring, response 0.35s
    const k = Math.pow(2 * Math.PI / 0.35, 2), c = 2 * Math.sqrt(k);
    const a = -k * (x - target) - c * v;
    v += a * dt; setX(x + v * dt);
    if (Math.abs(v) < 2 && Math.abs(x - target) < 0.3) { setX(target); v = 0; raf = 0; return; }
    raf = requestAnimationFrame(step(now));
  };
}
function springTo(px, vel) {
  target = px;
  if (vel !== undefined) v = vel;
  if (reduceMotion) { setX(px); v = 0; return; }
  if (!raf) raf = requestAnimationFrame(step(performance.now()));
}

function choose(next, vel) {
  springTo(next === "en" ? travel() : 0, vel);
  document.getElementById("lang-ro").setAttribute("aria-checked", next === "ro");
  document.getElementById("lang-en").setAttribute("aria-checked", next === "en");
  if (next === lang) return;
  lang = next;
  try { localStorage.setItem("cv-lang", lang); } catch (e) {}
  if (reduceMotion) { render(lang); return; }
  const app = document.getElementById("app");
  app.parentElement.classList.add("swapping");
  setTimeout(() => { render(lang); app.parentElement.classList.remove("swapping"); }, 180);
}

// Pointer handling: commit on pointer-down for taps, 1:1 drag with grab offset, velocity handoff on release.
let drag = null;
seg.addEventListener("pointerdown", e => {
  seg.setPointerCapture(e.pointerId);
  cancelAnimationFrame(raf); raf = 0;
  drag = { startX: e.clientX, origin: x, moved: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
});
seg.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.startX;
  if (!drag.moved && Math.abs(dx) < 4) return;
  drag.moved = true; seg.style.cursor = "grabbing";
  const max = travel();
  let nx = drag.origin + dx;
  // Rubber-band past either end
  const rb = (o, d) => (o * d * 0.55) / (d + 0.55 * Math.abs(o));
  if (nx < 0) nx = -rb(-nx, max); else if (nx > max) nx = max + rb(nx - max, max);
  setX(nx);
  drag.hist.push({ x: e.clientX, t: e.timeStamp });
  if (drag.hist.length > 5) drag.hist.shift();
});
function endDrag(e) {
  if (!drag) return;
  seg.style.cursor = "";
  const d = drag; drag = null;
  if (!d.moved) {
    const r = seg.getBoundingClientRect();
    choose(e.clientX - r.left > r.width / 2 ? "en" : "ro", 0);
    return;
  }
  const h = d.hist, a = h[0], b = h[h.length - 1];
  const vel = b.t > a.t ? (b.x - a.x) / ((b.t - a.t) / 1000) : 0;
  // Project momentum, then snap from the projected endpoint
  const projected = x + (vel / 1000) * 0.998 / (1 - 0.998) * 0.2;
  choose(projected > travel() / 2 ? "en" : "ro", vel);
}
seg.addEventListener("pointerup", endDrag);
seg.addEventListener("pointercancel", endDrag);
seg.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") { choose("en"); document.getElementById("lang-en").focus(); }
  if (e.key === "ArrowLeft") { choose("ro"); document.getElementById("lang-ro").focus(); }
});
// Keyboard activation (Enter/Space on a focused button)
seg.querySelectorAll("button").forEach(b => b.addEventListener("click", e => { if (e.detail === 0) choose(b.dataset.lang); }));
addEventListener("resize", () => { setX(lang === "en" ? travel() : 0); target = x; });

render(lang);
setX(lang === "en" ? travel() : 0); target = x;
document.getElementById("lang-ro").setAttribute("aria-checked", lang === "ro");
document.getElementById("lang-en").setAttribute("aria-checked", lang === "en");
