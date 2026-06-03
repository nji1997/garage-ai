import { Resvg } from '@resvg/resvg-js';
import { writeFile } from 'fs/promises';

// Clean hand-crafted coupe silhouette on indigo background.
// Body path traced clockwise; arch masks (same color as background) overlay
// the body/wheel boundary to carve out realistic wheel wells.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4F46E5"/>

  <!-- Car body: coupe silhouette, flat bottom at y=323 -->
  <path fill="white" d="
    M 52,285
    C 52,264 60,248 80,243
    L 148,233
    C 166,196 192,165 226,155
    L 312,152
    C 348,152 380,172 406,212
    L 434,252
    C 445,262 456,276 456,298
    L 456,316
    Q 455,323 447,323
    L 68,323
    C 56,323 52,310 52,285
    Z
  "/>

  <!-- Rear wheel (left) -->
  <circle fill="white" cx="130" cy="358" r="44"/>
  <!-- Front wheel (right) -->
  <circle fill="white" cx="382" cy="358" r="44"/>

  <!-- Wheel arch masks: indigo upper semicircles sit on top of body+wheel,
       carving out the wheel-well shape by revealing the background -->
  <path fill="#4F46E5" d="M 84,323 A 46,46 0 0 0 176,323 Z"/>
  <path fill="#4F46E5" d="M 336,323 A 46,46 0 0 0 428,323 Z"/>
</svg>`;

const sizes = [
  { size: 192, file: 'public/icon-192.png' },
  { size: 512, file: 'public/icon-512.png' },
  { size: 180, file: 'public/apple-touch-icon.png' },
];

for (const { size, file } of sizes) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const rendered = resvg.render();
  const png = rendered.asPng();
  await writeFile(file, png);
  console.log(`Generated ${file} (${size}x${size})`);
}

console.log('Done.');
