<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateTableColecaoDocumento extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('colecao_documento', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->timestamps();

            $table->uuid('user_id');
            $table->uuid('documento_id');
            $table->uuid('colecao_id')->nullable();
            $table->integer('ordem')->unsigned()->default(null);

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('documento_id')->references('id')->on('documentos');
            $table->foreign('colecao_id')->references('id')->on('colecoes')->onDelete('cascade');

            $table->unique(['user_id', 'documento_id', 'colecao_id'], 'unique_user_doc_colecao');

            $table->index(['user_id', 'colecao_id', 'ordem']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('colecao_documento');
    }
}
