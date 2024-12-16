import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, Router } from '@angular/router';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { NgModel } from '@angular/forms';


@Component({
  selector: 'app-tools',
  imports: [MatIconModule, MatToolbar, RouterLink, MatCardModule, MatFormFieldModule],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.css'
})
export class ToolsComponent {
  tools: Tool[] = []; // Array to hold the user's tools
  toolshedService = inject(toolshedService);
  router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.loadUserTools();
  }

  // Fetch user's tools
  async loadUserTools(): Promise<void> {
    try {
      // Get the current account's tools
      const tools = await this.toolshedService.fetchAccountTools();
      this.tools = tools; // Store the tools in the component's state
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  }

  // Delete a tool
  async deleteTool(toolId: string): Promise<void> {
    try {
      await this.toolshedService.deleteTool(toolId);
      console.log('Tool deleted successfully');
      this.loadUserTools(); // Reload the tools after deletion
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  }

  // Mark a tool as unavailable
  async markToolUnavailable(toolId: string): Promise<void> {
    try {
      await this.toolshedService.updateTool(toolId, { availabilityStatus: false });
      this.tools = this.tools.map(tool => 
        tool.id === toolId ? { ...tool, availabilityStatus: false } : tool
      ); // Update the local state
      console.log('Tool marked as unavailable.');
    } catch (error) {
      console.error('Error marking tool unavailable:', error);
    }
  }
}