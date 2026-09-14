import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVKtVV1PTKEIUcTokTU_i0einmecc09as",
  authDomain: "ac-retail.firebaseapp.com",
  databaseURL: "https://ac-retail-default-rtdb.firebaseio.com",
  projectId: "ac-retail",
  storageBucket: "ac-retail.firebasestorage.app",
  messagingSenderId: "119786479284",
  appId: "1:119786479284:web:7e5f56a57ee6e886c781e1",
  measurementId: "G-33JYSCJP1S"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
