<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\CollectionDocument;
use App\Models\Collections;
use App\Models\Summaries;
use App\Models\User;
use App\Validations\CollectionsValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Coleções serão usadas para que o aluno/professor salve resumos postados por qualquer um, de forma organizada em uma "pasta" em seu perfil.
 */
class CollectionController extends Controller
{

    /**
     * Busca uma coleção pelo seu id.
     */
    public function getCollectionById(Request $request, $collection_id)
    {
        try {
            // Busca a coleção.
            $collection = Collections::where('id', $collection_id)->first();

            // Se não encontra-la, retorna um 404 not found.
            if (!$collection) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Se encontrar, retorna a coleção.
            return DefaultResponse::HTTPResponse(
                $collection,
                DefaultMessages::OK,
            );
        } catch (Exception $e) {

            // Em caso de erro, retorna um erro 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Criar uma coleção.
     */
    public function createCollection(Request $request)
    {
        try {

            // Valida os dados para criar a coleção.
            $validator = CollectionsValidations::validateCreateCollection($request);

            // Em caso de falha, retorna a mensagem do erro de validação com um 422 validation error
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            $user_id = Auth::user()->id;

            // Cria a coleção.
            DB::beginTransaction();
            $newCollection = Collections::create([
                'nome' => $request->input('nome'),
                'user_id' => $user_id
            ]);
            DB::commit();

            // Retorna a coleção criada.
            return DefaultResponse::HTTPResponse(
                $newCollection,
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {
            // Em caso de erro, retorna o 500 com internal server error.
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Busca as coleções de um usuário. Função usada para quando for acessar o perfil do usuário, para visualizar suas coleções criadas.
     * As coleções não serão privadas como posts salvos no instagra, mas públicas pois um dos pontos centrais da aplicação é facilitar o compartilhamento
     * destes resumpos.
     */
    public function getUserCollections(Request $request, $user_id)
    {
        try {
            $page = $request->input('page', 1);
            $pageable = filter_var($request->input('pageable', true), FILTER_VALIDATE_BOOLEAN);

            // Busca as coleções.
            $collections = Collections::where('user_id', $user_id)
                ->withCount('ColecaoDocumento as count_documentos');

            if (!$pageable) {
                $result = ['data' => $collections->get()];
            } else {
                // Atribui paginação as coleções.
                $result = $collections->paginate(4);
            }

            // Retorna as coleções com um código 200.
            return DefaultResponse::HTTPResponse(
                $result,
                DefaultMessages::OK
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Adiciona um resumo à coleção.
     */
    public function addDocumentToCollection(Request $request)
    {
        try {
            // Utilizando o auth para que o usuário logado adicione o doucmento em sua própria coleção.
            $user_id = Auth::user()->id;

            // Validação para verificar se o documento(resumo) adicionar existe.
            $validator = CollectionsValidations::validadeAddDocumentToCollection($request);

            // Retorna um validation error em caso de falha de validação com 422.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            $documento_id = $request->input('documento_id');
            $colecao_id = $request->input('colecao_id');

            DB::beginTransaction();

            $exists = CollectionDocument::where('user_id', $user_id)
                ->where('documento_id', $documento_id)
                ->where(function ($query) use ($colecao_id) {
                    if ($colecao_id === null) {
                        $query->whereNull('colecao_id');
                    } else {
                        $query->where('colecao_id', $colecao_id);
                    }
                })
                ->exists();

            if ($exists) {
                DB::rollBack();
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    'Documento já está salvo',
                    422
                );
            }

            // Busca o documento e a coleção e adicionar a tabela pivot entre os dois o resumo.
            $maxOrdem = CollectionDocument::where('user_id', $user_id)
                ->where(function ($query) use ($colecao_id) {
                    if ($colecao_id === null) {
                        $query->whereNull('colecao_id');
                    } else {
                        $query->where('colecao_id', $colecao_id);
                    }
                })
                ->max('ordem');

            $novaOrdem = ($maxOrdem !== null) ? $maxOrdem + 1 : 1;

            CollectionDocument::create([
                'user_id' => $user_id,
                'documento_id' => $documento_id,
                'colecao_id' => $colecao_id,
                'ordem' => $novaOrdem
            ]);

            DB::commit();

            // Retorna o documento adicionado a coleção.
            return DefaultResponse::HTTPResponse(
                ['ordem' => $novaOrdem],
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {
            DB::rollBack();
            // Em caso de falha, retorna um erro 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }


    /**
     * Utilizada para remover um resumo da coleção.
     */
    public function removeDocumentFromCollection(Request $request)
    {
        try {
            $user_id = Auth::user()->id;
            $documento_id = $request->input('documento_id');
            $colecao_id = $request->input('colecao_id');
            
            DB::beginTransaction();

            $item = CollectionDocument::where('user_id', $user_id)
                ->where('documento_id', $documento_id)
                ->where(function ($query) use ($colecao_id) {
                    if ($colecao_id === null) {
                        $query->whereNull('colecao_id');
                    } else {
                        $query->where('colecao_id', $colecao_id);
                    }
                })
                ->first();

            
            // Se o resumo já não estiver na coleção especificada, retorna um erro 404.
            if (!$item) {
                DB::rollBack();
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    'Documento não encontrado',
                    404
                );
            }
            
            // Se não, adiciona na coleção.
            $ordemRemovida = $item->ordem;

            $item->delete();

            CollectionDocument::where('user_id', $user_id)
                ->where(function ($query) use ($colecao_id) {
                    if ($colecao_id === null) {
                        $query->whereNull('colecao_id');
                    } else {
                        $query->where('colecao_id', $colecao_id);
                    }
                })
                ->where('ordem', '>', $ordemRemovida)
                ->decrement('ordem');

            DB::commit();

            // Retorna um obeto vazio com 200 e OK.
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Em caso de falha, retorna um erro 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Verifica em quais coleções determinado resumo está.
     * Utilizado para que quando o usuário abrir um resumo no frontend e abrir a visualização para salvar na coleção,
     * ele possa ver em quais coleções aquele resumo está salvo e portanto remover ou adicionar a uma coleção.
     */
    public function checkDocumentInCollections($documento_id)
    {
        try {
            $user_id = Auth::user()->id;

            // Busca as coleções em que o resumo está salvo.
            $savedCollections = CollectionDocument::where('documento_id', $documento_id)
                ->where('user_id', $user_id)
                ->get()
                ->map(function ($item) {
                    return $item->colecao_id;
                })
                ->toArray();

            // Retorna as coleções as quais o resumo stá salvo.
            return DefaultResponse::HTTPResponse(
                ['saved_in' => $savedCollections],
                DefaultMessages::OK
            );
        } catch (Exception $e) {
            // Em caso de erro retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }


    /**
     * Utilizado para que o usuário possa acessar uma coleção e ver os resumos salvos nela.
     * Retorna os resumos da coleção.
     */
    public function getSummariesFromCollectionById(Request $request, $collection_id)
    {
        try {
            // Filtros de itens por página, termo de pesquisa, matéria_id, tipo (p1, p2...) e professir_id respectivamente.
            $perPage = $request->input('per_page', 5);
            $searchQueryTerm = $request->input('q', '');
            $subject = $request->input('materia');
            $type = $request->input('tipo');
            $teacher = $request->input('professor');

            // Busca  resumo de acordo com os filtros.
            $query = Summaries::query()
                ->where('apagado', false)
                ->select([
                    'documentos.id',
                    'documentos.titulo',
                    'documentos.tipo',
                    'documentos.tag',
                    'documentos.conteudo_texto',
                    'documentos.materia_id',
                    'documentos.user_id',
                    'documentos.created_at',
                    'documentos.updated_at'
                ])
                ->withCount([
                    'reviews as perfeito_count' => function ($q) {
                        $q->where('review', 'perfeito');
                    },
                    'reviews as util_count' => function ($q) {
                        $q->where('review', 'util');
                    },
                    'reviews as confuso_count' => function ($q) {
                        $q->where('review', 'confuso');
                    }
                ])
                ->whereHas('collectionDocuments', function ($q) use ($collection_id) {
                    $q->where('colecao_id', $collection_id);
                });

            if (!empty($searchQueryTerm)) {
                $searchQueryTerm = strtolower($searchQueryTerm);
                $query->where(function ($q) use ($searchQueryTerm) {
                    $q->where('titulo', 'like', '%' . $searchQueryTerm . '%')
                        ->orWhere('conteudo_texto', 'LIKE', '%' . $searchQueryTerm . '%');
                });
            }

            if (!empty($subject)) {
                $query->where('materia_id', $subject);
            }

            if (!empty($type) && $type != '*') {
                $query->where('tag', $type);
            }

            if (!empty($teacher)) {
                $query->whereHas('materia.professores', function ($q) use ($teacher) {
                    $q->where('professor_id', $teacher);
                });
            }

            $query->orderBy('documentos.created_at', 'desc');

            $summaries = $query->paginate($perPage);

            $summaries->getCollection()->transform(function ($summary) {
                $summary->subject = $summary->materia;
                $summary->owner = $summary->user;

                unset($summary->materia);
                unset($summary->user);

                return $summary;
            });

            // Retorna os resumos.
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK
            );
        } catch (Exception $e) {
            // Em caso de falha, retorna o 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    /**
     * Busca todos os resumos salvos, independente da coleção.
     * No frontend será utilizado para a coleção "Geral", onde o usuário poderá visualizar todos os resumos salvos.
     */
    public function getAllSummariesFromCollection(Request $request, $user_id)
    {
        try {
            // Filtros de itens por página, termo de pesquisa, matéria_id, tipo (p1, p2...) e professir_id respectivamente.
            $perPage = $request->input('per_page', 5);
            $searchQueryTerm = $request->input('q', '');
            $subject = $request->input('materia');
            $type = $request->input('tipo');
            $teacher = $request->input('professor');

            // Busca os resumos de acordo com os filtros.
            $query = Summaries::query()
                ->where('apagado', false)
                ->select([
                    'documentos.id',
                    'documentos.titulo',
                    'documentos.tipo',
                    'documentos.tag',
                    'documentos.conteudo_texto',
                    'documentos.materia_id',
                    'documentos.user_id',
                    'documentos.created_at',
                    'documentos.updated_at'
                ])
                ->withCount([
                    'reviews as perfeito_count' => function ($q) {
                        $q->where('review', 'perfeito');
                    },
                    'reviews as util_count' => function ($q) {
                        $q->where('review', 'util');
                    },
                    'reviews as confuso_count' => function ($q) {
                        $q->where('review', 'confuso');
                    }
                ])
                ->whereHas('collectionDocuments', function ($q) use ($user_id) {
                    $q->where('user_id', $user_id);
                });

            if (!empty($searchQueryTerm)) {
                $searchQueryTerm = strtolower($searchQueryTerm);
                $query->where(function ($q) use ($searchQueryTerm) {
                    $q->where('titulo', 'like', '%' . $searchQueryTerm . '%')
                        ->orWhere('conteudo_texto', 'LIKE', '%' . $searchQueryTerm . '%');
                });
            }

            if (!empty($subject)) {
                $query->where('materia_id', $subject);
            }

            if (!empty($type) && $type != '*') {
                $query->where('tag', $type);
            }

            if (!empty($teacher)) {
                $query->whereHas('materia.professores', function ($q) use ($teacher) {
                    $q->where('professor_id', $teacher);
                });
            }

            $query->orderBy('documentos.created_at', 'desc');

            $summaries = $query->paginate($perPage);

            $summaries->getCollection()->transform(function ($summary) {
                $summary->subject = $summary->materia;
                $summary->owner = $summary->user;

                unset($summary->materia);
                unset($summary->user);

                return $summary;
            });

            // Retorna os resumos.
            return DefaultResponse::HTTPResponse(
                $summaries,
                DefaultMessages::OK
            );
        } catch (Exception $e) {

            // Em caso de falha, retorna um 500 cm internal server eroor.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }

    // Usado para apagar uma coleção.
    public function deleteCollection(Request $request, $collection_id)
    {
        try {
            // Segurança para que um usuário só possa apagar suas coleções.
            $user_id = Auth::user()->id;

            // Busca a coleção.
            $collection = Collections::where('id', $collection_id)
                ->where('user_id', $user_id)
                ->first();

            // Se ela não existir, retorna um 404 not found.
            if (!$collection) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_FOUND,
                    [],
                    404
                );
            }

            // Apaga a coleção.
            DB::beginTransaction();
            $collection->delete();
            DB::commit();

            // Retorna um 204 no content.
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::DELETED,
                204
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Em caso de falha, retorna um 500 internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    // Utilizado para editar o nome de uma coleção.
    public function editCollectionName(Request $request, $colection_id)
    {
        try {

            // Valida o nome da coleção
            $validator = CollectionsValidations::validateEditCollectionName($request);

            // Em caso de falha, retorna um 422 validation error.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors()->first(),
                    422
                );
            }

            // Busca a coleção;
            $collection = Collections::where('id', $colection_id)->first();

            // Caso não ache retorna um 404 not found.
            if (!$collection) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND
                );
            }

            // Busca o usuário logado, pois apenas o dono da coleção pode edita-la.
            $user_id = Auth::user()->id;

            if ($collection->user_id != $user_id) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    401
                );
            }

            // Edita o nome da coleção.
            DB::beginTransaction();
            $collection->nome = $request->input('nome');
            $collection->save();
            DB::commit();

            // Retona um codigo 200 com ok
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::OK,
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Em caso dae falha, retorna um 500 com internal server error.
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    public function updateDocumentsOrder(Request $request)
    {
        try {
            $user_id = Auth::user()->id;
            $colecao_id = $request->input('colecao_id');
            $documents = $request->input('documents');

            DB::beginTransaction();

            foreach ($documents as $doc) {
                CollectionDocument::where('user_id', $user_id)
                    ->where('documento_id', $doc['documento_id'])
                    ->where(function ($query) use ($colecao_id) {
                        if ($colecao_id === null) {
                            $query->whereNull('colecao_id');
                        } else {
                            $query->where('colecao_id', $colecao_id);
                        }
                    })
                    ->update(['ordem' => $doc['ordem']]);
            }

            DB::commit();

            return DefaultResponse::HTTPResponse(
                [],
                'Ordem atualizada com sucesso',
                200
            );
        } catch (Exception $e) {
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }
}
