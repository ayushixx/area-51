# iQOO Sentinel AI Interactive Prototype

> **"Ready before you tap play."**

This is an interactive prototype for the **iQOO Sentinel AI**, a concept that demonstrates how AI can proactively prepare a gaming smartphone for a session.

The prototype visualizes the pre-game workflow for a popular mobile game (BGMI). It shows how the device intelligently readies itself by managing system resources, verifying the network, and implementing a charge strategy, all based on a predictive "Habit Model."

## Overview

The Sentinel AI concept moves beyond reactive performance management. Instead of only responding to in-game demands, it uses a learned habit model to anticipate when a user is about to play. This allows the device to enter a "Pre-game window" and prepare the system in advance.

This prototype simulates that experience, providing a visual dashboard of the device's readiness.

## Features

- **Predictive Pre-game Window:** The interface simulates entering a pre-game state based on a habit model confidence threshold.
- **Gaming Readiness Score:** A combined score (0-100) that reflects the device's overall readiness, factoring in battery, thermal, network, memory, and charging status.
- **Live System Metrics:** Displays key performance indicators in real-time:
    - Thermal (°C)
    - Battery (%)
    - Network Status
    - Free Memory (%)
- **Automated Preparation Tasks:** The prototype visualizes the AI performing several actions to get the device ready:
    - Verifying the network connection
    - Setting a charging strategy
    - Trimming background applications
    - Pre-cooling the device
    - Loading the game profile

## How It Works

1.  **Prediction:** The "Habit Model" detects a pattern and predicts an upcoming gaming session.
2.  **Preparation:** Once the confidence threshold is crossed, the device enters a "Pre-game window."
3.  **Optimization:** The Sentinel AI begins a series of optimizations to ensure peak performance (clearing memory, cooling the device, etc.).
4.  **Readiness:** The system aims to be fully ready by the predicted start time (e.g., 8:00 PM).

## Technologies Used

This is a front-end interactive prototype. For a detailed list of the technologies and tools used, please see the [STACK.md](STACK.md) file.


LINK :

https://area-51-4i0upkd7a-ayushisharma94644-9502s-projects.vercel.app/
