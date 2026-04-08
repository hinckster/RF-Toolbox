/**
 * screenshot.js — Visual review tool for RF Toolbox
 * Usage:
 *   node screenshot.js          — screenshots all HTML tool pages
 *   node screenshot.js 03       — screenshots only 03_*.html
 *   node screenshot.js 06 07    — screenshots 06 and 07 only
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PAGES = [
  'index.html',
  '01_link_budget.html',
  '02_receiver_chain.html',
  '03_iip3_intermod.html',
  '04_antenna_array.html',
  '05_matching.html',
  '06_radar_range.html',
  '07_superheterodyne.html',
  '08_fspl.html',
  '09_transmission_line.html',
  '10_phase_noise.html',
  '11_pa_efficiency.html',
  '12_modulation_ber.html',
  '13_microstrip.html',
  '14_attenuator.html',
  '15_mixer.html',
  '16_sparam.html',
  '17_filter.html',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile',  width: 375,  height: 812 },
];

async function main() {
  const args = process.argv.slice(2);

  // Filter pages based on CLI args (e.g. "03" matches "03_iip3_intermod.html")
  let pagesToShot = PAGES;
  if (args.length > 0) {
    pagesToShot = PAGES.filter(p => {
      if (p === 'index.html' && args.includes('index')) return true;
      return args.some(a => p.startsWith(a));
    });
    if (pagesToShot.length === 0) {
      console.error('No pages matched args:', args);
      process.exit(1);
    }
  }

 // Clear and recreate screenshots dir
const outDir = path.join(__dirname, 'screenshots');
if (fs.existsSync(outDir)) {
  fs.readdirSync(outDir).forEach(f => fs.unlinkSync(path.join(outDir, f)));
} else {
  fs.mkdirSync(outDir);
}
console.log('🗑  Cleared old screenshots');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const page of pagesToShot) {
    const filePath = path.join(__dirname, page);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP  ${page} (file not found)`);
      continue;
    }
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

    for (const vp of VIEWPORTS) {
      const tab = await browser.newPage();
      await tab.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      await tab.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 15000 });

      // Small pause for chart animations / canvas renders
      await new Promise(r => setTimeout(r, 600));

      const slug = page.replace('.html', '');
      const outFile = path.join(outDir, `${slug}_${vp.name}.png`);
      await tab.screenshot({ path: outFile, fullPage: true });
      console.log(`  ✓  ${outFile}`);
      await tab.close();
    }
  }

  await browser.close();
  console.log('\nDone. Screenshots saved to ./screenshots/');
}

main().catch(err => { console.error(err); process.exit(1); });
