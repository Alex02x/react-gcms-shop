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
        Schema::create('product_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('version_number', 50);
            $table->string('version_name');
            $table->text('short_description');
            $table->text('full_changelog');
            $table->unsignedInteger('download_count')->default(0);
            $table->boolean('is_latest')->default(false);
            $table->timestamps();

            $table->index(['product_id', 'is_latest']);
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_versions');
    }
};
