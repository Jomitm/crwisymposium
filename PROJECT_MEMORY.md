# CRWI Symposium Project Memory

## Project Overview
**Title:** Pilgrimage of Hope: Consecrated Women, Living Flames of God’s Love
**Purpose:** Official website for the Symposium on Consecrated Life (CRWI).
**Mission:** To provide a professional, interactive, and beautifully designed platform for symposium information, speakers, and engagement.

## Technical Stack
- **Frontend:** Vanilla HTML5, CSS3 (with custom premium styling), and JavaScript.
- **Backend:** Node.js with Express.
- **Data Management:** `data.json` for dynamic content, `visitor_count.json` for tracking, and `xlsx` for parsing spreadsheet data.
- **Architecture:** Modular JavaScript (`main.js`, `data_integration.js`) for UI updates and search functionality.

## Core Features
- **Cinematic Hero Section:** Video backgrounds and smooth entrance animations.
- **Dynamic Content Rendering:** Sections for Speakers, Presenters, Themes, and "The Invisible Engines" (Staff/Volunteers) are generated dynamically from data.
- **Visitor Counter:** Persisted local counter with environment-aware API fallbacks.
- **Interactive Modals:** 3D-enhanced modals (e.g., Cultural Event) using Three.js and Lucide icons.
- **Search System:** Real-time filtering for presenters and themes.
- **Responsive Design:** Optimized for mobile, tablet, and desktop viewports.

## Latest Updates (2026-04-23)
- **Cultural Event Modal:** Integrated a modern, interactive modal with 3D background effects and Lucide icons.
- **Visitor Counter Fix:** Enhanced stability for local and live environments, updated CSP for analytics.
- **Memory File Initialization:** Created `PROJECT_MEMORY.md` to track project evolution.

## Current Focus
- Maintaining visual consistency across all components.
- Ensuring smooth performance of animations and dynamic data injections.
