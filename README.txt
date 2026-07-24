CONNECT FOUR ONLINE

This version includes:
- Single Player against a simple AI
- Local multiplayer on one phone
- Online multiplayer on different phones
- Six-digit room codes
- WhatsApp invitation links
- Win/loss and streak statistics
- Score tracking
- Rematch system
- Tutorial

IMPORTANT FIREBASE SETUP

1. Firebase Console -> Build -> Authentication
2. Click Get Started
3. Sign-in method -> Anonymous -> Enable

4. Firebase Console -> Build -> Firestore Database
5. Click Create Database
6. Start in Test Mode for initial testing

7. Upload index.html, style.css and script.js to your GitHub repository.
8. Replace the old files.
9. Commit the changes.
10. Wait for GitHub Pages to redeploy.

TEMPORARY FIRESTORE RULES FOR TESTING

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}

These rules are suitable for testing but should be improved before a public release.
