<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['count' => 0]);
        }
        
        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
        
        return response()->json(['count' => $count]);
    }
}