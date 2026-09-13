import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../referrals.json', import.meta.url)));
if (config.codes.length !== 35 || new Set(config.codes).size !== 35 || config.codes.some(code => !/^[1-9][0-9]{5}$/.test(code))) throw Error('Expected 35 unique six-digit codes');
const runtime = readFileSync(new URL('./referral-runtime.js', import.meta.url), 'utf8');
const aliases = Object.entries(config.aliases ?? {});
if (aliases.length !== 35 || new Set(aliases.map(([, code]) => code)).size !== 35 ||
    aliases.some(([slug, code]) => !/^[a-z]+(?:-[a-z]+)*$/.test(slug) || !config.codes.includes(code))) {
  throw Error('Expected 35 unique word aliases mapped to the existing codes');
}
for (const [path, code] of [...config.codes.map(code => [code, code]), ...aliases]) {
  const dir = new URL(`../${path}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<meta http-equiv="refresh" content="2;url=${config.destination}">
<title>Hey Sammy</title>
<script>window.referralConfig=${JSON.stringify({code, destination:config.destination, token:config.token})};\n${runtime}</script>
</head><body><a href="${config.destination}">App Store</a></body></html>\n`);
}
