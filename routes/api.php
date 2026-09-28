<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MatchingController;
use App\Http\Controllers\Api\AdditionalApiController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\NotificationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['web', 'auth'])->group(function () {
    
    // Matching (Fitur Unggulan)
    Route::get('reports/{report}/match', [MatchingController::class, 'match']);
    
    // Dashboard
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/recent-reports', [DashboardController::class, 'recentReports']);
    
    // Additional APIs
    Route::get('/categories', [AdditionalApiController::class, 'categories']);
    Route::get('/recommendations', [AdditionalApiController::class, 'recommendations']);
    Route::get('/activities', [AdditionalApiController::class, 'activities']);

    Route::get('/search', [App\Http\Controllers\Api\SearchController::class, 'search']);
    Route::get('/search-categories', [App\Http\Controllers\Api\SearchController::class, 'getCategories']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});