// Configuration Firebase du projet Mascotto
const firebaseConfig = {
  apiKey: "AIzaSyDYZ4YF0uL9s2TmgAyiEwC1PtZeeSgTc",
  authDomain: "mascotto-a2afc.firebaseapp.com",
  projectId: "mascotto-a2afc",
  storageBucket: "mascotto-a2afc.firebasestorage.app",
  messagingSenderId: "467516847674",
  appId: "1:467516847674:web:f8ad795768ea6757d92703"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
