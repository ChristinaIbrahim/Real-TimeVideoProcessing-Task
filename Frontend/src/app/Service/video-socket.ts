import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class VideoSocket {
  private socket: Socket;

  constructor() {
    // ✅ لازم يكون نفس البورت اللي backend شغال عليه
    this.socket = io('http://localhost:5000', {
      transports: ['websocket'], // تأكد إنه بيستخدم WebSocket
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to backend socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
    });
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}
