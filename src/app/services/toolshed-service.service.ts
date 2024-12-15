// Import necessary Firebase modules
import { Injectable, inject } from '@angular/core';
import { Timestamp, query, orderBy, setDoc, Firestore, doc, collection, collectionData, CollectionReference } from '@angular/fire/firestore';
import { getAuth, createUserWithEmailAndPassword } from "@angular/fire/auth";

import { Observable } from 'rxjs';

// Define data models
export interface User {
  ownedTools: string[];
  publicAddress: string;
  publicName: string;
}


export interface Tool {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  ownerPublicName: string;
  availabilityStatus: boolean;
  reviews?: Review[];
}

export interface Review {
  reviewerID: string;
  review: string;
  rating: number;
}

@Injectable({
  providedIn: 'root',
})
export class toolshedService {
  firestore: Firestore = inject(Firestore);
  toolCollection: CollectionReference;
  userCollection: CollectionReference;
  // reviewCollection: CollectionReference;
  public tools$: Observable<Tool[]>; // Observable for live updates
  public users$: Observable<User[]>; // Observable for live updates
  // public reviews$: Observable<Review[]>; // Observable for live updates
  
  auth = getAuth();

  constructor() {
    //fetches the tools
    this.toolCollection = collection(this.firestore, 'Tools');
    var q = query(this.toolCollection);
    this.tools$ = collectionData<Tool>(q);

    //fetches the users
    this.userCollection = collection(this.firestore, 'Users');
    q = query(this.userCollection);
    this.users$ = collectionData<User>(q);
  }
  
  async addTool(newTool: Omit<Tool, 'id'>): Promise<string> {
    try {
      const toolDocRef = doc(this.toolCollection); // Create a reference with an auto-generated ID
      const id = toolDocRef.id; // Get the generated ID

      // Add the tool to Firestore, including the generated ID
      await setDoc(toolDocRef, {
        ...newTool,
        id, // Add the generated ID to the document
        timestamp: Timestamp.fromDate(new Date()), // Optionally include a timestamp
      });      
      console.log('Tool successfully added with ID:', id);
      return(id);
    } catch (error) {
      console.error('Error adding tool:', error);
    }
    return("Failed to add tool");
  }

  // createUser(auth , email, password): boolean{
  //   return true;
  // }
}
