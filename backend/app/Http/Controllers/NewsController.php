<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Responses\DefaultResponse;
use App\Http\Responses\DefaultMessages;
use App\Validations\NewsValidations;
use App\Validations\QuerySearchValidations;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Controller responsável pelo CRUD de notícias.
 * As noticias só podem ser administradas pelos administradores da aplicação.
 * 
 * @package App\Http\Controllers
 * @author Natan Altomar <natan.altomar14@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 */
class NewsController extends Controller
{
    /**
     * Define as colunas padrões para evitar a escrita repetitiva e um código mais limpo.
     */
    private $newsColumns = ['id', 'conteudo', 'titulo', 'created_at', 'user_id'];

    /**
     * Pega todas as notícias, com paginação e com 4 notícias por página.
     * 
     * @return App\Http\Responses\DefaultResponse::HTTPResponse resposta JSON contendo:
     *          - status: Um status HTTP, status padrão é o 200.
     *          - message: Uma mensagem App\Http\Responses\DefaultMessages
     *          - Os dados contendo as notícias paginadas.
     * 
     * @see DefaultResponse::HTTPResponse()
     * @see DefaultMessages::OK
     * 
     * @example
     * // Requisição para pegar as notícias paginadas
     * GET /api/news
     */
    public function getAll()
    {
        try {
            // Pega as notícias, ordena por data de criação e faz a paginação.
            $news = News::select($this->newsColumns)->with(['user' => function ($query) {
                $query->select('id', 'nome', 'sobrenome');
            }])->orderBy('created_at', 'DESC')->paginate(4);


            // Envia as notícias paginadas.
            return DefaultResponse::HTTPResponse(
                $news,
                DefaultMessages::OK,
                200,
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Busca uma notícia por id
    public function getById($news_id)
    {
        try {
            // Busca a notícia.
            $news = News::where('id', $news_id)->first();

            // Se a notícia existir, envia na resposta
            if ($news) {
                return DefaultResponse::HTTPResponse(
                    $news,
                    DefaultMessages::OK,
                    200
                );
            }

            // Se não existir, retorna um 404 com not found.
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::NOT_FOUND,
                404
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Utilizada para o administrador criar uma noticia.
    public function create(Request $request)
    {
        try {
            // Valida os dados do corpo da requisição para criar a notícia.
            $validator = NewsValidations::validateNews($request);

            // Em caso de falha nas validações, reotrn aum 422 com validartion error.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Cria a notícia e a salva
            DB::beginTransaction();
            $user_id = Auth::user()->id;
            $create_news = new News;
            $create_news->user_id = $user_id;
            $create_news->conteudo = $request->conteudo;
            $create_news->titulo = $request->titulo;
            $create_news->save();
            DB::commit();

            // Retorna os dados da notícia criada.
            return DefaultResponse::HTTPResponse(
                $create_news,
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {
            DB::rollBack();
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    // Usado para que o administrador delete uma notpicia.
    public function delete($news_id)
    {
        try {
            // Busca a notícia e a apaga.
            $delete = News::where('id', $news_id)->delete();

            // Se foi deletado, retorna 1 : 0.
            if ($delete) {
                return DefaultResponse::HTTPResponse('', DefaultMessages::DELETED, 204);
            }

            // Se não for encontrada a notpicia, retorna um 404 com not found.
            return DefaultResponse::HTTPResponse('', DefaultMessages::NOT_FOUND, 404);
        } catch (Exception $e) {

            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, $e->getMessage(), 500);
        }
    }

    // Utilizado para que o administrador atualize uma notícia.
    public function update(Request $request, $news_id)
    {
        try {

            // Pega a notícia pelo ID.
            $news = News::where('id', $news_id)->first();

            // Se a notícia não for encontrada retorna um 404 com not found.
            if (!$news) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Valida os dados do corpo da requisição.
            $validator = NewsValidations::validateNews($request);

            // Se as validações falharem, retorna o primeiro erro um codigo 422 e um validation error como mensagem.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Atualiza a notícia.
            DB::beginTransaction();
            $news->update($validator->validated());
            DB::commit();

            // Retorna os dados da notícia atualizada.
            return DefaultResponse::HTTPResponse(
                $validator->validated(),
                DefaultMessages::UPDATED,
                201
            );
        } catch (Exception $e) {
            DB::rollBack();
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Busca  as notpicias baseado em alguns filtros.
     * Os filtros podem ser:
     *  q = termo;
     *  isDate = é ou não uma busca por data da notícia.
     * 
     */
    public function search(Request $request)
    {
        try {
            // Filtros da pesquisa.
            $searchQueryTerm = $request->input('q', '');
            $isDate = filter_var($request->input('isDate'), FILTER_VALIDATE_BOOLEAN);
            $result = [];

            // Valida os dados do corpo da requisição.
            $validator = QuerySearchValidations::validateQuerySearch($request);

            if ($isDate) {
                // Formata a data.
                $date = Carbon::createFromFormat('d/m/Y', $searchQueryTerm);
                $result = News::whereDate('created_at', $date->format('Y-m-d'))->paginate(5);

                return DefaultResponse::HTTPResponse($result, DefaultMessages::OK);
            }


            // Se as validações falharem reotrna um 422 com os erros.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // MApeia os meses como números.
            $meses = [
                'janeiro' => '01',
                'fevereiro' => '02',
                'março' => '03',
                'abril' => '04',
                'maio' => '05',
                'junho' => '06',
                'julho' => '07',
                'agosto' => '08',
                'setembro' => '09',
                'outubro' => '10',
                'novembro' => '11',
                'dezembro' => '12'
            ];

            // Trata os dados da busca.
            $termLower = mb_strtolower($searchQueryTerm);
            $numericMonths = $meses[$termLower] ?? null;

            $formatedDate = null;
            if (preg_match('/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/', $searchQueryTerm, $matches)) {
                $formatedDate = "{$matches[3]}-{$matches[2]}-{$matches[1]}";
            }

            // Faz a query para pegas as notícias utilizando os filtros.
            $query = News::query()->where(function ($query) use ($searchQueryTerm, $numericMonths, $formatedDate) {
                $query->where('titulo', 'LIKE', "%{$searchQueryTerm}%")
                    ->orWhere('conteudo', 'LIKE', "%{$searchQueryTerm}%");

                $query->orWhereYear('created_at', $searchQueryTerm)
                    ->orWhereMonth('created_at', $searchQueryTerm)
                    ->orWhereDay('created_at', $searchQueryTerm);

                if ($numericMonths) {
                    $query->orWhereMonth('created_at', $numericMonths);
                }

                if ($formatedDate) {
                    $query->orWhereDate('created_at', $formatedDate);
                }
            });

            $query->orderBy('created_at', 'DESC');

            // Pagina ou não as noticias.
            if (isset($request['page'])) {
                $result = $query->paginate(4);
            } else {
                $result = $query->get();
            }


            // Retorna as notpicias com um 200 e a mensagem OK
            return DefaultResponse::HTTPResponse($result, DefaultMessages::OK);
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, [], 500);
        }
    }
}
