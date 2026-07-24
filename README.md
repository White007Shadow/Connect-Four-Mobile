# Connect4 Arena

## Included
- Easy, Medium and Hard AI
- Local and online multiplayer
- Six-digit rooms, invite links and WhatsApp sharing
- Spectators, chat and emoji reactions
- Guest profiles with optional Google/email accounts
- Saved player disc colors
- Automatic black/white outlines only when player colors are similar
- Neon, Dark, Light and fully Custom themes
- Confetti, sound toggle and saved statistics
- Refresh/reconnect support
- Both players must press Ready before the next online round
- Modular JavaScript files

## Upload
Upload `index.html`, `style.css`, and the entire `js` folder to the root of:
`https://github.com/white007shadow/Connect4`

The configured Pages address is:
`https://white007shadow.github.io/Connect4/`

## Firebase
Anonymous Authentication must remain enabled.

Optional:
- Enable Google provider for Google accounts.
- Enable Email/Password provider for email accounts.

## Firestore rules
Copy all text from `firestore.rules` into Firebase Console → Firestore → Rules and click Publish.

## Test
1. Create a room on device one.
2. Join on device two.
3. Open a third browser and spectate.
4. Test moves, chat, reactions, win confetti and Ready.
5. Refresh a player and verify reconnection.

## Security limitation
Transactions and membership rules reduce conflicts and unauthorized room updates. Truly cheat-proof competitive play requires trusted server-side move validation, such as Firebase Cloud Functions.
