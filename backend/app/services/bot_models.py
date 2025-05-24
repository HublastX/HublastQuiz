from app.services.llm_base import LLMBase
from app.settings.settings import settings
from google import genai

GOOGLE_API_KEY = settings.GOOGLE_API_KEY

client = genai.Client(api_key=GOOGLE_API_KEY)


def botModelGemini():
    modelo_base = LLMBase(
        provider="google",
        model="gemini-2.0-flash",
        temperature=0.3,
        api_key=GOOGLE_API_KEY,
    )

    return modelo_base
