import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-taskbar',
  imports: [RouterLink, MatToolbarModule, MatIconModule],
  templateUrl: './taskbar.component.html',
  styleUrl: './taskbar.component.css'
})
export class TaskbarComponent {

}
