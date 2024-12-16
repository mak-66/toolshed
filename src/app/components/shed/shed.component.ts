import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toolshedService, Tool, Account } from '../../services/toolshed-service.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-shed',
  imports: [RouterOutlet, AsyncPipe, MatToolbarModule, MatIconModule, MatCardModule, RouterLink,],
  templateUrl: './shed.component.html',
  styleUrl: './shed.component.css'
})
export class ShedComponent {
  title = 'toolshed';
  tools: Tool[] = [];
  toolshedService = inject(toolshedService);

} 