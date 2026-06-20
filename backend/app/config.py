"""Configuração via variáveis de ambiente (.env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql:///pontes?host=/var/run/postgresql"
    cors_origins: str = "http://localhost:5174,http://localhost:5173,http://localhost:5175"

    # Fonte de dados abertos da CTTU (usado pelo ingest)
    cttu_base: str = "https://dados.recife.pe.gov.br"
    cttu_resource: str = "3e67a327-db30-4d4c-bd44-928e26e33c3f"
    cttu_data: str = "2018-08-28"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
