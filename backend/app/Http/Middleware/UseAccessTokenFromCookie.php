<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UseAccessTokenFromCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken()) {
            $token = $request->cookie(config('auth.token_cookie', 'manga_haven_token'));

            if (is_string($token) && $token !== '') {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }

        return $next($request);
    }
}
