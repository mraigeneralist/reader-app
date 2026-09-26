# Connect GitHub to Claude Code

It takes about five minutes, once per computer. Install the GitHub CLI and log in through your browser. After that, Claude Code can create repos, push code and open pull requests for you.

## Before you start

- A free GitHub account: https://github.com/signup
- Git installed: https://git-scm.com/downloads

## 1. Install

Run this in a terminal:

```
winget install --id GitHub.cli
```

Close every terminal and VS Code, then open them again so the new `gh` command is found. Check it:

```
gh --version
```

You should see a version number.

## 2. Log in

```
gh auth login
```

Answer the four questions with the arrow keys and Enter:

| Question | Pick |
| --- | --- |
| Where do you use GitHub? | GitHub.com |
| Preferred protocol for Git operations? | HTTPS |
| Authenticate Git with your GitHub credentials? | Yes |
| How would you like to authenticate? | Login with a web browser |

The terminal shows a one-time code like `ABCD-1234`. Press Enter, sign in to GitHub in the browser that opens, enter the code, and click **Authorize GitHub CLI**. Don't show the code on screen or share it.

## 3. Check it and start using it

Confirm the login:

```
gh auth status
```

It should say "Logged in to github.com account" and your username.

Tell Git who you are, one time, using the email on your GitHub account:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Restart Claude Code if it was open. Now just ask it in plain words:

- "Create a private GitHub repo for this project and push it"
- "Push my latest changes to GitHub"
- "Open a pull request for these changes"

If Claude Code needs to edit GitHub Actions workflow files, run `gh auth refresh -s workflow` once and approve it in the browser.

## Shortcut: let Claude Code do it

Paste this into Claude Code. It does everything except the browser login, which it hands back to you:

```
Set up the GitHub CLI on this computer so you can work with GitHub for me.
1. Check if Git and the GitHub CLI (gh) are installed. Install whatever is missing with winget.
2. If my Git name and email aren't set, ask me for them and set them globally.
3. When it's time to log in, stop and tell me exactly what to run in my own terminal and which options to pick. Wait until I say I'm done.
4. Then check the login with gh auth status and tell me if everything is ready.
```
