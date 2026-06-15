<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableAppRules extends Migration
{
    public function up()
    {
        Schema::create('app_rules', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->text("rules")->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('app_rules');
    }
}
