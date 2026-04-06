# RF Toolbox — Design System, Safeguards & Iteration Log
**Author:** Noah Hinckster · EE Graduate Student  
**Repo:** https://github.com/hinckster/RF-Toolbox  
**Live site:** https://hinckster.github.io/RF-Toolbox/

---

## ⚠️ Safeguards — Read Before Making Any Changes

These rules apply to every file in this repo, every time, no exceptions.

### Never Break These
- [ ] Every file must remain **fully self-contained** — no imports from other local files
- [ ] Every file must **load and run with no internet connection** except cdnjs.cloudflare.com
- [ ] Every file must **work as a standalone iframe** embeddable in Google Sites
- [ ] Chart.js is **pinned to 4.4.1** — do not change this version
- [ ] All sliders must **update in real time** with no page reload or button press
- [ ] All equations must **stay visible** and update when parameters change
- [ ] The annotation box must **always show a non-empty explanation**
- [ ] No file should **exceed 80KB** — keep them lean and fast-loading

### Before Editing Any File
1. Read this entire DESIGN.md first
2. Run `git status` — confirm you are on the correct branch
3. Never edit more than one file at a time without a commit in between if files are large
4. If a change touches the shared design system (colors, fonts, layout), it must be applied to **all** files in that same commit — no partial updates

### Before Every Commit
- [ ] Open the changed file in a browser and confirm it renders correctly
- [ ] Confirm all sliders still work and update the chart
- [ ] Confirm the equation box still shows and highlights correctly
- [ ] Confirm the page is not broken on a narrow window (< 768px)
- [ ] Commit message must follow format: `"Verb noun — detail"` e.g. `"Add radar tool — batch 2"`

### Never Do These
- ❌ Do not delete or rename any existing HTML file without updating `index.html`
- ❌ Do not add `<form>` tags — use event listeners only
- ❌ Do not add external fonts (Google Fonts etc.) — use system font stack only
- ❌ Do not add any analytics, tracking, or third-party scripts
- ❌ Do not store user data or use localStorage
- ❌ Do not break the mobile responsive layout when editing desktop styles
- ❌ Do not commit directly without reviewing the diff first (`git diff`)

### Recovery
If something breaks:
```bash
# See what changed
git diff

# Undo all uncommitted changes
git checkout .

# Roll back the last commit (keeps files, undoes commit)
git reset --soft HEAD~1

# Roll back to a specific commit (nuclear option)
git log --oneline          # find the commit hash
git reset --hard <hash>
git push --force
```

---

## Screenshot Capability

Every tool page includes a built-in **Download PNG** button that captures the current chart state using the Canvas API. No external libraries needed — Chart.js canvases are directly exportable.

### How It Works
Each tool page has a `screenshotBtn` button in the toolbar (next to Fullscreen and Copy Link). When clicked it:
1. Finds all `<canvas>` elements on the page
2. If there is one canvas → exports it directly
3. If there are multiple canvases (e.g. polar + cartesian) → composites them onto a new canvas side by side
4. Adds a title bar and timestamp to the exported image
5. Triggers a PNG download named `[tool-name]_[timestamp].png`

### Implementation Snippet
Add this to every tool page inside the `<script>` tag:

```javascript
function takeScreenshot(toolName) {
  const canvases = [...document.querySelectorAll('canvas')];
  const padding = 16;
  const titleHeight = 40;

  // Composite all canvases side by side
  const totalWidth = canvases.reduce((sum, c) => sum + c.width + padding, padding);
  const maxHeight = Math.max(...canvases.map(c => c.height));

  const out = document.createElement('canvas');
  out.width = totalWidth;
  out.height = maxHeight + titleHeight + padding * 2;

  const ctx = out.getContext('2d');

  // Background
  ctx.fillStyle = '#16181d';
  ctx.fillRect(0, 0, out.width, out.height);

  // Title bar
  ctx.fillStyle = '#e6edf3';
  ctx.font = 'bold 14px Segoe UI, system-ui, sans-serif';
  ctx.fillText(toolName + '  ·  RF Toolbox  ·  hinckster.github.io/RF-Toolbox', padding, titleHeight / 2 + 5);

  // Timestamp
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px monospace';
  ctx.fillText(new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC', padding, titleHeight - 4);

  // Draw each canvas
  let x = padding;
  canvases.forEach(c => {
    ctx.drawImage(c, x, titleHeight + padding);
    x += c.width + padding;
  });

  // Download
  const link = document.createElement('a');
  const slug = toolName.toLowerCase().replace(/\s+/g, '_');
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  link.download = `${slug}_${ts}.png`;
  link.href = out.toDataURL('image/png');
  link.click();
}
```

### Toolbar HTML Pattern
Every tool page should have this toolbar in the top-right:

```html
<div class="toolbar">
  <button class="tbtn" onclick="takeScreenshot('Friis Transmission')">📷 Screenshot</button>
  <button class="tbtn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
  <button class="tbtn" id="copyBtn" onclick="copyLink()">⎘ Copy Link</button>
</div>
```

### Toolbar CSS
```css
.toolbar {
  position: fixed;
  top: 14px;
  right: 16px;
  display: flex;
  gap: 6px;
  z-index: 100;
}
.tbtn {
  background: #1e2128;
  border: 1px solid #30363d;
  color: #8b949e;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: .75rem;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.tbtn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}
```

### Fullscreen and Copy Link
```javascript
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copyBtn');
    const original = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.color = '#3fb950';
    btn.style.borderColor = '#3fb950';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  });
}
```

---

## Visual Self-Improvement Loop

Claude Code can screenshot every tool page, look at the images, and
self-correct — catching layout bugs, broken charts, misaligned elements,
and mobile issues that are invisible from code alone.

### Setup (one time only)
```bash
npm install
```
This installs Puppeteer (headless Chrome) as a dev dependency.
The `screenshots/` folder and `node_modules/` are gitignored — they
never get committed to the repo.

### How to trigger a visual review in Claude Code

**Review all pages:**
```
Run `node screenshot.js` to capture all pages at desktop and mobile 
widths. Then look at every image in the screenshots/ folder. For each 
page identify any visual problems — broken layouts, clipped text, 
misaligned charts, slider labels that overflow, annotation boxes that 
are too small, or anything that looks wrong on mobile. List all issues 
found, then fix them one file at a time. Re-screenshot each file after 
fixing to confirm the issue is resolved before moving on. Commit all 
fixes as "Visual fixes — [list of files changed]" and push.
```

**Review one specific page:**
```
Run `node screenshot.js 03` to screenshot 03_iip3_intermod.html at 
desktop and mobile widths. Look at both screenshots carefully. List 
every visual issue you see — layout, spacing, readability, chart 
rendering, annotation text overflow. Fix all issues, re-screenshot 
to confirm, then commit as "Fix visual issues in 03_iip3" and push.
```

**After adding a new tool:**
```
Run `node screenshot.js 06` to screenshot the new radar range tool. 
Compare it visually against screenshots of 01_friis_transmission.html 
(the reference page). Identify any design inconsistencies — color 
differences, font size mismatches, spacing that doesn't match the 
design system in DESIGN.md. Fix all inconsistencies, re-screenshot 
to confirm it matches the reference, then commit and push.
```

**Full design consistency pass:**
```
Run `node screenshot.js` to capture all pages. Compare each tool page 
against the design system in DESIGN.md. Flag any page that deviates 
from the spec — wrong background color, missing toolbar, annotation 
box missing or empty, axes without labels or units. Fix all deviations. 
Re-screenshot to confirm. Commit as "Design consistency pass" and push.
```

### What Claude looks for in screenshots
- Equation box visible and not clipped
- All slider labels readable, values not overflowing their containers
- Chart axes labeled with units
- Annotation box present and non-empty
- Toolbar (Screenshot / Fullscreen / Copy Link) visible top-right
- No horizontal scrollbar on desktop (1280px)
- Controls stack above chart on mobile (375px), nothing overlapping
- Colors match the design system — no white backgrounds, no default blue buttons
- Chart lines visible against the dark background

### Re-screenshot prompt after any fix
Always end a fix session with:
```
Re-screenshot the files you just changed with `node screenshot.js` 
and confirm the issues are resolved before committing.
```

---

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#16181d` | Page background |
| `bg-card` | `#1e2128` | Cards, panels |
| `bg-deep` | `#0d1117` | Inputs, metric boxes |
| `border` | `#30363d` | All borders |
| `text-primary` | `#e6edf3` | Headings |
| `text-secondary` | `#c9d1d9` | Body text |
| `text-muted` | `#8b949e` | Labels, captions |
| `accent-blue` | `#58a6ff` | Primary accent, sliders |
| `accent-green` | `#3fb950` | Good/pass states |
| `accent-orange` | `#f0883e` | Warning states |
| `accent-red` | `#f85149` | Error/fail states |
| `accent-yellow` | `#e6c547` | Highlighted variables |
| `accent-purple` | `#bc8cff` | Secondary data |

### Typography
- **Font stack:** `'Segoe UI', system-ui, sans-serif`
- **Monospace:** `'Courier New', monospace` — equations, values, axis labels
- **Base size:** 14px
- **Headings:** 1.35rem, color `text-primary`, weight 600
- **Subtitles:** 0.8rem, color `text-muted`

### Layout
- **Sidebar + chart:** `grid-template-columns: 260px 1fr` on desktop
- **Mobile breakpoint:** 768px — stack vertically, controls above chart
- **Card border-radius:** 8px
- **Panel padding:** 14px
- **Gap between panels:** 16–18px

### Components

#### Equation Box
- Background `bg-card`, border `border`, border-radius 8px
- Highlighted variables: `.var.hi` → yellow `#e6c547` background, dark text
- Result variables: `.var.res` → green `#3fb950` background, dark text
- Font: monospace, 0.92rem, line-height 2

#### Sliders
- `accent-color: #58a6ff`, track height 4px
- Label left, live value right in `accent-blue` monospace
- Value transitions: `transition: all 200ms ease`

#### Annotation Box
- Left border: 3px solid `accent-blue`
- Background `bg-card`, padding 11px 14px
- Must always be non-empty
- Must show specific current numbers, not generic text
- Must answer: *what am I seeing · why does it matter · what should I change*

#### Metric Cards
- 2-column grid
- Background `bg-deep`, border `border`, border-radius 6px
- Label 0.7rem `text-muted`, Value 1rem monospace
- Value color: green = good, yellow = marginal, red = bad/failed

### Chart.js Defaults
```javascript
// Apply to every chart options object
{
  animation: { duration: 0 },       // always off — sliders need instant response
  responsive: true,
  scales: {
    x: { grid: { color: '#252830' }, ticks: { color: '#8b949e' } },
    y: { grid: { color: '#252830' }, ticks: { color: '#8b949e' } }
  },
  plugins: {
    legend: { labels: { color: '#8b949e', font: { size: 11 }, boxWidth: 14 } }
  }
}
```

---

## Host Site Integration

The toolbox is embedded in **noahhinckley.com** (Google Sites portfolio) at `hinckster.github.io/RF-Toolbox`. These rules keep the toolbox visually coherent with the host site without violating the self-contained-file safeguard.

### Copper/Gold Accent — `#b5895a`
Applied to all **structural chrome** that bridges the toolbox to the portfolio identity:
- Toolbar button hover state (`border-color`, `color`)
- Section tag label above `<h1>` (`header .tag`)
- Annotation box left border
- Equation box section labels (`.eq-label`)
- Nav breadcrumb link color
- index.html: card hover border/glow, card number, back-link, footer links, bio text, hero-tag

### Dark Teal Hero — `#0d2d3a`
Used only on `index.html` hero background to match the portfolio hero section.

### Data-vs-Chrome Rule
The copper accent applies **only to non-data UI chrome** (labels, borders, hover states, navigation). It must **never** be applied to:
- Slider `accent-color` — keep `#58a6ff` (blue) for functional/interactive elements
- Chart line colors — data palette unchanged
- Metric card value colors (green/yellow/red semantic colors)

### Back-Link Pattern
`index.html` has a "← Back to Portfolio" link top-left pointing to `https://www.noahhinckley.com/home`.

### Breadcrumb Pattern
Every tool page nav: `noahhinckley.com › RF Toolbox › Tool Name`
- `noahhinckley.com` → `https://www.noahhinckley.com/home`
- `RF Toolbox` → `index.html`
- `Tool Name` → plain text (current page)
- Link color: `#b5895a`

---

## File Index

| File | Topic | Equation | Status |
|---|---|---|---|
| `index.html` | Landing page / portfolio grid | — | ✅ Live |
| `01_friis_transmission.html` | Friis link equation | Pr = Pt + Gt + Gr − FSPL | ✅ Live |
| `02_noise_figure.html` | Cascaded noise figure | F = F1 + (F2−1)/G1 + ··· | ✅ Live |
| `03_iip3_intermod.html` | IIP3 / two-tone IM3 | P_IM3 = 3Pin − 2·IIP3 + G | ✅ Live |
| `04_antenna_array.html` | ULA array factor | AF(θ) = sin(Nψ/2)/sin(ψ/2) | ✅ Live |
| `05_smith_chart.html` | Smith chart / Γ | Γ = (ZL−Z0)/(ZL+Z0) | ✅ Live |
| `06_radar_range.html` | Radar range equation | R⁴ = PtGtGrλ²σ / (4π)³Smin | 🔲 Planned |
| `07_superheterodyne.html` | Superhet receiver | f_image = f_RF ± 2·f_IF | 🔲 Planned |
| `08_fspl.html` | Free-space path loss sweep | FSPL = 20log(4πdf/c) | 🔲 Planned |
| `09_transmission_line.html` | TL reflection / VSWR | Γ(l) = ΓL·e^(−j2βl) | 🔲 Planned |
| `10_link_budget.html` | Link budget calculator | Margin = Pr − Sensitivity | 🔲 Planned |

---

## Iteration Log

### v1.0 — Batch 1 launch
- Built 5 core RF tools + landing page
- Dark design system established
- Chart.js 4.4.1 for all plots, pure vanilla JS

### v1.1 — UX + safeguards (planned)
- [ ] Mobile responsive layouts (768px breakpoint)
- [ ] Toolbar: Screenshot, Fullscreen, Copy Link buttons
- [ ] Smoother slider value transitions (200ms)
- [ ] Richer annotation text with live numbers
- [ ] Smith chart snap-to-common-values (50Ω, 75Ω, 100Ω, open, short)
- [ ] Index page: bio header, last-updated timestamp, blue glow hover

### v2.0 — Batch 2 (planned)
- [ ] 06 Radar range equation
- [ ] 07 Superheterodyne receiver
- [ ] 08 Free-space path loss sweep
- [ ] 09 Transmission line reflection
- [ ] 10 Link budget calculator

---

## Prompt Templates for Claude Code

### Golden rule — always start with:
```
Read DESIGN.md fully before making any changes. Follow all 
safeguards listed at the top. Then:
```

### Add a new tool
```
Read DESIGN.md fully before making any changes. Follow all 
safeguards listed at the top. Then:

Create [FILENAME].html as a new RF tool teaching [TOPIC].
- Governing equation: [EQUATION]
- Sliders/controls: [PARAMS]
- Chart: [WHAT TO PLOT, axes, units]
- Include the screenshot/fullscreen/copy-link toolbar from DESIGN.md
- Match the exact design system (colors, layout, components) from DESIGN.md
- Annotation box must give specific engineering insight, not generic text

Then update index.html to mark [FILENAME] as live.
Verify the checklist in DESIGN.md before committing.
Commit as "Add [TOPIC] tool — batch N" and push.
```

### Improve specific tool
```
Read DESIGN.md fully before making any changes. Follow all 
safeguards listed at the top. Then:

Improve [FILENAME].html with these specific changes:
- [change 1]
- [change 2]

Do not change anything not listed above. Verify the pre-commit 
checklist in DESIGN.md. Commit as "[description]" and push.
```

### Apply changes across all tools
```
Read DESIGN.md fully before making any changes. Follow all 
safeguards listed at the top. Then:

Apply these changes to ALL html files in the repo:
- [change 1]
- [change 2]

Commit after each file is verified working, not all at once.
Final commit message: "[description]"
Push when all files are done.
```

### Add screenshot capability to all existing tools
```
Read DESIGN.md fully, specifically the Screenshot Capability 
section. Then add the screenshot/fullscreen/copy-link toolbar 
to all 5 tool pages (01 through 05) exactly as specified in 
DESIGN.md. Do not change any other functionality. Verify each 
file renders correctly before moving to the next. Commit as 
"Add screenshot toolbar to all tools" and push.
```

---

## Notes for Future Iterations
- Keep all files self-contained — no shared CSS/JS between pages
- Each tool must be independently embeddable as a Google Sites iframe
- Target iframe height for Google Sites: 700–800px
- Screenshot exports should include the tool name and timestamp
- Chart.js version locked to 4.4.1 — test all 10 files before upgrading
- Never add login, auth, or any server-side dependency
- The repo should always be in a deployable state on every commit