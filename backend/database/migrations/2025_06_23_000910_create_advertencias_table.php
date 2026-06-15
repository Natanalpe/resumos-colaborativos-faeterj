<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateAdvertenciasTable extends Migration
{

    public function up()
    {
        Schema::create('advertencias', function (Blueprint $table) {
            $table->char('id', 36)->primary()->default(DB::raw('(UUID())'));
            $table->uuid('user_id');
            $table->uuid('documento_id')->nullable()->default(null);
            $table->enum('acao', ['multiplas_tentativas_de_upload', 'upload_de_virus', 'upload_de_conteudo_sensivel', 'outros']);
            $table->timestamps();
            $table->boolean('foi_visto')->default(false);
            $table->string('descricao')->nullable();
            
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('documento_id')->references('id')->on('documentos')->nullable(true);
        });
    }

    public function down()
    {
        Schema::dropIfExists('advertencias');
    }
}