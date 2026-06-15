<?php

namespace App\Validations;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

/**
 * Validações padronizadas para o controller de manutenção
 */
class MaintenanceValidations
{

    public static function validateUpdateMaintenanceMode(Request $request)
    {
        $rules = [
            'under_maintenance' => 'required|boolean',
            'estimate' => 'required'
        ];

        $arrayRequest = $request->toArray();

        return Validator::make($arrayRequest, $rules);
    }
}
