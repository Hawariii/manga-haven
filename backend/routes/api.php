<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MangaController;
use App\Http\Controllers\ReaderController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth-register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:auth-admin-login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::get('/manga', [MangaController::class, 'index']);
Route::get('/manga/{slug}', [MangaController::class, 'show']);
Route::get('/manga/{mangaSlug}/chapters/{chapterSlug}', [ReaderController::class, 'show']);
Route::get('/top-manga', [MangaController::class, 'topManga']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationNotification'])
        ->middleware('throttle:verification-notification');

    Route::get('/history', [HistoryController::class, 'index']);
    Route::post('/history', [HistoryController::class, 'store']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);

    Route::middleware('admin')->group(function (): void {
        Route::post('/manga', [MangaController::class, 'store']);
        Route::match(['put', 'patch'], '/manga/{manga}', [MangaController::class, 'update']);
        Route::delete('/manga/{manga}', [MangaController::class, 'destroy']);

        Route::post('/manga/{manga}/chapters', [ChapterController::class, 'store']);
        Route::match(['put', 'patch'], '/chapters/{chapter}', [ChapterController::class, 'update']);
        Route::delete('/chapters/{chapter}', [ChapterController::class, 'destroy']);
    });
});
