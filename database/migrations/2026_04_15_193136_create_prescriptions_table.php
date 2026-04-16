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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('examination_id')->constrained('examinations')->onDelete('cascade');
            $table->enum('status', ['pending', 'served'])->default('pending');
            $table->dateTime('served_date')->nullable();
            $table->foreignId('served_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('total', 15, 2)->default(0)->comment('Total purchase amount from all prescription items');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
