<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = auth()->user();

        // Cek role: super_admin ATAU admin_kelurahan
        if (in_array($user->role, ['super_admin', 'admin_kelurahan'])) {
            return $next($request);
        }

        // Jika bukan admin, kembalikan response unauthorized
        return response()->json(['message' => 'Unauthorized'], 403);
    }
}