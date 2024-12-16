import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { provideRouter, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatToolbarModule, MatIconModule, MatCardModule, MatFormFieldModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  toolshedService = inject(toolshedService);
  router = inject(Router);
  email: string = '';
  password: string = '';
  loginSuccess: boolean = true;

  // Method to handle login
  async onLogin(): Promise<void> {
    try {
      // Call the login method of toolshedService with email and password
      this.loginSuccess = await this.toolshedService.login(this.email, this.password);
      console.log('Login successful');
      //redirect to a different page after successful login
      if(this.loginSuccess){
        this.router.navigate(['/profilepage']);  // Navigate to the profile page
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Optionally, display an error message to the user
    }
  }
}
