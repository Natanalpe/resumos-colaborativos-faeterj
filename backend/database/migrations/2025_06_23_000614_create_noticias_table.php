<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateNoticiasTable extends Migration
{

    public function up()
    {
        Schema::create('noticias', function (Blueprint $table) {
            //$table->char('id', 36)->primary()->default(DB::raw('(UUID())'));
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('user_id');
            $table->timestamps();
            $table->text('conteudo', 2000);
            $table->string('titulo', 75);

            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('noticias');
    }
}
