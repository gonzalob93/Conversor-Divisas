# Conversor de divisas — BCRA

Calculadora de tipos de cambio que consume la API pública de estadísticas cambiarias del [Banco Central de la República Argentina (BCRA)](https://estadisticascambiarias.bcra.gob.ar).

## Características

- Conversión entre cualquier par de monedas disponible en el BCRA
- Tasa directa e inversa visibles simultáneamente
- Selector de fecha para consultar cotizaciones históricas
- Gráfico de evolución del par seleccionado (7, 30, 90 y 180 días)
- Estadísticas del período: mínimo, máximo, variación porcentual
- Panel con todas las cotizaciones del día en ARS
- Modo oscuro automático según preferencia del sistema
- Fallback con datos de ejemplo si la API no está disponible

## Estructura del proyecto

```
bcra-conversor/
├── frontend/
│   └── index.html          # App completa (HTML + CSS + JS, sin dependencias externas)
├── proxy-node/
│   ├── server.js           # Proxy Express para evitar restricciones CORS
│   └── package.json
├── proxy-python/
│   ├── main.py             # Proxy FastAPI
│   └── requirements.txt
├── proxy-cloudflare/
│   ├── worker.js           # Cloudflare Worker (edge, gratis)
│   └── wrangler.toml
├── .gitignore
└── README.md
```

## Inicio rápido

### Opción A — Sin proxy (directo al BCRA)

Si la API del BCRA permite CORS desde tu dominio, simplemente abrí `frontend/index.html` en el navegador. La URL base ya está configurada para apuntar directamente a la API.

### Opción B — Con proxy (recomendado para producción)

Si la API devuelve errores CORS, levantá uno de los proxies incluidos y actualizá la constante `BASE` en `frontend/index.html`:

```js
// Línea ~12 de frontend/index.html
const BASE = 'https://tu-proxy.com/cotizaciones';
```

## Proxies disponibles

### Node.js + Express

Ideal para deployar en Vercel, Railway o Render.

```bash
cd proxy-node
npm install
npm start
# Proxy disponible en http://localhost:3000/cotizaciones
```

Variables de entorno opcionales:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT`   | `3000`  | Puerto del servidor |

### Python + FastAPI

Ideal para Railway, Fly.io o PythonAnywhere.

```bash
cd proxy-python
pip install -r requirements.txt
uvicorn main:app --reload
# Proxy disponible en http://localhost:8000/cotizaciones
```

### Cloudflare Worker

La opción más simple: edge computing gratuito, sin servidor que mantener.

```bash
cd proxy-cloudflare
npm install -g wrangler
wrangler login
wrangler deploy
# El worker queda disponible en https://bcra-proxy.<tu-usuario>.workers.dev
```

## API del BCRA

El proyecto consume el endpoint público:

```
GET https://estadisticascambiarias.bcra.gob.ar/Cotizaciones
```

Parámetros utilizados:

| Parámetro    | Tipo   | Descripción                        |
|--------------|--------|------------------------------------|
| `fechadesde` | string | Fecha inicio `YYYY-MM-DD`          |
| `fechahasta` | string | Fecha fin `YYYY-MM-DD`             |
| `limit`      | number | Máximo de registros en la respuesta |

Ejemplo de respuesta:

```json
{
  "results": [
    {
      "fecha": "2024-04-10",
      "codigoMoneda": "USD",
      "tipoPase": 1050.00
    }
  ]
}
```

La conversión entre dos monedas no-ARS se realiza cruzando a través del peso argentino:

```
resultado = monto × cotización_origen_ARS ÷ cotización_destino_ARS
```

## Deploy del frontend

El frontend es un único archivo HTML sin dependencias de build. Podés hostearlo en:

- **GitHub Pages**: activá Pages en Settings → Pages → Branch `main` → carpeta `/frontend`
- **Netlify**: arrastrá la carpeta `frontend/` al panel de Netlify
- **Vercel**: `vercel --cwd frontend`
- Cualquier hosting estático (S3, Cloudflare Pages, etc.)

## Licencia

MIT — libre para usar, modificar y distribuir.
