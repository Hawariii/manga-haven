<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('manga', function (Blueprint $table): void {
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->string('artist')->nullable();
            $table->string('type', 50)->nullable();
            $table->json('genres')->nullable();
            $table->unsignedSmallInteger('release_year')->nullable();
            $table->string('country', 100)->nullable();
            $table->string('banner')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
        });

        Schema::table('chapters', function (Blueprint $table): void {
            $table->string('slug')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unique(['manga_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table): void {
            $table->dropUnique('chapters_manga_id_slug_unique');
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn([
                'slug',
                'published_at',
                'is_locked',
            ]);
        });

        Schema::table('manga', function (Blueprint $table): void {
            $table->dropColumn([
                'description',
                'author',
                'artist',
                'type',
                'genres',
                'release_year',
                'country',
                'banner',
                'is_featured',
                'is_published',
            ]);
        });
    }
};
