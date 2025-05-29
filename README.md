# GameAssist
Roll20 Modular API Framework

## Overview

GameAssist is a modular, comprehensive Roll20 API toolkit designed to enhance gameplay through automated, streamlined, and customizable functionality. It integrates seamlessly into your Roll20 environment, providing consistent, efficient, and error-free game management, from concentration tracking and NPC management to automated HP assignment and critical fumble detection.

## Features

### Core System

* **Task Queue & Watchdog:** Ensures stable execution of automated tasks and recovers from errors gracefully.
* **Handler Tracking:** Centrally manages event and command bindings.
* **State Management:** Audits, seeds, and maintains isolated state data for robustness and ease of debugging.
* **RBAC Support:** Fine-grained access control for GM and player-specific interactions.

### Integrated Modules

#### CritFumble

* Detects critical misses and provides dynamic roll-table fumble results.
* Interactive menu for players to specify attack type upon critical failures.

#### NPC Manager

* Automatically manages NPC death markers based on HP thresholds.
* Provides real-time reporting on marker mismatches and NPC status.

#### Concentration Tracker

* Automatically prompts concentration checks upon damage.
* Supports normal, advantage, and disadvantage rolls.
* Dynamically updates token markers based on success or failure.

#### NPC HP Roller

* Assigns randomized HP to NPC tokens based on predefined dice formulas.
* Supports individual and bulk HP assignment.

## Installation

1. **Clone this repository** into your Roll20 API scripts.
2. Ensure required scripts (e.g., TokenMod) are available in your Roll20 game.
3. Copy the GameAssist script into your game's API script section.

## Usage

### Basic Commands

* `!ga-config`: Configure modules, view settings, and manage runtime configurations.
* `!ga-enable <module>` and `!ga-disable <module>`: Enable or disable modules during play.
* Module-specific commands:

  * **CritFumble:** `!critfail`, `!critfumble-help`
  * **NPC Manager:** `!npc-death-report`
  * **Concentration Tracker:** `!concentration`, `!cc`
  * **NPC HP Roller:** `!npc-hp-all`, `!npc-hp-selected`

### Advanced Configuration

GameAssist modules come with detailed configuration options. Adjust these settings using:

```
!ga-config set <module> <key>=<value>
```

Example:

```
!ga-config set CritFumble debug=true
```

## Development & Contributions

Contributions are welcome! Please follow these guidelines:

* **Fork the repository** and create feature-specific branches.
* Clearly document changes and include unit tests.
* Submit pull requests with detailed descriptions of enhancements or fixes.

### Running Tests

To ensure the stability of your changes, thoroughly test scripts within the Roll20 sandbox environment.

## Changelog

Refer to the included `CHANGELOG.md` for detailed version history and recent updates.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
