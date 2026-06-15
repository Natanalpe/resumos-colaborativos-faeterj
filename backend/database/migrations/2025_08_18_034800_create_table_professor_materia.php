<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateTableProfessorMateria extends Migration
{
    public function up()
    {
        Schema::create('professor_materia', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('professor_id');
            $table->uuid('materia_id');

            $table->foreign('professor_id')
                ->references('id')
                ->on('users');
            
            $table->foreign('materia_id')
                ->references('id')
                ->on('materias');
        });
    }

    public function down()
    {
        Schema::dropIfExists('professor_materia');
    }
}
