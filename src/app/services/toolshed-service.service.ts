import { Injectable, inject } from '@angular/core';
import { Timestamp, query, orderBy, where, addDoc, deleteDoc, getDoc, getDocs, setDoc, updateDoc, Firestore, doc, collection, collectionData, CollectionReference } from '@angular/fire/firestore';
import { User, Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "@angular/fire/auth";
import { Observable, firstValueFrom,map,BehaviorSubject, combineLatest } from 'rxjs';
import { Router } from '@angular/router';


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
  ownerEmail: string;
  ownerPhoneNumber: string;
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
  router: Router = inject(Router)
  auth: Auth = getAuth();
  user: User | null = null;
  currentAccount: Account | null = null;
  toolCollection: CollectionReference;
  accountCollection: CollectionReference;
  public tools$: Observable<Tool[]>; 
  public communityTools$: Observable<Tool[]>;
  public accounts$: Observable<Account[]>;
  
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

    this.communityTools$ = combineLatest([this.tools$, this.accounts$]).pipe(
      map(([tools, accounts]) => {
        // Check if currentAccount is set and has a valid communityCode
        if (this.currentAccount) {
          const communityCode = this.currentAccount.communityCode;

          // Filter tools by the communityCode of the currentAccount
          return tools.filter(tool => tool.communityCode === communityCode);
        }
        return [];
      })
    );
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

  async fetchCommunityTools(): Promise<Tool[]> {
    try {
      if (!this.currentAccount) {
        throw new Error('No current account is logged in');
      }
  
      const communityCode = this.currentAccount.communityCode;
      // Query tools belonging to the same community
      const toolsQuery = query(
        this.toolCollection,
        where('communityCode', '==', communityCode) 
      );
  
      const querySnapshot = await getDocs(toolsQuery);
  
      if (querySnapshot.empty) {
        return [];
      }
  
      const tools: Tool[] = querySnapshot.docs.map(doc => doc.data() as Tool);
      
      return tools;
    } catch (error) {
      console.error('Error fetching community tools:', error);
      throw error;
    }
  }
  

  async fetchAccount(email: string): Promise<Account> {
    try {
      // Get the latest value of the accounts observable
      const accounts = await firstValueFrom(this.accounts$);  
      // Find the account with the matching email
      const account = accounts.find((account) => account.email === email);  
      if (!account) {
        throw new Error(`Account with email ${email} not found`);      }
  
      return account;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }  
  
  async addTool(newTool: Partial<Tool>): Promise<string> {
    try {
      const toolDocRef = doc(this.toolCollection);
      const id = toolDocRef.id; // Get the generated ID
  
      // Add the tool to Firestore, including the generated ID
      await setDoc(toolDocRef, {
        ...newTool,
        ownerPublicName: this.currentAccount!.publicName,
        communityCode: this.currentAccount!.communityCode,
        ownerEmail: this.currentAccount!.email,
        ownerPhoneNumber: this.currentAccount!.phoneNumber,
        id,
      });
  
      console.log('Tool successfully added with ID:', id);
  
      // update the owner's 'ownedTools' field in their account document
      if (this.currentAccount) {  
        const accountsQuery = query(
          collection(this.firestore, 'Accounts'),
          where('email', '==', this.currentAccount.email)
        );
      
        const querySnapshot = await getDocs(accountsQuery);
      
        if (querySnapshot.empty) {
          throw new Error(`No account found with email: ${this.currentAccount.email}`);
        }
      
        const accountDocRef = querySnapshot.docs[0].ref;
      
        // Update the 'ownedTools' array by adding the new tool ID
        await updateDoc(accountDocRef, {
          ownedTools: [...this.currentAccount.ownedTools, id],
        });
      
        console.log("Owner's 'ownedTools' updated successfully");

        // Update the local `currentAccount` to reflect the change
        this.currentAccount = {
          ...this.currentAccount,
          ownedTools: [...this.currentAccount.ownedTools, id],
        };

        console.log('Local currentAccount updated successfully');
      }
      return id;
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
      throw error;
    }
  }

  async deleteTool(toolId: string): Promise<void> {
    try {
      if (!this.currentAccount) {
        throw new Error('No current account is logged in');
      }
  
      // Delete the tool from the "Tools" collection
      const toolDocRef = doc(this.firestore, 'Tools', toolId);
      await deleteDoc(toolDocRef);
      console.log(`Tool with ID ${toolId} deleted successfully.`);
  
      // Query the "Accounts" collection to find the current user's document
      const accountsQuery = query(
        collection(this.firestore, 'Accounts'),
        where('email', '==', this.currentAccount.email)
      );
      const querySnapshot = await getDocs(accountsQuery);

      if (querySnapshot.empty) {
        throw new Error(`No account found with email: ${this.currentAccount.email}`);
      }

      const accountDocRef = querySnapshot.docs[0].ref;

      // Remove the tool's ID from the owner's "ownedTools" array
      const updatedOwnedTools = this.currentAccount.ownedTools.filter(id => id !== toolId);
      await updateDoc(accountDocRef, { ownedTools: updatedOwnedTools });
      console.log(`Owner's ownedTools updated successfully after deleting tool ${toolId}`);

      // Update the local `currentAccount` to reflect the deletion
      this.currentAccount = {
        ...this.currentAccount,
        ownedTools: updatedOwnedTools,
      };
      console.log('Local currentAccount updated successfully');
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error;
    }
  }
  

  async fetchAccountTools(): Promise<Tool[]> {
    try {
      if (!this.currentAccount) {
        throw new Error('No current account is logged in');
      }
      
      console.log(this.currentAccount)
      const ownedToolIds = this.currentAccount.ownedTools;
      
      if (ownedToolIds.length === 0) {
        return [];
      }
      
      // Fetch all tools from Firestore that match the ownedToolIds
      const toolsQuery = query(
        this.toolCollection,
        where('id', 'in', ownedToolIds) // Filter tools by the ownedToolIds
      );      
      const querySnapshot = await getDocs(toolsQuery);
      
      if (querySnapshot.empty) {
        return [];
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
      // find the account with the given email
      const accountCollectionRef = collection(this.firestore, 'Accounts');
      const q = query(accountCollectionRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error(`Account with email ${email} does not exist`);
      }
  
      const accountDocRef = querySnapshot.docs[0].ref; 

      await updateDoc(accountDocRef, updates);  // Update the document with the provided changes
      console.log('Account updated successfully');
      
      // Check if communityCode is being updated in the updates
      if ('communityCode' in updates) {
        // If communityCode is being changed, log the user out
        console.log('Community code is changing, logging out the user...');
        await this.logout();
      }
    
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  // Allows user to enter waitlist in tooldetails
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
        const firebaseError = error as { code: string, message: string }; 
        const errorCode = firebaseError.code;
        const errorMessage = firebaseError.message;
        console.log('Firebase Error Code:', errorCode, 'Message:', errorMessage);
      } else {
        // Handle case where the error isn't an instance of Error
        console.log('An unknown error occurred', error);
      }
      return false;
    }
  }

  async logout(): Promise<void>{
    signOut(this.auth).then(() => {
      console.log('User logged out');
      this.currentAccount = null;
      this.router.navigate( ['/']);
    })
  }
}
