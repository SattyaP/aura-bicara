<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'video_path',
        'wpm',
        'eye_contact_percentage',
        'filler_word_count',
        'grade',
    ];

    /**
     * Get the user that owns this evaluation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
