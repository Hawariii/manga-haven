<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth-login', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('auth-admin-login', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perMinute(5)->by('admin|'.$email.'|'.$request->ip());
        });

        RateLimiter::for('auth-register', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perHour(5)->by($email.'|'.$request->ip());
        });
    }
}
