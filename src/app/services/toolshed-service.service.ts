// Import necessary Firebase modules
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Define data models
interface User {
  ownedTools: string[];
  publicAddress: string;
  publicName: string;
}

interface Tool {
  name: string;
  imageUrl: string;
  description: string;
  ownerPublicName: string;
  availabilityStatus: boolean;
  reviews?: Review[];
}

interface Review {
  reviewerID: string;
  review: string;
  rating: number;
}

@Injectable({
  providedIn: 'root',
})
export class toolshedService {
  private users: { [id: string]: User } = {};
  private tools: { [id: string]: Tool } = {};

  constructor(private firestore: AngularFirestore) {}

  // Fetch and cache users from Firebase
  fetchUsers(): void {
    this.firestore
      .collection<User>('Users')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((users) => {
        users.forEach((user) => {
          this.users[user.id] = user;
        });
      });
  }

  // Fetch and cache tools from Firebase
  fetchTools(): void {
    this.firestore
      .collection<Tool>('Tools')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((tools) => {
        tools.forEach((tool) => {
          this.tools[tool.id] = tool;
        });
      });
  }

  // Get a local copy of users
  getUsers(): { [id: string]: User } {
    return this.users;
  }

  // Get a local copy of tools
  getTools(): { [id: string]: Tool } {
    return this.tools;
  }

  // Update a user in Firebase and locally
  updateUser(userId: string, updates: Partial<User>): void {
    this.firestore
      .collection('Users')
      .doc(userId)
      .update(updates)
      .then(() => {
        this.users[userId] = { ...this.users[userId], ...updates };
      })
      .catch((error) => console.error('Error updating user:', error));
  }

  // Update a tool in Firebase and locally
  updateTool(toolId: string, updates: Partial<Tool>): void {
    this.firestore
      .collection('Tools')
      .doc(toolId)
      .update(updates)
      .then(() => {
        this.tools[toolId] = { ...this.tools[toolId], ...updates };
      })
      .catch((error) => console.error('Error updating tool:', error));
  }

  // Add a review to a tool
  addReview(toolId: string, review: Review): void {
    this.firestore
      .collection('Tools')
      .doc(toolId)
      .collection('Reviews')
      .add(review)
      .then(() => {
        if (!this.tools[toolId].reviews) {
          this.tools[toolId].reviews = [];
        }
        this.tools[toolId].reviews?.push(review);
      })
      .catch((error) => console.error('Error adding review:', error));
  }
}
