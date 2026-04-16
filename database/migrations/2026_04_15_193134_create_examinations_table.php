<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('examinations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('examination_date');
            $table->text('findings');
            $table->string('document_path')->nullable();
            // Vital Signs
            $table->decimal('height', 5, 2)->nullable()->comment('dalam cm');
            $table->decimal('weight', 5, 2)->nullable()->comment('dalam kg');
            $table->integer('systole')->nullable()->comment('sistole tekanan darah');
            $table->integer('diastole')->nullable()->comment('diastole tekanan darah');
            $table->integer('heart_rate')->nullable()->comment('detak jantung per menit');
            $table->integer('respiration_rate')->nullable()->comment('laju pernapasan per menit');
            $table->decimal('temperature', 4, 2)->nullable()->comment('suhu tubuh dalam Celsius');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examinations');
    }
};
