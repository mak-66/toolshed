import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatToolbarModule, MatIconModule, MatCardModule, MatFormFieldModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  toolshedService = inject(toolshedService);
  username: string = '';
  password: string = '';

  isAuthenticated$ = computed(() => !!this.username && !!this.password);
}