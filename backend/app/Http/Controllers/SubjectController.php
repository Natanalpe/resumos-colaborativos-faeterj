<?php

namespace App\Http\Controllers;

use App\Validations\SubjectsValidations;
use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\Subjects;
use App\Validations\QuerySearchValidations;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller responsável plo CRUD das matérias na plataforma.
 */
class SubjectController extends Controller
{

    // Pega todas as matérias com paginação e os professores associados a ela.
    public function getAll(Request $request)
    {
        try {
            $subjects = [];
            // Verifica se é preciso paginação ou não, pois dependendo de onde no frontend é feito a requisição, não é preciso de paginação.
            if (isset($request['page'])) {
                $subjects = Subjects::select()
                    ->with(['professores' => function ($query) {
                        $query->select('users.id', 'nome', 'sobrenome');
                    }])
                    ->paginate(5);
            } else {
                $subjects = Subjects::select()
                    ->with(['professores' => function ($query) {
                        $query->select('users.id', 'nome', 'sobrenome');
                    }])->get();
            }

            // Retorna as matérias
            return DefaultResponse::HTTPResponse(
                $subjects,
                DefaultMessages::OK,
                200,
            );
        } catch (Exception $e) {

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Busca apenas uma matéria pelo seu id.
    public function getById(Request $request, $subject_id)
    {
        try {
            // Seleciona a metéria e os professores associados a ela.
            $subject = Subjects::with('professores:id,nome,sobrenome')
                ->where('id', $subject_id)
                ->first();

            // Se houver matéria com este id, retorna ela com o código 200 e a mensagem de OK.
            if ($subject) {
                return DefaultResponse::HTTPResponse(
                    $subject,
                    DefaultMessages::OK,
                    200
                );
            }

            // Se a matéria com aquele ID não existir, retorn um cógido 404 e a mensagem de nout found.
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::NOT_FOUND,
                404
            );
        } catch (Exception $e) {

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Cria uma matéria.
     * Apenas adminsitradores podem criar matérias.
     */
    public function create(Request $request)
    {
        // Valida os dados do corpo da requisição para criar a metéria.
        $validator = SubjectsValidations::validateSubjects($request);

        // Se houver falha nas validações, retorna um erro 422 a mensagem validation error e os erros.
        if ($validator->fails()) {
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::VALIDATION_ERROR,
                $validator->errors(),
                422
            );
        }
        DB::beginTransaction();

        try {
            // Cria a matéria.
            $create_subject = new Subjects();
            $create_subject->nome = $request->nome;
            $create_subject->sigla = $request->sigla;
            $create_subject->save();

            // Se já houver no corpo da requisição algum professor, associa-os a matperia criada.
            if ($request->has('professores') && is_array($request->professores)) {
                $create_subject->professores()->sync($request->professores);
            }

            DB::commit();

            // Retorna o códito 201 a mensagem de criado e a matéria criada.
            return DefaultResponse::HTTPResponse(
                $create_subject,
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Atualiza uma matéria pelo seu id.
     * Apenas administradores podem editar as matérias.
     */
    public function update(Request $request, $subject_id)
    {
        DB::beginTransaction();
        try {
            // Busca a matéria que será atualizada.
            $subject = Subjects::where('id', $subject_id)->first();

            // Se a matéria não existir, retorna o código 404 e a mensagem de not found.
            if (!$subject) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Valida os dados do corpo da requisição.
            $validator = SubjectsValidations::validateSubjects($request);

            // Se houver falha no corpo da requisição, retorna o código 422 e a mensagem de validation error.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Atualiza a matéria.
            $subject->update($request->only(['nome', 'sigla']));

            // Se houver professores no corpo da requisição, atualiza-os tambem.
            if ($request->has('professores') && is_array($request->professores)) {
                $subject->professores()->sync($request->professores);
            }

            DB::commit();

            // Retorna os dados da matéria criada, a manesagem de atualizado e o código 200.
            return DefaultResponse::HTTPResponse(
                $subject,
                DefaultMessages::UPDATED,
                200
            );
        } catch (Exception $e) {
            DB::rollBack();

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Apaga uma matéria pelo seu id.
     * 
     * Apenas administradores podem apagar matérias.
     */
    public function delete(Request $request, $subject_id)
    {
        try {
            
            // Procura pela matéria.
            $delete = Subjects::where('id', $subject_id)->first();

            // Deleta a matéria e remove os professires associados a ela.
            DB::beginTransaction();
            $delete->professores()->sync([]);
            $delete->delete();
            DB::commit();

            // Se foi deletado retorna o código 204, e a mensagem deletado.
            if ($delete) {
                return DefaultResponse::HTTPResponse('', DefaultMessages::DELETED, 204);
            }

            // Se não foi deletado, retorna o código 404 e a mensagem not found.
            return DefaultResponse::HTTPResponse('', DefaultMessages::NOT_FOUND, 404);
        } catch (Exception $e) {
            DB::rollBack();

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, $e->getMessage(), 500);
        }
    }

    // Busca por uma matéria baseado nos filtros.
    public function search(Request $request)
    {
        try {
            // Filtros
            $searchQueryTerm = $request->input('q', '');
            $result = [];

            // Valida os dados para pesquisar a matéria que estão no corpo da requisição.
            $validator = QuerySearchValidations::validateQuerySearch($request);

            // Se houver falha na requisição, retorna o código 422 a mensagem validation error e os erros da validaçõa.
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Se houver a pagina no corpo da requisição, faz a busca páginada.
            if (isset($request['page'])) {
                $result = Subjects::query()
                    ->with(['professores' => function ($query) {
                        $query->select('users.id', 'nome', 'sobrenome');
                    }])
                    ->where(function ($query) use ($searchQueryTerm) {
                        $query->where('nome', 'LIKE', "%{$searchQueryTerm}%")
                            ->orWhere('sigla', 'LIKE', "%{$searchQueryTerm}%");
                    })
                    ->orWhereHas('professores', function ($query) use ($searchQueryTerm) {
                        $query->where('nome', 'LIKE', "%{$searchQueryTerm}%")
                            ->orWhere('sobrenome', 'LIKE', "%{$searchQueryTerm}%");
                    })
                    ->paginate(5);
            } else {
                $result = Subjects::query()
                    ->with(['professores' => function ($query) {
                        $query->select('users.id', 'nome', 'sobrenome');
                    }])
                    ->where(function ($query) use ($searchQueryTerm) {
                        $query->where('nome', 'LIKE', "%{$searchQueryTerm}%")
                            ->orWhere('sigla', 'LIKE', "%{$searchQueryTerm}%");
                    })
                    ->orWhereHas('professores', function ($query) use ($searchQueryTerm) {
                        $query->where('nome', 'LIKE', "%{$searchQueryTerm}%")
                            ->orWhere('sobrenome', 'LIKE', "%{$searchQueryTerm}%");
                    })->get();
            }

            // Retorna as matérias com o código 200 e a mensagem de OK.
            return DefaultResponse::HTTPResponse($result, DefaultMessages::OK);
        } catch (Exception $e) {

            // Se houver falha, retorna o código 500, mensagem internal server error
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, [], 500);
        }
    }
}
