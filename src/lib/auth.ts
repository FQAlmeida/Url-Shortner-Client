import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { browser } from '$app/environment';

export let db: Firestore;
export let app: FirebaseApp;
export let auth: Auth;

const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_API_KEY,
    appId: import.meta.env.FIREBASE_APP_ID,
    // useEmulator: import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true',
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN
};

console.log(firebaseConfig);


export const initializeFirebase = () => {
    if (!browser) {
        throw new Error("Can't use the Firebase client on the server.");
    }
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        console.log(auth);
    }
};