<?php

namespace Database\Seeders;

use App\Models\Chapter;
use App\Models\Favorite;
use App\Models\History;
use App\Models\Manga;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::updateOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $admin = User::updateOrCreate([
            'email' => 'admin@mangahaven.test',
        ], [
            'name' => 'Admin Manga Haven',
            'password' => Hash::make('admin12345'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $mangaItems = [
            [
                'title' => 'Renegade Immortal',
                'slug' => 'renegade-immortal',
                'cover' => 'https://picsum.photos/seed/renegade-immortal/600/900',
                'banner' => 'https://picsum.photos/seed/renegade-immortal-banner/1200/675',
                'views' => 2000000,
                'status' => 'Ongoing',
                'description' => 'Cultivation fantasy dengan konflik besar, dunia luas, dan progres karakter yang panjang.',
                'author' => 'Er Gen',
                'artist' => 'Studio DW',
                'type' => 'Donghua',
                'genres' => ['Action', 'Fantasy', 'Martial Arts'],
                'release_year' => 2023,
                'country' => 'China',
                'is_featured' => true,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 126', 'number' => 126, 'published_at' => now()->subDays(3)],
                    ['title' => 'Episode 127', 'number' => 127, 'published_at' => now()->subDays(2)],
                    ['title' => 'Episode 128', 'number' => 128, 'published_at' => now()->subDay()],
                ],
            ],
            [
                'title' => 'Ascendants of the Nine Suns',
                'slug' => 'ascendants-of-the-nine-suns',
                'cover' => 'https://picsum.photos/seed/nine-suns/600/900',
                'banner' => 'https://picsum.photos/seed/nine-suns-banner/1200/675',
                'views' => 1500000,
                'status' => 'Sedang Tayang',
                'description' => 'Cerita aksi kultivasi cepat dengan rival kuat dan visual pertarungan yang intens.',
                'author' => 'Tian Can Tu Dou',
                'artist' => 'Studio Flame',
                'type' => 'Donghua',
                'genres' => ['Action', 'Adventure', 'Fantasy'],
                'release_year' => 2024,
                'country' => 'China',
                'is_featured' => true,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 14', 'number' => 14, 'published_at' => now()->subDays(6)],
                    ['title' => 'Episode 15', 'number' => 15, 'published_at' => now()->subDays(4)],
                    ['title' => 'Episode 16', 'number' => 16, 'published_at' => now()->subDays(2)],
                ],
            ],
            [
                'title' => 'Battle Through the Heavens',
                'slug' => 'battle-through-the-heavens',
                'cover' => 'https://picsum.photos/seed/btth/600/900',
                'banner' => 'https://picsum.photos/seed/btth-banner/1200/675',
                'views' => 3200000,
                'status' => 'Ongoing',
                'description' => 'Perjalanan balas dendam dan kebangkitan kultivator muda yang jadi salah satu judul besar.',
                'author' => 'Tian Can Tu Dou',
                'artist' => 'Studio Motion Magic',
                'type' => 'Donghua',
                'genres' => ['Action', 'Fantasy', 'Revenge'],
                'release_year' => 2022,
                'country' => 'China',
                'is_featured' => true,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 211', 'number' => 211, 'published_at' => now()->subDays(8)],
                    ['title' => 'Episode 212', 'number' => 212, 'published_at' => now()->subDays(5)],
                    ['title' => 'Episode 213', 'number' => 213, 'published_at' => now()->subDays(1)],
                ],
            ],
            [
                'title' => 'Soul Land',
                'slug' => 'soul-land',
                'cover' => 'https://picsum.photos/seed/soul-land/600/900',
                'banner' => 'https://picsum.photos/seed/soul-land-banner/1200/675',
                'views' => 4100000,
                'status' => 'Completed',
                'description' => 'Serial populer dengan progression system yang panjang dan worldbuilding kuat.',
                'author' => 'Tang Jia San Shao',
                'artist' => 'Studio Sparkly Key',
                'type' => 'Donghua',
                'genres' => ['Action', 'Fantasy', 'Adventure'],
                'release_year' => 2021,
                'country' => 'China',
                'is_featured' => false,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 261', 'number' => 261, 'published_at' => now()->subDays(30)],
                    ['title' => 'Episode 262', 'number' => 262, 'published_at' => now()->subDays(29)],
                    ['title' => 'Episode 263', 'number' => 263, 'published_at' => now()->subDays(28)],
                ],
            ],
            [
                'title' => 'The Great Ruler',
                'slug' => 'the-great-ruler',
                'cover' => 'https://picsum.photos/seed/great-ruler/600/900',
                'banner' => 'https://picsum.photos/seed/great-ruler-banner/1200/675',
                'views' => 980000,
                'status' => 'Ongoing',
                'description' => 'Fantasy school battle dengan fokus alliance, rivalitas, dan ekspansi dunia.',
                'author' => 'Tian Can Tu Dou',
                'artist' => 'Studio Arc',
                'type' => 'Donghua',
                'genres' => ['Fantasy', 'School', 'Action'],
                'release_year' => 2024,
                'country' => 'China',
                'is_featured' => false,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 57', 'number' => 57, 'published_at' => now()->subDays(7)],
                    ['title' => 'Episode 58', 'number' => 58, 'published_at' => now()->subDays(5)],
                    ['title' => 'Episode 59', 'number' => 59, 'published_at' => now()->subDays(3)],
                ],
            ],
            [
                'title' => 'Perfect World',
                'slug' => 'perfect-world',
                'cover' => 'https://picsum.photos/seed/perfect-world/600/900',
                'banner' => 'https://picsum.photos/seed/perfect-world-banner/1200/675',
                'views' => 2750000,
                'status' => 'Sedang Tayang',
                'description' => 'Aksi survival fantasy dengan power scaling besar dan visual dunia yang liar.',
                'author' => 'Chen Dong',
                'artist' => 'Shanghai Foch Film',
                'type' => 'Donghua',
                'genres' => ['Action', 'Fantasy', 'Adventure'],
                'release_year' => 2023,
                'country' => 'China',
                'is_featured' => true,
                'is_published' => true,
                'chapters' => [
                    ['title' => 'Episode 189', 'number' => 189, 'published_at' => now()->subDays(4)],
                    ['title' => 'Episode 190', 'number' => 190, 'published_at' => now()->subDays(2)],
                    ['title' => 'Episode 191', 'number' => 191, 'published_at' => now()],
                ],
            ],
        ];

        $historyChapterId = null;

        foreach ($mangaItems as $index => $item) {
            $manga = Manga::updateOrCreate(
                ['slug' => $item['slug']],
                collect($item)->except('chapters')->toArray()
            );

            foreach ($item['chapters'] as $chapterData) {
                $chapter = Chapter::updateOrCreate(
                    [
                        'manga_id' => $manga->id,
                        'number' => $chapterData['number'],
                    ],
                    [
                        'title' => $chapterData['title'],
                        'slug' => Str::slug($chapterData['title'].'-'.$chapterData['number']),
                        'published_at' => $chapterData['published_at'] ?? now(),
                        'is_locked' => false,
                        'created_by' => $admin->id,
                    ]
                );

                if ($index === 0 && $chapterData['number'] === 128) {
                    $historyChapterId = $chapter->id;
                }
            }

            if ($index < 3) {
                Favorite::updateOrCreate([
                    'user_id' => $user->id,
                    'manga_id' => $manga->id,
                ]);
            }

            if ($index === 0) {
                Favorite::updateOrCreate([
                    'user_id' => $admin->id,
                    'manga_id' => $manga->id,
                ]);
            }
        }

        if ($historyChapterId) {
            $renegadeImmortal = Manga::where('slug', 'renegade-immortal')->first();

            if ($renegadeImmortal) {
                History::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'manga_id' => $renegadeImmortal->id,
                    ],
                    [
                        'last_chapter' => $historyChapterId,
                    ]
                );
            }
        }
    }
}
