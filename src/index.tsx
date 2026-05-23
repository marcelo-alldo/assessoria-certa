import '@i18n/i18n';
import './styles/index.css';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import routes from 'src/configs/routesConfig';

// Captura falhas de import() dinâmico que ocorrem fora da árvore React
// (ex: route loaders, event handlers) — causadas por deploys com novos chunk hashes
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;

  if (
    error instanceof Error &&
    (error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module'))
  ) {
    const CHUNK_RELOAD_KEY = 'chunk_reload_attempted';
    const alreadyAttempted = sessionStorage.getItem(CHUNK_RELOAD_KEY);

    if (!alreadyAttempted) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
      window.location.reload();
    }
  }
});

// async function mockSetup() {
// 	return worker.start({
// 		onUnhandledRequest: 'bypass',
// 		serviceWorker: {
// 			url: `${API_BASE_URL}/mockServiceWorker.js`
// 		}
// 	});
// }

/**
 * The root element of the application.
 */
const container = document.getElementById('app');

if (!container) {
  throw new Error('Failed to find the root element');
}

// mockSetup().then(() => {
// 	/**
// 	 * The root component of the application.
// 	 */
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    console.error('UncaughtError error', error, errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    console.error('Caught error', error, errorInfo.componentStack);
  },
});

const router = createBrowserRouter(routes);

root.render(<RouterProvider router={router} />);
// });
