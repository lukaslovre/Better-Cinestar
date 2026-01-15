# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Developing

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Announcement bar (optional)

The announcement bar above the header is controlled directly in the component.

- Toggle it via the `enabled` boolean in [src/lib/components/AnnouncementBar.svelte](src/lib/components/AnnouncementBar.svelte)
- Change the message via the `message` constant (and optionally `href`)
