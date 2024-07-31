import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  notification = this.socket.fromEvent<any>('notification');


  constructor(private socket: Socket, private stateService: StateService) {  
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      const userId = this.stateService.getUserId();
      if (userId) {
        console.log(`Joining room: ${userId}`);
        this.socket.emit('join', { room: userId });
      } else {
        console.error('User ID is null or localStorage is not available');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.notification.subscribe((data: any) => {
      console.log('Notification received:', data);
    });





     }
  
  
  

  

  
}
