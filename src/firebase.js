 // Import the functions you need from the SDKs you need
 import { initializeApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries
 // Your web app's Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyCv30rEn0rrAta4VWxV5lYafZxJWTafrvM",
    authDomain: "carbonzero-e9600.firebaseapp.com",
    projectId: "carbonzero-e9600",
    storageBucket: "carbonzero-e9600.appspot.com",
    messagingSenderId: "269646610943",
    appId: "1:269646610943:web:74bdfee596aa6827f927ca"
  };
 // Initialize Firebase
 
 const app = initializeApp(firebaseConfig);
 // Export firestore database
 // It will be imported into your react app whenever it is needed
 export const db = getFirestore(app);