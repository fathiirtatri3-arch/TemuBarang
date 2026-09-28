<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        $stats = [
            'total' => $notifications->count(),
            'unread' => $notifications->where('is_read', false)->count(),
        ];
        
        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
    
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notification->markAsRead();
        
        return redirect()->back()->with('success', 'Notifikasi ditandai sudah dibaca');
    }
    
    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);
        
        return redirect()->back()->with('success', 'Semua notifikasi ditandai sudah dibaca');
    }
    
    public function destroy($id)
    {
        $notification = Notification::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notification->delete();
        
        return redirect()->back()->with('success', 'Notifikasi dihapus');
    }
}