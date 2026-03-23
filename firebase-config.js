import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyASd0W1X8im3_h5GSWEcJ079pQso73s8U4",
    authDomain: "regtech-b3023.firebaseapp.com",
    projectId: "regtech-b3023",
    storageBucket: "regtech-b3023.firebasestorage.app",
    messagingSenderId: "3715308083",
    appId: "1:3715308083:web:e44dab187b5d94eb326146"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.firebaseModules = {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    setDoc,
    query,
    orderBy
};
