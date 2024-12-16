import { Component, input, inject, computed } from '@angular/core';
import { toolshedService, Tool, Account } from '../../services/toolshed-service.service';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tooldetail',
  imports: [DatePipe, MatToolbarModule, MatIconModule, MatCardModule],
  templateUrl: './tooldetail.component.html',
  styleUrls: ['./tooldetail.component.css']
})
export class TooldetailComponent {
  id = input<string>(''); // ID of the tool
  toolshedService = inject(toolshedService); // Inject toolshedService
  currTool: Tool | undefined; // The current tool
  currentAccount: Account | undefined; // The current user's account

  constructor() {}

  ngOnInit(): void {
    this.loadTool();
    this.loadCurrentAccount();
  }

  async loadTool() {
    try {
      this.currTool = await this.toolshedService.fetchTool(this.id());
      if (this.currTool) {
        console.log('Fetched tool:', this.currTool);
        console.log('Current tool waitlist:', this.currTool.waitlist);
      } else {
        console.log('Tool not found.');
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
    }
  }

  async loadCurrentAccount() {
    try {
      if (this.toolshedService.currentAccount) {
        this.currentAccount = this.toolshedService.currentAccount;
      } else {
        console.log('No current account found');
      }
    } catch (error) {
      console.error('Error loading current account:', error);
    }
  }

  async enterWaitlist() {
    if (!this.currTool || !this.currentAccount) {
      console.log('Tool or account not available');
      return;
    }

    try {
      await this.toolshedService.enterWaitlist(this.currTool.id, this.currentAccount);
      console.log('Entered waitlist successfully');
    } catch (error) {
      console.error('Error entering waitlist:', error);
    }
  }
}