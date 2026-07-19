# GameAssist Attribution and Third-Party Notices

GameAssist is independently developed and maintained by **Mord Eagle**. This document acknowledges projects whose published work informed or contributed to GameAssist and preserves the notices required by their licenses.

References to TokenMod, StatusInfo, Roll20, Wizards of the Coast, or their contributors do not imply sponsorship, endorsement, support, or affiliation.

## GameAssist MarkerService

`GameAssist.MarkerService` is an original GameAssist implementation for resolving, reading, changing, and observing Roll20 token status markers. Its compatibility goals were informed by the established marker behavior of **TokenMod**, including custom marker tags, numbered markers, duplicate entries, and preservation of unrelated token markers.

- GameAssist component: `GameAssist.MarkerService`
- Component version: `1.0.0`
- Project acknowledged: TokenMod
- Author: The Aaron, Arcane Scriptomancer
- Reference release: TokenMod `0.8.88`
- Source: <https://github.com/Roll20/roll20-api-scripts/tree/master/TokenMod>
- License: MIT

MarkerService is independently maintained as part of GameAssist. It is not TokenMod and is not an official or endorsed TokenMod release.

## GameAssist ConditionService

`GameAssist.ConditionService` is an independently maintained GameAssist module for condition definitions, descriptions, selected-token menus, permission controls, and supported `!condition` compatibility workflows. It uses `GameAssist.MarkerService` for every marker read, write, toggle, and observation.

- GameAssist component: `ConditionService`
- Component version: `1.0.0`
- Compatibility and design foundation: StatusInfo
- Original author: Robin Kuiper
- Supplied reference release: StatusInfo `0.3.11`
- Published comparison release: StatusInfo package `0.3.12`
- Pinned Roll20 repository snapshot: `9d634d3149985dcf10333920b3f4c41f215f39fc`
- StatusInfo `0.3.12` file blob: `d3054aa8660f1eda47c424c4984e1850760e5c1a`
- Source: <https://github.com/Roll20/roll20-api-scripts/tree/master/StatusInfo>
- License: MIT

The published `0.3.12` package still declares internal script version `0.3.11`. Compared with the published `0.3.11` file, its executable change replaces the `character_sheet` attribute lookup with the character object's `charactersheetname` property. GameAssist does not adapt that sheet-specific synchronization path.

StatusInfo-derived compatibility concepts include the `!condition` command family, established configuration field names, the legacy `state.STATUSINFO` shape, the default condition catalog, and its marker associations. GameAssist independently implements the module lifecycle, chat presentation, permission feedback, validation, non-destructive migration, protected configuration, structured API, original concise descriptions, and MarkerService integration.

ConditionService is not StatusInfo and is not an official or endorsed StatusInfo release. Robin Kuiper is not responsible for GameAssist support, modifications, or compatibility decisions.

## TokenMod

**TokenMod** was created by **The Aaron, Arcane Scriptomancer** and distributed through the Roll20 API Scripts repository under the MIT License.

GameAssist acknowledges TokenMod as an important design reference for token editing, command compatibility, marker handling, and script-to-script interoperability. Any TokenMod-derived code included in a GameAssist release retains the applicable copyright and permission notice below.

- Project: TokenMod
- Author: The Aaron, Arcane Scriptomancer
- Source: <https://github.com/Roll20/roll20-api-scripts/tree/master/TokenMod>
- License: MIT

GameAssist is independently maintained and is not an official TokenMod release. The original author is not responsible for GameAssist support, changes, or compatibility decisions.

## StatusInfo

**StatusInfo** was created by **Robin Kuiper** and distributed through the Roll20 API Scripts repository under the MIT License.

GameAssist acknowledges StatusInfo as a design and compatibility reference for condition descriptions, condition menus, marker-driven status information, and related chat workflows. Any StatusInfo-derived code included in a GameAssist release retains the applicable copyright and permission notice below.

- Project: StatusInfo
- Author: Robin Kuiper
- Source: <https://github.com/Roll20/roll20-api-scripts/tree/master/StatusInfo>
- License: MIT

GameAssist is independently maintained and is not an official StatusInfo release. The original author is not responsible for GameAssist support, changes, or compatibility decisions.

## Roll20 API Scripts MIT Notice

TokenMod and StatusInfo are distributed through the Roll20 API Scripts repository under its MIT License.

Copyright (c) 2014-2018 Roll20 and/or Individual Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Repository license: <https://github.com/Roll20/roll20-api-scripts/blob/master/LICENSE>

## D&D 5E Rules Material

GameAssist does not reproduce non-SRD sourcebook text. D&D 5E (2014) rules descriptions included with GameAssist must either be original summaries or come from material released through the **System Reference Document 5.1** under the **Creative Commons Attribution 4.0 International License**.

- Official SRD information and downloads: <https://www.dndbeyond.com/srd/>
- Creative Commons Attribution 4.0: <https://creativecommons.org/licenses/by/4.0/>

Use of SRD material does not imply endorsement by Wizards of the Coast.

## GameAssist License

Original GameAssist code is released under the MIT License. See [`LICENSE`](LICENSE) for the GameAssist copyright and permission notice.
