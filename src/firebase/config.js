// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVW3J7HXSZQwHTz4eobvliq-1s7B7Vmq0",
  authDomain: "screen-sharing-project.firebaseapp.com",
  projectId: "screen-sharing-project",
  storageBucket: "screen-sharing-project.firebasestorage.app",
  messagingSenderId: "544201577636",
  appId: "1:544201577636:web:ecfc5bc5f69b70f1f78231",
  measurementId: "G-WD294RGP28",
  databaseURL: "https://screen-sharing-project-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Handle authentication
let authPromise = null;

const ensureAuthenticated = () => {
  if (authPromise) return authPromise;

  authPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("✅ User authenticated:", user.uid);
        resolve(user);
      } else {
        console.log("🔄 Signing in anonymously...");
        signInAnonymously(auth)
          .then((result) => {
            console.log("✅ Signed in anonymously:", result.user.uid);
            resolve(result.user);
          })
          .catch((error) => {
            console.error("❌ Anonymous sign-in failed:", error);
            reject(error);
          });
      }
    });
  });

  return authPromise;
};

// Initial auth check
ensureAuthenticated().catch(console.error);

export {
    app,
    db,
    auth,
    ensureAuthenticated
}