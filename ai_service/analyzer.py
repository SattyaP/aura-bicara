"""
AuraBicara - Phase 1.3: Video & Audio Analyzer
Analyzes presentation videos using Whisper (speech-to-text) and MediaPipe (face detection).
"""

import re
import cv2
import whisper
import numpy as np

# ============================================================
# Step A: Model Initialization (loaded once globally)
# ============================================================
print("[Analyzer] Loading Whisper model (base)... This may take a moment on first run.")
whisper_model = whisper.load_model("base")
print("✓ Whisper model loaded successfully.")

print("[Analyzer] Initializing Face Detection (OpenCV Haar Cascade)...")
# Use OpenCV's Haar Cascade instead of MediaPipe for better compatibility
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
print("✓ Face Detection initialized successfully.")

# Common Indonesian filler words
INDONESIAN_FILLERS = [
    "eee", "ee", "e", "emm", "em", "hmm", "hm", "uhh", "uh",
    "anu", "kayak", "gitu", "gitulah", "kan", "kok", "sih",
    "tuh", "nah", "yah", "ya", "jadi", "terus"
]


# ============================================================
# Step B: Audio Extraction & NLP (Whisper)
# ============================================================
def analyze_audio(video_path):
    """
    Analyze audio from video using Whisper for Indonesian speech-to-text.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        tuple: (wpm, filler_word_count, transcript)
    """
    # Get video duration using OpenCV
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    duration_seconds = frame_count / fps if fps > 0 else 0
    cap.release()
    
    if duration_seconds == 0:
        raise ValueError("Video duration is zero or could not be determined")
    
    # Transcribe audio using Whisper (Indonesian language)
    print(f"[Analyzer] Transcribing audio (duration: {duration_seconds:.1f}s)...")
    result = whisper_model.transcribe(video_path, language="id")
    transcript = result["text"].strip()
    print(f"✓ Transcription complete: {len(transcript)} characters")
    
    # Calculate Words Per Minute (WPM)
    words = transcript.split()
    word_count = len(words)
    duration_minutes = duration_seconds / 60.0
    wpm = int(word_count / duration_minutes) if duration_minutes > 0 else 0
    
    # Count filler words
    transcript_lower = transcript.lower()
    filler_word_count = 0
    
    for filler in INDONESIAN_FILLERS:
        # Use word boundary matching to avoid partial matches
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, transcript_lower)
        filler_word_count += len(matches)
    
    print(f"✓ Analysis: WPM={wpm}, Fillers={filler_word_count}")
    
    return wpm, filler_word_count, transcript


# ============================================================
# Step C: Video Processing & CV (OpenCV Haar Cascade)
# ============================================================
def analyze_video(video_path):
    """
    Analyze video for eye contact using OpenCV Haar Cascade face detection.
    
    Eye contact is estimated by detecting face presence in frames.
    A higher face detection rate suggests the speaker is looking at the camera.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        float: eye_contact_percentage (0.0 to 100.0)
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")
    
    total_frames = 0
    face_detected_frames = 0
    
    # Process every nth frame for efficiency (skip frames)
    frame_skip = 3  # Process every 3rd frame
    frame_index = 0
    
    print("[Analyzer] Processing video frames for face detection...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_index += 1
        
        # Skip frames for efficiency
        if frame_index % frame_skip != 0:
            continue
        
        total_frames += 1
        
        # Convert to grayscale for Haar Cascade
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        # Check if at least one face is detected
        if len(faces) > 0:
            face_detected_frames += 1
    
    cap.release()
    
    # Calculate eye contact percentage
    if total_frames > 0:
        eye_contact_percentage = (face_detected_frames / total_frames) * 100.0
    else:
        eye_contact_percentage = 0.0
    
    eye_contact_percentage = round(eye_contact_percentage, 2)
    print(f"✓ Face detection: {face_detected_frames}/{total_frames} frames ({eye_contact_percentage}%)")
    
    return eye_contact_percentage


def analyze_presentation(video_path):
    """
    Complete presentation analysis combining audio and video analysis.
    
    Args:
        video_path: Path to the video file
        
    Returns:
        dict: Analysis results with wpm, filler_word_count, eye_contact_percentage, transcript
    """
    print(f"\n{'='*60}")
    print(f"[Analyzer] Starting full presentation analysis...")
    print(f"Video: {video_path}")
    print(f"{'='*60}\n")
    
    # Analyze audio (speech)
    wpm, filler_word_count, transcript = analyze_audio(video_path)
    
    # Analyze video (face/eye contact)
    eye_contact_percentage = analyze_video(video_path)
    
    print(f"\n{'='*60}")
    print("[Analyzer] Analysis complete!")
    print(f"{'='*60}\n")
    
    return {
        "wpm": wpm,
        "filler_word_count": filler_word_count,
        "eye_contact_percentage": eye_contact_percentage,
        "transcript": transcript
    }
