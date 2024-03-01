import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from "socket.io-client";


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket: any;
  readonly uri: string = 'http://localhost:3000';

  constructor() {
    
  }

  connect(){
    const search_id = Math.floor(Math.random() * 100000);
    localStorage.setItem('search_id', search_id.toString());

    this.socket = io(this.uri, {
      query: {
        search_id
      }
    });
  }

  listen(eventName: string) {
    return new Observable(subscriber => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  close() {
    console.log('desconectando websocket');
    this.socket.disconnect();
  }

}