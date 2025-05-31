// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "inkly-1fc91.firebaseapp.com",
  projectId: "inkly-1fc91",
  storageBucket: "inkly-1fc91.firebasestorage.app",
  messagingSenderId: "1097920700894",
  appId: "1:1097920700894:web:221900cf9131c4d0f17d4f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure provider settings
provider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, provider };