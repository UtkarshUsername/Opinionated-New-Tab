# Exam Countdown Extension

<p align="center">
  <img src="assets/icons/icon128.png" alt="Exam Countdown Extension Logo" width="128" height="128">
</p>

<p align="center">
  A browser extension that provides countdown timers for JEE and NEET exams, helping students track the time remaining until their important exams.
</p>

<p align="center">
  <a href="https://github.com/NovatraX/exam-countdown-extension/releases"><img src="https://img.shields.io/github/v/release/NovatraX/exam-countdown-extension?style=flat-square" alt="GitHub Release"></a>
  <a href="https://github.com/NovatraX/exam-countdown-extension/blob/main/LICENSE"><img src="https://img.shields.io/github/license/NovatraX/exam-countdown-extension?style=flat-square" alt="License"></a>
  <a href="https://github.com/NovatraX/exam-countdown-extension/issues"><img src="https://img.shields.io/github/issues/NovatraX/exam-countdown-extension?style=flat-square" alt="Issues"></a>
  <a href="https://github.com/NovatraX/exam-countdown-extension/pulls"><img src="https://img.shields.io/github/issues-pr/NovatraX/exam-countdown-extension?style=flat-square" alt="Pull Requests"></a>
</p>

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Local Development](#local-development)
- [License](#license)

## ✨ Features

- ⏰ **Countdown Timers**: Real-time countdown for JEE and NEET exams
- 🎛️ **Customizable Preferences**: Show/hide countdowns based on your interests
- 🖥️ **Popup Interface**: Quick access to countdowns via extension icon
- 🆕 **New Tab View**: Detailed countdown view in a new tab
- 🎨 **User-Friendly Design**: Clean and intuitive interface
- 📅 **Personalized Exams**: Add and track your own exam dates
- 🎵 **Background Music**: Play Spotify playlists or YouTube videos as background music

## 🚀 Installation

### Stable Release

<p align="center">
    <a href="https://github.com/NovatraX/exam-countdown-extension/releases/"><img src="https://img.shields.io/badge/GitHub-blue?style=for-the-badge&logo=github&logoColor=white&labelColor=grey&color=blue" alt="Download from GitHub" height="47" /></a>
    <a href="https://chromewebstore.google.com/detail/mhjcpnnmmalddidegkfcempomlpkkdan"><img src="https://github.com/user-attachments/assets/20a6e44b-fd46-4e6c-8ea6-aad436035753" alt="Download from Chrome Web Store" height="47" /></a>
    <a href="https://addons.mozilla.org/en-US/firefox/addon/exam-countdown/"><img src="https://github.com/user-attachments/assets/c0e99e6b-97cf-4af2-9737-099db7d3538b" alt="Download from Mozilla Add-ons" height="47" /></a>
</p>

### Beta Version

For Firefox:
1. **Download** the `.zip` from [Releases](https://github.com/NovatraX/exam-countdown-extension/releases/).
2. **Extract** it to a folder.
3. Open `about:debugging#/runtime/this-firefox` in Firefox.
4. Click **"Load Temporary Add-on..."** and select the `manifest.json` file from the extracted folder.

For Chrome:
1. **Download** the `.zip` from [Releases](https://github.com/NovatraX/exam-countdown-extension/releases/).
2. **Extract** it to a folder.
3. Open `chrome://extensions/`.
4. **Enable Developer Mode** (top right in Chrome).
5. Click **"Load unpacked"** and select the extracted folder.

## 📖 Usage

- Click on the extension icon to open the popup and view the countdowns.
- Access the options page to set your preferences for displaying countdowns.
- Use the countdown page for a detailed view, which can be opened in a new tab.
- Add your own exam dates in the settings to personalize your countdown experience.

## 🤝 Contributing

We welcome contributions from everyone! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 🛠️ Local Development

### Prerequisites

Before beginning, install `pnpm` globally (if not already installed):

```bash
npm install -g pnpm
```

### Install Dependencies

Install the required dependencies for the project:

```bash
pnpm install
```

### Development

To develop for **Firefox**, set the `TARGET_BROWSER` environment variable before running the dev server:

```bash
export TARGET_BROWSER=firefox  # Linux/macOS
set TARGET_BROWSER=firefox     # Windows (Command Prompt)
$env:TARGET_BROWSER="firefox"  # Windows (PowerShell)
```

Then start the development server:

```bash
pnpm dev
```

This will launch Firefox with your extension loaded. The page will automatically reload whenever you make changes to your code.

### Build for Production

Build for a specific browser. Each outputs to its own directory (`dist/chrome` or `dist/firefox`):

```bash
pnpm build:chrome    # → dist/chrome/
pnpm build:firefox   # → dist/firefox/
pnpm build           # → both
```

### Linting

Run Mozilla's addons-linter against the Firefox build (requires `build:firefox` first):

```bash
pnpm build:firefox
pnpm lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
