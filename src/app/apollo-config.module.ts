import { NgModule, Inject } from '@angular/core';

import { onError } from 'apollo-link-error';


import { ApolloModule, Apollo } from 'apollo-angular';
import { ApolloLink, Operation } from 'apollo-link';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { StorageKeys } from './storage-keys';
import { GRAPHCOOL_CONFIG, GraphcoolConfig } from './core/providers/graphcool-config.provider';



@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class ApolloConfigModule {

  constructor(
    private apollo: Apollo,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcoolConfig,
    private httpLink: HttpLink
  ) {
    const uri = this.graphcoolConfig.simpleAPI;
    const http = httpLink.create({ uri });

    const authMiddleware: ApolloLink = new ApolloLink((operation, forward) => {

      operation.setContext({
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.getAuthToken()}`
        })

      });

      return forward(operation);

    });

    const linkError = onError(({ response, graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        ); }

      if  (networkError) { console.log(`[Network error]: ${networkError}`); }

      // response.errors = [new Error('PJN Test')];
    });


    apollo.create({
      link: ApolloLink.from([
        linkError,
        authMiddleware.concat(http)
      ]),
      cache: new InMemoryCache(),
      connectToDevTools: !environment.production
    });
  }

  private getAuthToken(): string {
    return window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
  }

}
