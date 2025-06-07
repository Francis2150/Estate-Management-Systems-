// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAQpiNTZULk70K9Ov68th337q4WQva7zPA",
  authDomain: "estate-account-manager.firebaseapp.com",
  projectId: "estate-account-manager",
  storageBucket: "estate-account-manager.firebasestorage.app",
  messagingSenderId: "955560721280",
  appId: "1:955560721280:web:74a056f5f7dba8fed9df65"
};
firebase.initializeApp(firebaseConfig);
const dbRemote = firebase.firestore();
