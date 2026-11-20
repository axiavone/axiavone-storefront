import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const DEFAULT_GA_MEASUREMENT_ID = 'G-TJMYJBQTXS';
const DEFAULT_SITE_URL = 'https://axiavone-storefront.vercel.app';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeGscToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const contentMatch = trimmed.match(/content\s*=\s*["']([^"']+)["']/i);
  return (contentMatch ? contentMatch[1] : trimmed).trim();
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  const rawGaId = (
    env.VITE_GA_MEASUREMENT_ID ||
    env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.VITE_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    DEFAULT_GA_MEASUREMENT_ID
  ).trim();
  const gaMeasurementId = /^G-[A-Z0-9]+$/i.test(rawGaId)
    ? rawGaId
    : DEFAULT_GA_MEASUREMENT_ID;

  const gscToken = normalizeGscToken(
    env.VITE_GOOGLE_SITE_VERIFICATION ||
      env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.VITE_GOOGLE_SITE_VERIFICATION ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      ''
  );

  const rawSiteUrl = (
    env.VITE_SITE_URL ||
    env.NEXT_PUBLIC_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_SITE_URL
  )
    .trim()
    .replace(/\/+$/, '');
  const siteUrl = /^https?:\/\//i.test(rawSiteUrl) ? rawSiteUrl : DEFAULT_SITE_URL;

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-analytics-and-gsc',
        transformIndexHtml(html: string): string {
          let updated = html.replaceAll(DEFAULT_GA_MEASUREMENT_ID, gaMeasurementId);
          updated = updated.replaceAll(DEFAULT_SITE_URL, escapeHtmlAttr(siteUrl));

          const gscMetaTag = gscToken
            ? `<meta name="google-site-verification" content="${escapeHtmlAttr(gscToken)}" />`
            : '';
          updated = updated.replace('<!-- %GSC_VERIFICATION_META% -->', gscMetaTag);
          return updated;
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
