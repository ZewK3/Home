# HR System Frontend

React + Vite implementation for the HR management system.

## Setup
1. Copy environment file and adjust variables
   ```bash
   cp .env.example .env
   # edit .env if needed
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start development server
   ```bash
   npm run dev
   ```

## Production
Build optimized assets with:
```bash
npm run build
```

The app expects the backend worker to be available at the URL defined in `VITE_API_BASE_URL`.
