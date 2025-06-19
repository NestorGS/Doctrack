  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  import {
    getFirestore,
    doc,
    setDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

 const firebaseConfig = {
  apiKey: "AIzaSyAofOyGzsSWHQG3FfsFrGbVWjW0xMywb9c",
  authDomain: "doctrack-46fc2.firebaseapp.com",
  projectId: "doctrack-46fc2",
  storageBucket: "doctrack-46fc2.firebasestorage.app",
  messagingSenderId: "865552814891",
  appId: "1:865552814891:web:cf8e79d5ffd847067bab6e",
  measurementId: "G-XQPNKXK08Y"
};
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
const db = getFirestore();

(async () => {
  const snap = await db.collection('patients').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.doctorId) {
      // TODO: decide    doctorId   (por ejemplo, asignar un médico default)
      const doctorId = 'UID_DEL_DOCTOR_DEFAULT';
      await doc.ref.update({ doctorId });

      // (opcional) crear entrada espejo
      await db.collection('doctors')
              .doc(doctorId)
              .collection('patients')
              .doc(doc.id)
              .set({ linkedAt: new Date() });
    }
  }
  console.log('Migración terminada');
})();
