<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\Reviews;
use App\Validations\ReviewsValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
/**
 * Controller responsável pelo controle das interações com os resumos.
 * Há três tipos de interações, perfeito, útil e confuso.
 * 
 * As interações servem como meio do usuário poder atestar a credibilidade de um resumo.
 */
class ReviewController extends Controller
{

    // Adiciona ou atualiza a interação a um resumo.
    public function updateOrCreate(Request $request, $document_id)
    {

        try {
            // Pega o usuário autenticado.
            $user_id = Auth::user()->id;

            // Se o resumo não existir, retorna um erro 404.
            if (!$document_id) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    [],
                    422
                );
            }

            // Valida os dados do corpo da requisição.
            $validator = ReviewsValidations::validateCreateOrUpdateReview($request);

            // Se houver falha nas validações,reorna um erro 422 com a mensagem validation error e o primeiro erro
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    422,
                    $validator->errors()
                );
            }

            // Atualiza ou insere a intereção(review) ao documento.
            DB::beginTransaction();
            $review = Reviews::updateOrCreate(
                ['documento_id' => $document_id, 'user_id' => $user_id],
                ['review' => $request->input('review')]
            );
            DB::commit();

            // Retoan o código 200 e a mensagem de criado.
            return DefaultResponse::HTTPResponse(
                $review,
                DefaultMessages::CREATED
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                []
            );
        }
    }

    public function delete($document_id)
    {
        try {
            $user_id = Auth::user()->id;

            if (!$document_id) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    [],
                    422
                );
            }

            DB::beginTransaction();

            $review = Reviews::where('documento_id', $document_id)
                ->where('user_id', $user_id)
                ->first();

            if ($review) {
                $review->delete();
            }

            DB::commit();

            return DefaultResponse::HTTPResponse(
                null,
                DefaultMessages::DELETED
            );
        } catch (Exception $e) {
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                []
            );
        }
    }
}
