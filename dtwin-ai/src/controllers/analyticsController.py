import os
from fastapi import HTTPException, Header
from pydantic import BaseModel
from src.services.aiService import AIService

class FaceAnalyzeRequest(BaseModel):
    image_base64: str

SECRET_TOKEN = os.getenv("SECRET_TOKEN_AI")

class AnalyticsController:
    @staticmethod
    async def process_face_analysis(payload: FaceAnalyzeRequest, authorization: str = Header(None)):
        if authorization != f"Bearer {SECRET_TOKEN}":
            raise HTTPException(status_code=401, detail="Unauthorized")

        try:
            ai_result = AIService.analyze_face_image(payload.image_base64)
            
            return {
                "status": "success",
                "data": ai_result
            }
        except ValueError as val_err:
            raise HTTPException(status_code=400, detail=str(val_err))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))