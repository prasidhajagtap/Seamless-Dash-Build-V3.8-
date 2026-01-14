🚀 Seamless Dash - Seamex
Seamless Dash is a hyper-casual, "endless flyer" game built using HTML5 Canvas and Vanilla JavaScript. It is designed to provide a branded, engaging experience for users within the Poornata App, featuring dynamic difficulty and real-time social sharing.

🌟 Key Features
1. Advanced Game Mechanics
Physics-Based Flight: A smooth "Hold to Fly" mechanic with character bobbing and a motion-trail history effect.

Dynamic Backgrounds: A 3-stage color interpolation system that shifts the sky from Day to Sunset to Night as the player levels up.

Impact Feedback: Enhanced screen shake logic that triggers on hits and decays naturally, ensuring the UI remains stable during gameplay.

Shield System: Power-ups appear after 50 points, granting 8 seconds of invulnerability with a visual countdown and particle effects.

2. Branding & UI/UX
Dash Branding: Integrated "Powered by Seamex" logos and "Seamless Dash" identity on the menu and game-over screens.

Responsive Canvas: Automatically scales to fit any mobile or desktop screen resolution while maintaining aspect ratio.

Z-Index Management: Strict UI layering ensures input screens and menus disappear completely during active gameplay.

3. Data & Validation
Strict Login Validation: * Name: Letters and spaces only (minimum 3 characters).

Poornata ID: Numbers only (4–10 digits).

Persistence: High scores and user profiles are saved locally (localStorage) per Poornata ID.

Leaderboard: A real-time Top 5 ranking system displayed on the menu and death screens.

4. Engagement Tools
Trivia System: Displays Seamex-specific trivia and HR transformation facts on the Game Over screen to reinforce brand messaging.

Social Challenge: A native "Share Challenge" button that allows users to share their scores via the device's native share menu or clipboard.

🛠️ Technical Stack
Engine: HTML5 Canvas API (2D Context).

Logic: Vanilla JavaScript (ES6+).

Styles: CSS3 with Flexbox and CSS Variables for theme management.

Assets: Optimized PNG sprites and MP3 audio files.

🎮 How to Play
Login: Enter your Name and Poornata ID.

Start: Place your finger/mouse on the screen to begin.

Fly: Hold to ascend/move toward your finger; Release to end the dash (Game Over).

Dodge: Avoid the pink and red viruses.

Power-Up: Collect the Blue Shield to destroy viruses on contact for a limited time.

📁 File Structure
To run the game, ensure the following assets are in the root folder:

index.html (The core logic provided)

character.png (The Dash character)

cloud1.png (Background clouds)

icons8-virus-60.png & icons8-virus-60 (1).png (Obstacles)

sheild.png (Power-up icon)

NEW Seamex logo.png (Branding)

Audio Files: bgm.mp3, Die.mp3, levelup.mp3, powerup.mp3

Development Note: The screen shake decay logic is globally handled in the update() loop to prevent "permanent vibration" bugs during shield collisions.
