from fastapi import APIRouter
from src.controllers.analyticsController import AnalyticsController, FaceAnalyzeRequest

router = APIRouter(prefix="/api", tags=["AI Analytics"])

router.post("/face-detection")(AnalyticsController.process_face_analysis)