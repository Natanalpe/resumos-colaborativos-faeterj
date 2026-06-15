<?php

namespace App\Validations;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

/**
 * Validações padronizadas para o controller de feedbacks/review
 */
class ReviewsValidations {
    public static function validateCreateOrUpdateReview(Request $request) {
        $rules = [
            'review|in:perfeito,util,confuso,none'
        ];
        $arrayRequest = $request->toArray();
        return Validator::make($arrayRequest, $rules);
    }
}
