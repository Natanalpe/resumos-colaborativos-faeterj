<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateLogsTable extends Migration
{

    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            //$table->char('id', 36)->primary()->default(DB::raw('(UUID())'));
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('user_id');
            $table->enum('acao', ['login', 'logout', 'upload_documento', 'delecao_documento', 'review', 'registro_de_usuario', 'desativacao_de_usuario', 'mudanca_de_senha']);
            $table->boolean('acao_ocorreu_com_sucesso');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('logs');
    }
}