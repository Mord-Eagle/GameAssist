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
* Note: CritFumble points to Rollable Tables within your Roll20 game.

#### NPC Manager
*(Requires TokenMod API for automated marker/status integration.)* 

* Automatically manages NPC death markers based on HP thresholds.
* Provides real-time reporting on marker mismatches and NPC status.

#### Concentration Tracker
*(Requires TokenMod API for automated marker/status integration.)* 

* Automatically prompts concentration checks upon damage.
* Supports normal, advantage, and disadvantage rolls.
* Dynamically updates token markers based on success or failure.

#### NPC HP Roller
*(Requires TokenMod API for automated marker/status integration.)* 

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
 
### CritFumble Rollable Tables Integration

**Note:**  
The CritFumble module in GameAssist relies on Roll20’s *Rollable Tables* to determine critical miss outcomes. When a critical fumble is detected, CritFumble will automatically roll on the appropriate table and report the result in chat.

#### Required Table Names

CritFumble looks for the following Rollable Table names (case-sensitive):

- `CF-Melee` — for melee weapon fumbles
- `CF-Ranged` — for ranged weapon fumbles
- `CF-Thrown` — for thrown weapon fumbles
- `CF-Spell` — for spellcasting fumbles
- `CF-Natural` — for natural/unarmed attacks
- `Confirm-Crit-Martial` — for martial confirmation rolls (see below)
- `Confirm-Crit-Magic` — for magic confirmation rolls (see below)

> *Note: While I considered building the critical fumble table directly into the CritFumble module itself, I intentionally opted to leverage Roll20's native Rollable Tables. This decision was made to maximize flexibility and allow Dungeon Masters to fully customize fumble outcomes according to their table’s style and preferences. However, if you would prefer a version of CritFumble with prebuilt tables included—or have ideas for curated defaults—please let me know by opening a feature request or sharing your feedback.*

> **Recommendation:** For balance, set up confirmation rolls so that:
> - **Martial attacks confirm on a d8** (i.e., use an 8-entry table or roll a d8; confirmed on a 1).
> - **Magic attacks confirm on a d4** (i.e., use a 4-entry table or roll a d4; confirmed on a 1).
>  
> *Rationale:* Martial characters often attack more frequently, making them more likely to roll a 1 by pure probability. Using a higher die for confirmation keeps things fair and reduces frequency of confirmed fumbles.

#### How to Create a Rollable Table in Roll20

1. Open your game in Roll20.
2. Go to the **Collection** tab (icon: bulleted list).
3. Under *Rollable Tables*, click “+ Add”.
4. Name your table **exactly** as listed above (e.g., `CF-Melee`).
5. Add entries to the table (see below for examples).
6. Set the *weight* for each entry if you want some outcomes to be more or less likely (default is 1).
7. Click “Save Changes” to finish.

#### Entry Formatting and Examples

> **Tip:** For all entries:
> - Keep descriptions short and clear.
> - Avoid harsh penalties unless your table prefers high-lethality.
> - Use consistent language.
> - The **weight** determines the chance of each result; a higher weight means more likely to roll that result.

**Example for a Magic Fumble Table using a d8 (`CF-Spell`):**

- `1: Spell Backfire – Your spell fizzles; you take half damage.` (Weight: 1)
- `2-4: Magical Feedback – Take 2d4 force damage.` (Weight: 3)
- `5: Magical Backlash – Roll a DC 13 DEX Save or be knocked prone.` (Weight: 1)
- `6-7: Loss of Focus – You lose your reaction this turn.` (Weight: 2)
- `8: Double Trouble – Roll twice on this table and suffer both effects. Reroll 8s.` (Weight: 1)

#### Troubleshooting

If CritFumble cannot find a required table, it will alert the GM.  
- Ensure table names are exactly as listed above.
- Each table must have at least one entry.

#### Customization

You can create your own tables or modify existing entries and weights to match your group’s style. For help, sample tables, or to report issues, visit:  
[https://github.com/Mord-Eagle/GameAssist/issues](https://github.com/Mord-Eagle/GameAssist/issues)

### Advanced Configuration

GameAssist modules come with detailed configuration options. Adjust these settings using:

```
!ga-config set <module> <key>=<value>
```

Example:

```
!ga-config set CritFumble debug=true
```

## Development, Feedback & Contributions

GameAssist is an open-source project that thrives on community engagement—whether you want to contribute code, report issues, or help shape future features.

**How to Contribute:**

* Fork the repository and create feature-specific branches.
* Clearly document your changes and include unit tests where possible.
* Submit pull requests with detailed descriptions of enhancements or fixes.

**Feature Requests and System Support:**

If you would like to see GameAssist support additional game systems (such as Pathfinder, Starfinder, or other TTRPGs), need compatibility with specific character sheets, or have suggestions for module enhancements, please open a feature request on the [GitHub Issues page](https://github.com/Mord-Eagle/GameAssist/issues).  
Your feedback and collaboration directly inform development priorities and future releases.

### Running Tests

To ensure the stability of your changes, thoroughly test scripts within the Roll20 sandbox environment.

## Changelog

Refer to the included `CHANGELOG.md` for detailed version history and recent updates.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
