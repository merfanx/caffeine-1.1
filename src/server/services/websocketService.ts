export function broadcastToRoom(roomId: string, message: any) {
  // In-memory / HTTP broadcast fallback
  if (process.env.NODE_ENV !== 'production') {
    // console.log(`[WebSocket Broadcast to ${roomId}]:`, message);
  }
}

export function notifyUser(userId: string, event: string, payload: any) {
  // Pass-through notification
}
