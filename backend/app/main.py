from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.routes import routers
from app.core.config import get_settings
from app.db.base import Base
from app.db.init_db import seed_database
from app.db.session import SessionLocal, engine

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="Smart Karnataka Nyaya — Karnataka Government Legal Assistance Platform",
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API routes
    for router in routers:
        app.include_router(router, prefix=settings.api_prefix)

    @app.get("/health", tags=["System"])
    def health():
        return {"status": "ok", "service": settings.app_name, "version": "1.0.0"}

    @app.get(settings.api_prefix + "/config/public", tags=["System"])
    def get_public_config():
        return {"web3forms_access_key": settings.web3forms_access_key}

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_database(db)

    # Serve the built React frontend
    if STATIC_DIR.exists():
        app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

        @app.get("/{full_path:path}")
        def serve_frontend(full_path: str):
            file_path = STATIC_DIR / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            # If the browser is asking for an asset that no longer exists, return 404
            # instead of returning index.html (which causes SyntaxError: Unexpected token '<')
            if full_path.startswith("assets/"):
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Asset not found")
            return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
