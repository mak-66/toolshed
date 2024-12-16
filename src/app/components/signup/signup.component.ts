import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { toolshedService, Tool } from '../../services/toolshed-service.service';

@Component({
  selector: 'app-signup',
  imports: [MatToolbarModule, MatIconModule, MatCardModule, MatFormFieldModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  toolshedService = inject(toolshedService);
  router = inject(Router);
  password: string = '';
  email: string = '';
  publicName: string = '';
  phoneNumber: string = '';
  publicAddress: string = '';
  communityCode: string = '';

  async onSignUp(): Promise<void> {
    try {
      // Create an account object
      const newAccount = {
        ownedTools: [],
        publicName: this.publicName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        publicAddress: this.publicAddress,
        communityCode: this.communityCode,
      };

      // Call the createAccount method from toolshedService
      await this.toolshedService.createUser(this.email, this.password, newAccount);

      console.log('Account successfully created!');
      // Redirect to login page or profile page
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error during signup:', error);
    }
  }
}
