import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toolshedService } from './services/toolshed-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'toolshed';
  tools: any[] = [];

  constructor(private toolshedService: toolshedService) {}

  ngOnInit(): void {
    this.toolshedService.fetchTools(); // Fetch tools from Firebase
    this.tools = Object.values(this.toolshedService.getTools());
  }
}
