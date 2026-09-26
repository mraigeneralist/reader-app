# Publish your app on the Play Store

## Part 1: Get these ready first

1. **A Google Play Developer account.** Sign up at https://play.google.com/console. It costs a one-time $25, and Google verifies your identity, which can take a few days.
2. **A Privacy Policy page, and its URL.** Send this to Claude Code:
   ```
   Write a simple privacy policy for this app for the Play Store, based on what data the app really collects or sends. Give it in one code block so I can copy it easily.
   ```
   Paste the text into a free page on [Google Sites](https://sites.google.com), publish it, and copy the link.

3. **An app icon and a feature graphic.** Send this to Claude Design, and attach a few screenshots of your app so it can match your style:
   ```
   Design a Play Store app icon (512 x 512 PNG, no text) and feature graphic (1024 x 500 PNG, app name + tagline) for this app.
   ```
   Download both at exactly those sizes.

4. **Screenshots and descriptions.** Connect your phone by USB (see the Android testing guide), open your app on it, and send this to Claude Code:
   ```
   Take Play Store screenshots of the main screens of my app on my connected phone (8 max, no status bar, 2:1 ratio) and save them in a store-screenshots folder. Then write a short (80 chars) and full description about the app, each in a code block so I can copy it.
   ```
5. **The production app bundle (.aab).** In the terminal under your project folder, run:
   ```
   npx eas-cli@latest build -p android --profile production
   ```
   Then wait for 10-15 minutes for the build to finish. Once the build is done, you get a link. Download the `.aab` file and keep it safe: this is what you upload to the Play Store.

## Part 2: Create your app in Play Console

1. Open [Play Console](https://play.google.com/console) and click **Create app**.
2. Fill in the app name, default language, **App** (not Game), and **Free**.
3. Tick the declarations and click **Create app**.

## Part 3: Finish the setup tasks

On the app's **Dashboard**, open **Set up your app** and complete each task. Most are short forms about your app:

- **Privacy policy:** paste your Privacy Policy URL.
- **App access:** choose "All functionality is available without special access", unless your app needs a login. If it does, give Google a test account.
- **Ads:** say whether your app shows ads.
- **Content rating:** fill in the questionnaire to get your age rating.
- **Target audience:** pick the age groups your app is for.
- **Data safety:** say what data your app collects and shares. Not sure? Ask Claude Code: "Help me fill in the Play Store Data safety form for this app".
- **Other declarations** (news app, government app, health features and so on): answer No if they don't apply.

Then go to **Store presence > Main store listing** and add your descriptions, icon, feature graphic and screenshots. Under **Store settings**, pick a category and add a contact email.

## Part 4: Run a closed test

New personal accounts (made after 13 November 2023) have to test the app with at least **12 testers for 14 days in a row** before they can publish. If you have an organisation account, skip to Part 5.

1. Go to **Test and release > Testing > Closed testing** and create a track.
2. Under **Testers**, add the Gmail addresses of your 12+ testers: friends and family are fine.
3. Click **Create new release**, upload your `.aab` file, and click **Next**, then **Save and publish**. If it asks about **Play App Signing**, keep Google's recommended option.
4. Pick the countries, then send **Publishing overview > Send changes for review**. Review usually takes a few days.
5. Once it's approved, copy the **opt-in link** from the Testers tab and send it to your testers. Each tester opens it, taps **Become a tester**, and installs the app from the Play Store.
6. Wait 14 days. Testers should keep the app installed and open it now and then.

## Part 5: Publish to everyone

1. After 14 days, go to the **Dashboard** and click **Apply for production**. Answer the short questions about your test. Google replies in about 7 days.
2. Once you have access, go to **Test and release > Production** and click **Create new release**.
3. Upload your `.aab` file (or add the one from your closed test), write what's new, and click **Next**.
4. Pick your countries, then send it for review from **Publishing overview**.

When the review passes, your app is live on the Play Store.

## Releasing an update later

1. Ask Claude Code to make your changes and raise the version in `app.json` (for example 1.0.0 to 1.0.1).
2. Run the same build command from Part 1 and download the new `.aab`.
3. In **Production**, click **Create new release**, upload it, and send it for review.
