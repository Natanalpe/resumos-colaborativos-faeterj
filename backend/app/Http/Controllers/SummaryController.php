<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\CollectionDocument;
use App\Models\Logs;
use App\Models\Reviews;
use App\Models\Summaries;
use App\Models\User;
use App\Services\ImageSecurityService;
use App\Validations\SummaryValidations;
use App\Validations\QuerySearchValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Controller responsável pelo CRUD dos resumos.
 * 
 * Gerencia a Busca, criação, atualização e deleção.
 * 
 * @package App\Http\Controllera
 * @author Natan Altomar <natan.altomar14@gmail.com>
 * @version 1.0.0
 * @since 1.0.0
 */
class SummaryController extends Controller
{

    /**
     * Realiza a busca dos resumos.
     * 
     * Este método busca os resumos, filtrando-os, se for necessário, 
     * pela matéria, professor, tipo, titulo e/ou conteudo do resumo e retorna
     * se for aplicavel, os resumos paginados com cinco items por página.
     */
    public function search(Request $request)
    {
        try {
            // Valida os dados do corpo da requisição
            $validator = QuerySearchValidations::validateQuerySearch($request);

            // Se houver falha, retorna um código 422, mensagem validation error e os erros
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Os filtros para a busca dos resumos
            $searchQueryTerm = $request->input('q', '');
            $subject = $request->input('materia');
            $type = $request->input('tipo');
            $teacher = $request->input('professor');
            $page = $request->input('page');

            // Busca os resumos com a matéria, o dono do post e os professores da matéria, menos os apagados.
            $query = Summaries::query()
                ->where('apagado', false)
                ->with([
                    'subject:id,nome,sigla',
                    'owner:id,nome,sobrenome,role',
                    'subject.professores:id,nome,sobrenome'
                ]);

            // Campo de pesquisa
            $searchQueryTerm = strtolower($searchQueryTerm);

            // Faz o filtro pelo campo de pesquisa
            $query->where(function ($q) use ($searchQueryTerm) {
                $q->where('titulo', 'like', '%' . $searchQueryTerm . '%')
                    ->orWhere('conteudo_texto', 'LIKE', '%' . $searchQueryTerm . '%');
            });

            // Pesquisas pelos filtros
            if (!empty($subject)) {
                $query->where('materia_id', $subject);
            }

            if (!empty($type) && $type != '*') {
                $query->where('tag', $type);
            }

            if (!empty($teacher)) {
                $query->whereHas('subject.professores', function ($q) use ($teacher) {
                    $q->where('professor_id', $teacher);
                });
            }
            $summaries = '';
            $query->orderBy('created_at', 'DESC');

            // Se houver paginação no corpo da requisição, é feita a paginaçao
            if (!empty($page)) {
                $summaries = $query->paginate(5);
            } else {
                $summaries = $query->get();
            }

            // Retorna um código 200 e os resumos
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    // Busca a imagem do resumo pelo seu id
    public function getImageContent(Request $request, $id)
    {
        try {
            // Pega o campo conteúdo, responsável por armazenar o caminho da imagem
            $document = Summaries::where('id', $id)->first(['tipo', 'conteudo']);

            // Se o tipo do resumo não for image, ou não existir retorna um 404 e not found
            if (!$document || $document->tipo !== 'imagem') {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    [],
                    404
                );
            }

            $imagePath = $document->conteudo;

            // Verifica se o arquivo existe no storage
            if (!Storage::disk('local')->exists($imagePath)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    ['message' => 'Arquivo de imagem não encontrado'],
                    404
                );
            }

            // Lê o arquivo do storage
            $imageData = Storage::disk('local')->get($imagePath);

            // Detecta o tipo MIME da imagem pela extensão
            $extension = pathinfo($imagePath, PATHINFO_EXTENSION);
            $mimeTypes = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp'
            ];
            $mimeType = $mimeTypes[strtolower($extension)] ?? 'image/png';

            // Retorna a imagem
            return response($imageData)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'inline; filename="document_image.' . $extension . '"');
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Cria o resumo
     */
    public function create(Request $request)
    {
        try {
            $user_id = Auth::user()->id;
            $user = User::where('id', $user_id)->first();

            if($user->pode_postar == 0) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_AUTHORIZED,
                    403
                );
            }

            // Os dados do resumo vindos do frontend
            $tipo = $request->input('tipo');
            $document = new Summaries();
            $document->materia_id = $request->input('materia_id');
            $document->user_id = $user_id;
            $document->titulo = $request->input('titulo');
            $document->tipo = $request->input('tipo');
            $document->tag = $request->input('tag');
            $document->apagado = false;

            /**
             * Existem quatro tipos de resumos, texto(txt), readmme, link do youtube(youtube_link) e imagem.
             * O switch escolhe um deles baseado no tipo escolhido pelo usuário
             */
            switch ($tipo) {
                case 'txt':
                case 'readme':
                case 'youtube_link':
                    $document->conteudo_texto = $request->input('conteudo');

                    // Valida os dados vindos no corpo da requisição
                    $validator = SummaryValidations::validateDocumentText($document);

                    // Se houver falha, retorna um código 422, a mensagem validation error e os erros.
                    if ($validator->fails()) {
                        Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 1]);
                        return DefaultResponse::HTTPErrorResponse(
                            DefaultMessages::VALIDATION_ERROR,
                            422,
                            $validator->errors(),
                        );
                    }

                    // Salva o resumo
                    DB::beginTransaction();
                    $document->save();
                    Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 0]);
                    DB::commit();

                    break;
                case 'imagem':
                    // Pega os dados da imagem
                    $base64Data = $request->input('conteudo');
                    $document->conteudo = $base64Data;

                    // Faz uma verificação básica da imagem postada para verificar se não possui algum script dentro dela.
                    $securityService = new ImageSecurityService();
                    $securityResult = $securityService->scanBase64Image($base64Data);

                    // Se não passr no teste de validação, retorna o código 422 a mensagem de falha de segurança e 
                    if (!$securityResult['safe']) {
                        // Insere no log a falha de criação de resumo
                        Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 0]);
                        return DefaultResponse::HTTPErrorResponse(
                            DefaultMessages::SECURITY_WARNING_IMAGE,
                            $securityResult,
                            422
                        );
                    }

                    // Pega a imagem e converte em base64 e valida os dados
                    $base64String = preg_replace('/^data:image\/\w+;base64,/', '', $base64Data);
                    $imageData = base64_decode($base64String);

                    $extension = $this->getImageExtension($base64Data);
                    // Gera um nome único para o arquivo
                    $filename = uniqid('summary_') . '_' . time() . '.' . $extension;
                    // Salva a imagem no storage (storage/app/summaries)
                    Storage::disk('local')->put('summaries/' . $filename, $imageData);

                    // Salva o caminho da imagem no banco
                    $document->conteudo = 'summaries/' . $filename;

                    $validator = SummaryValidations::validateDocumentImage($document);

                    if ($validator->fails()) {
                        // Remove a imagem se a validação falhar
                        Storage::disk('local')->delete('summaries/' . $filename);

                        Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 0]);
                        return DefaultResponse::HTTPErrorResponse(
                            DefaultMessages::VALIDATION_ERROR,
                            $validator->errors(),
                            422
                        );
                    }

                    DB::beginTransaction();
                    $document->save();
                    DB::commit();
                    break;
            }

            // Retorna o resumo criado o código 201 e a mensagem criado
            return DefaultResponse::HTTPResponse(
                $document,
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error            
            Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 0]);
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Pega os dados (quem postou, matéria e os reviews totais e o review, se houver, do usuário logado) do resumo pelo seu id
     */
    public function getById(Request $request, $id)
    {
        try {
            //
            $user_id = Auth::user()->id;
            $allowDeleted = $request->input('allowDeleted', '');
            $deleted = 0;

            /**
             * O administrador pode acessar os resumos apagados, então é feito o controle aqui
             */
            if ($allowDeleted == 1) {
                $deleted = 1;
            }

            // Pega os todos os dados necessários do resumo
            $summary = Summaries::where('id', $id)
                ->with('user', function ($query) {
                    $query->select('users.id', 'nome', 'sobrenome', 'role');
                })
                ->with('materia')
                ->withCount([
                    'reviews as util_count' => function ($query) {
                        $query->where('review', 'util');
                    },
                    'reviews as perfeito_count' => function ($query) {
                        $query->where('review', 'perfeito');
                    },
                    'reviews as confuso_count' => function ($query) {
                        $query->where('review', 'confuso');
                    }
                ])
                ->with(['reviews' => function ($query) use ($user_id) {
                    $query->where('user_id', $user_id)
                        ->select('id', 'documento_id', 'review')
                        ->take(1);
                }])
                ->where('apagado', $deleted)
                ->first();

            // Se não for encontrato, retorna um código 404 com a mensagem not found
            if (!$summary) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            /**
             * Se for um usuário comum tentando acessar, retorna uma mensagem de conteudo apagado e o código 410
             */
            if ($summary->apagado == 1 && $deleted = 0) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::DELETED_CONTENT,
                    410
                );
            }

            // Retorna os dados do resumo e a mensagem de ok
            return DefaultResponse::HTTPResponse(
                $summary,
                DefaultMessages::OK,
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Pega os ultimos resumos postados.
     * É usado para mostrar na página inicial do frontend os últimos resumos postados na plataforma
     */
    public function getLastSummaries(Request $request)
    {
        try {
            // A quantidade desejada que será retornada
            $quantity = $request->input('quantidade', 5);

            // Pega os resumos no banco e seus dados
            $summaries = Summaries::where('apagado', 0)
                ->with(['user', 'materia'])
                ->withCount([
                    'reviews as util_count' => function ($query) {
                        $query->where('review', 'util');
                    },
                    'reviews as perfeito_count' => function ($query) {
                        $query->where('review', 'perfeito');
                    },
                    'reviews as confuso_count' => function ($query) {
                        $query->where('review', 'confuso');
                    }
                ])
                ->orderBy('created_at', 'desc')
                ->take($quantity)
                ->get()
                ->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'titulo' => $document->titulo,
                        'created_at' => $document->created_at,
                        'conteudo_texto' => $document->conteudo_texto,
                        'util_count' => $document->util_count,
                        'perfeito_count' => $document->perfeito_count,
                        'confuso_count' => $document->confuso_count,
                        'owner' => $document->user ? [
                            'id' => $document->user->id,
                            'nome' => $document->user->nome,
                            'sobrenome' => $document->user->sobrenome,
                            'role' => $document->user->role
                        ] : null,
                        'subject' => $document->materia ? [
                            'id' => $document->materia->id,
                            'nome' => $document->materia->nome,
                            'sigla' => $document->materia->sigla
                        ] : null
                    ];
                });

            // Retorna os resumos o código 200 e a mensagem OK
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
            );
        }
    }

    /* 
        O dono do post pode deletar;

        O administrador apenas coloca o "apagado" como verdadeiro, pois caso o 
        usuário tenha postado algo, por exemplo, criminoso, o administrador 
        tem tudo salvo. Ou para caso o administrador muder de ideia quando a deleção.
    */
    public function deleteContent(Request $request, $id)
    {
        try {
            // Pega os dados do usuário logado
            $user_id = Auth::user()->id;
            $user = User::where('id', $user_id)->first();
            // Busca o resumo
            $document = Summaries::where('id', $id)
                ->first();

            // Se não houver resumo com esse id, retorna um 404 com a mensagem not found
            if (!$document) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            /**
             * Se o usuário logado for um administrador, muda o 'apagado' para verdadeiro no banco, naquele resumo
             * A partir dai, o resumo não pode ser mais acesaro por nenhum usuário além do administrador no dashboard do administrador
             */
            if ($user->role == 'administrador') {
                DB::beginTransaction();
                $document->apagado = 1;
                $document->save();
                DB::commit();

                // Retorna um código 204 com deletado.
                Logs::create(['user_id' => $user_id, 'acao' => 'delecao_documento', 'acao_ocorreu_com_sucesso' => 1]);
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::DELETED,
                    204
                );
            }

            /**
             * Se o usuário que estiver tentando apagar for o dono do resumo e o resumo não estiver como 'apagado', apaga o resumo definitivamente
             */
            if ($user_id == $document->user_id || $document->apagado != 1) {
                DB::beginTransaction();
                $document->delete();
                Logs::create(['user_id' => $user_id, 'acao' => 'delecao_documento', 'acao_ocorreu_com_sucesso' => 1]);
                DB::commit();

                // Retorna uma mensagem de deletado e o código 204
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::DELETED,
                    204
                );
            }

            /**
             * Segurança:
             * Se o usuário que esttiver tentando apagar o resumo não for o dono do resumo, cai aqui
             * e retorna um código 403 com a mensagem não autorizado.
             */
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::NOT_AUTHORIZED,
                403
            );
        } catch (Exception $e) {
            Logs::create(['user_id' => $user_id, 'acao' => 'upload_documento', 'acao_ocorreu_com_sucesso' => 0]);
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Pega os resumos de um usuário em específico pelo seu id.
     * Usado para mostrar os resumo postados pelo usuário quando é acessado seu perfil
     */
    public function getUserSummaries(Request $request, $user_id)
    {
        try {

            // Valida os dados vindos no corpo da requisição
            $validator = QuerySearchValidations::validateQuerySearch($request);

            // Se houver falha nas validações, retorna um 422 a mensagem de erros de validações e a mensagem de validation error
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Os filtros vindos no corpo da requisição
            $searchQueryTerm = $request->input('q', '');
            $subject = $request->input('materia');
            $type = $request->input('tipo');
            $teacher = $request->input('professor');
            $page = $request->input('page');

            // Busca o resumo, sua matéria, seu dono e os professores da matéria
            $query = Summaries::query()
                ->where('apagado', false)
                ->where('user_id', $user_id)
                ->with([
                    'subject:id,nome,sigla',
                    'owner:id,nome,sobrenome,role',
                    'subject.professores:id,nome,sobrenome'
                ]);

            $searchQueryTerm = strtolower($searchQueryTerm);

            // Busca utilizando os filtros
            $query->where(function ($q) use ($searchQueryTerm) {
                $q->where('titulo', 'like', '%' . $searchQueryTerm . '%')
                    ->orWhere('conteudo_texto', 'LIKE', '%' . $searchQueryTerm . '%');
            });

            if (!empty($subject)) {
                $query->where('materia_id', $subject);
            }

            if (!empty($type) && $type != '*') {
                $query->where('tag', $type);
            }

            if (!empty($teacher)) {
                $query->whereHas('subject.professores', function ($q) use ($teacher) {
                    $q->where('professor_id', $teacher);
                });
            }
            $summaries = '';
            $query->orderBy('created_at', 'DESC');

            // Se tiver o parametro de pagina na requisição, faz a painação
            if (!empty($page)) {
                $summaries = $query->paginate(4);
            } else {
                $summaries = $query->get();
            }

            // Retorna os resumos, a mensagem de OK e o código 200
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Busca os resumos apagados.
     * Somente os administradores podem acessar os resumos apagados.
     */
    public function getAllDeletedSummaries(Request $request)
    {
        try {

            // Valida os dados vindos no corpo da requisição
            $validator = QuerySearchValidations::validateQuerySearch($request);

            // Se hovuer falha nas validações, reotnr aum código 422, a mensagem de validation error e os erros de validações.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Filtros vindos no corpo da requisição
            $searchQueryTerm = $request->input('q', '');
            $subject = $request->input('materia');
            $type = $request->input('tipo');
            $teacher = $request->input('professor');
            $page = $request->input('page');

            // Busca os resumos com apagado = 1
            $query = Summaries::query()
                ->where('apagado', true)
                ->with([
                    'subject:id,nome,sigla',
                    'owner:id,nome,sobrenome,role',
                    'subject.professores:id,nome,sobrenome'
                ]);

            $searchQueryTerm = strtolower($searchQueryTerm);

            // Continua a busca utilizando os filtros
            $query->where(function ($q) use ($searchQueryTerm) {
                $q->where('titulo', 'like', '%' . $searchQueryTerm . '%')
                    ->orWhere('conteudo_texto', 'LIKE', '%' . $searchQueryTerm . '%');
            });

            if (!empty($subject)) {
                $query->where('materia_id', $subject);
            }

            if (!empty($type) && $type != '*') {
                $query->where('tag', $type);
            }

            if (!empty($teacher)) {
                $query->whereHas('subject.professores', function ($q) use ($teacher) {
                    $q->where('professor_id', $teacher);
                });
            }
            $summaries = '';
            $query->orderBy('created_at', 'DESC');

            if (!empty($page)) {
                $summaries = $query->paginate(5);
            } else {
                $summaries = $query->get();
            }

            // Retorna os resumos, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Restaura a deleção de um resumo.
     * Apenas o administrador pode restaurar um resumo em que ele mesmo "apagou"
     */
    public function restoreDeletionContent(Request $request, $id)
    {
        try {
            // Busca o resumo pelo seu id
            $document = Summaries::where('id', $id)
                ->first();

            // Se o resumo não ecistir, retorna um 404 com a mensagem not found
            if (!$document) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            /**
             * Apagada definitivamente o resumo, as tabelas que possuem alguma FK são apagadas automaticamente também, já foi definido na migration do Document
             */
            DB::beginTransaction();
            $document->apagado = 0;
            $document->save();
            DB::commit();

            // Retorna o código 204 e a mensagem de deletado
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::DELETED,
                204
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Usado para que o administrador apague definitivamente o resumo a partir do dashboard do administrador
     */
    public function admDeleteContent(Request $request, $id)
    {
        try {
            // Busca o resumo
            $document = Summaries::where('id', $id)
                ->first();

            // Se o resumo não existir, retorna um 404 com a mensagem not found
            if (!$document) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Apaga o resumo
            DB::beginTransaction();
            CollectionDocument::where('documento_id', $id)->delete();
            Reviews::where('documento_id', $id)->delete();
            $document->delete();
            DB::commit();

            // Retorna o código 204 e a mensagem de deletado
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::DELETED,
                204
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Extrai a extensão da imagem do base64
     */
    private function getImageExtension($base64String)
    {
        preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches);
        return $matches[1] ?? 'png';
    }
}
