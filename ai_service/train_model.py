"""
AuraBicara - Phase 1.1: Synthetic Data Generation & Model Training
Trains a Random Forest classifier to evaluate public speaking performance.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib


def assign_grade(row):
    """Assign grade based on presentation metrics heuristics."""
    wpm = row['wpm']
    eye_contact = row['eye_contact_percentage']
    filler = row['filler_word_count']
    
    # Grade 'A' (Excellent): wpm 110-150 AND eye_contact > 80 AND filler < 5
    if 110 <= wpm <= 150 and eye_contact > 80 and filler < 5:
        return 'A'
    # Grade 'B' (Good): wpm 90-160 AND eye_contact > 60 AND filler < 12
    elif 90 <= wpm <= 160 and eye_contact > 60 and filler < 12:
        return 'B'
    # Grade 'C' (Fair): wpm 70-170 AND eye_contact > 40 AND filler < 20
    elif 70 <= wpm <= 170 and eye_contact > 40 and filler < 20:
        return 'C'
    # Grade 'D' (Poor): Anything else
    else:
        return 'D'


def generate_synthetic_data(n_samples=5000, random_seed=42):
    """Generate synthetic presentation evaluation data."""
    np.random.seed(random_seed)
    
    data = {
        'wpm': np.random.randint(50, 201, size=n_samples),
        'eye_contact_percentage': np.round(np.random.uniform(0.0, 100.0, size=n_samples), 2),
        'filler_word_count': np.random.randint(0, 31, size=n_samples)
    }
    
    df = pd.DataFrame(data)
    df['grade'] = df.apply(assign_grade, axis=1)
    
    return df


def train_model(df):
    """Train a Random Forest classifier on the presentation data."""
    # Prepare features and target
    X = df[['wpm', 'eye_contact_percentage', 'filler_word_count']]
    y = df['grade']
    
    # Split data: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train Random Forest Classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("=" * 60)
    print("AuraBicara - Model Training Results")
    print("=" * 60)
    print(f"\nModel Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)\n")
    print("Classification Report:")
    print("-" * 60)
    print(classification_report(y_test, y_pred))
    print("=" * 60)
    
    return model


def main():
    print("\n[Step A] Generating synthetic data (5,000 samples)...")
    df = generate_synthetic_data(n_samples=5000)
    
    # Save synthetic data to CSV
    csv_path = 'synthetic_presentation_data.csv'
    df.to_csv(csv_path, index=False)
    print(f"✓ Synthetic data saved to: {csv_path}")
    
    # Display grade distribution
    print("\nGrade Distribution:")
    print(df['grade'].value_counts().sort_index())
    
    print("\n[Step B] Training Random Forest model...")
    model = train_model(df)
    
    # Export trained model
    model_path = 'presentation_model.pkl'
    joblib.dump(model, model_path)
    print(f"\n✓ Trained model exported to: {model_path}")
    print("\nPhase 1.1 completed successfully!")


if __name__ == "__main__":
    main()
