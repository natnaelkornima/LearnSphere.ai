import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "LearnSphere AI"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "learnsphere-super-secret-key-development-2026"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/learnsphere"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/learnsphere"

    # Supabase / Storage
    SUPABASE_URL: str = "https://dummy-project.supabase.co"
    SUPABASE_ANON_KEY: str = "dummy-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "dummy-service-role-key"
    SUPABASE_STORAGE_BUCKET: str = "documents"

    # AI Configuration
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_PROVIDER: str = "gemini"
    EMBEDDING_MODEL: str = "text-embedding-004"
    EMBEDDING_DIMENSIONS: int = 768

    # CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Limits
    MAX_UPLOAD_SIZE_MB: int = 25
    MAX_DOCUMENT_PAGES: int = 500

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()

