from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.weather import router
from app.config import settings

app = FastAPI(title="Weather Forecast API", version="1.0.0")

# Origins are comma-separated in the env var, e.g.:
# ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # covers all Vercel preview URLs
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Weather API is running"}
