from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import routers
from app.core.config import get_settings
from app.db.base import Base
from app.db.init_db import seed_database
from app.db.session import SessionLocal, engine


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

    return app


app = create_app()
