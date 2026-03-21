<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
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

        return $this->successResponse(null, 'Logout successful.');
    }

    public function me(): JsonResponse
    {
        return $this->successResponse([
            'user' => new UserResource(request()->user()),
        ]);
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
