<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExaminationController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ===== Guest Routes =====
Route::group(['middleware' => ['guest']], function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// ===== Authenticated Routes =====
Route::group(['middleware' => ['auth']], function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    // Dashboard stats (Admin Only)
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/dashboard-stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    });

    Route::any('/logout', [AuthController::class, 'logout'])->name('logout');

    // ===== Patient Routes =====
    Route::middleware(['role:resepsionis,admin,dokter'])->group(function () {
        Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
        Route::get('/patients/list', [PatientController::class, 'list'])->name('patients.list');
        Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
    });
    Route::middleware(['role:resepsionis,admin'])->group(function () {
        Route::post('/patients', [PatientController::class, 'store'])->name('patients.store');
        Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('patients.update');
    });
    Route::middleware(['role:admin'])->group(function () {
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->name('patients.destroy');
    });

    // ===== Examination Routes =====
    Route::middleware(['role:dokter,admin'])->group(function () {
        Route::get('/examinations', [ExaminationController::class, 'index'])->name('examinations.index');
        Route::get('/examinations/list', [ExaminationController::class, 'list'])->name('examinations.list');
        Route::get('/examinations/{examination}', [ExaminationController::class, 'show'])->name('examinations.show');
        Route::post('/examinations', [ExaminationController::class, 'store'])->name('examinations.store');
        Route::put('/examinations/{examination}', [ExaminationController::class, 'update'])->name('examinations.update');
        Route::post('/examinations/{examination}/upload-document', [ExaminationController::class, 'uploadDocument'])->name('examinations.uploadDocument');
    });
    Route::middleware(['role:admin'])->group(function () {
        Route::delete('/examinations/{examination}', [ExaminationController::class, 'destroy'])->name('examinations.destroy');
    });

    // ===== Medicine Routes =====
    Route::middleware(['role:dokter,apoteker,admin'])->group(function () {
        Route::get('/medicines', [MedicineController::class, 'index'])->name('medicines.index');
        Route::get('/medicines/list', [MedicineController::class, 'list'])->name('medicines.list');
        Route::get('/medicines/{medicine}', [MedicineController::class, 'show'])->name('medicines.show');
    });
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/medicines/{medicine}/price-history', [MedicineController::class, 'priceHistory'])->name('medicines.priceHistory');
        Route::post('/medicines/refresh', [MedicineController::class, 'refresh'])->name('medicines.refresh');
    });

    // ===== Prescription Routes =====
    Route::middleware(['role:dokter,apoteker,admin'])->group(function () {
        Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
        Route::get('/prescriptions/list', [PrescriptionController::class, 'list'])->name('prescriptions.list');
        Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show'])->name('prescriptions.show');
        Route::get('/prescriptions/{prescription}/print', [PrescriptionController::class, 'printReceipt'])->name('prescriptions.print');
    });
    Route::middleware(['role:dokter,admin'])->group(function () {
        Route::post('/prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');
        Route::put('/prescriptions/{prescription}', [PrescriptionController::class, 'update'])->name('prescriptions.update');
    });
    Route::middleware(['role:apoteker,admin'])->group(function () {
        Route::post('/prescriptions/{prescription}/approve', [PrescriptionController::class, 'approve'])->name('prescriptions.approve');
    });

    // ===== User Routes =====
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users/list', [UserController::class, 'list'])->name('users.list');
        Route::resource('/users', UserController::class)->except(['create', 'edit']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.resetPassword');
    });

    // ===== Profile Routes (All Authenticated) =====
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::get('/profile/me', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.updatePassword');

    // ===== Log Routes =====
    Route::get('/my-logs', [LogController::class, 'myLogs'])->name('logs.myLogs');
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/all-logs', [LogController::class, 'allLogs'])->name('logs.allLogs');
    });
});
