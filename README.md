# Folio

A personal reading app for Android. Import your own book files, organise them into
categories, read them, highlight passages and look up words without leaving the page.
Everything is stored on the device. There are no accounts and nothing is sent to a server.
The one exception is the dictionary, which looks words up online.

> Status: early development. The design system and Home screen are in place. Features
> land one at a time (see the roadmap below).

## Features

- **Import**: PDF, EPUB, MOBI, AZW3, FB2, DOCX, DOC, TXT and RTF from device storage
  or any cloud provider in the Android file picker.
- **Continue reading**: Home shows the books you're reading with progress. Opening a book
  returns you to the exact position you left, even after a restart.
- **Categories**: create, rename, recolour and delete categories, assign books, and browse by category.
- **Finished books**: a book is marked finished when you reach the end (you can also mark or undo it by hand), and the Finished screen lists completion dates.
- **Highlights**: select text and highlight it. Each book has a list of its highlights
  with location and date. Tap one to jump back to it.
- **Dictionary**: select a word, tap Define, and a sheet shows the pronunciation, part of speech,
  definition and an example. Closing it returns you to the same spot on the page.
- Search, table of contents, reading settings (font, size, spacing, theme, brightness),
  onboarding and app settings.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, TypeScript, React Compiler |
| Runtime | Development build with `expo-dev-client` (Expo Go is not used) |
| Navigation | Expo Router (file-based, in `src/app/`) |
| Storage | `expo-sqlite` + Drizzle ORM; imported files live in app storage via `expo-file-system` |
| Reader | `react-native-webview` running foliate-js (EPUB/MOBI/AZW3/FB2) and pdf.js (PDF); DOCX/DOC/TXT/RTF are converted to EPUB on import |
| UI | Custom components built from the Stashly design system (`src/theme`, `src/components`), Archivo + JetBrains Mono fonts embedded with `expo-font`, Lucide icons, `@gorhom/bottom-sheet` |
| Device APIs | `expo-document-picker`, `expo-brightness`, `expo-speech`, `expo-clipboard`, `expo-sharing` |

## Project structure

```
src/
  app/          Screens and navigators (Expo Router)
  components/   Design-system components: Button, Card, Cover, Surface…
  features/     Screen-specific pieces, grouped by feature
  theme/        Typed design tokens: colours, type, spacing, effects
design/         Read-only copy of the design canvas and tokens
assets/fonts/   Embedded font files
```

## Running on a physical Android device

This project uses a **development build**, a debug version of the app with the Expo dev tools
built in. You build it once, install it on your phone, and then JavaScript changes reach the phone
instantly through Fast Refresh.

### Prerequisites

- Node.js 20 or newer
- Android Studio, which provides the Android SDK, `adb` and a bundled JDK. Set `JAVA_HOME` to the
  bundled JDK (`<Android Studio>/jbr`) and `ANDROID_HOME` to the SDK folder.
- An Android phone with **Developer options** and **USB debugging** turned on

### First run

```bash
npm install
adb devices                     # your phone should be listed as "device"
npx expo run:android --device   # builds the app, installs it, starts Metro
```

The first build takes around 10–15 minutes. When it finishes, the app opens on the phone and
connects to the Metro dev server on your computer.

### Daily development

Once the app is installed, you only need the dev server:

```bash
npx expo start --dev-client
```

Open **Folio** on the phone. Saved changes appear immediately through Fast Refresh.

**Rebuild with `npx expo run:android --device` after:**
- adding a library that contains native code
- changing `app.json` plugins or permissions
- upgrading the Expo SDK

### If the phone can't reach Metro

Over USB, forward the port so the phone can reach your computer:

```bash
adb reverse tcp:8081 tcp:8081
```

Then reopen the app, or shake the phone and choose **Reload**.

## Roadmap

1. Design system + Home ✅
2. Onboarding and empty states
3. Import pipeline and library database
4. Reader (EPUB/MOBI/AZW3/FB2, PDF, converted formats) with saved position
5. Library, book detail, continue reading
6. Categories
7. Highlights
8. Dictionary
9. Finished books and end of book
10. Search and app settings
