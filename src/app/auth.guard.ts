import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { toolshedService } from './services/toolshed-service.service';  // Adjust the path to your service

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private toolshedService: toolshedService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const user = this.toolshedService.user; // This assumes your toolshedService holds user info

    if (user) {
      // If user is logged in, allow access
      return true;
    } else {
      // If not logged in, redirect to login page
      this.router.navigate(['/']);
      return false;
    }
  }
}
