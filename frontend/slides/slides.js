const slides = [
  `<section class="pitch-cover"><div class="pitch-kicker">ACALANES DATA FEST · 2026</div><h1>Morph<span>.</span></h1><p>What if we could test a city decision<br>before making it?</p><div class="pitch-chip">A virtual city grounded in real Census data</div></section>`,
  `<section class="pitch-ask"><div class="pitch-kicker">01 / ASK</div><h2>One question<br>that matters.</h2><div class="pitch-question"><small>SAN FRANCISCO</small><strong>Would people support a protected bike lane on Market Street?</strong><span class="pitch-question-arrow">↗</span></div><div class="pitch-bottomline">A decision affects more than an average.</div></section>`,
  `<section class="pitch-data"><div class="pitch-kicker">02 / REAL DATA</div><div class="pitch-data-main"><div class="pitch-big-number">10,000</div><h2>virtual residents</h2><p>sampled from Census microdata</p></div><div class="pitch-data-strip"><span><b>ACS PUMS</b> source</span><span class="pitch-strip-arrow">→</span><span><b>person weights</b> preserve scale</span><span class="pitch-strip-arrow">→</span><span><b>synthetic people</b> explore scenarios</span></div><div class="pitch-disclosure">Real records. Fabricated personas. No one was surveyed.</div></section>`,
  `<section class="pitch-explore"><div class="pitch-kicker">03 / EXPLORE</div><h2>A question becomes<br>a citywide experiment.</h2><div class="pitch-flow"><div class="pitch-flow-card"><i>◎</i><b>Sample</b><span>Census-grounded residents</span></div><div class="pitch-flow-arrow">→</div><div class="pitch-flow-card"><i>✦</i><b>Simulate</b><span>AI reasons by archetype</span></div><div class="pitch-flow-arrow">→</div><div class="pitch-flow-card"><i>▥</i><b>Explain</b><span>Weighted result + groups</span></div></div><div class="pitch-tech">Gemini predicts · Census weights aggregate · Neo4j remembers events</div></section>`,
  `<section class="pitch-result"><div class="pitch-kicker">04 / FINDING</div><div class="pitch-result-card"><div class="pitch-result-head">Market Street bike lane · San Francisco</div><div class="pitch-result-number"><span class="count-up" data-count="68">68</span><span>%</span></div><h2>modeled support</h2><div class="pitch-result-bar" role="img" aria-label="68 percent modeled support and 32 percent modeled opposition"><i></i></div><div class="pitch-result-labels"><b>68% support</b><b>32% oppose</b></div><p>Explore which groups differ—and why.</p></div><div class="pitch-result-caveat">Model estimate, not measured public opinion.</div></section>`,
  `<section class="pitch-close"><div class="pitch-kicker">05 / EXPLAIN + DEMO</div><h2>Find the next<br>question to ask<br>real people.</h2><p>Morph turns data into a starting point for better decisions.</p><a class="pitch-demo" href="https://morph-zeta-five.vercel.app/?ws=public" target="_blank" rel="noopener">Try Morph live <span>↗</span></a><div class="pitch-team">Mahin Bharathwaj · Abhay Sudhir · Nandan Pericherla</div></section>`
];

const speakerNotes = [
  "The event asks us to start with a question, explore a real dataset, and explain a finding. Our question: can a city test a decision with a virtual population before doing expensive real-world research? Morph is our prototype.",
  "We chose a concrete San Francisco decision: a protected bike lane on Market Street. A single citywide yes or no hides how people with different circumstances might respond. The demo lets us ask that question directly.",
  "Our real dataset is American Community Survey PUMS microdata. We sample 10,000 synthetic residents and retain the Census person weights. These are fabricated personas based on anonymized records, not interviewed people. The weights matter because the estimate should reflect population scale, not a raw count of agents.",
  "Morph groups similar residents into archetypes, asks Gemini how each group might react, and combines the responses with survey weights. The app can also store hypothetical events in Neo4j so later scenarios have memory. The result includes group breakdowns and sample reasons.",
  "In our working demo, the hypothetical Market Street bike-lane question produced 68 percent modeled support. This is a simulation output, not a poll or validated prediction. Its value is showing which groups the model expects to differ, so we know what to investigate with real people.",
  "Now open the live app. Ask the bike-lane question, show the weighted result, and click into the breakdowns and reasons. If time allows, show an event and the timeline. End by saying that Morph helps choose the right questions for a real survey; it does not replace one."
];

const stage = document.getElementById("stage");
const world = document.getElementById("world");
const slide = document.getElementById("slide");
const count = document.getElementById("count");
const fill = document.getElementById("progress-fill");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const notes = document.getElementById("notes");
let current = 0;
let hasRendered = false;
const camera = [[1, 0, 0], [1.34, 125, 10], [1.14, -40, -25], [1.48, 70, 25], [1.22, -115, -25], [1, 0, 0]];

function fit() {
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function show(index, updateHash = true) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  if (hasRendered && target === current) return;
  const old = stage.querySelector(".slide-exit");
  old?.remove();
  if (hasRendered && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const outgoing = slide.cloneNode(true);
    outgoing.removeAttribute("id");
    outgoing.removeAttribute("aria-live");
    outgoing.setAttribute("aria-hidden", "true");
    outgoing.className = "slide slide-exit";
    stage.insertBefore(outgoing, slide);
    outgoing.addEventListener("animationend", () => outgoing.remove(), { once: true });
  }
  current = target;
  slide.innerHTML = slides[current];
  notes.innerHTML = `<b>Presenter notes · ${current + 1}/${slides.length}</b>${speakerNotes[current]}`;
  slide.setAttribute("aria-label", `Slide ${current + 1} of ${slides.length}`);
  count.textContent = `${current + 1} / ${slides.length}`;
  fill.style.width = `${((current + 1) / slides.length) * 100}%`;
  const [zoom, x, y] = camera[current];
  world.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  if (updateHash) history.replaceState(null, "", `#${current + 1}`);
  const countUp = slide.querySelector(".count-up");
  if (countUp && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const started = performance.now();
    const end = Number(countUp.dataset.count);
    const animate = now => {
      if (countUp !== slide.querySelector(".count-up")) return;
      const p = Math.min((now - started) / 1000, 1);
      countUp.textContent = Math.round(end * (1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  hasRendered = true;
}

function fromHash() {
  const number = Number(location.hash.slice(1));
  show(Number.isInteger(number) && number >= 1 ? number - 1 : 0, false);
}

prev.addEventListener("click", () => show(current - 1));
next.addEventListener("click", () => show(current + 1));
window.addEventListener("keydown", event => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); show(current + 1); }
  if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); show(current - 1); }
  if (event.key === "Home") show(0);
  if (event.key === "End") show(slides.length - 1);
  if (event.key.toLowerCase() === "n") notes.hidden = !notes.hidden;
});
let touchX = null;
window.addEventListener("touchstart", event => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
window.addEventListener("touchend", event => {
  if (touchX === null) return;
  const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
  if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });
window.addEventListener("resize", fit);
window.addEventListener("hashchange", fromHash);
fit();
fromHash();

// Reuse the project's pixel map and place repeatable visual markers on its land.
const canvas = document.getElementById("residents");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
canvas.width = 1600;
canvas.height = 900;
const map = new Image();
map.src = "../assets/sf_tiles.png";
map.onload = () => {
  const sample = document.createElement("canvas");
  sample.width = 1600;
  sample.height = 900;
  const sc = sample.getContext("2d", { willReadFrequently: true });
  const height = map.height * 1600 / map.width;
  const top = (900 - height) / 2 - 12;
  sc.drawImage(map, 0, top, 1600, height);
  const pixels = sc.getImageData(0, 0, 1600, 900).data;
  let seed = 2076;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  let placed = 0;
  let attempts = 0;
  while (placed < 10000 && attempts < 180000) {
    attempts++;
    const x = Math.floor(random() * 1600);
    const y = Math.floor(random() * 900);
    const p = (y * 1600 + x) * 4;
    const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
    if (!(g > r * 1.16 && g > b * .9 && r < 165)) continue;
    ctx.fillStyle = random() < .54 ? "#efc6b2" : "#b6d9b9";
    ctx.fillRect(x, y, 3, 3);
    placed++;
  }
};
