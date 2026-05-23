import base64
import cv2
import numpy as np
from deepface import DeepFace
import traceback

class AIService:
    @staticmethod
    def analyze_face_image(image_base64: str):
        try:
            cleaned_base64 = image_base64.strip().replace("\n", "").replace("\r", "").replace(" ", "+")

            if "," in cleaned_base64:
                base64_data = cleaned_base64.split(",")[1]
            else:
                base64_data = cleaned_base64

            missing_padding = len(base64_data) % 4
            if missing_padding:
                base64_data += '=' * (4 - missing_padding)

            img_bytes = base64.b64decode(base64_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                print("[ERROR AI] OpenCV gagal merakit gambar (frame is None). Teks Base64 salah format.")
                raise ValueError("Format gambar tidak valid atau korup")

            results = DeepFace.analyze(
                img_path=frame,
                actions=['emotion', 'age', 'gender'],
                detector_backend='opencv',
                enforce_detection=False
            )
            result = results[0]

            emotion = result['dominant_emotion']
            age = result['age']
            confidence = result['emotion'][emotion] / 100

            gender_scores = result['gender']

            woman_score = 0.0
            man_score = 0.0
            
            for key, value in gender_scores.items():
                if key.lower() == 'woman':
                    woman_score = value
                elif key.lower() == 'man':
                    man_score = value

            raw_dominant = str(result.get('dominant_gender', '')).lower()

            if woman_score == 0 and man_score == 0:
                if 'woman' in raw_dominant or 'female' in raw_dominant:
                    gender = "female"
                else:
                    gender = "male"
            else:
                if woman_score > 30.0:
                    gender = "female"
                else:
                    gender = "male"

            return {
                "predicted_age": int(age),
                "confidence_score": round(confidence, 4),
                "emotion": emotion,
                "gender": gender
            }

        except Exception as e:
            print("[CRITICAL ERROR DI AISERVICE PYTHON]")
            traceback.print_exc()
            raise ValueError(f"Proses AI gagal mengeksekusi gambar: {str(e)}")