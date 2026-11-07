import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import LearnSphereException

# Logging configuration
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("learnsphere")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LearnSphere AI backend...")
    # Verify database connection and create tables if in dev/test mode
    try:
        async with engine.begin() as conn:
            # Enable pgvector extension if available on PostgreSQL
            if not engine.url.drivername.startswith("sqlite"):
                try:
                    await conn.execute(
                        __import__("sqlalchemy").text("CREATE EXTENSION IF NOT EXISTS vector")
                    )
                except Exception as ext_err:
                    logger.warning(f"Could not automatically create vector extension: {ext_err}")
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection and schema tables verified.")
    except Exception as e:
        logger.error(f"Database connection error on startup: {e}")
    yield
    logger.info("Shutting down LearnSphere AI backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Centralized exception handling
@app.exception_handler(LearnSphereException)
async def handle_learnsphere_exception(request: Request, exc: LearnSphereException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
        headers=exc.headers,
    )


@app.exception_handler(Exception)
async def handle_generic_exception(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later."
                if not settings.DEBUG
                else str(exc),
                "details": None,
            }
        },
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0",
    }


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

