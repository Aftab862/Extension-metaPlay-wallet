# React + Vite

<!-- To intall packages  -->

npm install --f

<!-- To extract the build run these commands: -->

npm run build
npx esbuild src/background.js --bundle --outfile=dist/background.js --format=iife --minify
npx esbuild src/content.jsx --bundle --outfile=dist/content.js --format=iife --minify
npx esbuild src/popup.jsx --bundle --outfile=dist/popup.js --format=iife --minify


<!-- For approval, please submit the build as a ZIP folder to chrome webstore -->



/public
  ├─ manifest.json
  ├─ popup.html
  └─ icons/
/src
  ├─ popup.jsx         ← React-based popup UI
  └─ background.js     ← Background service worker (wallet logic)
/vite.config.js        ← Build config for popup (and optionally background)
/package.json
/package-lock.json
/README.md
