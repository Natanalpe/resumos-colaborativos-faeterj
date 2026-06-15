<?php

namespace App\Http\Controllers;

use App\Http\Responses\DefaultMessages;
use App\Http\Responses\DefaultResponse;
use App\Models\AppRules;
use App\Models\System;
use App\Models\User;
use App\Validations\MaintenanceValidations;
use App\Validations\RulesValidations;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

/**
 * Controller usado para o CRUD para as funcionalidades do dashboard do administrador.
 */
class SystemController extends Controller
{

    /**
     * Busca os dados para mostrar como gráfico no frontend no dashoard do administrador
     * Retorna:
     *      - A divisão de tipos de usuário;
     *      - A quantidade de resumos por matéria;
     *      - A quantidade de posts nos últimos seis meses;
     */
    public function getDashboardSystemData()
    {
        try {
            $data = [];

            // Contagem de usuários ativos por role;
            $count_students = User::where('role', 'aluno')->where('ativo', '1')->count();
            $count_teachers = User::where('role', 'professor')->where('ativo', '1')->count();
            $count_adms = User::where('role', 'administrador')->where('ativo', '1')->count();

            // Contagem de documentos por matéria;
            $count_documents_by_subjects = DB::table('materias')
                ->leftJoin('documentos', 'documentos.materia_id', '=', 'materias.id')
                ->select('materias.id', 'materias.nome', 'materias.sigla',  DB::raw('COUNT(documentos.id) as total_documentos'))
                ->groupBy('materias.id', 'materias.nome')
                ->orderBy('total_documentos', 'desc')
                ->get();

            // Atividade de upload por período (últimos 6 meses)
            $uploads_por_periodo = DB::table('documentos')
                ->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as periodo'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', DB::raw('DATE_SUB(NOW(), INTERVAL 6 MONTH)'))
                ->groupBy('periodo')
                ->orderBy('periodo', 'asc')
                ->get();

            // As contagens
            $data['counts'] = [
                'alunos' => $count_students,
                'professores' => $count_teachers,
                'administradores' => $count_adms,
                'resumo_por_materia' => $count_documents_by_subjects,
                'uploads_por_periodo' => $uploads_por_periodo
            ];

            // Retorna o código 200 com os dados e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                $data,
                DefaultMessages::OK,
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    // Busca as regras da plataforma
    public function getRules()
    {
        try {

            // Busca as regras
            $rules = AppRules::first();

            // Se houver regras, retorna o código 200 a mensagem OK e as regras
            /**
             * As regras são armazenadas no banco como texto mas são um JSON que será formatado no frontend pela biblioteca Quill
             * Biblioteca responsável por formatar/mostrar e possibilitar editar um texto como se fosse um documento no excel/google docs
             */
            if ($rules) {
                return DefaultResponse::HTTPResponse($rules, DefaultMessages::OK);
            }

            // Se não houver regras, retorna os dados vazios, o código 200 e a mensagem de OK
            return DefaultResponse::HTTPResponse(
                ['created_at' => 0, 'updated_at' => 0, 'rules' => ''],
                DefaultMessages::OK
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    // Atualiza as regras
    public function updateRules(Request $request)
    {
        try {

            // Valida os dados vindos no corpo da requisiçãp
            $validator = RulesValidations::validateCreateOrUpdateRules($request);

            // Se houver alha nas validações, retorna um código 422 os erros e uma mensagem de validation error
            if ($validator->fails()) {
                return DefaultResponse::HTTPResponse(
                    $validator->errors(),
                    DefaultMessages::VALIDATION_ERROR,
                    422
                );
            }

            // Insere ou atualiza as regras.
            DB::beginTransaction();
            $rules = AppRules::updateOrCreate(
                ['id' => 1],
                ['rules' => $request->input('rules')]
            );
            DB::commit();

            // Retoana as novas regras, o código 200 e a mensagemd e atualizado
            return DefaultResponse::HTTPResponse(
                $rules,
                DefaultMessages::UPDATED
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Verifica se a plataforma está em modo de manutenção.
     * Verificar o App\Http\Middleware\MaintenanceMode.
     * Apenas o administrador pode fazer qualquer requisição (até o login), quando a plataforma estiver em estado de manutenção.
     */
    public function getMaintenanceMode()
    {
        try {

            // Busca os dados da manutenção
            $maintenance = System::first();

            // Se não existir dados, retorna um código 200, a mensagem de OK e dizendo que não há manutenção
            if (!$maintenance) {
                return DefaultResponse::HTTPResponse(
                    ['created_at' => 0, 'updated_at' => 0, 'em_manutencao' => false, 'previsao_fim' => 0],
                    DefaultMessages::OK
                );
            }

            // Se houver dados de manutenção, retorna eles, um código 200 e a mensagem de OK.
            return DefaultResponse::HTTPResponse(
                $maintenance,
                DefaultMessages::OK
            );
        } catch (Exception $e) {

            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Atualiza o estado de manutenção da plataforma.
     * Apenas os administradores podem acessar está função.
     */
    public function updateMaintenanceMode(Request $request)
    {
        try {

            // Valida os dados vindos no corpo da requisição;
            $validator = MaintenanceValidations::validateUpdateMaintenanceMode($request);

            // Se hovuer falha nas validações, reotrna um vódigo 422, a mensagem de validation error e os erros de validação
            if ($validator->fails()) {
                return DefaultResponse::HTTPResponse(
                    $validator->errors(),
                    DefaultMessages::VALIDATION_ERROR,
                    422
                );
            }

            // Atualiza o estado de manutenção.
            DB::beginTransaction();
            $manutencao = System::first();
            if (!$manutencao) {
                $manutencao = new System();
            }
            $manutencao->em_manutencao = $request->input('under_maintenance');
            $manutencao->previsao_fim = $request->input('estimate');
            $manutencao->save();
            DB::commit();

            // Retorna os dados atualizados.
            return DefaultResponse::HTTPResponse(
                $manutencao,
                DefaultMessages::UPDATED
            );
        } catch (Exception $e) {
            
            // Se houver falha, retorna uma código 500 e a mensagem de internal server error
            DB::rollBack();
            return DefaultResponse::HTTPErrorResponse(
                DefaultMessages::INTERNAL_SERVER_ERROR,
                $e->getMessage()
            );
        }
    }
}
