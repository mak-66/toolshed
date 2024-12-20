import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toolshedService } from './services/toolshed-service.service';
import {TaskbarComponent} from './components/taskbar/taskbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskbarComponent, MatToolbarModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  toolshedService = inject(toolshedService);
}
