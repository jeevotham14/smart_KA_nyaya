from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import routers
from app.core.config import get_settings
from app.db.base import Base
from app.db.init_db import seed_database
from app.db.session import SessionLocal, engine

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in routers:
        app.include_router(router, prefix=settings.api_prefix)

    @app.get("/health", tags=["System"])
    def health():
        return {"status": "ok", "service": settings.app_name}

    @app.on_event("startup")
    def on_startup():
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_database(db)

    # Serve the built React frontend
    if STATIC_DIR.exists():
        # Serve static assets (JS, CSS, images)
        app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

        # Catch-all: serve index.html for any non-API route (SPA routing)
        @app.get("/{full_path:path}")
        def serve_frontend(full_path: str):
            file_path = STATIC_DIR / full_path
            if file_path.is_file():
                return FileResponse(file_path)
            return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
