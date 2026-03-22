<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Throwable;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->validated(),
            'role' => 'user',
        ]);

        return $this->issueAuthResponse($user, $request->userAgent() ?: 'manga-haven', 'User registered successfully.', Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->attemptLogin($request);

        if (! $user) {
            return $this->errorResponse('Invalid credentials.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->issueAuthResponse($user, $request->validated()['device_name'] ?? ($request->userAgent() ?: 'manga-haven'), 'Login successful.');
    }

    public function adminLogin(LoginRequest $request): JsonResponse
    {
        $user = $this->attemptLogin($request);

        if (! $user) {
            return $this->errorResponse('Invalid credentials.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($user->role !== 'admin') {
            return $this->errorResponse('Admin access only.', Response::HTTP_FORBIDDEN);
        }

        return $this->issueAuthResponse($user, $request->validated()['device_name'] ?? ($request->userAgent() ?: 'manga-haven-admin'), 'Admin login successful.');
    }

    public function logout(): JsonResponse
    {
        $user = request()->user();
        $currentToken = $user?->currentAccessToken();

        if ($currentToken) {
            $currentToken->delete();
        } else {
            $user?->tokens()->delete();
        }

        return $this->clearAuthCookies(
            $this->successResponse(null, 'Logout successful.')
        );
    }

    public function me(): JsonResponse
    {
        return $this->successResponse([
            'user' => new UserResource(request()->user()),
        ]);
    }

    public function sendVerificationNotification(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(null, 'Email already verified.');
        }

        $user->sendEmailVerificationNotification();

        return $this->successResponse(null, 'Verification email sent.');
    }

    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::findOrFail($id);
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect()->away($frontendUrl.'/login?verified=invalid');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect()->away($frontendUrl.'/login?verified=success');
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::query()
                ->where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                $user->update([
                    'name' => $googleUser->getName() ?: $user->name,
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            } else {
                $user = User::create([
                    'name' => $googleUser->getName() ?: 'Google User',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::password(32)),
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]);
            }

            $response = redirect()->away($frontendUrl.'/auth/callback?provider=google');

            return $this->attachAuthCookiesToResponse(
                $response,
                $this->createAuthToken($user, 'google-oauth'),
                $user->role
            );
        } catch (Throwable $exception) {
            return redirect()->away($frontendUrl.'/login?social=google-error');
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink([
            'email' => strtolower(trim((string) $validated['email'])),
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->errorResponse(__($status), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->successResponse(null, 'Password reset link sent.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)->letters()->mixedCase()->numbers()->uncompromised()],
        ]);

        $status = Password::reset(
            [
                'email' => strtolower(trim((string) $validated['email'])),
                'password' => $validated['password'],
                'password_confirmation' => $validated['password_confirmation'] ?? null,
                'token' => $validated['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->errorResponse(__($status), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->successResponse(null, 'Password has been reset successfully.');
    }

    private function attemptLogin(LoginRequest $request): ?User
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return null;
        }

        return $user;
    }

    private function issueAuthResponse(User $user, string $deviceName, string $message, int $status = 200): JsonResponse
    {
        return $this->attachAuthCookies($this->successResponse([
            'user' => new UserResource($user),
        ], $message, $status), $this->createAuthToken($user, $deviceName), $user->role);
    }

    private function attachAuthCookies(JsonResponse $response, string $token, string $role): JsonResponse
    {
        $this->attachAuthCookiesToResponse($response, $token, $role);

        return $response;
    }

    private function attachAuthCookiesToResponse(SymfonyResponse $response, string $token, string $role): SymfonyResponse
    {
        $minutes = 60 * 24 * 30;
        $secure = (bool) config('session.secure');
        $sameSite = config('session.same_site', 'lax') ?: 'lax';
        $domain = config('session.domain');

        $response->headers->setCookie(
            Cookie::make(
                config('auth.token_cookie', 'manga_haven_token'),
                $token,
                $minutes,
                '/',
                $domain,
                $secure,
                true,
                false,
                $sameSite
            )
        );

        $response->headers->setCookie(
            Cookie::make(
                config('auth.role_cookie', 'manga_haven_role'),
                $role,
                $minutes,
                '/',
                $domain,
                $secure,
                true,
                false,
                $sameSite
            )
        );

        return $response;
    }

    private function clearAuthCookies(JsonResponse $response): JsonResponse
    {
        $response->headers->setCookie(Cookie::forget(
            config('auth.token_cookie', 'manga_haven_token'),
            '/',
            config('session.domain')
        ));

        $response->headers->setCookie(Cookie::forget(
            config('auth.role_cookie', 'manga_haven_role'),
            '/',
            config('session.domain')
        ));

        return $response;
    }

    private function createAuthToken(User $user, string $deviceName): string
    {
        $deviceName = Str::limit(trim($deviceName) ?: 'manga-haven', 255, '');

        $user->tokens()
            ->where('name', $deviceName)
            ->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        $staleTokenIds = $user->tokens()
            ->latest('id')
            ->pluck('id')
            ->slice(5)
            ->values();

        if ($staleTokenIds->isNotEmpty()) {
            $user->tokens()->whereIn('id', $staleTokenIds)->delete();
        }

        return $token;
    }
}
