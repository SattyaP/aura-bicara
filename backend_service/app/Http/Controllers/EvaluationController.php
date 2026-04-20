<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class EvaluationController extends Controller
{
    /**
     * Validate and forward uploaded video to the AI service.
     */
    public function evaluateVideo(Request $request)
    {
        $path = null;
        $stream = null;

        try {
            $request->validate([
                'video' => ['required', 'file', 'max:51200'],
            ]);

            $uploadedVideo = $request->file('video');

            if ($uploadedVideo === null) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No video file provided.',
                ], 422);
            }

            $userId = auth('api')->id();

            if ($userId === null) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            $path = $uploadedVideo->store('temp_videos');
            $absolutePath = Storage::path($path);

            if (!is_file($absolutePath) || !is_readable($absolutePath)) {
                throw new \RuntimeException('Temporary video file is missing or unreadable.');
            }

            $stream = fopen($absolutePath, 'rb');

            if ($stream === false) {
                throw new \RuntimeException('Failed to open temporary video file for AI request.');
            }

            $response = Http::attach(
                'video',
                $stream,
                $uploadedVideo->getClientOriginalName() ?: basename($absolutePath)
            )->acceptJson()
            ->connectTimeout(10)
            ->timeout(300)
            ->post('http://127.0.0.1:5000/api/upload');

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to process video in AI service.',
                    'details' => $response->json('message') ?? $response->body(),
                ], $response->status() >= 400 ? $response->status() : 500);
            }

            $metrics = $response->json('data', []);

            $evaluation = Evaluation::create([
                'user_id' => $userId,
                'video_path' => $path,
                'wpm' => $metrics['wpm'] ?? null,
                'eye_contact_percentage' => $metrics['eye_contact_percentage'] ?? null,
                'filler_word_count' => $metrics['filler_word_count'] ?? null,
                'grade' => $metrics['predicted_grade'] ?? null,
            ]);

            $evaluationId = $evaluation->getAttribute('id');
            $wpm = $evaluation->getAttribute('wpm');
            $eyeContactPercentage = $evaluation->getAttribute('eye_contact_percentage');
            $fillerWordCount = $evaluation->getAttribute('filler_word_count');
            $predictedGrade = $evaluation->getAttribute('grade');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'evaluation_id' => $evaluationId,
                    'wpm' => $wpm,
                    'eye_contact_percentage' => $eyeContactPercentage,
                    'filler_word_count' => $fillerWordCount,
                    'predicted_grade' => $predictedGrade,
                ],
            ]);
        } catch (ConnectionException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'AI service is unreachable.',
                'details' => $exception->getMessage(),
            ], 503);
        } catch (\Throwable $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process video in AI service.',
                'details' => $exception->getMessage(),
            ], 500);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }

            if ($path) {
                Storage::delete($path);
            }
        }
    }
}
