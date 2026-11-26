// Firebase connection (safe to share; security comes from firestore.rules)
firebase.initializeApp({apiKey:"AIzaSyAi1Jw1bWSc3SvU749ERcQqfMK5hJr-_Fg",authDomain:"milk-collection-4650a.firebaseapp.com",projectId:"milk-collection-4650a",storageBucket:"milk-collection-4650a.firebasestorage.app",messagingSenderId:"883076228037",appId:"1:883076228037:web:4102cf05902b34ad07e1ac"});
const auth=firebase.auth(),db=firebase.firestore();
