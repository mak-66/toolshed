import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toolshedService, Tool, User } from './services/toolshed-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'toolshed';
  tools: Tool[] = [];
  toolshedService = inject(toolshedService);

  addRandomTool() {
    const randomTool: Tool = this.getRandomTool(); // Generate a random tool

    // Call the addTool method to add the tool to Firestore
    this.toolshedService.addTool(randomTool)
      .then(() => {
        console.log('Random tool added successfully');
      })
      .catch(error => {
        console.error('Error adding random tool:', error);
      });
  }

  // Helper method to generate a random tool
  getRandomTool(): Tool {
    const toolNames = ['Hammer', 'Wrench', 'Snow Blower', 'Lawn Mower', 'Power Drill'];
    const toolDescriptions = [
      'A strong and durable tool for construction work.',
      'A wrench for tightening and loosening bolts.',
      'A powerful snow blower to clear your driveway.',
      'A lawn mower for maintaining your garden.',
      'A cordless power drill for DIY tasks.'
    ];
    const toolImages = [
      'https://example.com/hammer.jpg',
      'https://example.com/wrench.jpg',
      'https://example.com/snow-blower.jpg',
      'https://example.com/lawn-mower.jpg',
      'https://example.com/power-drill.jpg'
    ];

    const randomIndex = Math.floor(Math.random() * toolNames.length); // Generate a random index

    return {
      name: toolNames[randomIndex],
      imageUrl: toolImages[randomIndex],
      description: toolDescriptions[randomIndex],
      ownerPublicName: 'John Doe', // You can set this to a dynamic value if needed
      availabilityStatus: Math.random() < 0.5, // Randomly assign availability status (true or false)
    };
  }

  // ngOnInit(): void {
  //   this.toolshedService.fetchTools(); // Fetch tools from Firebase
  //   this.tools = Object.values(this.toolshedService.getTools());
  // }
}
