<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('nome')->nullable(false);
            $table->string('sobrenome')->nullable(false);
            $table->string('matricula')->unique();
            $table->string('password');
            $table->enum('role', ['administrador', 'professor', 'aluno']);
            $table->boolean('ativo')->default(true);
            $table->boolean('primeiro_login')->default(true);
            $table->enum('razao_da_desativacao', ['professor_saiu', 'aluno_abandonou_curso', 'aluno_concluiu_curso', 'aluno_trancou_curso', 'outro'])->nullable();
            $table->boolean('pode_postar')->default(true);
            $table->boolean('usando_primeira_senha')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->string('email')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
