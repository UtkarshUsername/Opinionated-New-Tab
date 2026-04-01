# Opinionated New Tab

<p align="center">
  A dense, keyboard-first new tab dashboard for your browser.
</p>

<p align="center">
  <a href="https://github.com/UtkarshUsername/Opinionated-New-Tab/blob/main/LICENSE"><img src="https://img.shields.io/github/license/UtkarshUsername/Opinionated-New-Tab?style=flat-square" alt="License"></a>
</p>

<img width="1920" height="960" alt="image" src="https://github.com/user-attachments/assets/9fee5903-05a0-4ca2-9415-2b4f7cba8f89" />
<img width="1920" height="952" alt="image" src="https://github.com/user-attachments/assets/86fa3974-bec8-47c2-be15-0d176cb6b352" />

## 📋 Table of Contents

- [Installation](#installation)
- [Local Development](#local-development)
- [License](#license)

## Installation

### Beta Version

For Firefox:
1. Follow [Local Development](#local-development).
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **"Load Temporary Add-on..."** and select the `manifest.json` file from the dist/firefox folder.

## Local Development

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Forked from [Exam Countdown Extension](https://github.com/NovatraX/exam-countdown-extension) by [Novatra](https://github.com/NovatraX).
