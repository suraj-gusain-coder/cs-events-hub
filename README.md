# Daksh - Indian CS Events & Internships Hub

A premium, visually stunning single-page web dashboard designed for Computer Science students in India. It aggregates and displays active hackathons, competitive coding contests, CTFs, ideathons, and software engineering internships across major cities and global platforms.

Live data is automatically scraped and updated daily.

## 🚀 Live Site
Once hosted on GitHub Pages, the site is accessible publicly at:
**`https://suraj-gusain-coder.github.io/cs-events-hub/`**

---

## ✨ Features

- **Daily Auto-Updates**: Powered by a GitHub Action that runs a python aggregator daily on the cloud.
- **Aggregated Data Sources**: Compiles active events from:
  - **Hackathons**: Hack2Skill, Devfolio, Unstop, MLH.
  - **Coding Contests**: CodeChef, LeetCode, HackerRank, GeeksforGeeks.
  - **CTFs & Ideathons**: PicoCTF, Unstop.
  - **Internships (India)**: Internshala, GeeksforGeeks Jobs (Bangalore, Hyderabad, Pune, Mumbai, Delhi NCR, Remote).
  - **International**: Google Summer of Code, MLH Fellowship, Kaggle.
- **Dynamic Countdowns**: Highlighting urgent deadlines ending in less than 3 days.
- **Custom Suggestions**: Suggest custom events that persist in browser local storage.
- **Premium Styling**: Dark theme, glassmorphic elements, hover glowing borders, and responsive design optimized for mobile and desktop screens.

---

## 🛠️ Local Development & Manual Update

To run the updater script manually on your machine:

1. Double-click the `run_updater.bat` file, or run the following command in the directory:
   ```bash
   python refresh_events.py
   ```
2. Open `index.html` in your web browser to test locally.
