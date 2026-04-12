const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BCRA = 'https://api.bcra.gob.ar/estadisticascambiarias/v1.0';

app.use(cors());

/*
  GET /cotizaciones?fecha=YYYY-MM-DD
  → Proxy a BCRA: /Cotizaciones?fecha=...
  Devuelve todas las cotizaciones del día.
*/
app.get('/cotizaciones', async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
    const url = `${BCRA}/Cotizaciones?fecha=${fecha}`;
    console.log(`[BCRA] GET ${url}`);
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error('[BCRA] Error cotizaciones:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/*
  GET /historial/:moneda?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD&limit=N
  → Proxy a BCRA: /Cotizaciones/{codMoneda}?fechaDesde=...&fechaHasta=...&limit=...
  Devuelve la evolución histórica de una moneda.
*/
app.get('/historial/:moneda', async (req, res) => {
  try {
    const { moneda } = req.params;
    const params = new URLSearchParams();
    if (req.query.fechaDesde) params.set('fechaDesde', req.query.fechaDesde);
    if (req.query.fechaHasta) params.set('fechaHasta', req.query.fechaHasta);
    if (req.query.limit)      params.set('limit', req.query.limit);
    if (req.query.offset)     params.set('offset', req.query.offset);

    const url = `${BCRA}/Cotizaciones/${moneda}?${params}`;
    console.log(`[BCRA] GET ${url}`);
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error('[BCRA] Error historial:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/*
  GET /divisas
  → Lista de todas las monedas disponibles.
*/
app.get('/divisas', async (req, res) => {
  try {
    const url = `${BCRA}/Maestros/Divisas`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Proxy BCRA corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/cotizaciones`);
});
