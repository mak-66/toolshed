import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toolshedService, Tool, User } from './services/toolshed-service.service';
import {TaskbarComponent} from './components/taskbar/taskbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AsyncPipe, TaskbarComponent, MatToolbarModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
}
