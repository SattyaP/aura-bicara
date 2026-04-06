"""
AuraBicara - Phase 1.3: Flask Microservice for Presentation Evaluation
Exposes the trained Random Forest model via REST API.
Supports video upload with Whisper (audio) and MediaPipe (video) analysis.
"""

import os
import sys
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

from analyzer import analyze_audio, analyze_video

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Laravel/React frontend connections

# ============================================================
# Step A: Model Loading
# ============================================================
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'presentation_model.pkl')

try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ Model loaded successfully from: {MODEL_PATH}")
except FileNotFoundError:
    print("=" * 60)
    print("ERROR: Model file not found!")
    print(f"Expected path: {MODEL_PATH}")
    print("\nPlease run 'python train_model.py' first to generate the model.")
    print("=" * 60)
    sys.exit(1)
except Exception as e:
    print(f"ERROR: Failed to load model - {str(e)}")
    sys.exit(1)


# ============================================================
# Step B: API Endpoint Construction
# ============================================================
@app.route('/api/predict', methods=['POST'])
def predict_grade():
    """
    Predict presentation grade based on input features.
    
    Expected JSON payload:
    {
        "wpm": 130,
        "eye_contact_percentage": 90.0,
        "filler_word_count": 2
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['wpm', 'eye_contact_percentage', 'filler_word_count']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "status": "error",
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Convert input to DataFrame (scikit-learn expects feature names)
        input_df = pd.DataFrame([{
            'wpm': data['wpm'],
            'eye_contact_percentage': data['eye_contact_percentage'],
            'filler_word_count': data['filler_word_count']
        }])
        
        # Predict grade using the loaded model
        predicted_grade = model.predict(input_df)[0]
        
        return jsonify({
            "status": "success",
            "data": {
                "predicted_grade": predicted_grade
            }
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the service is running."""
    return jsonify({
        "status": "success",
        "message": "AuraBicara AI Service is running",
        "model_loaded": model is not None
    })


# ============================================================
# Step D: Video Upload & Analysis Endpoint
# ============================================================
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'temp_uploads')

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/upload', methods=['POST'])
def upload_and_analyze():
    """
    Upload a video file, analyze it, and return the predicted grade.
    
    Expected: multipart/form-data with 'video' file field.
    
    Returns:
        JSON with wpm, eye_contact_percentage, filler_word_count, 
        predicted_grade, and transcript.
    """
    temp_path = None
    
    try:
        # Check if video file is present in request
        if 'video' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No video file provided. Please upload a file with key 'video'."
            }), 400
        
        video_file = request.files['video']
        
        # Check if a file was actually selected
        if video_file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No file selected."
            }), 400
        
        # Validate file extension
        if not allowed_file(video_file.filename):
            return jsonify({
                "status": "error",
                "message": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Generate unique filename to avoid collisions
        file_ext = video_file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"temp_video_{uuid.uuid4().hex}.{file_ext}"
        temp_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save the uploaded file temporarily
        video_file.save(temp_path)
        print(f"✓ Video saved temporarily: {temp_path}")
        
        # Analyze audio (Whisper) - returns wpm, filler_word_count, transcript
        wpm, filler_word_count, transcript = analyze_audio(temp_path)
        
        # Analyze video (MediaPipe) - returns eye_contact_percentage
        eye_contact_percentage = analyze_video(temp_path)
        
        # Prepare input for ML model prediction
        input_df = pd.DataFrame([{
            'wpm': wpm,
            'eye_contact_percentage': eye_contact_percentage,
            'filler_word_count': filler_word_count
        }])
        
        # Predict grade using the loaded model
        predicted_grade = model.predict(input_df)[0]
        
        return jsonify({
            "status": "success",
            "data": {
                "wpm": wpm,
                "eye_contact_percentage": eye_contact_percentage,
                "filler_word_count": filler_word_count,
                "predicted_grade": predicted_grade,
                "transcript": transcript
            }
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
    finally:
        # Clean up: delete temporary video file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                print(f"✓ Temporary file cleaned up: {temp_path}")
            except Exception as cleanup_error:
                print(f"Warning: Failed to delete temp file: {cleanup_error}")


# ============================================================
# Server Execution
# ============================================================
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("AuraBicara AI Service - Starting...")
    print("=" * 60)
    print(f"POST /api/predict  - Predict grade from metrics")
    print(f"POST /api/upload   - Upload video for full analysis")
    print(f"GET  /api/health   - Health check")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
