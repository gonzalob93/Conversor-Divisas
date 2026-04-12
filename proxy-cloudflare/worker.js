/**
 * Proxy BCRA — Cloudflare Worker
 *
 * Deploy:
 *   1. Instalá Wrangler: npm install -g wrangler
 *   2. Autenticá: wrangler login
 *   3. Publicá: wrangler deploy
 *
 * Una vez publicado, reemplazá BASE en el frontend por la URL del worker.
 */

const BCRA_BASE = 'https://estadisticascambiarias.bcra.gob.ar/Cotizaciones';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const bcraUrl = `${BCRA_BASE}${url.search}`;

    try {
      const response = await fetch(bcraUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `BCRA HTTP ${response.status}` }),
          { status: response.status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
  },
};
