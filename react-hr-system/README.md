## React HR System

Frontend for the HR Management demo. Built with Vite and React 19.

### Getting started

```bash
cp .env.example .env
# edit VITE_API_BASE_URL if needed
npm install
npm run dev
```

### Building for production

```bash
npm run build
npm run preview
```

The app expects a Cloudflare Worker API running at `VITE_API_BASE_URL`.

### Capturing screenshots with Playwright

Install browsers once and run the script:

```bash
npx playwright install
npm run screenshot
```

Screenshots are written to the `screenshots/` directory.
