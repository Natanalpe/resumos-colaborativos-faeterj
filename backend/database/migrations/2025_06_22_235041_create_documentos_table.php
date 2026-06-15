<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateDocumentosTable extends Migration
{

    public function up()
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->uuid('id', 36)->primary()->default(DB::raw('(UUID())'));
            $table->uuid('materia_id');
            $table->string('titulo');
            $table->timestamps();
            $table->binary('conteudo')->nullable();
            $table->text('conteudo_texto')->nullable();
            $table->uuid('user_id');
            $table->enum('tipo', ['imagem', 'txt', 'readme', 'youtube_link']);
            $table->enum('tag', ['p1', 'p2', 'p3', 'pf', 'outros']);
            $table->boolean('apagado');
            
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('materia_id')->references('id')->on('materias');
        });

        DB::statement('ALTER TABLE documentos MODIFY conteudo LONGBLOB');
    }

    public function down()
    {
        Schema::dropIfExists('documentos');
    }
}