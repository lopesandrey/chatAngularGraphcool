import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AutoLoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): Observable<boolean> {
    console.log('LoginGuard');
    return this.authService.isAuthneticated
      .pipe(
        tap(is => (is) ? this.router.navigate(['/dashboard']) : null),
        map(is => !is)
      );
  }
}
