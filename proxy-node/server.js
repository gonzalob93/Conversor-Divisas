const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BCRA_BASE = 'https://estadisticascambiarias.bcra.gob.ar/Cotizaciones';

app.use(cors());
app.use(express.json());

/* ── Proxy principal ─────────────────────────────────────────────────────── */
app.get('/cotizaciones', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const url = `${BCRA_BASE}?${params}`;

    console.log(`[BCRA] GET ${url}`);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      timeout: 10000,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `BCRA respondió con HTTP ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[BCRA] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── Health check ────────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Proxy BCRA corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/cotizaciones`);
});
