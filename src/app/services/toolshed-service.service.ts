// Import necessary Firebase modules
import { Injectable, inject } from '@angular/core';
import { Timestamp, query, orderBy, Firestore, addDoc, collection, collectionData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Define data models
export interface User {
  ownedTools: string[];
  publicAddress: string;
  publicName: string;
}


export interface Tool {
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
  
  addTool(newTool: Tool): Promise<void> {
    return addDoc(this.toolCollection, newTool)
      .then(() => {
        console.log('Tool successfully added to the database!');
      })
      .catch((error) => {
        console.error('Error adding tool: ', error);
      });
  }
}
