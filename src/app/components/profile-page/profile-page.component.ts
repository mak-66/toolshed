import { Component, OnInit } from '@angular/core';
import { toolshedService, Account } from '../../services/toolshed-service.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-profile-page',
  imports: [MatCardModule, MatFormFieldModule, MatFormFieldModule, FormsModule, RouterLink, MatToolbar, MatIcon],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  
})
export class ProfilePageComponent implements OnInit {
  account: Account = {
    ownedTools: [],
    publicAddress: '',
    publicName: '',
    email: '',
    phoneNumber: '',
    communityCode: '',
  };

  constructor(private toolshedService: toolshedService) {}

  ngOnInit(): void {
    this.loadAccountData();
  }

  // Load the user's account data
  async loadAccountData(): Promise<void> {
    try {
      if (this.toolshedService.currentAccount) {
        this.account = { ...this.toolshedService.currentAccount };  // Make a shallow copy to avoid direct mutation
      } else {
        console.error('No account is currently logged in.');
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  }

  // Update the profile data in Firestore
  async updateProfile(): Promise<void> {
    try {
      if (this.account.email) {
        await this.toolshedService.updateAccount(this.account.email, this.account);
        console.log('Profile updated successfully.');
        alert('Profile updated successfully.');
      } else {
        console.error('Account email is missing. Cannot update.');
        alert('Account email is missing. Cannot update.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile.');
    }
  }
}
