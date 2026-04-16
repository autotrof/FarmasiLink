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
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('prescription_id')->constrained('prescriptions')->onDelete('cascade');
            $table->foreignUuid('medicine_id')->constrained('medicines')->onDelete('cascade');
            $table->foreignUuid('price_id')->constrained('prices')->onDelete('restrict');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2)->comment('harga satuan obat saat resep dibuat');
            $table->decimal('subtotal', 10, 2)->comment('total harga item (quantity * unit_price)');
            $table->string('dosage')->comment('dosis pemberian obat');
            $table->string('instruction')->comment('cara pemberian');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
