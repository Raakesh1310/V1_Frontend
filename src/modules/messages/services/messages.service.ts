import { Injectable } from '@angular/core';
import { Message } from '@modules/messages/models';
import { Observable, of } from 'rxjs';

const messages: Message[] = [
  {
    image: 'https://source.unsplash.com/vTL_qy03D1I/60x60',
    text: `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    details: 'Emily Fowler · 58m'
  },
  {
    image: 'https://source.unsplash.com/4ytMf8MgJlY/60x60',
    text: `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    details: 'Diane Chambers · 2d'
  }
];

@Injectable()
export class MessagesService {
  constructor() {}

  get messages$(): Observable<Message[]> {
    return of(messages);
  }
}
