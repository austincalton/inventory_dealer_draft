# Vue App

A basic Vue.js application setup with Vite and configured for GitHub Pages deployment.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

The project is configured to automatically deploy to GitHub Pages when pushing to the main branch. The deployment is handled by GitHub Actions workflow in `.github/workflows/deploy.yml`.

To deploy manually:

```bash
npm run build
npm run deploy
```

## Project Structure

- `index.html` - Main HTML file
- `src/main.js` - Vue app entry point
- `src/components/` - Vue components
- `vite.config.js` - Vite configuration with GitHub Pages base path

vue-app/
  src/
    api/
      components.js
      preview.js
    stores/
      builderStore.js
    views/
      BuilderView.vue
    components/
      BrandSelector.vue
      ComponentLibrary.vue
      ComponentCard.vue
      PreviewPanel.vue
      IframePreview.vue


rails-app/
  app/controllers/api/components_controller.rb
  app/controllers/api/preview_controller.rb

Rails = data + preview rendering
Vue = UI + state management