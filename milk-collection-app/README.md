# Milk Collection Manager (Sudha Dairy centers)

## Folder
- index.html - app page
- css/style.css - light blue/white theme
- js/config.js - Firebase config
- js/i18n.js - Hindi/English
- js/app.js - all features and rate formula
- assets/logo.png - Sudha logo
- firestore.rules - security rules
- firebase.json, .firebaserc - hosting setup
- manifest.json - Add to Home screen on phone

## Setup (once)
1. Firebase console > Authentication: Email/Password ON.
2. Firestore Database > Rules: paste firestore.rules > Publish.
3. Host the folder free: Netlify Drop (drag the whole folder), or `firebase deploy`.
4. Authentication > Settings > Authorized domains: add your site address.
5. Open the site on your phone > Add to Home screen.

## Rate formula (chart effective 10-07-2026)
- Fat below 6.0: (fat x 417 + SNF x 278) / 100
- Fat 6.0 and above: fat x 8.1823 x (1 + 0.05 x (SNF - 9))
Change rates anytime in Settings.

Login uses number@milkapp.in internally. There is no SMS/email password reset; keep the password safe.
