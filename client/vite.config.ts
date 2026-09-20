// Vite runs the frontend development server and builds the production frontend.
// These plugins teach it how to process Tailwind CSS and SvelteKit files.
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
// This helper gives the editor type checking and suggestions for Vite settings.
import { defineConfig } from 'vite';

// Vite loads this exported configuration when you run `npm run dev` or `npm run build`.
export default defineConfig({
  // Tailwind generates utility CSS; SvelteKit handles Svelte components and app routes.
  plugins: [tailwindcss(), sveltekit()],
  // These settings apply to the development server, not the deployed web server.
  server: {
    // `fs` means file system: control which local files Vite is allowed to serve.
    fs: {
      // Paths here are relative to the client project root. `..` is the repo root,
      // allowing imports from shared/cinemas.json as well as files inside client/.
      // This permits access; it does not automatically include every file in the app.
      allow: ['..']
    }
  }
});
