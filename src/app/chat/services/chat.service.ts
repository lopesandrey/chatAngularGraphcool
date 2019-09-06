import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../models/chat.model';
import { Apollo } from 'apollo-angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { AllChatsQuery, USER_CHATS_QUERY, ChatQuery, CHAT_BY_ID_OR_BY_USERS_QUERY } from './chat.graphql';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private apollo: Apollo,
    private authSerive: AuthService
  ) { }

  getUserChats(): Observable<Chat[]> {
    return this.apollo.query<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        userId: this.authSerive.authUser.id
      }
    }).pipe(
      map(res => res.data.allChats)
    );
  }

  getChatByIdOrByUsers(chatOrUserId: string): Observable<Chat> {
    return this.apollo.query<ChatQuery | AllChatsQuery>({
      query: CHAT_BY_ID_OR_BY_USERS_QUERY,
      variables: {
        chatId: chatOrUserId,
        targetUserId: chatOrUserId,
        loggedUserId: this.authSerive.authUser.id
      }
    }).pipe(
      map(res => {
        // tslint:disable-next-line:no-string-literal
        const chat: Chat = (res.data['Chat']) ? res.data['Chat'] : res.data['allChats'][0];
        return chat;
      })
    );
  }

}
