// Import necessary Firebase modules
import { Injectable, inject } from '@angular/core';
import { Timestamp, query, orderBy, setDoc, Firestore, doc, collection, collectionData, CollectionReference } from '@angular/fire/firestore';
import { User, Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "@angular/fire/auth";

import { Observable } from 'rxjs';

// Define data models
export interface Account {
  ownedTools: string[];
  publicAddress: string;
  publicName: string;
  email: string;
  phoneNumber: string;
}

export interface Tool {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  ownerPublicName: string;
  availabilityStatus: boolean;
  waitlist?: User[];
}

@Injectable({
  providedIn: 'root',
})
export class toolshedService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = getAuth();
  user: User | null = null;
  toolCollection: CollectionReference;
  accountCollection: CollectionReference;
  // reviewCollection: CollectionReference;
  public tools$: Observable<Tool[]>; // Observable for live updates
  public accounts$: Observable<Account[]>; // Observable for live updates
  // public reviews$: Observable<Review[]>; // Observable for live updates
  
  constructor() {
    //fetches the tools
    this.toolCollection = collection(this.firestore, 'Tools');
    var q = query(this.toolCollection);
    this.tools$ = collectionData<Tool>(q);

    //fetches the accounts
    this.accountCollection = collection(this.firestore, 'Accounts');
    q = query(this.accountCollection);
    this.accounts$ = collectionData<Account>(q);

    // Listen for auth state changes and set the user property
    onAuthStateChanged(this.auth, (currentUser) => {
      this.user = currentUser;
      console.log('Auth state changed, user is now:', this.user);
    });
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

  async createUser(email: string, password: string): Promise<void> {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed up 
        this.user = userCredential.user;
        console.log('User successfully created:', this.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  async login (email: string, password: string): Promise<void> {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        this.user = userCredential.user;
        console.log('User logged in:', this.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  async logout(): Promise<void>{
    signOut(this.auth).then(() => {
      // Sign-out successful.
      console.log('User logged out');
    })
  }
}
