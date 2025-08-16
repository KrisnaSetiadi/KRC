// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "formflow-smorv",
  appId: "1:25769876524:web:dd37cef78bc5a615f20589",
  storageBucket: "formflow-smorv.appspot.com",
  apiKey: "AIzaSyDVfY64QXoU6ElS9KYM7vNG2KBNzHa3Jlk",
  authDomain: "formflow-smorv.firebaseapp.com",
  messagingSenderId: "25769876524",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };