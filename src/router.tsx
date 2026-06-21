import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { NotFound } from './pages/NotFound';

// Route-level code splitting: each page is its own chunk so the initial load
// only ships the catalog. (Named exports → map to { default }.)
const Catalog = lazy(() =>
  import('./pages/Catalog').then((m) => ({ default: m.Catalog })),
);
const MovementDetail = lazy(() =>
  import('./pages/MovementDetail').then((m) => ({ default: m.MovementDetail })),
);
const Compare = lazy(() =>
  import('./pages/Compare').then((m) => ({ default: m.Compare })),
);
const Parts = lazy(() =>
  import('./pages/Parts').then((m) => ({ default: m.Parts })),
);
const BuildPlanner = lazy(() =>
  import('./pages/BuildPlanner').then((m) => ({ default: m.BuildPlanner })),
);
const Learn = lazy(() =>
  import('./pages/Learn').then((m) => ({ default: m.Learn })),
);
const Education = lazy(() =>
  import('./pages/Education').then((m) => ({ default: m.Education })),
);
const EduArticle = lazy(() =>
  import('./pages/EduArticle').then((m) => ({ default: m.EduArticle })),
);
const Brands = lazy(() =>
  import('./pages/Brands').then((m) => ({ default: m.Brands })),
);
const BrandDetail = lazy(() =>
  import('./pages/BrandDetail').then((m) => ({ default: m.BrandDetail })),
);
const About = lazy(() =>
  import('./pages/About').then((m) => ({ default: m.About })),
);

// basename is derived from Vite's base (BASE_PATH in vite.config.ts) so routing
// stays in sync with the GitHub Pages deployment automatically. '/mimir/' → '/mimir'.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Catalog /> },
        { path: 'movement/:id', element: <MovementDetail /> },
        { path: 'compare', element: <Compare /> },
        { path: 'parts', element: <Parts /> },
        { path: 'build', element: <BuildPlanner /> },
        { path: 'education', element: <Education /> },
        { path: 'education/brands', element: <Brands /> },
        { path: 'education/brand/:slug', element: <BrandDetail /> },
        { path: 'education/:slug', element: <EduArticle /> },
        { path: 'learn', element: <Learn /> },
        { path: 'about', element: <About /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename,
    future: { v7_relativeSplatPath: true },
  },
);
