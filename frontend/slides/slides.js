const slides = [
  `<section class="pitch-cover"><div class="pitch-kicker">ACALANES DATA FEST · 2026</div><h1>Morph<span>.</span></h1><p>Cities need to know how residents might<br>respond before making a decision.</p><div class="pitch-chip">Morph uses Census data to test ideas before a public survey.</div></section>`,
  `<section class="pitch-ask"><div class="pitch-kicker">THE EXAMPLE</div><h2>A flood funding<br>decision.</h2><div class="pitch-question"><small>HYPOTHETICAL · SAN FRANCISCO</small><strong>Should San Francisco fund flood protection before a Super El Niño winter?</strong><span class="pitch-question-arrow">↗</span></div><div class="pitch-bottomline">The proposal focuses on low-lying neighborhoods.</div></section>`,
  `<section class="pitch-data"><div class="pitch-kicker">THE DATA</div><div class="pitch-data-main"><div class="pitch-big-number">10,000</div><h2>virtual residents</h2><p>built from U.S. Census survey records</p></div><div class="pitch-data-strip"><span>Age</span><span>Income</span><span>Education</span><span>Household size</span></div><div class="pitch-disclosure">Source: American Community Survey (ACS PUMS)</div></section>`,
  `<section class="pitch-explore"><div class="pitch-kicker">HOW MORPH USES THE DATA</div><h2>From Census data<br>to modeled responses.</h2><div class="pitch-flow"><div class="pitch-flow-card"><i>◎</i><b>Group</b><span>Similar resident profiles</span></div><div class="pitch-flow-arrow">→</div><div class="pitch-flow-card"><i>✦</i><b>Simulate</b><span>Gemini models each group’s response</span></div><div class="pitch-flow-arrow">→</div><div class="pitch-flow-card"><i>▥</i><b>Combine</b><span>Census weights reflect each group’s size</span></div></div></section>`,
  `<section class="pitch-result"><div class="pitch-kicker">THE RESULT</div><div class="pitch-result-card"><div class="pitch-result-head">Super El Niño flood protection · San Francisco</div><div class="pitch-result-number"><span class="count-up" data-count="79">79</span><span>%</span></div><h2>modeled support</h2><div class="pitch-result-bar" role="img" aria-label="79 percent modeled support and 21 percent modeled opposition"><i></i></div><div class="pitch-result-labels"><b>79% support</b><b>21% oppose</b></div><p>Break down the estimate by age, income, and more.</p></div><div class="pitch-result-caveat">AI simulation of a hypothetical proposal.</div></section>`,
  `<section class="pitch-close"><div class="pitch-kicker">LIVE DEMO</div><h2>What should<br>we ask residents<br>next?</h2><p>Use the breakdowns to plan a real survey.</p><a class="pitch-demo" href="https://morph-zeta-five.vercel.app/?ws=public" target="_blank" rel="noopener">Try Morph live <span>↗</span></a><div class="pitch-team">Mahin Bharathwaj · Aradhya Mishra</div></section>`
];

const speakerNotes = [
  "Cities have to make decisions before they know how residents will respond. A survey takes time, and a single citywide average can hide differences between groups. Morph helps cities decide what to ask and whom to reach.",
  "Imagine San Francisco is planning for a Super El Niño winter. We asked whether residents would support funding flood protection for low-lying neighborhoods.",
  "We use public Census survey records with fields like age, income, education, and household size. We sample those records to build 10,000 virtual residents.",
  "Morph groups similar profiles, asks Gemini to simulate each group’s response, and combines the answers using Census survey weights. The weights help the combined estimate reflect how common different profiles are in the population.",
  "The model estimated 79 percent support. This number comes from simulated responses. Show one demographic breakdown and explain what question it raises for a real survey.",
  "Open the Super El Niño result in the app. Show the overall estimate, then one group breakdown and a sample reason. Ask what we would want to confirm with residents."
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
