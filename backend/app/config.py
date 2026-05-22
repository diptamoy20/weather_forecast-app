from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openweather_api_key: str
    # Comma-separated list of allowed origins, e.g.:
    # http://localhost:5173,https://your-app.vercel.app
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
