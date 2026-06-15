<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarningsController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SystemController;
use Illuminate\Support\Facades\Route;

/**
 * Rotas públicas
 */
Route::middleware(['maintenanceMode'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('confirm-password-change', [AuthController::class, 'confirmPasswordChange']);
        Route::post('password/recovery', [PasswordController::class, 'sendRecoveryPasswordMail']);
        Route::post('password/validate-token', [PasswordController::class, 'validateRecoveryToken']);
        Route::post('password/reset', [PasswordController::class, 'resetPassword']);
    });
});

Route::middleware(['auth:sanctum', 'maintenanceMode'])->group(function () {
    Route::post('send-set-password-mail', [EmailController::class, 'sendSetPasswordMail']);
    Route::post('send-reset-password-mail', [EmailController::class, 'sendSetPasswordMail']);
});


/**
 * Rotas permitidas apenas para usuários com a role de administrador
 */
Route::middleware(['auth:sanctum'])->group(function () {

    Route::prefix('news')->group(function () {
        Route::post('', [NewsController::class, 'create'])->middleware('role:administrador');
        Route::delete('/{news_id}', [NewsController::class, 'delete'])->middleware('role:administrador');
        Route::put('/{news_id}', [NewsController::class, 'update'])->middleware('role:administrador');
        Route::get('/search', [NewsController::class, 'search'])->middleware('role:administrador');
    });

    Route::prefix('users')->group(function () {
        Route::get('', [UserController::class, 'getAll'])->middleware('role:administrador');
        Route::get('/role', [UserController::class, 'getAllByRole'])->middleware('role:administrador');
        Route::get('/search', [UserController::class, 'search'])->middleware('role:administrador');
        Route::put('/{id}', [UserController::class, 'update'])->middleware('role:administrador');
        Route::put('/disable/{id}', [UserController::class, 'disableUser'])->middleware('role:administrador');
        Route::put('/enable/{id}', [UserController::class, 'enableUser'])->middleware('role:administrador');
        Route::post('', [UserController::class, 'createUsers'])->middleware('role:administrador');

        Route::prefix('bunch')->group(function () {
            Route::post('disable', [UserController::class, 'disableUsers'])->middleware('role:administrador');
            Route::post('enable', [UserController::class, 'reactivateUsers'])->middleware('role:administrador');
        });
    });

    Route::prefix('subjects')->group(function () {
        Route::post('', [SubjectController::class, 'create'])->middleware('role:administrador');
        Route::delete('{subject_id}', [SubjectController::class, 'delete'])->middleware('role:administrador');
        Route::put('{subject_id}', [SubjectController::class, 'update'])->middleware('role:administrador');
    });

    Route::prefix('warnings')->group(function () {
        Route::post('', [WarningsController::class, 'create'])->middleware('role:administrador');
        Route::delete('/{id}', [WarningsController::class, 'delete'])->middleware('role:administrador');
    });

    Route::prefix('system')->group(function () {
        Route::post('/rules', [SystemController::class, 'updateRules'])->middleware('role:administrador');
        Route::put('/maintenance', [SystemController::class, 'updateMaintenanceMode'])->middleware('role:administrador');
        Route::get('/metrics', [SystemController::class, 'getDashboardSystemData'])->middleware('role:administrador');
    });

    Route::prefix('summaries')->group(function () {
        Route::delete('delete/{id}', [SummaryController::class, 'admDeleteContent'])->middleware('role:administrador');
        Route::put('restore/{id}', [SummaryController::class, 'restoreDeletionContent'])->middleware('role:administrador');

        Route::prefix('deleted')->group(function () {
            Route::get('/all', [SummaryController::class, 'getAllDeletedSummaries'])->middleware('role:administrador');
        });
    });
});

/**
 * Rotas permitidas para todos os usuários.
 */
Route::middleware(['auth:sanctum', 'changed.password', 'maintenanceMode'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('request-password-change', [AuthController::class, 'requestPasswordChange']);

    Route::prefix('password')->group(function () {
        Route::post('send-reset-mail', [EmailController::class, 'sendSetPasswordMail']);
        Route::post('validate-token', [EmailController::class, 'validateToken']);
        Route::post('set-password', [EmailController::class, 'setPassword']);
    });

    Route::prefix('mail')->group(function () {
        Route::get('/callback', [EmailController::class, 'handleCallback']);
        Route::get('/send-mail', [EmailController::class, 'sendRecoveryMail']);
    });

    Route::prefix('news')->group(function () {
        Route::get('/{news_id}', [NewsController::class, 'getById']);
        Route::get('', [NewsController::class, 'getAll']);
    });

    Route::prefix('users')->group(function () {
        Route::get('/{user_id}', [UserController::class, 'getById']);
        Route::get('/{user_id}/warnings/', [WarningsController::class, 'getAllByUserId']);
        Route::get('/{user_id}/warnings/{warnings_id}', [WarningsController::class, 'getByIds']);
        Route::get('/{user_id}/count/warnings', [WarningsController::class, 'getUserWarningQuantity']);

        Route::prefix('profile')->group(function () {
            Route::get('/{user_id}', [UserController::class, 'getProfile']);

            Route::prefix('posts')->group(function () {
                Route::get('/{user_id}', [SummaryController::class, 'getUserSummaries']);
            });
        });

        Route::prefix('teacher')->group(function () {
            Route::get('/all', [UserController::class, 'getAllTeachers']);
        });
    });

    Route::prefix('subjects')->group(function () {
        Route::get('', [SubjectController::class, 'getAll']);

        /* 
        ** Tomar cuidado com a ordem dos endpoints, se o 'search' ficasse depoid do 
        ** '/{subject_id}', ao fazer uma requisição para o 'search', o laravel poderia 
        ** interpreta-lo como uma requisição para o '/{subject_id'}.
        */
        Route::get('/search', [SubjectController::class, 'search']);
        Route::get('/{subject_id}', [SubjectController::class, 'getById']);
    });

    Route::prefix('summaries')->group(function () {
        Route::get('/{id}/image', [SummaryController::class, 'getImageContent']);
        Route::get('/last', [SummaryController::class, 'getLastSummaries']);
        Route::get('/search', [SummaryController::class, 'search']);
        Route::post('', [SummaryController::class, 'create']);
        Route::get('/{id}', [SummaryController::class, 'getById']);
        Route::delete('/{id}', [SummaryController::class, 'deleteContent']);
    });

    Route::prefix('review')->group(function () {
        Route::post('/summary/{document_id}', [ReviewController::class, 'updateOrCreate']);
        Route::delete('/summary/{document_id}', [ReviewController::class, 'delete']);
    });

    Route::prefix('system')->group(function () {
        Route::get('/rules', [SystemController::class, 'getRules']);
        Route::get('/maintenance', [SystemController::class, 'getMaintenanceMode']);
    });

    Route::prefix('collection')->group(function () {
        // Rotas específicas ANTES das rotas com parâmetros dinâmicos
        Route::get('/user/{user_id}', [CollectionController::class, 'getUserCollections']);
        Route::post('', [CollectionController::class, 'createCollection']);

        Route::prefix('document')->group(function () {
            
            Route::put('update-order', [CollectionController::class, 'updateDocumentsOrder']);

            Route::prefix('all')->group(function () {
                Route::get('/{colection_id}', [CollectionController::class, 'getSummariesFromCollectionById']);
                Route::get('user/{user_id}', [CollectionController::class, 'getAllSummariesFromCollection']);
            });

            Route::get('check/{documento_id}', [CollectionController::class, 'checkDocumentInCollections']);
            Route::delete('', [CollectionController::class, 'removeDocumentFromCollection']);
            Route::post('', [CollectionController::class, 'addDocumentToCollection']);
        });

        // Rotas com parâmetros dinâmicos POR ÚLTIMO
        Route::get('/{collection_id}', [CollectionController::class, 'getCollectionById']);
        Route::delete('/{collection_id}', [CollectionController::class, 'deleteCollection']);
        Route::put('/{collection_id}', [CollectionController::class, 'editCollectionName']);
    });
});
