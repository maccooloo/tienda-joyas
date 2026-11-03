/* Offline renderer. Set FILM_TOOLS_DIR to a folder containing playwright and ffmpeg-static. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
const dependencies = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolDirectory = process.env.FILM_TOOLS_DIR || path.join(os.tmpdir(), 'criseida-browser-review', 'node_modules');
const { chromium } = await import(pathToFileURL(dependencies.resolve('playwright', { paths: [toolDirectory] })).href);
const { default: ffmpeg } = await import(pathToFileURL(dependencies.resolve('ffmpeg-static', { paths: [toolDirectory] })).href);
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/era-film-assets.json'), 'utf8'));
const output = path.join(root, 'out', 'era-film');
fs.mkdirSync(output, { recursive: true });
const images = manifest.chapters.flatMap((chapter, index) => ['art', 'living', 'blink'].map((kind) => ({
  name: `${kind === 'living' ? 'live' : kind}${index}`,
  data: `data:image/webp;base64,${fs.readFileSync(path.join(root, chapter[kind])).toString('base64')}`,
})));

async function render(browser, mobile, stills) {
  const width = mobile ? 720 : 1600;
  const height = mobile ? 1080 : 900;
  const name = mobile ? 'mobile' : 'desktop';
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(pathToFileURL(path.join(__dirname, 'era-film.html')).href);
  await page.evaluate((settings) => window.initializeFilm(settings), { width, height, images });
  if (stills) {
    for (const t of [0, 2.8, 4.6, 5, 6.4, 7, 11.6, 14, 18.6, 21, 25.6, 27.95]) {
      const data = await page.evaluate((seconds) => window.renderFrame(seconds, true), t);
      fs.writeFileSync(path.join(output, `${name}-${t}.png`), Buffer.from(data, 'base64'));
    }
    console.log(`${name}: 12 proof frames saved`);
  } else {
    const destination = path.join(root, mobile ? manifest.outputs[1] : manifest.outputs[0]);
    const encoder = spawn(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(manifest.fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', destination], { windowsHide: true });
    let error = '';
    encoder.stderr.on('data', (chunk) => { error += chunk; });
    const done = once(encoder, 'close');
    const frames = manifest.durationSeconds * manifest.fps;
    for (let frame = 0; frame < frames; frame++) {
      const data = await page.evaluate((seconds) => window.renderFrame(seconds), frame / manifest.fps);
      if (!encoder.stdin.write(Buffer.from(data, 'base64'))) await once(encoder.stdin, 'drain');
      if (frame % 168 === 0) console.log(`${name}: ${Math.round(frame / frames * 100)}%`);
    }
    encoder.stdin.end();
    const [code] = await done;
    if (code !== 0) throw new Error(error || `FFmpeg exited ${code}`);
    console.log(`${name}: ${destination} (${(fs.statSync(destination).size / 1024 / 1024).toFixed(2)} MiB)`);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const stills = process.argv.includes('--stills');
    await render(browser, false, stills);
    await render(browser, true, stills);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
