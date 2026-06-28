import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: 'AIzaSyAoo89wTXK3enksY_b1SWSFtYkwf3dp6Rs',
    authDomain: 'wealth-f8844.firebaseapp.com',
    projectId: 'wealth-f8844',
    storageBucket: 'wealth-f8844.firebasestorage.app',
    messagingSenderId: '818675237858',
    appId: '1:818675237858:web:d716732bd885feb2006fbb',
    measurementId: 'G-6BNNKD63FD',
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
//# sourceMappingURL=firebase.js.map