# Verlo AI: Onboarding & Progress Update

## Summary of Changes
This update focuses on creating a seamless, high-conversion onboarding flow, integrating persistent user progress tracking (XP, Streaks), and finalizing the rebrand to "Verlo AI".

### 1. Onboarding Flow
The onboarding process has been revamped to be more engaging and personalized:
- **Obstacles**: Users identify what's holding them back.
- **Time Investment**: A new screen (`time-investment.tsx`) asks users for their daily commitment (5/10/15 mins).
- **Assessment**: The "baseline" assessment now runs through the standard `VoiceConversation` component but with specific parameters.
- **Processing**: A new circular progress UI (`processing.tsx`) provides better feedback during AI analysis.
- **Reveal**: The results screen (`reveal.tsx`) now intelligently routes users:
    - **New Users**: Directs to a new **Projection** screen.
    - **Existing Users**: Awards XP and returns to the Home screen.
- **Projection**: A new screen (`projection.tsx`) shows the user's potential improvement over 30 days based on their baseline score and time investment, then converts them to Sign Up.

### 2. Progress Tracking (`ProgressProvider`)
A new context provider (`lib/ProgressProvider.tsx`) now manages:
- **XP System**: Users earn XP for completing levels.
- **Streaks**: Daily usage is tracked and persisted using `AsyncStorage`.
- **Level Unlocking**: Levels on the home screen (`(tabs)/index.tsx`) now unlock sequentially as you complete them.

### 3. Authentication & Paywall
- **Simplified Auth**: Removed complex magic links; focused on Email/Password.
- **Paywall Integration**: The paywall (`paywall.tsx`) checks for authentication. If a user is signed in but hasn't completed onboarding, they are shown the paywall (Free Trial CTA) and then their onboarding is marked as complete.

### 4. Rebranding
- App name updated to **Verlo AI** throughout the UI.
- System prompts updated to ensure realistic baseline scores (58-74 range) for beginners.

## How to Test
1. **Fresh Install / Clear Data**: To see the full onboarding flow.
2. **Walkthrough**:
   - Go through the "Get Started" flow.
   - Select obstacles and time investment.
   - Complete the 60-second assessment.
   - View your baseline score.
   - Continue to the "Projection" screen to see your potential.
   - Sign Up.
   - View the "Verlo Pro" paywall and start a trial (or continue with basic).
   - You should land on the Home Screen with Level 1 unlocked.
3. **Practice**:
   - Tap "Level 1".
   - Complete the conversation.
   - Click "Finish" on the reveal screen.
   - Verify that your XP has increased and Level 2 is now unlocked (if applicable).

## Technical Notes
- **Linting**: Fixed TypeScript errors in `VoiceConversation.tsx` and `processing.tsx`.
- **Dependencies**: Added `react-native-svg` and `react-native-reanimated` for smooth circular progress animations.
