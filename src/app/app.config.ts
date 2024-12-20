import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: "toolshed-d03f6",
        appId: "1:1076441728383:web:3972f389a5cce4e223864a",
        storageBucket: "toolshed-d03f6.firebasestorage.app",
        apiKey: "AIzaSyBPeR3G-Ai_UZlkHM3Z61ZOg2KEvIIAd18",
        authDomain: "toolshed-d03f6.firebaseapp.com",
        messagingSenderId: "1076441728383",
        measurementId: "G-Q3C67485L5",
      })
    ),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()), provideAnimationsAsync(),
  ],
};
