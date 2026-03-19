<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

abstract class Controller
{
    protected function successResponse(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'message' => $message,
            'data' => $this->normalizeData($data),
        ], $status);
    }

    protected function errorResponse(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    private function normalizeData(mixed $data): mixed
    {
        if ($data instanceof JsonResource || $data instanceof AnonymousResourceCollection) {
            return $data->resolve();
        }

        if ($data instanceof Paginator) {
            return $data->toArray();
        }

        return $data;
    }
}
