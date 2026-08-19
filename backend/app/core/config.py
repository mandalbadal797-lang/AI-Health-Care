import os
from typing import List, Union
from pydantic import Field, AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "MindCampus API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production_9f8e7d6c5b4a321"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./mindcampus_dev.db"

    # AI Configuration (Backend only)
    AI_PROVIDER: str = "fallback"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-1.5-flash"
    AI_MAX_TOKENS: int = 1000
    AI_TEMPERATURE: float = 0.7
    GEMINI_API_KEY: str = "mock_dev_gemini_key"
    OPENAI_API_KEY: str = "mock_dev_openai_key"

    # Uploads
    UPLOAD_DIR: str = "backend/static/uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
