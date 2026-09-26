# Test your app on your Android phone

Do this once. Then Claude Code can install your app on your phone over USB, and every change you save shows up on the phone right away.

## 1. Install Android Studio

1. Download it from https://developer.android.com/studio and run the installer.
2. Open Android Studio, choose **Standard** setup, accept all the licenses, and let it finish downloading. It takes a while.

That's all you need from Android Studio. You don't have to open it again.

## 2. Tell Windows where Android is

**Easy way:** paste this into Claude Code:

```
Set up the Android environment variables on this Windows computer for my user account:
1. Set ANDROID_HOME to the Android SDK folder (usually %LOCALAPPDATA%\Android\Sdk).
2. Set JAVA_HOME to the Java that comes with Android Studio (usually C:\Program Files\Android\Android Studio\jbr).
3. Add the SDK's platform-tools folder to my Path, without removing anything already there.
Check each folder exists before setting it. If one is missing, tell me instead of guessing. Show me the final values when you're done.
```

When it's done, close and reopen VS Code, then check it worked with `adb --version` (see below).

**Or do it yourself:**

1. Press the Windows key, type **environment variables**, and open **Edit environment variables for your account**.
2. Under **User variables**, click **New** twice to add these two:

   | Variable name | Variable value |
   | --- | --- |
   | `ANDROID_HOME` | `%LOCALAPPDATA%\Android\Sdk` |
   | `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |

3. Select **Path**, click **Edit**, then **New**, and add:
   ```
   %LOCALAPPDATA%\Android\Sdk\platform-tools
   ```
4. Click **OK** on every window, then close and reopen your terminal and VS Code.

Check it worked:
```
adb --version
```
You should see a version number.

## 3. Turn on Developer mode on your phone

1. Open **Settings > About phone**.
2. Find **Build number** and tap it **7 times**. Enter your PIN if asked. You'll see "You are now a developer!"

   On some phones Build number is one level deeper, under **Software information** or **Version**.
3. Go back to **Settings**, open **Developer options** (search for it if you can't find it), and turn on **USB debugging**.

Can't find it? It's different on every brand (Samsung, Redmi, OnePlus...). Google **"How to enable developer options [your phone model]"**.

## 4. Connect your phone

1. Plug your phone into the computer with a USB cable. Use a cable that carries data; some charging-only cables don't.
2. If the phone asks what the USB connection is for, choose **File transfer**.
3. The phone shows **Allow USB debugging?** Tick **Always allow from this computer** and tap **Allow**.

Check the computer sees your phone:
```
adb devices
```
You should see a line ending in `device`. If it says `unauthorized`, unlock your phone and tap **Allow** on the popup.

## 5. Install your app on the phone

In your project folder, run:
```
npx expo run:android --device
```
Or just ask Claude Code: "Build and install the app on my phone".

The first build takes several minutes. After that, keep the terminal running: every change you save appears on your phone in seconds. Your phone and computer need to be on the same Wi-Fi, or stay connected by USB.
