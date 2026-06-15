<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\Reviews;
use App\Models\User;
use App\Validations\QuerySearchValidations;
use App\Validations\UserValidations;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
/**
 * Controler para o CRUD de usuários e suas credenciais.
 */
class UserController extends Controller
{

    /**
     * Usado para mudar a senha do usuário no seu primeiro login.
     */
    public function changePasswordFirstLogin(Request $request)
    {
        try {
            // BUsca o usuário logado
            $user = Auth::user();
            $user_data = User::where('id', $user->id)->first();

            // Se o usuário estiver realmente no seu primeiro login, realiza a mudança
            if ($user_data->primeiro_login == 1 && $user_data->password == Hash::make($request->input('old_password'))) {
                $user_data->password = Hash::make($request->input('new_password'));
                $user_data->primeiro_login = 0;

                if ($user_data->save()) {
                    // Retoana um código 200 a mensagem de atualizado e os novos dados do usuário
                    return DefaultResponse::HTTPResponse($user_data, DefaultMessages::UPDATED, 200);
                }
                // Retoana o código 400 e a mensagem de não atualizado
                return DefaultResponse::HTTPErrorResponse(DefaultMessages::NOT_UPDATED, [], 400);
            } else {
                // Retorna o ódigo 400 e a mensagel de não atualiazdo
                return DefaultResponse::HTTPErrorResponse(DefaultMessages::NOT_UPDATED, [], 400);
            }
        } catch (Exception $e) {
            // Retorna o código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, [], 500);
        }
    }

    // Busca todos os usuários de forma paginada
    public function getAll(Request $request)
    {
        try {
            $page = $request->input('page');

            // Pega os dados dos usuários
            $users = User::select('id', 'nome', 'sobrenome', 'matricula', 'ativo', 'razao_da_desativacao', 'pode_postar', 'email', 'role')
                ->where('role', 'NOT LIKE', 'administrador')
                ->orderBy('ativo', 'DESC')
                ->paginate(5, '*', 'page', $page);

            // Retorna os usuários, uma mensagem de ok e o código 200  
            return DefaultResponse::HTTPResponse(
                $users,
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Busca todos os usuários pela role
    public function getAllByRole(Request $request)
    {
        try {
            // Pega os dados dos usuáris
            $users = User::select('id', 'nome', 'sobrenome')->where('role', $request->input('role'))->get();

            // Retorna os dados, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $users,
                DefaultMessages::OK
            );
        } catch (Exception $e) {
            
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Busca um usuário pelo seu ID
    public function getById(Request $request, $user_id)
    {
        try {

            // Verifica se quem está acessando é administrador ou não
            $isAdm = Auth::user()->role == 'administrador' ? true : false;

            // Colunas básicas para a resposta da requisição e a query
            $query_columns = array(
                'id',
                'nome',
                'sobrenome',
            );

            // Se for um administrador fazendo a requisição, adiciona mais algumas colunas/dados
            if ($isAdm) {
                array_push(
                    $query_columns,
                    'matricula',
                    'ativo',
                    'razao_da_desativacao',
                    'pode_postar',
                    'email',
                    'role'
                );
            }

            // Busca os dados
            $user = User::select($query_columns)
                ->where('id', $user_id)->first();

            // Se houver usuário, retorna os dados dele com um código 200 e a mensagem de OK
            if ($user) {
                return DefaultResponse::HTTPResponse(
                    $user,
                    DefaultMessages::OK,
                    200
                );
            }
            // Se nao houver usuário, retorna um 404 com a mensagem de not found.
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::NOT_FOUND,
                404
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Busca um usuário.
     * Usado no dashboard do administrador para controle dos usuários.
     */
    public function search(Request $request)
    {
        try {
            // Valida os dados vindos no corpo da requisição
            $validator = QuerySearchValidations::validateQuerySearch($request);

            // Se houver falhas nas validações, retorna um código 422, a mensagem de validation error e os erros de validações
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Os filtros vindos no corpo da requisição
            $searchQueryTerm = $request->input('q', '');
            $role = $request->input('role');
            $result = [];

            // Verifica se é para buscas todos os usuário ou de apenas uma role e faz a busca;
            $roles = $role == "todos" ? ['aluno', 'professor', 'administrador'] : [$role];
            $query = User::query()
                ->whereIn('role', $roles)
                ->where(function ($query) use ($searchQueryTerm) {
                    $query->where('nome', 'LIKE', "%{$searchQueryTerm}%")
                        ->orWhere('sobrenome', 'LIKE', "%{$searchQueryTerm}%")
                        ->orWhere('matricula', 'LIKE', "%{$searchQueryTerm}%")
                        ->orWhereRaw("CONCAT(nome, ' ', sobrenome) LIKE ?", ["%{$searchQueryTerm}%"]);
                });

            if ($request->has('isActive')) {
                $isActive = filter_var($request->input('isActive'), FILTER_VALIDATE_BOOLEAN);
                $query->where('ativo', $isActive);
            }

            if ($request->has('canPost')) {
                $canPost = filter_var($request->input('canPost'), FILTER_VALIDATE_BOOLEAN);
                $query->where('pode_postar', $canPost);
            }

            if (isset($request['page'])) {
                $result = $query->paginate(5);
            } else {
                $result = $query->get();
            }

            // Retorna os dados, o código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse($result, DefaultMessages::OK);
        } catch (Exception $e) {
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(DefaultMessages::INTERNAL_SERVER_ERROR, [], 500);
        }
    }

    /**
     * Utilizado para criar um novo usuário.
     * Apenas administradores podem criar usuários.
     */
    public function create(Request $request)
    {
        try {

            // Valida os dados vindos no corpo da requisição.
            $validator = UserValidations::validateCreateUser($request);

            // Se houver falha nas valida~ções retorna um código 422, os erros de validações e a mensagem de validations error
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // PEga o usuário logado
            $logged_user_id = Auth::user()->id;
            $logged_user = User::where("id", $logged_user_id)->first();

            // Somente o administrador principal pode criar outros administradores.
            if ($request->role == "administrador" && $logged_user->matricula != "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Cria o usuario
            DB::beginTransaction();
            $user = new User();
            $user->nome = $request->nome;
            $user->sobrenome = $request->sobrenome;
            $user->matricula = $request->matricula;
            $user->password = bcrypt($request->matricula);
            $user->role = $request->role;
            $user->ativo = 1;
            $user->primeiro_login = 1;
            $user->pode_postar = 1;
            $user->usando_primeira_senha = 1;
            $user->save();

            DB::commit();

            // Retorna o id e a matricula do usuário criado, e um código 201 e a mensagem de criado
            return DefaultResponse::HTTPResponse(
                ['id' => $user->id, 'matricula' => $user->matricula],
                DefaultMessages::CREATED,
                201
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Atualiza um usuário
    public function update(Request $request, $id)
    {
        try {
            // Busca o usuário logado
            $user = User::where('id', $id)->first();

            // Se o usuário não existir, retorna um 404 com a mensagem de not found
            if (!$user) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Valida os dados vindo no corpo da requisição
            $validator = UserValidations::validateUpdateUser($request, $id);

            // Se houver falha na validação, retorna um código 422 a mensagem de validation error e os erros das validações
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // BUsca o usuário logado
            $logged_user_id = Auth::user()->id;
            $logged_user = User::where("id", $logged_user_id)->first();

            // Somente o administrador principal pode atualizar outros administradores.
            if ($user->role == "administrador" && $logged_user->matricula != "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Atualiza o usuário
            DB::beginTransaction();
            $user->update($validator->validated());
            DB::commit();

            // Retorna os dados do usuário atualizados, o código 200 e a mensagem de udpdated
            return DefaultResponse::HTTPResponse(
                $validator->validated(),
                DefaultMessages::UPDATED,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Os usuário não são deletados, são desabilitados apenas.
     * Desabilitar um usuário impossibilita ele de entrar na plataforma.
     */
    public function disableUser(Request $request, $id)
    {
        try {
            // Busca o usuário logado
            $authUser_id = Auth::user()->id;
            $user = User::where('id', $id)->first();

            // Se não houver usuário, retorna um código 404 e a mensagem de not found
            if (!$user) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }
            
            $logged_user = User::where("id", $authUser_id)->first();

            // Somente o administrador principal pode desabilitar outros administradores.
            if ($user->id == "administrador" && $logged_user->matricula != "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Um administrador não pode desabilitar sua própria conta ou a conta do administrador 'principal'.
            if ($user->id == $authUser_id || $user->matricula == "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Valida os dados vindos no corpo da requisição
            $validator = UserValidations::validateDisableUser($request);

            // Se houver falha na validação, reotrna um código 422, a mensagem de validation error e os erros de validações
            if ($validator->fails()) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    $validator->errors(),
                    422
                );
            }

            // Remove todos os tokens de acesso do usuário
            $user->tokens->each->delete();

            // Atualiza os dados da desativação do usuário.
            DB::beginTransaction();
            $user->razao_da_desativacao = $request->input('razao_da_desativacao');
            $user->ativo = 0;
            $user->save();
            DB::commit();

            // Retorna um código 204 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::OK,
                204
            );
        } catch (Exception $e) {
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    // Habilita um usuário = Permite que ele entre na plataforma
    public function enableUser(Request $request, $id)
    {
        try {
            $user = User::where('id', $id)->first();

            if (!$user) {
                return DefaultResponse::HTTPResponse(
                    [],
                    DefaultMessages::NOT_FOUND,
                    404
                );
            }

            // Pega o usuário logado
            $logged_user_id = Auth::user()->id;
            $logged_user = User::where("id", $logged_user_id)->first();

            // Somente o administrador principal pode habilitar outros administradores.
            if ($request->role == "administrador" && $logged_user->matricula != "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Atualiza os dados do usuário
            DB::beginTransaction();
            $user->razao_da_desativacao = null;
            $user->ativo = 1;
            $user->save();
            DB::commit();

            // Retorna um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                [],
                DefaultMessages::OK,
                204
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    /**
     * Cria multiplos usuários ao mesmo tempo.
     * Utilizado para que o administrador não precisa criar um por um.
     */
    public function createUsers(Request $request)
    {
        try {
            // Pega o tipo de usuário que serão criados
            $role = $request->input('tipo_usuario');

            // Os dados dos usuários (nome, sobrenome e matricula)
            $insertUsers = $request->input('usuarios');

            $messagesSuccessful = [];
            $messagesFail = [];

            $logged_user_id = Auth::user()->id;
            $logged_user = User::where("id", $logged_user_id)->first();

            // Somente o administrador principal pode criar outros administradores.
            if ($request->role == "administrador" && $logged_user->matricula != "100000000000001") {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::NOT_AUTHORIZED,
                    [],
                    403
                );
            }

            // Loop para criar os usuários
            DB::beginTransaction();
            foreach ($insertUsers as $iu) {
                $newUser = new User();
                $newUser->nome = $iu['nome'];
                $newUser->sobrenome = $iu['sobrenome'];
                $newUser->matricula = $iu['matricula'];
                $newUser->password = bcrypt($iu['matricula']);
                $newUser->role = $role;
                $newUser->ativo = 1;
                $newUser->primeiro_login = 1;
                $newUser->pode_postar = 1;
                $newUser->usando_primeira_senha = 1;

                // Valida os dados do usuário que estara sendo criado
                $validator = UserValidations::validateBulkCreateUser($newUser);

                // Se houver falha adiciona uma mensagem de erro ao array, indicando o erro de validação
                if ($validator->fails()) {
                    $errorMessage = $iu['nome'] . ' ' . $iu['sobrenome'] . ' - ' . $iu['matricula'] . ": " . implode(', ', $validator->errors()->all());
                    array_push($messagesFail, $errorMessage);
                    continue;
                }

                // Salva o novo usuário
                $newUser->save();

                // Se houver sucesso na criação, adiciona a mensaem de sucesso no array de mensagens de sucesso
                $successMessage = $iu['nome'] . ' ' . $iu['sobrenome'] . ' - ' . $iu['matricula'];
                array_push($messagesSuccessful, $successMessage);
            }

            DB::commit();

            /**
             * Retorna as falhas em criar usuários, os sucessos, a contagem de sucessos e falhas
             * Um código 200 e a mensagem de ok
             */
            return DefaultResponse::HTTPResponse(
                [
                    "falhas" => $messagesFail,
                    "sucessos" => $messagesSuccessful,
                    "total_sucessos" => count($messagesSuccessful),
                    "total_falhas" => count($messagesFail)
                ],
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    // Pega todos os professores.
    public function getAllTeachers(Request $request)
    {
        try {

            // Busca os dados do professor
            $teachers = User::select(['id', 'nome', 'sobrenome'])
                ->where('role', 'professor')
                ->where('ativo', true)
                ->get();

            // Retorna os dados, um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $teachers,
                DefaultMessages::OK
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                [],
                500
            );
        }
    }

    // Busca os dados do perfil de um usuário pelo seu ID
    public function getProfile(Request $request, $user_id)
    {
        try {
            // Pega o usuário
            $userProfile = [];
            $user = User::where('id', $user_id)->first();

            // Contagem de resumos postados
            $countPosts = DB::table('documentos')
                ->where('user_id', $user->id)
                ->where('apagado', 0)
                ->count();

            // Contagem de review (perfeito e útil)
            $reviewsCount = Reviews::join('documentos', 'reviews.documento_id', '=', 'documentos.id')
                ->where('documentos.user_id', $user->id)
                ->select('reviews.review', DB::raw('count(*) as total'))
                ->groupBy('reviews.review')
                ->pluck('total', 'review');

            // Dados básicos do usuário
            $userProfile['user'] = [
                'id' => $user->id,
                'nome' => $user->nome,
                'sobrenome' => $user->sobrenome,
                'role' => $user->role
            ];

            $userProfile['count_posts'] = [
                'count' => $countPosts ?? 0
            ];

            $userProfile['review'] = [
                'perfeito' => $reviewsCount->get('perfeito', 0),
                'util' => $reviewsCount->get('util', 0),
                'confuso' => $reviewsCount->get('confuso', 0)
            ];

            // Retorna os dados do perfil, um cósigo 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $userProfile,
                DefaultMessages::OK
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
     * Desabilita multiplos usuários.
     * Par que o administrador não precise desabilitar um por um.
     */
    public function disableUsers(Request $request)
    {
        try {
            // Pega todas as matriculas dos alunos/professores que serão desabilitados
            $matriculasToDisable = $request->input('usuarios');
            $reason = $request->input('razao_da_desativacao');

            $messagesSuccessful = [];
            $messagesFail = [];

            $logged_user_id = Auth::user()->id;

            // Se não houver nenhuma matricula, retorna um código 422 e a mensagem de validation error
            if (empty($matriculasToDisable)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    'Nenhum usuário informado',
                    422
                );
            }

            // O motivo da desativação dos usuários
            $validReasons = ['professor_saiu', 'aluno_abandonou_curso', 'aluno_concluiu_curso', 'aluno_trancou_curso', 'outro'];
            if ($reason && !in_array($reason, $validReasons)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    'Motivo de desativação inválido',
                    422
                );
            }

            DB::beginTransaction();


            foreach ($matriculasToDisable as $matricula) {
                // Busca o usuário por matrícula
                $user = User::where('matricula', $matricula)->first();

                // Se não houver usuário adiciona a mensagem de erro ao array de falhas
                if (!$user) {
                    array_push($messagesFail, "Matrícula {$matricula}: Usuário não encontrado");
                    continue;
                }

                /**
                 * Se um administrador estiver tentando se desabilitar, não permite a desativação.
                 */
                if ($user->id === $logged_user_id) {
                    array_push($messagesFail, "{$user->nome} {$user->sobrenome} ({$matricula}): Não é possível desativar seu próprio usuário");
                    continue;
                }

                /**
                 * Não é possível desabilitar o administrador principal, adiciona uma mensagem de erro ao array de flahas
                 */
                if ($user->matricula === "100000000000001") {
                    array_push($messagesFail, "{$user->nome} {$user->sobrenome} ({$matricula}): Não é possível desativar o administrador principal");
                    continue;
                }

                // Se o usuário já estiver desabilitado, adiicona uma mensagem de erro ao array de flahas
                if ($user->ativo == 0) {
                    array_push($messagesFail, "{$user->nome} {$user->sobrenome} ({$matricula}): Usuário já está desativado");
                    continue;
                }

                // Altera o estado de ativação do usuário
                $user->ativo = 0;
                if ($reason) {
                    $user->razao_da_desativacao = $reason;
                }
                $user->save();

                // Adiciona a mensagem de sucesso ao array de sucessos.
                $successMessage = "{$user->nome} {$user->sobrenome} - {$user->matricula}";
                array_push($messagesSuccessful, $successMessage);
            }

            DB::commit();

            // Retorna as falhas e sucessos e suas contagens
            return DefaultResponse::HTTPResponse(
                [
                    "falhas" => $messagesFail,
                    "sucessos" => $messagesSuccessful,
                    "total_sucessos" => count($messagesSuccessful),
                    "total_falhas" => count($messagesFail)
                ],
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Reativa multiplos usuários.
     * Par que o administrador não precise reativar um por um.
     */
    public function reactivateUsers(Request $request)
    {
        try {

            // as matriculas dos usuários que serão reativados
            $matriculasToReactivate = $request->input('usuarios');

            $messagesSuccessful = [];
            $messagesFail = [];

            // Se não houver matriculas vindas no corpo da requisição retorna um código 422 e a mensagem de validation error
            if (empty($matriculasToReactivate)) {
                return DefaultResponse::HTTPErrorResponse(
                    DefaultMessages::VALIDATION_ERROR,
                    'Nenhum usuário informado',
                    422
                );
            }

            DB::beginTransaction();

            // Loop para desabilitar todos os usuários
            foreach ($matriculasToReactivate as $matricula) {
                $user = User::where('matricula', $matricula)->first();

                // Se o usuário não existir, adiciona a mensagem de erro ao array de erros
                if (!$user) {
                    array_push($messagesFail, "Matrícula {$matricula}: Usuário não encontrado");
                    continue;
                }

                // Se o usuário á estiver ativo, adiciona o usuário a mensagem de erros
                if ($user->ativo == 1) {
                    array_push($messagesFail, "{$user->nome} {$user->sobrenome} ({$matricula}): Usuário já está ativo");
                    continue;
                }

                // Reativa o usuário
                $user->ativo = 1;
                $user->razao_da_desativacao = null;
                $user->save();

                // Adicoina a mensagem de sucesso ao array de sucessos.
                $successMessage = "{$user->nome} {$user->sobrenome} - {$user->matricula}";
                array_push($messagesSuccessful, $successMessage);
            }

            DB::commit();

            // Retorna os dados de falhas e sucessos e a contagem com um código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                [
                    "falhas" => $messagesFail,
                    "sucessos" => $messagesSuccessful,
                    "total_sucessos" => count($messagesSuccessful),
                    "total_falhas" => count($messagesFail)
                ],
                DefaultMessages::OK,
                200
            );
        } catch (Exception $e) {
            
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage(),
                500
            );
        }
    }
}
