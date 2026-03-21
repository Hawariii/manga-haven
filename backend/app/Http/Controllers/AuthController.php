<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->validated(),
            'role' => 'user',
        ]);

        $user->sendEmailVerificationNotification();

        return $this->issueAuthResponse($user, $request->userAgent() ?: 'manga-haven', 'User registered successfully. Please verify your email.', Response::HTTP_CREATED);
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

        return $this->successResponse(null, 'Logout successful.');
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
        $deviceName = Str::limit(trim($deviceName) ?: 'manga-haven', 255, '');

        $user->tokens()
            ->where('name', $deviceName)
            ->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        $staleTokenIds = $user->tokens()
            ->latest('id')
            ->skip(5)
            ->pluck('id');

        if ($staleTokenIds->isNotEmpty()) {
            $user->tokens()->whereIn('id', $staleTokenIds)->delete();
        }

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
        ], $message, $status);
    }
}
