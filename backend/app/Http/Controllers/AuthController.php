<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());
        $token = $user->createToken($request->userAgent() ?: 'manga-haven')->plainTextToken;

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'User registered successfully.', Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->errorResponse('Invalid credentials.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $token = $user->createToken($credentials['device_name'] ?? ($request->userAgent() ?: 'manga-haven'))->plainTextToken;

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Login successful.');
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
}
