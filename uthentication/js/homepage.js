// At the top of your file
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { syncCSVToFirestore, syncFirestoreToCSV } from './syncGratuity.js'; // Local sync file

const firebaseConfig = {
  apiKey: "AIzaSyAQpiNTZULk70K9Ov68th337q4WQva7zPA",
  authDomain: "estate-account-manager.firebaseapp.com",
  projectId: "estate-account-manager",
  storageBucket: "estate-account-manager.firebasestorage.app",
  messagingSenderId: "955560721280",
  appId: "1:955560721280:web:74a056f5f7dba8fed9df65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Handle auth state
onAuthStateChanged(auth, (user) => {
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById('loggedUserFName').innerText = userData.firstName;
          document.getElementById('loggedUserEmail').innerText = userData.email;
          document.getElementById('loggedUserLName').innerText = userData.lastName;

          // 🔄 Sync from Firestore to local CSV (if new device)
          syncFirestoreToCSV(loggedInUserId);

          // 🌐 Sync local CSV to Firestore when online
          window.addEventListener('online', () => {
            syncCSVToFirestore(loggedInUserId);
          });

        } else {
          console.log("No document found matching ID.");
        }
      })
      .catch((error) => {
        console.error("Error getting document:", error);
      });
  } else {
    console.log("User ID not found in local storage.");
  }
});

// Logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('loggedInUserId');
  signOut(auth)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});

