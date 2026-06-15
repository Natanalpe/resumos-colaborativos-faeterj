<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'nome' => "Resumos",
            'email' => 'resumoscolaborativos@gmail.com',
            'password' => Hash::make('dgxkyscthflybvtu'),
            'role' => 'administrador',
            'primeiro_login' => 0,
            'sobrenome' => 'colaborativos',
            'matricula' => '100000000000001',
            'ativo' => 1,
            'pode_postar' => 1,
            'usando_primeira_senha' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
