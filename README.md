# Entrenament de la memòria

A small, framework-free web app for a 6-week (3 sessions/week) memory-training
research protocol. Pure HTML/CSS/JavaScript — runs by opening `index.html`
directly in a browser, no build step, no server, no accounts.

The UI and word/association content are in **Catalan**. Code comments are in
English.

## Project structure

```
index.html
css/styles.css
js/data/participants.js     # authorized participants (CSV-formatted string, see below)
js/data/words.js            # 3 balanced sets of ~50 Catalan words each (Exercise 3)
js/data/associations.js     # 3 balanced sets of 15 word pairs each (Exercise 4)
js/data/emojis.js           # emoji sets for Exercises 1 and 2
js/data/assessmentWords.js  # 2 disjoint 15-word lists for the baseline/final assessment
js/core/utils.js            # generic helpers (shuffle, text normalization, dates...)
js/core/storage.js          # localStorage: sessions, stats, streaks, set assignment
js/core/sheets.js           # sends each finished session/assessment to Google Sheets
js/core/app.js              # screen navigation / main controller (loaded last)
js/exercises/*.js           # one file per exercise (memory, sequences, words,
                             # associations, positions) + assessment.js (the
                             # baseline/final memory test, not one of the 5)
```

## Managing participants

Edit `js/data/participants.js`. It's a plain JS file containing a
CSV-formatted string (`name,code` per line) that the app parses itself:

```js
const PARTICIPANTS_CSV = `
name,code
Emma,A014
...
`;
```

**Why not a real `.csv` file?** The app is meant to be opened directly as a
local file (`file://…/index.html`), and browsers block `fetch()` of local
files under that protocol (you'd get a CORS error in Chrome). Keeping the
list as a `.js` file loaded via `<script>` sidesteps that while still being
edited exactly like a CSV — one line per participant, comma-separated. If you
ever host this app on a real web server instead of opening it locally, it
would be straightforward to switch this file to a genuine `fetch('participants.csv')`
call.

Login matches name and code **exactly** (after trimming stray whitespace),
per the spec.

### Self-registration (open sign-up)

The login screen has an "Ets nou/nova? Crea un compte" link that leads to a
dedicated sign-up screen (`#screen-register`). Unlike logging in, sign-up
only asks for a **name** - the participant doesn't invent their own code:

1. They type the name they want to be known as. The app checks it's not
   already taken (case-insensitively) against everyone it knows about -
   `participants.js`, this device's own past registrations, and anyone
   who's registered on other devices (see cross-device recognition below).
2. If it's free, the app generates a fresh code (`generateUniqueParticipantCode()`
   in app.js - format `P` + 3 zero-padded digits, e.g. `P042`, chosen not
   to collide with anyone already known) and creates the account.
3. The generated code is shown full-screen, large and selectable
   (`#screen-register-code`), with an explicit "Ja l'he guardat, continuar"
   button the participant has to press before moving on - so they have a
   clear moment to write it down. From then on they log in the normal way,
   with the name they chose and this code.

This means access is no longer restricted to a researcher-curated list -
anyone who reaches the page can create an account and start participating.

Self-registered accounts are stored in a separate localStorage list
(`memoryTraining_selfRegistered`, see `storage.js`) and merged with
`PARTICIPANTS_CSV` at load time - they're **not** written back into
`participants.js`, since a static file the browser can't write to. Account
creation is also sent to Google Sheets as a `type: "registration"` row (see
the schema above).

### Cross-device recognition

At sign-up (name-uniqueness check) and at login (name/code match), the app
asks the Apps Script's `doGet` endpoint (JSONP - see the code above) about
exactly one thing at a time - **never the full participant list**:

- `sheets.js#checkRemoteNameTaken(name)` → `?checkName=...` → resolves to
  `true`/`false`. Used at sign-up. The response reveals nothing about who
  holds the name or any other participant.
- `sheets.js#fetchRemoteParticipantByCode(code)` → `?code=...` → resolves
  to that one participant's summary (or `null` if that code has no rows at
  all). Used at login (for both a name+code this device already knows
  locally, to pick up anything new, and one it doesn't) and once more
  during sign-up to confirm a freshly generated code isn't already used by
  someone on another device.

What a found summary does, via `storage.js#mergeRemoteSummary` (app.js's
`loadRemoteParticipants` no longer exists - each check is now made
individually, right when it's needed, instead of fetching everyone
up front):

1. Adds that one name+code to this device's in-memory participant list if
   it doesn't already know them, so login/uniqueness checks recognize an
   account created (or CSV code only ever used) on another device.
2. Folds their baseline-done, final-done, and trained-dates status into
   this device's local record - so logging in on a new device with an
   account that already passed the baseline elsewhere goes straight to the
   normal Welcome screen instead of being sent through the baseline
   assessment again, a session already completed elsewhere today correctly
   blocks a second one, and the final assessment unlocks once the program
   is complete regardless of which devices the 18 sessions were spread
   across.

This is a **summary** sync, not a full one: the merged-in placeholder
sessions/assessments carry only what's needed for those checks and for the
progress dashboard's day-count/streak/average/best-score numbers (date and
total score for sessions; done-or-not and score for assessments) - not the
per-exercise score breakdown, raw timing/moves data, or exact forgotten
words for something completed on a different device (those still only
live in the Sheet and in that other device's own localStorage). Synced-in
entries are marked `syncedFromOtherDevice: true` if you ever need to tell
them apart from ones recorded locally. Training from two different devices
on two different days works fine (both days show up); training the *same*
day from two devices before either has synced could still let both
sessions through - an inherent limit of client-only storage with no real
backend, not something worth engineering around here.

A few other things worth knowing:

- These checks need a network connection and a configured
  `GOOGLE_SCRIPT_URL`. Offline, or before you've deployed the Apps Script
  (or before redeploying it after this or any later update to `doGet`/
  `doPost`), sign-up, login, and the daily/final-assessment gates all still
  work exactly as before *on their own device* - they just can't see
  anything that happened elsewhere yet.
- Generated codes aren't checked for accidental collision with codes you
  might add to `participants.js` *later* - if you hand-assign a code that
  happens to match one already self-registered, whoever registered first
  keeps it functionally (exact name+code matching still works correctly),
  but it's simplest to keep your own codes on a different pattern than `P###`.
- `doGet` deliberately never returns more than one participant's data (or
  a bare `taken` boolean) per request, however it's called - see the
  privacy note below and the "Data storage & privacy notes" section for
  what this does and doesn't protect.
- If you want a closed, researcher-only cohort instead, this feature can be
  removed by pointing the "Ets nou/nova?" link away from `#screen-register`
  (or hiding it) - `doGet`, `checkRemoteNameTaken()`,
  `fetchRemoteParticipantByCode()`, `mergeRemoteSummary()`, and the
  register screens then become unused and can be removed too.

### Demographic questions at sign-up

After the name step (and before the code is generated), sign-up has one
more required screen (`#screen-register-demographics`): age, gender,
highest education level, and current occupation. All four are required -
the "Continuar" button is blocked with an error until every field has a
value.

The option lists (in `index.html`) follow standard Catalan/Spanish public
statistics categories rather than an ad-hoc list:

- **Gender** offers Home / Dona / No binari / Prefereixo no dir-ho, not a
  binary-only choice - reflecting Catalan and Spanish law recognizing
  gender identity beyond the binary (Llei 11/2014 in Catalonia; the 2023
  Spanish "llei trans", Ley 4/2023).
- **Education level** and **occupation** follow the broad categories
  Idescat (the Catalan statistics institute) uses in its own surveys
  (`Sense estudis` through `Doctorat`; `Estudiant` through `Altres`),
  rather than a from-scratch list.

This is a reasonable default, not a substitute for your own ethics
board/IRB's approved wording if your protocol requires specific phrasing -
edit the `<option>` lists directly if so. Demographics are stored once per
participant (`demographics` in the record - see storage.js) and are never
asked again or editable afterward from the UI. They're sent to Google
Sheets as part of the same `type: "registration"` row (see the schema
below) - **not** exposed through the `doGet` endpoint used for cross-device
recognition (see above): `doGet` only ever answers "what do you know about
this one code?" or "is this name taken?", one participant (or a bare
boolean) at a time, and age/gender/education/occupation are deliberately
left out of even that single-participant response - so demographics aren't
reachable by anyone who just has the Apps Script URL, regardless of which
code or name they ask about.

## Balanced difficulty sets, and content advancing session to session

Words, associations and memory-board symbols each come in 3 pre-built,
difficulty-balanced **tracks**. A participant's code is deterministically
hashed (`codeToSetIndex` in `utils.js`) to always pick the same track
across every session, so difficulty never drifts for a given participant,
while two different participants may land on different tracks.

Within a track, content is **day-indexed, not randomly re-sampled**: each
of the 3 data files nests one more level than the track -
`WORD_SETS[track][sessionIndex]`, `ASSOCIATION_SETS[track][sessionIndex]`,
`MEMORY_BOARD_SETS[track][sessionIndex]` - where `sessionIndex` is how many
sessions that participant has already completed (0 on their first day, 1 on
their second, ...; see `currentSessionIndex` in app.js, computed once per
session in `startNewSession()` and passed to whichever exercise is opened).
Earlier versions of this app randomly sampled each day's words/pairs from
one small shared pool per track, which meant participants would quickly see
(and start memorizing) the same content over and over - defeating the point
of a repeated memory-training protocol. Now each of the 18 planned sessions
(`PROGRAM_TOTAL_SESSIONS`) gets its own fixed word list and association-pair
list that's never repeated within that track across the whole program. If a
participant keeps training past session 18, content cycles back to session
1's list rather than erroring (`sessionIndex % track.length` in each
exercise module) - extend the data files with more per-track sessions if
you'd rather it not repeat at all beyond 18.

The memory board is the one exception: there aren't 18 sessions' worth
(144) of simple, mutually-unambiguous, universally-rendered emoji per track
to draw on without resorting to near-duplicate symbols that would make the
matching game confusing rather than harder. Its 3 tracks instead each hold
a pool of 48 symbols split into 6 groups of 8, cycling through those 6
groups across the 18 sessions (a set of 8 symbols reappears every 6th
session, not every single session like before) - see the comment in
`data/emojis.js` for the exact reasoning. This matters less for Memòria
than for the other exercises anyway: its actual memory task is spatial
(which position matches which), and the board LAYOUT is freshly shuffled
every session regardless of symbol repetition.

Exercises 2 (Seqüències) and 5 (Posicions) were never affected by this -
both already generate fresh random content every round from a shared pool
(sequence emojis) or from scratch (grid positions), so there was nothing to
fix for them; their `start()` functions accept the same `sessionIndex`
parameter as the other three purely for a consistent call signature in
`app.js#openExercise()`, and ignore it.

To add more variety or extend beyond 18 planned sessions, add more
per-track entries to `WORD_SETS`/`ASSOCIATION_SETS`/`MEMORY_BOARD_SETS`
(keeping each session's word/pair/symbol count exactly 12/10/8) and bump
`PROGRAM_TOTAL_SESSIONS` in `app.js` to match. The data files were
generated with a script that deduplicates and partitions a large word/pair
pool automatically - hand-editing 3×18 nested arrays directly is error
prone at this size, so scripting a similar pass is worth it if you extend
them significantly.

## Google Sheets integration

Each finished session **and** each baseline/final assessment is sent
automatically (no extra button) to a Google Sheet via a Google Apps Script
"Web App". Set up your own:

> **If you already have rows in an existing Sheet from an earlier version
> of this app**: this column layout adds the raw-data columns (Memory Time,
> Memory Moves, Sequences Correct Rounds, ...) **interleaved next to each
> score**, not only appended at the end like the earlier `Type`/assessment/
> demographics additions were. That means old rows' values will land under
> the wrong headers if you just paste the new `doPost`/`doGet` into your
> existing sheet without also touching existing rows. Safest options: start
> a fresh sheet/tab for new data going forward (simplest, keeps old data
> intact but separate), or manually insert the new empty columns into your
> existing sheet at the matching positions before redeploying so old rows
> shift into the right place. Either way, this is a one-time concern - once
> your columns match this layout, every future addition so far has been,
> and future ones should continue to be, append-only at the end.

1. Create a new Google Sheet. Add a header row (optional but recommended):

   `Name | Code | Type | Date | Time | Total Time | Memory Score | Memory Time (s) | Memory Moves | Sequences Score | Sequences Correct Rounds | Sequences Total Rounds | Words Score | Words Correct | Words Total | Words Forgotten | Associations Score | Associations Successes | Associations Errors | Associations Total | Positions Score | Positions Correct Rounds | Positions Total Rounds | Total Score | % Correct | Assessment Correct | Assessment Total | Assessment Score | Assessment Time (s) | Assessment Forgotten Words | Age | Gender | Education Level | Occupation`

   `Type` is `training`, `baseline`, `final`, or `registration`. Training
   rows fill Total Time through % Correct - the score *and* the raw data
   behind it for each exercise (e.g. Memory Time/Moves alongside Memory
   Score) - and leave the Assessment/Age..Occupation columns blank;
   baseline/final rows fill only the Assessment columns (including the raw
   recall time and the exact forgotten-word list); `registration` rows
   (logged when someone self-registers - see below) fill Name/Code/Type/
   Date/Time plus Age/Gender/Education Level/Occupation, and leave
   everything else blank.
2. In the Sheet, go to **Extensions → Apps Script**.
3. Replace the default code with:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.name,
       data.code,
       data.type || "training",
       data.date,
       data.time,
       data.totalTime ?? "",
       data.memoryScore ?? "",
       data.memoryTimeSeconds ?? "",
       data.memoryMoves ?? "",
       data.sequenceScore ?? "",
       data.sequenceCorrectRounds ?? "",
       data.sequenceTotalRounds ?? "",
       data.wordHits ?? "",
       data.wordsCorrect ?? "",
       data.wordsTotal ?? "",
       data.wordsForgotten ?? "",
       data.associationHits ?? "",
       data.associationSuccesses ?? "",
       data.associationErrors ?? "",
       data.associationTotal ?? "",
       data.positionScore ?? "",
       data.positionCorrectRounds ?? "",
       data.positionTotalRounds ?? "",
       data.totalScore ?? "",
       data.percentCorrect ?? "",
       data.assessmentCorrect ?? "",
       data.assessmentTotal ?? "",
       data.assessmentScore ?? "",
       data.assessmentTimeSeconds ?? "",
       data.assessmentForgottenWords ?? "",
       data.age ?? "",
       data.gender ?? "",
       data.educationLevel ?? "",
       data.occupation ?? ""
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({ status: "success" }))
       .setMimeType(ContentService.MimeType.JSON);
   }

   // Lets the app look up cross-device info WITHOUT ever exposing more
   // than what was specifically asked about (see "Cross-device
   // recognition" below) - answers exactly one of two scoped questions
   // per request, never the whole participant list:
   //   ?code=XXX     -> that ONE participant's summary, or null if no
   //                    rows exist for that code
   //   ?checkName=Y  -> { taken: true/false } for whether Y is already
   //                    used by anyone, with no other data revealed
   // Returns JSONP - a plain fetch() can't read an Apps Script response
   // cross-origin (no CORS headers), but a <script> tag isn't subject to
   // CORS, so this is the standard workaround.
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var rows = sheet.getDataRange().getValues();
     var callback = e.parameter.callback;

     function respond(payload) {
       var json = JSON.stringify(payload);
       if (callback) {
         return ContentService
           .createTextOutput(callback + "(" + json + ");")
           .setMimeType(ContentService.MimeType.JAVASCRIPT);
       }
       return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
     }

     if (e.parameter.checkName) {
       var wantedName = String(e.parameter.checkName).toLowerCase();
       var taken = false;
       for (var i = 1; i < rows.length; i++) {
         var rowName = rows[i][0];
         if (rowName && String(rowName).toLowerCase() === wantedName) { taken = true; break; }
       }
       return respond({ taken: taken });
     }

     if (e.parameter.code) {
       var wantedCode = String(e.parameter.code);
       var summary = null;
       for (var j = 1; j < rows.length; j++) {
         if (rows[j][1] !== wantedCode) continue;
         if (!summary) {
           summary = {
             name: rows[j][0], code: wantedCode,
             baselineDone: false, finalDone: false,
             baselineScore: null, finalScore: null,
             trainedDates: [], totalScores: []
           };
         }
         if (rows[j][0]) summary.name = rows[j][0]; // keep the latest non-blank name seen
         var type = rows[j][2];
         var date = rows[j][3];
         if (type === "baseline") { summary.baselineDone = true; summary.baselineScore = rows[j][27]; }
         if (type === "final") { summary.finalDone = true; summary.finalScore = rows[j][27]; }
         if (type === "training" && date) {
           summary.trainedDates.push(date);
           summary.totalScores.push(rows[j][23]);
         }
       }
       return respond(summary);
     }

     // No recognized query - respond with nothing, never the full dataset.
     return respond(null);
   }
   ```

   `doGet` never returns more than one participant's data (or a plain
   `taken` boolean) per request - anyone with the Apps Script URL can only
   ever ask "what do you know about code X?" or "is name Y taken?", not
   list everyone. Column indices (`rows[j][23]`, `rows[j][27]`, ...) are
   positional, matching the header row above - if you ever reorder or
   insert columns, update these indices to match (0-based, so column 24
   "Total Score" is index 23).

   (`??` requires the V8 runtime, which is the default for new Apps Script
   projects - **Project Settings → check "Enable V8 runtime"** if you're on
   an older project.)

4. Click **Deploy → New deployment**. Choose type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Deploy, and copy the generated Web App URL.
6. Paste it into `GOOGLE_SCRIPT_URL` at the top of `js/core/sheets.js`.

**If you already had an earlier version of this script deployed:** editing
the script's code alone does *not* update the live URL - Apps Script web
app deployments are pinned to a version. After pasting in the updated code,
go to **Deploy → Manage deployments → (pencil/edit icon) → Version: New
version → Deploy**. The URL stays the same; only the code behind it
changes. Skipping this step means assessment rows will keep arriving with
their score columns blank, since the old code doesn't know about them yet.

That's it — no further changes needed. The app POSTs with
`mode: "no-cors"` (Apps Script doesn't return CORS headers, so a normal
cross-origin `fetch` can't read the response anyway). This means the app
can detect **network-level** failures (offline, unreachable) and will show
*"No s'ha pogut desar les dades. Comprova la connexió a internet."* in that
case, but it cannot detect an error happening *inside* the Apps Script
itself (e.g. a broken sheet). Check the sheet occasionally, or watch
**Apps Script → Executions** for errors, to confirm data is arriving.

## Data storage & privacy notes

- All participant session history lives in the browser's `localStorage`
  (key `memoryTraining_participants`), scoped per participant code. This is
  what drives the "one session per day" restriction and the personal
  progress dashboard ("El meu progrés").
- Because this is `localStorage`, full-detail history is per-browser/device -
  every session is still safely recorded in the Google Sheet regardless.
  A participant switching devices or clearing site data gets a *summary*
  of their baseline/final/trained-days status pulled back in automatically
  (see "Cross-device recognition" above), just not the per-exercise detail
  behind each score, which stays in the Sheet and on the original device.
- The Apps Script's `doGet` endpoint is deliberately scoped so that anyone
  who has the URL - which, since "security is not a concern" per the
  project spec, is anyone who can view this app's source - can only ever
  ask about **one** participant's code, or get a plain yes/no on whether
  one name is taken. There's no request that lists or dumps every
  participant; see "Cross-device recognition" above for exactly what a
  single lookup does and doesn't return.
- Beyond that endpoint scoping, "security is not a concern" per the
  project spec still applies everywhere else: there's no other
  server-side validation, and the CSV check and one-per-day gate are
  purely client-side.

## Adjusting the program length

`PROGRAM_WEEKS` and `SESSIONS_PER_WEEK` at the top of `js/core/app.js`
control the "X of Y sessions" completion percentage shown on the progress
screen (default: 6 weeks × 3 sessions = 18 total). This is also what
unlocks the final assessment (see below): it becomes available once a
participant has completed `PROGRAM_TOTAL_SESSIONS` daily sessions.

**This number is now also coupled to the daily content** (see "Balanced
difficulty sets, and content advancing session to session" below):
`WORD_SETS`/`ASSOCIATION_SETS`/`MEMORY_BOARD_SETS` each hold exactly 18
sessions' worth of content per track, matching the default
`PROGRAM_TOTAL_SESSIONS`. If you change the program length without also
resizing those data files, content will still work (each exercise wraps
with `% track.length`), but it'll start repeating at whatever session count
the data files actually have, not at your new program length.

## Baseline / final assessment

Separate from the 5 daily exercises, there's a one-time 15-word memory
test used as a pre/post research measure:

- **Baseline**: forced immediately after a participant's very first
  successful login, before they can see the Welcome screen or start any
  daily training. Uses `ASSESSMENT_WORD_SET_BASELINE`.
- **Final**: unlocked on the Welcome screen (as a "Fer l'avaluació final"
  button) once the participant has completed the full program
  (`PROGRAM_TOTAL_SESSIONS` sessions). Uses `ASSESSMENT_WORD_SET_FINAL`.

Both use the same format (15 words shown for 35s, then free recall,
accent/case-insensitive matching - see `js/exercises/assessment.js`) but
deliberately **different, equated word lists** (similar difficulty and
average length, no repeats, no obvious semantic grouping - see the
comments in `js/data/assessmentWords.js`), so a participant's "improvement"
isn't partly just having memorized the specific baseline list over six
weeks. Neither assessment is one of the 5 daily exercises: it doesn't
touch the daily menu, the progress bar, or the one-session-per-day gate,
and each can only ever be completed once per participant. Results show up
on the "El meu progrés" screen and are sent to Google Sheets with
`type: "baseline"` / `type: "final"` (see the Google Sheets section above).

## Memory board size

Exercise 1 (Memòria) uses a 4×4 board (8 pairs) - deliberately kept small
so a round finishes quickly. To change it, edit the arrays in
`js/data/emojis.js` (`MEMORY_BOARD_SETS`) to have as many symbols as you
want pairs, and adjust `.memory-board { grid-template-columns: ... }` in
`css/styles.css` to match (currently `repeat(4, 1fr)`).
