import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError, of } from 'rxjs';
import { map, tap, catchError, mergeMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { Base64 } from 'js-base64';
import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION, LoggedInUserQuery, LOGGED_IN_USER_QUERY } from './auth.graphql';
import { StorageKeys } from 'src/app/storage-keys';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  keepSigned: boolean;
  rememberMe: boolean;


  // tslint:disable-next-line:variable-name
  private _isAuthenticated =  new ReplaySubject<boolean>(1);


  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
      this.isAuthneticated.subscribe(is => console.log('AuthState', is));
      this.init();
   }

   init(): void {
      this.keepSigned = JSON.parse(window.localStorage.getItem(StorageKeys.KEEP_SIGNED));
      this.rememberMe = JSON.parse(window.localStorage.getItem(StorageKeys.REMEMBER_ME));
   }

   toggleKeepSigned(): void {
     this.keepSigned = !this.keepSigned;
     window.localStorage.setItem(StorageKeys.KEEP_SIGNED, this.keepSigned.toString());
   }

   toggleRememberMe(): void {
     this.rememberMe = !this.rememberMe;
     window.localStorage.setItem(StorageKeys.REMEMBER_ME, this.rememberMe.toString());
     if (!this.rememberMe) {
       window.localStorage.removeItem(StorageKeys.USER_EMAIL);
       window.localStorage.removeItem(StorageKeys.USER_PASSWORD);
     }
   }

   setRememberMe(user: { email: string, password: string }): void {
     if (this.rememberMe) {
        window.localStorage.setItem(StorageKeys.USER_EMAIL, Base64.encode(user.email));
        window.localStorage.setItem(StorageKeys.USER_PASSWORD, Base64.encode(user.password));
     }
   }
   getRememberMe(): { email: string, password: string } {
     if (!this.rememberMe) { return null; }
     return {
       email: Base64.decode(window.localStorage.getItem(StorageKeys.USER_EMAIL)),
       password: Base64.decode(window.localStorage.getItem(StorageKeys.USER_PASSWORD))
     };
   }
  get isAuthneticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  signinUser(variables: {email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    }).pipe(
      map(res => {
        console.log(res.data.authenticateUser);
        return  res.data.authenticateUser;
      }),
      tap(res => this.setAuthState({token: res && res.token, isAuthneticated: res !== null})),
      catchError(error => {
        this.setAuthState({token: null, isAuthneticated: false});
        return throwError(error);
      })
    );
  }

  signupUser(variables: {name: string, email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.signupUser),
      tap(res => this.setAuthState({token: res && res.token, isAuthneticated: res !== null})),
      catchError(error => {
        this.setAuthState({token: null, isAuthneticated: false});
        return throwError(error);
      })
    );
  }

  logout(): void {
    window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    window.localStorage.removeItem(StorageKeys.KEEP_SIGNED);
    this.keepSigned =  false;
    this._isAuthenticated.next(false);
    this.router.navigate(['/login']);
    this.apollo.getClient().resetStore();
  }


  autoLogin(): Observable<void> {
    if (!this.keepSigned) {
      this._isAuthenticated.next(false);
      window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
      return of();
    }

    return this.validateToken()
      .pipe(
        tap(authData => {
          const token = window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
          this.setAuthState({token, isAuthneticated: authData.isAuthneticated});
        }),
        mergeMap(res => of()),
        catchError(error => {
          this.setAuthState({token: null, isAuthneticated: false});
          return throwError(error);
        })
      );

  }

  private validateToken(): Observable<{id: string, isAuthneticated: boolean}> {
    return this.apollo.query<LoggedInUserQuery>({
      query: LOGGED_IN_USER_QUERY
    }).pipe(
      map(res => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthneticated: user !== null
        };
      })
    );
  }


  private setAuthState(authData: {token: string, isAuthneticated: boolean}): void {
    if (authData.isAuthneticated) {
      window.localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this._isAuthenticated.next(authData.isAuthneticated);
  }

}
