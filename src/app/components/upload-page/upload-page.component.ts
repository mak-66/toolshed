import { Component, inject } from '@angular/core';
import { toolshedService, Tool } from '../../services/toolshed-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css'],
  imports: [FormsModule],
})
export class UploadPageComponent {
  toolshedService = inject(toolshedService);

  // User input properties
  toolName: string = '';
  toolDescription: string = '';
  toolOwner: string = '';
  toolImageUrl: string = '';
  toolAvailabilityStatus: boolean = true; // Default status can be set to 'true' (available)

  // Method to add the tool based on user input
  addToolFromInput() {
    if (this.toolName && this.toolDescription && this.toolOwner) {
      const newTool: Tool = {
        name: this.toolName,
        description: this.toolDescription,
        imageUrl: 'https://example.com/hammer.jpg',
        ownerPublicName: this.toolOwner,  // Can be dynamically set if needed
        availabilityStatus: this.toolAvailabilityStatus,  // Use user input for availability status
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
    this.toolImageUrl = '';
    this.toolAvailabilityStatus = true;
  }
}
