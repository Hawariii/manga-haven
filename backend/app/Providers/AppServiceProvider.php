<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\Request;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

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
        VerifyEmail::createUrlUsing(function (User $notifiable): string {
            return URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
        });

        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

            return $frontendUrl.'/reset-password?token='.urlencode($token).'&email='.urlencode($user->email);
        });

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

        RateLimiter::for('password-reset', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perHour(5)->by('password-reset|'.$email.'|'.$request->ip());
        });

        RateLimiter::for('verification-notification', function (Request $request): Limit {
            return Limit::perMinute(3)->by((string) optional($request->user())->getAuthIdentifier().'|'.$request->ip());
        });
    }
}
