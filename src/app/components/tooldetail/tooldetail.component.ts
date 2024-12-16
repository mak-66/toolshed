import { Component, input, inject, computed } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-tooldetail',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './tooldetail.component.html',
  styleUrl: './tooldetail.component.css'
})
export class TooldetailComponent {
  id = input<string>('');
  toolshedService = inject(toolshedService);
  currTool: Tool | undefined;

  constructor(){}

  ngOnInit(): void {
    // Ensure you await the fetchTool method to get the resolved tool
    this.loadTool();
  }

  async loadTool() {
    try {
      this.currTool = await this.toolshedService.fetchTool(this.id());
      if (this.currTool) {
        console.log('Fetched tool:', this.currTool);
      } else {
        console.log('Tool not found.');
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
    }
  }
}
