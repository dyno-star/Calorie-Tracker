# Nourish Calorie Tracker

A lightweight React + Vite app for tracking daily calories, macros, water intake, and recent nutrition trends.

## Features

- AI-assisted food logging from:
  - meal descriptions
  - uploaded photos
  - live camera capture
- Daily macro tracking (calories, protein, carbs, fat)
- Editable macro goals and built-in macro calculator
- Water intake tracker with daily goal progress
- 7-day history view with charts and daily breakdown
- Local-first storage using browser `localStorage`

## Tech Stack

- React 18
- Vite 5

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## App Setup

1. Open the app.
2. Go to the **Goals** tab.
3. Add your Anthropic API key (from `https://console.anthropic.com`) to enable AI food analysis.
4. Save your daily calorie and macro targets.

## Usage Overview

- **Log Food**: describe food or add a photo/camera shot, then confirm the AI result to add it to your log.
- **Summary**: view totals, macro breakdown, and remaining targets for the day.
- **History**: review the last 7 days of intake and goal adherence.
- **Goals**: manage API key, set nutrition goals, and clear today’s log.

## Data Storage

All user data (entries, goals, water progress, API key) is stored in your browser `localStorage` and is not synced to a backend by default.
