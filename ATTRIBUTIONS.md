# GameAssist Attribution and Third-Party Notices

This document records the provenance of GameAssist components, the license notices that must travel with adapted code, and the distinction between upstream projects and independently maintained GameAssist services.

GameAssist is independently developed and maintained by Mord Eagle. References to upstream projects identify technical provenance and do not imply sponsorship, endorsement, support, or ongoing participation by the original authors.

## Current v0.1.5.0 Release

### GameAssist MarkerService

`[GAMEASSIST:CORE:MARKERSERVICE]` is an original GameAssist implementation and the sole GameAssist authority for Roll20 marker identity, reads, writes, toggles, preservation, and observation.

Its compatibility goals and status-marker behavior were informed by TokenMod's established Roll20 behavior, particularly custom marker tags, duplicate entries, numbered overlays, and observer expectations.

- GameAssist component: `GameAssist.MarkerService`
- GameAssist service version: `1.0.0`
- Upstream project acknowledged: TokenMod
- Upstream author: The Aaron, Arcane Scriptomancer
- Reference baseline: TokenMod `0.8.88`
- Upstream source: https://github.com/Roll20/roll20-api-scripts/tree/master/TokenMod
- License: MIT, as distributed by the Roll20 API Scripts repository

GameAssist v0.1.5.0 does not bundle the standalone TokenMod or StatusInfo command implementations wholesale. Future adapted services must add their exact implementation baselines and adaptation records before release.

## Planned GameAssist Services

The final GameAssist-branded module names are owner-authoritative and must be selected before their MECHSUITS sections are created.

### General Token Service

The future GameAssist general token service will be independently branded and maintained. It may preserve selected `!token-mod` behavior as a compatibility surface, but it must not present itself as an official TokenMod release.

Before implementation, record:

- the exact TokenMod version and commit used;
- which files, functions, or command behaviors were adapted;
- which portions were independently implemented;
- compatibility intentionally preserved, changed, or omitted;
- state migration behavior;
- the complete applicable MIT notice.

Attribution:

- Original project: TokenMod
- Original author: The Aaron, Arcane Scriptomancer
- Current candidate baseline: TokenMod `0.8.88`
- Source: https://github.com/Roll20/roll20-api-scripts/tree/master/TokenMod

Recommended module notice:

> This GameAssist service is independently maintained and substantially redesigned for the GameAssist architecture. It contains portions adapted from the MIT-licensed TokenMod project by The Aaron where identified in the implementation record. It is not an official TokenMod release and is not endorsed or supported by the original author.

### Condition Information Service

The future GameAssist condition-information service will be independently branded and maintained. It may preserve selected `!condition` workflows as a compatibility surface, but it must not present itself as an official StatusInfo release.

Before implementation, record:

- the exact StatusInfo version and commit used;
- which files, functions, condition records, or workflows were adapted;
- which portions were independently implemented;
- compatibility intentionally preserved, changed, or omitted;
- state migration behavior;
- the complete applicable MIT notice;
- the license and source of any bundled game-rule descriptions.

Attribution:

- Original project: StatusInfo
- Original author: Robin Kuiper
- Supplied reference baseline: StatusInfo `0.3.11`
- Current Roll20 repository version at the time of this record: `0.3.12`
- Source: https://github.com/Roll20/roll20-api-scripts/tree/master/StatusInfo

Issue #26 must select and pin the actual baseline after comparing the supplied `0.3.11` reference with the currently published version.

Recommended module notice:

> This GameAssist service is independently maintained and substantially redesigned for the GameAssist architecture. It contains portions adapted from the MIT-licensed StatusInfo project by Robin Kuiper where identified in the implementation record. It is not an official StatusInfo release and is not endorsed or supported by the original author.

## Roll20 API Scripts MIT Notice

TokenMod and StatusInfo are distributed through the Roll20 API Scripts repository under its MIT license.

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

Repository license: https://github.com/Roll20/roll20-api-scripts/blob/master/LICENSE

## D&D 5E Rules Text

Condition names and mechanics may be implemented independently, but copied descriptive text requires a verified source and license.

For D&D 5E (2014) rules text, GameAssist should use System Reference Document 5.1 material released under Creative Commons Attribution 4.0 International, or use original summaries that do not copy non-SRD book text.

Before shipping SRD-derived descriptions:

- verify each description against SRD 5.1 rather than an unofficial transcription;
- include the attribution statement required by the SRD 5.1 Creative Commons preamble;
- identify GameAssist modifications where required by CC BY 4.0;
- do not imply Wizards of the Coast endorsement.

Official SRD licensing and downloads: https://www.dndbeyond.com/srd/

## Implementation Record Requirements

Every release that introduces or materially updates adapted code must record:

1. Upstream project, author, source URL, version, and commit.
2. Applicable license and preserved notice.
3. Adapted files or functional areas.
4. Original GameAssist additions and architectural changes.
5. Compatibility retained, intentionally changed, or omitted.
6. State migration and rollback behavior.
7. Verification performed against the upstream baseline.
8. Any third-party content licenses beyond the software license.

These records belong in the relevant MECHSUITS section footer, this document, and the release changelog.

## Contacting Original Authors

The MIT license does not require advance notice, approval, or a response from the original authors when its conditions are followed.

A brief courtesy message is nevertheless appropriate after the first working integration is public. It should:

- thank the author;
- identify the original project and exact baseline;
- link to GameAssist and this attribution record;
- explain that the adaptation is independently maintained;
- avoid requesting endorsement, support, or an obligation to review;
- offer to correct any attribution mistake promptly.

No response should be treated as required permission, approval, or endorsement.
