import { Component, inject } from '@angular/core';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css'],
  imports: [FormsModule, MatToolbarModule, MatIconModule, MatCardModule, RouterOutlet, RouterLink],
})
export class UploadPageComponent {
  toolshedService = inject(toolshedService);

  // User input properties
  toolName: string = '';
  toolDescription: string = '';
  toolOwner: string = '';
  toolImage: string = '';
  toolAvailabilityStatus: boolean = true; // Default status can be set to 'true' (available)

  handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.toolImage = reader.result as string; // Store the Base64 string
        console.log('Image converted to Base64:', this.toolImage);
      };
      reader.onerror = (error) => {
        console.error('Error converting image to Base64:', error);
      };
      reader.readAsDataURL(file); // Convert file to Base64
    }
  }

  // Method to add the tool based on user input
  addToolFromInput() {
    if (this.toolName && this.toolDescription && this.toolOwner) {
      const newTool: Tool = {
        id: "placeholder",
        name: this.toolName,
        description: this.toolDescription,
        image: this.toolImage,
        ownerPublicName: "",
        availabilityStatus: this.toolAvailabilityStatus,  // Use user input for availability status
        waitlist: [],
        communityCode: "",
        timestamp: Timestamp.fromDate(new Date())
      };

      // Call the addTool method to add the tool to Firestore
      this.toolshedService.addTool(newTool)
        .then(() => {
          console.log('Tool added successfully');
        })
        .catch(error => {
          console.error('Error adding tool:', error);
        });

      // Optionally, clear the input fields after submission
      this.clearInputs();
    } else {
      console.error('All fields must be filled out.');
    }
  }

  // Clear input fields after tool is added
  clearInputs() {
    this.toolName = '';
    this.toolDescription = '';
    this.toolOwner = '';
    this.toolImage = '';
    this.toolAvailabilityStatus = true;
  }
}
