# Set up Expo

Do this once, so you can build your app as an APK (to install on your phone) or an AAB (for the Play Store).

You need [Node.js](https://nodejs.org) (LTS version) installed first.

## 1. Create a free Expo account

Sign up at https://expo.dev.

## 2. Set up EAS in the terminal

Open a terminal in your app's project folder and run these commands **one at a time**. Wait for each one to finish before running the next.

1. Install Expo's build tool:
   ```
   npm install -g eas-cli
   ```
2. Sign in with the account from step 1:
   ```
   eas login
   ```
   - Your browser opens the Expo login page, and the terminal says **Waiting for browser login...**
   - Log in on that page and confirm your account.
   - The browser shows a success message and the terminal says **Logged in**.
   - If the browser doesn't open, copy the link the terminal prints and open it yourself.

   Check it worked with `eas whoami`. It prints your username.

3. Set up building for your app:
   ```
   eas build:configure
   ```
   Answer the questions it asks:
   - **Would you like to automatically create an EAS project for @yourname/your-app?** Press `Y`, then Enter. This links your app to your Expo account.
   - **Would you like us to run 'git init'...?** Only appears if your project isn't using Git yet. Press `Y`, then Enter, and press Enter again to accept the commit message.
   - **Which platforms would you like to configure for EAS Build?** Use the arrow keys to pick **Android**, then press Enter.

   When you see **🎉 Your project is ready to build.**, it's done. It created an `eas.json` file in your project with the build settings.

That's it. You're ready to build your APK or Play Store bundle.
