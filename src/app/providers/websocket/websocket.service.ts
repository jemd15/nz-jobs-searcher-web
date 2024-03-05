import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Job } from '../../models/job.model';

@Injectable({
	providedIn: 'root',
})
export class WebSocketService {
	socket: any;
	readonly uri: string = 'http://localhost:3000';

	constructor() {}

	connect() {
		const search_id = Math.floor(Math.random() * 100000);

		this.socket = io(this.uri, {
			query: {
				search_id,
			},
		});

		return search_id;
	}

	listen(eventName: string): Observable<Job> {
		return new Observable(subscriber => {
			this.socket.on(eventName, (data: Job) => {
				subscriber.next(data);
			});
		});
	}

	emit(eventName: string, data: any) {
		this.socket.emit(eventName, data);
	}

	close() {
		console.log('desconectando websocket');
		this.socket.disconnect();
	}
}
