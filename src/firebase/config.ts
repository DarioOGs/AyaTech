import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Deja que Firestore guarde una copia local (IndexedDB) de todo lo que se
// lee y escribe. Si el celular o el computador pierde la conexión, las
// lecturas siguen funcionando con el último dato conocido y las escrituras
// (nuevo pedido, ajuste de inventario, etc.) quedan en una fila de espera
// que se envía sola en cuanto vuelve la señal. No hay que programar nada
// más para cumplir con "que no se pierdan ventas sin internet".
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn(
      "El modo sin conexión solo puede activarse en una pestaña del navegador a la vez."
    );
  } else if (err.code === "unimplemented") {
    console.warn("Este navegador no soporta guardar datos sin conexión.");
  }
});
