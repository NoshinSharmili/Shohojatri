from pydantic import BaseModel


class ClientConfig(BaseModel):
    # Base of share links and QR codes; null → the web app uses its own origin (development).
    public_web_url: str | None
