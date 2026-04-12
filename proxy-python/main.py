"""
Proxy BCRA — FastAPI
Instalar: pip install fastapi uvicorn httpx
Correr:   uvicorn main:app --reload
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bcra-proxy")

app = FastAPI(
    title="Proxy BCRA",
    description="Proxy para la API de estadísticas cambiarias del BCRA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

BCRA_BASE = "https://estadisticascambiarias.bcra.gob.ar/Cotizaciones"


@app.get("/cotizaciones")
async def proxy_cotizaciones(request: Request):
    params = dict(request.query_params)
    logger.info(f"GET /cotizaciones params={params}")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                BCRA_BASE,
                params=params,
                headers={"Accept": "application/json"},
            )
        r.raise_for_status()
        return r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
