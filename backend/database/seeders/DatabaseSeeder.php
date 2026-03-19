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
        ]);

        $admin = User::updateOrCreate([
            'email' => 'admin@mangahaven.test',
        ], [
            'name' => 'Admin Manga Haven',
            'password' => Hash::make('admin12345'),
            'role' => 'admin',
        ]);

        $mangaItems = [
            [
                'title' => 'Renegade Immortal',
                'slug' => 'renegade-immortal',
                'cover' => 'https://picsum.photos/seed/renegade-immortal/600/900',
                'views' => 2000000,
                'status' => 'Ongoing',
                'chapters' => [
                    ['title' => 'Episode 126', 'number' => 126],
                    ['title' => 'Episode 127', 'number' => 127],
                    ['title' => 'Episode 128', 'number' => 128],
                ],
            ],
            [
                'title' => 'Ascendants of the Nine Suns',
                'slug' => 'ascendants-of-the-nine-suns',
                'cover' => 'https://picsum.photos/seed/nine-suns/600/900',
                'views' => 1500000,
                'status' => 'Sedang Tayang',
                'chapters' => [
                    ['title' => 'Episode 14', 'number' => 14],
                    ['title' => 'Episode 15', 'number' => 15],
                    ['title' => 'Episode 16', 'number' => 16],
                ],
            ],
            [
                'title' => 'Battle Through the Heavens',
                'slug' => 'battle-through-the-heavens',
                'cover' => 'https://picsum.photos/seed/btth/600/900',
                'views' => 3200000,
                'status' => 'Ongoing',
                'chapters' => [
                    ['title' => 'Episode 211', 'number' => 211],
                    ['title' => 'Episode 212', 'number' => 212],
                    ['title' => 'Episode 213', 'number' => 213],
                ],
            ],
            [
                'title' => 'Soul Land',
                'slug' => 'soul-land',
                'cover' => 'https://picsum.photos/seed/soul-land/600/900',
                'views' => 4100000,
                'status' => 'Completed',
                'chapters' => [
                    ['title' => 'Episode 261', 'number' => 261],
                    ['title' => 'Episode 262', 'number' => 262],
                    ['title' => 'Episode 263', 'number' => 263],
                ],
            ],
            [
                'title' => 'The Great Ruler',
                'slug' => 'the-great-ruler',
                'cover' => 'https://picsum.photos/seed/great-ruler/600/900',
                'views' => 980000,
                'status' => 'Ongoing',
                'chapters' => [
                    ['title' => 'Episode 57', 'number' => 57],
                    ['title' => 'Episode 58', 'number' => 58],
                    ['title' => 'Episode 59', 'number' => 59],
                ],
            ],
            [
                'title' => 'Perfect World',
                'slug' => 'perfect-world',
                'cover' => 'https://picsum.photos/seed/perfect-world/600/900',
                'views' => 2750000,
                'status' => 'Sedang Tayang',
                'chapters' => [
                    ['title' => 'Episode 189', 'number' => 189],
                    ['title' => 'Episode 190', 'number' => 190],
                    ['title' => 'Episode 191', 'number' => 191],
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
