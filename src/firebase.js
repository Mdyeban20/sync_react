// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCECy-aZ_k_f7_MRZYasrezbDVBPsLKE7M",
    authDomain: "oats-38392.firebaseapp.com",
    databaseURL: "https://oats-38392-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "oats-38392",
    storageBucket: "oats-38392.firebasestorage.app",
    messagingSenderId: "490235160932",
    appId: "1:490235160932:web:cff8ab708b9ab656ba3271",
    measurementId: "G-FZHT0C51LZ"
  };

  const app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and Firestore
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Exporting for use in other parts of your app
  export { auth, db, signOut };