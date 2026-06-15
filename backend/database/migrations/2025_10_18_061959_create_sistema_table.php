<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSistemaTable extends Migration
{
    public function up()
    {
        Schema::create('sistema', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->boolean("em_manutencao")->default(false);
            $table->dateTime('previsao_fim');
        });
    }

    public function down()
    {
        Schema::dropIfExists('sistema');
    }
}
