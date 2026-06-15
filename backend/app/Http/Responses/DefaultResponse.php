<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

/**
 * Padronização das respostas e respostas de erros para o frontend.
 */
class DefaultResponse {
    public static function HTTPResponse($data = [], $message = '', $status = 200): JsonResponse {
        return response()->json([
            'data' => $data,
            'message' => $message,
            'status' => $status,
        ], $status);
    }

    public static function HTTPErrorResponse($message = '', $errors = [], $status = 500): JsonResponse {
        return response()->json([
            'message' => $message,
            'status' => $status,
            'errors' => $errors
        ], $status);
    }

    public static function HTTPResponseNoContent(): JsonResponse {
        return response()->json([''], 204);
    }
}