# Heads Up - Scripting widget game

Heads Up for the iOS **Scripting** app. Plays on the Home Screen widget:
photo + word, modes Family / 18+ Cheeky (puns and visual wordplay only,
clean photos) / Custom (your own words, with a photo you approve first).

## Files (names must match exactly)
- `app_intents.tsx` - decks, game state, widget button logic
- `widget.tsx` - the Home Screen widget
- `index.tsx` - the in-app screen (mode picker + custom words)

## Setup
1. Install the free **Scripting** app from the App Store.
2. Create a new script project named `Heads Up`.
3. Add the three files above with the exact names and paste each file's code.
4. Run the script once in the app to pick a mode / add custom words.
5. Long-press the Home Screen, tap +, choose Scripting, pick the medium
   widget, then Edit Widget and select this script.

Photos are hand-picked Wikimedia Commons images baked into the deck; custom
photos come from Wikimedia Commons search and only appear after you approve
them in the app. If a photo cannot load, the word shows as a letter card.
