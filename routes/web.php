<?php

use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminProductVersionController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminWalletController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Authentication routes
Route::post('/auth/send-code', [AuthController::class, 'sendCode'])->name('auth.send-code');
Route::post('/auth/verify-code', [AuthController::class, 'verifyCode'])->name('auth.verify-code');
Route::get('/auth/user', [AuthController::class, 'user'])->middleware('auth')->name('auth.user');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth')->name('auth.logout');

// Main shop page
Route::get('/', [ShopController::class, 'index'])->name('home');

// Product details page
Route::get('/products/{slug}', [ShopController::class, 'show'])->name('product.show');

// Protected user pages
Route::middleware('auth')->group(function () {
    Route::get('/buys', function () {
        return Inertia::render('buys');
    })->name('buys');

    Route::get('/wallet', function () {
        return Inertia::render('wallet');
    })->name('wallet');

    Route::get('/settings', function () {
        return Inertia::render('settings');
    })->name('settings');
});

// Admin routes
Route::prefix('admin')->name('admin.')->middleware(['auth'])->group(function () {
    // User Management Routes
    Route::middleware('permission:manage-users')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        Route::get('/users/{user}/transactions', [AdminWalletController::class, 'transactions'])->name('users.transactions');
    });

    // Wallet Management Routes
    Route::middleware('permission:manage-wallets')->group(function () {
        Route::get('/users/{user}/wallet', [AdminWalletController::class, 'show'])->name('users.wallet');
        Route::post('/users/{user}/wallet/deposit', [AdminWalletController::class, 'deposit'])->name('users.wallet.deposit');
        Route::post('/users/{user}/wallet/withdraw', [AdminWalletController::class, 'withdraw'])->name('users.wallet.withdraw');
        Route::get('/users/{user}/transactions/export', [AdminWalletController::class, 'exportTransactions'])->name('users.transactions.export');
    });

    // Role Management Routes
    Route::middleware('permission:manage-roles')->group(function () {
        Route::get('/roles', [AdminRoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [AdminRoleController::class, 'create'])->name('roles.create');
        Route::post('/roles', [AdminRoleController::class, 'store'])->name('roles.store');
        Route::get('/roles/{role}/edit', [AdminRoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [AdminRoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])->name('roles.destroy');
    });

    // Category Management Routes
    Route::middleware('permission:edit-categories')->group(function () {
        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories/main', [AdminCategoryController::class, 'storeMainCategory'])->name('categories.main.store');
        Route::put('/categories/main/{category}', [AdminCategoryController::class, 'updateMainCategory'])->name('categories.main.update');
        Route::delete('/categories/main/{category}', [AdminCategoryController::class, 'destroyMainCategory'])->name('categories.main.destroy');
        Route::post('/categories/sub', [AdminCategoryController::class, 'storeSubcategory'])->name('categories.sub.store');
        Route::put('/categories/sub/{subcategory}', [AdminCategoryController::class, 'updateSubcategory'])->name('categories.sub.update');
        Route::delete('/categories/sub/{subcategory}', [AdminCategoryController::class, 'destroySubcategory'])->name('categories.sub.destroy');
    });

    // Product Management Routes
    Route::middleware('permission:edit-products')->group(function () {
        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
        Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImages'])->name('products.images.upload');
        Route::delete('/products/{product}/images/{media}', [AdminProductController::class, 'deleteImage'])->name('products.images.delete');
        Route::post('/products/{product}/images/reorder', [AdminProductController::class, 'reorderImages'])->name('products.images.reorder');

        // Product Version Routes
        Route::get('/products/{product}/versions', [AdminProductVersionController::class, 'index'])->name('products.versions.index');
        Route::get('/products/{product}/versions/create', [AdminProductVersionController::class, 'create'])->name('products.versions.create');
        Route::post('/products/{product}/versions', [AdminProductVersionController::class, 'store'])->name('products.versions.store');
        Route::get('/products/{product}/versions/{version}/edit', [AdminProductVersionController::class, 'edit'])->name('products.versions.edit');
        Route::put('/products/{product}/versions/{version}', [AdminProductVersionController::class, 'update'])->name('products.versions.update');
        Route::delete('/products/{product}/versions/{version}', [AdminProductVersionController::class, 'destroy'])->name('products.versions.destroy');
        Route::post('/products/{product}/versions/{version}/archive', [AdminProductVersionController::class, 'uploadArchive'])->name('products.versions.archive');
        Route::post('/products/{product}/versions/{version}/toggle-latest', [AdminProductVersionController::class, 'toggleLatest'])->name('products.versions.toggle-latest');
    });
});
