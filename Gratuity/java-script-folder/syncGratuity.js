import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const auth = getAuth();
const db = getFirestore();

const GRATUITY_KEY = "gratuity_csv_backup"; // localStorage key
const LOCAL_CSV_PATH = "MyAppDataTwo/GRATUITY.csv"; // if used with FileSystem API or Electron

// Sync CSV content from localStorage to Firestore
export async function syncCSVToFirestore(userId) {
  const csvContent = localStorage.getItem(GRATUITY_KEY);
  if (!csvContent) return;

  try {
    await setDoc(doc(db, "gratuity_records", userId), {
      csvContent,
      lastUpdated: serverTimestamp()
    });
    console.log("✅ Synced CSV to Firestore");
  } catch (error) {
    console.error("❌ Error syncing to Firestore:", error);
  }
}

// Restore CSV from Firestore to localStorage
export async function syncFirestoreToCSV(userId) {
  try {
    const docRef = doc(db, "gratuity_records", userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const { csvContent } = snapshot.data();
      localStorage.setItem(GRATUITY_KEY, csvContent);
      console.log("✅ Restored CSV from Firestore");
    } else {
      console.log("⚠️ No CSV found in Firestore");
    }
  } catch (error) {
    console.error("❌ Error restoring from Firestore:", error);
  }
}
