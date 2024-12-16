// Import necessary Firebase modules
import { Injectable, inject } from '@angular/core';
import { Timestamp, query, orderBy, where, addDoc, deleteDoc, getDoc, getDocs, setDoc, updateDoc, Firestore, doc, collection, collectionData, CollectionReference } from '@angular/fire/firestore';
import { User, Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "@angular/fire/auth";
import { Observable, firstValueFrom } from 'rxjs';

// Define data models
export interface Account {
  ownedTools: string[];
  publicAddress: string;
  publicName: string;
  email: string;
  phoneNumber: string;
  communityCode: string;
}

export interface Tool {
  id: string;
  name: string;
  image: string;
  description: string;
  ownerPublicName: string;
  availabilityStatus: boolean;
  waitlist?: string[];
  communityCode: string;
  timestamp: Timestamp;
}

@Injectable({
  providedIn: 'root',
})
export class toolshedService {
  firestore: Firestore = inject(Firestore);
  auth: Auth = getAuth();
  user: User | null = null;
  currentAccount: Account | null = null; //TODO: link login with current Account
  toolCollection: CollectionReference;
  accountCollection: CollectionReference;
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

  async fetchTool(id: string): Promise<Tool | undefined> {
    try {
      const tools = await firstValueFrom(this.tools$); // Get the latest value of the tools observable
      return tools.find((tool) => tool.id === id);
    } catch (error) {
      console.error('Error fetching tool:', error);
      return undefined;
    }
  }

  async fetchAccount(email: string): Promise<Account> {
    try {
      // Get the latest value of the accounts observable
      const accounts = await firstValueFrom(this.accounts$);  
      // Find the account with the matching email
      const account = accounts.find((account) => account.email === email);  
      // Since the account is guaranteed to exist, throw an error if it isn't found
      if (!account) {
        throw new Error(`Account with email ${email} not found`);      }
  
      return account;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error; // Rethrow the error for the caller to handle
    }
  }  
  
  async addTool(newTool: Partial<Tool>): Promise<string> {
    try {
      // Create a reference with an auto-generated ID for the new tool
      const toolDocRef = doc(this.toolCollection);
      const id = toolDocRef.id; // Get the generated ID
  
      // Add the tool to Firestore, including the generated ID
      await setDoc(toolDocRef, {
        ...newTool,
        ownerPublicName: this.currentAccount?.publicName,
        communityCode: this.currentAccount?.communityCode,
        id, // Add the generated ID to the document
      });
  
      console.log('Tool successfully added with ID:', id);
  
      // Now, update the owner's 'ownedTools' field in their account document
      if (this.currentAccount) {
        const accountsQuery = query(
          collection(this.firestore, 'Accounts'),
          where('email', '==', this.currentAccount.email)
        );
      
        const querySnapshot = await getDocs(accountsQuery);
      
        if (querySnapshot.empty) {
          throw new Error(`No account found with email: ${this.currentAccount.email}`);
        }
      
        // Get the first document from the query results
        const accountDocRef = querySnapshot.docs[0].ref;
      
        // Update the 'ownedTools' array by adding the new tool ID
        await updateDoc(accountDocRef, {
          ownedTools: [...this.currentAccount.ownedTools, id],
        });
      
        console.log("Owner's 'ownedTools' updated successfully");
      }
  
      return id; // Return the ID of the newly added tool
    } catch (error) {
      console.error('Error adding tool:', error);
    }
    return "Failed to add tool";
  }
  

  async updateTool(toolId: string, updates: Partial<Tool>): Promise<void> {
    try {
      // Reference the specific tool document by its ID
      const toolDocRef = doc(this.firestore, 'Tools', toolId);
  
      // Check if the tool document exists
      const toolSnap = await getDoc(toolDocRef);
      if (!toolSnap.exists()) {
        throw new Error(`Tool with ID ${toolId} does not exist`);
      }
  
      // Update the tool document with the provided updates
      await updateDoc(toolDocRef, updates);
      console.log(`Tool with ID ${toolId} updated successfully.`);
    } catch (error) {
      console.error('Error updating tool:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async deleteTool(toolId: string): Promise<void> {
    try {
      if (!this.currentAccount) {
        throw new Error('No current account is logged in');
      }
  
      // 1. Delete the tool from the "Tools" collection
      const toolDocRef = doc(this.firestore, 'Tools', toolId);
      await deleteDoc(toolDocRef);
      console.log(`Tool with ID ${toolId} deleted successfully.`);
  
      // 2. Remove the tool's ID from the owner's "ownedTools" array
      const updatedOwnedTools = this.currentAccount.ownedTools.filter(id => id !== toolId);
      const accountDocRef = doc(this.firestore, 'Accounts', this.currentAccount.email);
      await updateDoc(accountDocRef, { ownedTools: updatedOwnedTools });
      console.log(`Owner's ownedTools updated successfully after deleting tool ${toolId}`);
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error;  // Rethrow the error to be handled by the caller
    }
  }
  

  async fetchAccountTools(): Promise<Tool[]> {
    try {
      if (!this.currentAccount) {
        throw new Error('No current account is logged in');
      }
      
      // Retrieve the owned tool IDs from the current account
      const ownedToolIds = this.currentAccount.ownedTools;
      
      if (ownedToolIds.length === 0) {
        return []; // No owned tools
      }
      
      // Fetch all tools from Firestore that match the ownedToolIds
      const toolsQuery = query(
        this.toolCollection,
        where('id', 'in', ownedToolIds) // Filter tools by the ownedToolIds
      );
      
      // Get the tools matching the query
      const querySnapshot = await getDocs(toolsQuery);
      
      if (querySnapshot.empty) {
        return []; // No tools found
      }

      // Map the document snapshots to Tool objects
      const tools: Tool[] = querySnapshot.docs.map(doc => doc.data() as Tool);

      return tools;
    } catch (error) {
      console.error('Error fetching account tools:', error);
      throw error;
    }
  }

  //Creates the user for authentication, then calls createAccount to update the database
  async createUser(email: string, password: string, newAccount: Account): Promise<void> {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed up 
        this.user = userCredential.user;
        console.log('User successfully created:', this.user);
        this._createAccount(newAccount);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  // creates the account document
  async _createAccount(account: Account): Promise<void> {
    try {
      const docRef = await addDoc(this.accountCollection, account);
      console.log('Account created with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async updateAccount(email: string, updates: Partial<Account>): Promise<void> {
    try {
      // Create a query to find the account with the given email
      const accountCollectionRef = collection(this.firestore, 'Accounts');
      const q = query(accountCollectionRef, where('email', '==', email));
  
      // Execute the query
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error(`Account with email ${email} does not exist`);
      }
  
      // Assuming there is only one document with that email
      const accountDocRef = querySnapshot.docs[0].ref;  // Get the reference to the first document found
      await updateDoc(accountDocRef, updates);  // Update the document with the provided changes
      console.log('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async enterWaitlist(toolId: string, currentAccount: Account): Promise<void> {
    try {
      const toolDocRef = doc(this.firestore, 'Tools', toolId);
      const currTool = await getDoc(toolDocRef);
      
      if (!currTool.exists()) {
        throw new Error(`Tool with ID ${toolId} does not exist`);
      }
  
      const tool = currTool.data() as Tool;

      if (tool.waitlist && tool.waitlist.includes(currentAccount.publicName)) {
        console.log('User is already in the waitlist or no waitlist exists.');
        alert('You are already in the waitlist.');
        return;
      }
  
      // Add the current account to the waitlist
      const updatedWaitlist = tool.waitlist ? [...tool.waitlist, currentAccount.publicName] : [currentAccount.publicName];
  
      // Update the tool document with the new waitlist
      await updateDoc(toolDocRef, { waitlist: updatedWaitlist });
      console.log('Waitlist updated successfully');
  
    } catch (error) {
      console.error('Error entering waitlist:', error);
    }
  }

  async exitWaitlist(toolId: string, currentAccount: Account): Promise<void> {
    try {
      const toolDocRef = doc(this.firestore, 'Tools', toolId);
      const currTool = await getDoc(toolDocRef);
      
      if (!currTool.exists()) {
        throw new Error(`Tool with ID ${toolId} does not exist`);
      }
  
      const tool = currTool.data() as Tool;
  
      if (!tool.waitlist || !tool.waitlist.includes(currentAccount.publicName)) {
        console.log('User is not in the waitlist or no waitlist exists.');
        alert('You are not in the waitlist.');
        return;
      }
  
      // Remove the current account's publicName from the waitlist
      const updatedWaitlist = tool.waitlist.filter(name => name !== currentAccount.publicName);
  
      // Update the tool document with the new waitlist
      await updateDoc(toolDocRef, { waitlist: updatedWaitlist });
      console.log('Waitlist updated successfully');
  
    } catch (error) {
      console.error('Error exiting waitlist:', error);
    }
  }
  

  async login (email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user = userCredential.user;
      console.log('User logged in:', this.user);
      this.currentAccount = await this.fetchAccount(email)
      return true;  // Return true on successful login
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string, message: string }; // Cast to a more specific error type
        const errorCode = firebaseError.code;  // Now you can safely access `code`
        const errorMessage = firebaseError.message;
        console.log('Firebase Error Code:', errorCode, 'Message:', errorMessage);
      } else {
        // Handle case where the error isn't an instance of Error (for robustness)
        console.log('An unknown error occurred', error);
      }
      return false;  // Return false if there is an error
    }
  }

  async logout(): Promise<void>{
    signOut(this.auth).then(() => {
      // Sign-out successful.
      console.log('User logged out');
    })
  }
}
