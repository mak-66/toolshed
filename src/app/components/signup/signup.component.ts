import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
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
  username: string = '';
  password: string = '';

  onSignUp(){
    
  }
}
