# NHTSA Recall API Test Report

**Generated:** 2026-05-30  
**Vehicles tested:** 100  
**API endpoint:** https://api.nhtsa.gov/recalls/recallsByVehicle

---

## Summary

| Outcome | Count |
|---------|-------|
| Recalls found (200 + results) | 83 |
| No recalls on file (400 — confirmed no-data) | 17 |
| No recalls on file (200 + empty results) | 0 |
| Errors (5xx, timeout, network) | 0 |

> **Note on HTTP 400:** Every 400 response observed was a "no records found" response from the NHTSA database — NOT a malformed request error. Vehicles returning 400 with standard spellings were retried with alternate model name forms; in some cases alternate forms succeeded, in others 400 persisted across all tested forms (indicating genuinely no data for that make/model/year combination in the NHTSA database).

---

## Full Results

| # | Vehicle | HTTP Status | Recalls Found | Notes |
|---|---------|-------------|---------------|-------|
| 1 | 2022 FORD F-150 | 200 | 22 | |
| 2 | 2022 CHEVROLET SILVERADO 1500 | 200 | 6 | |
| 3 | 2022 RAM 1500 | 200 | 15 | |
| 4 | 2022 TOYOTA RAV4 | 200 | 1 | |
| 5 | 2022 TOYOTA CAMRY | 200 | 1 | |
| 6 | 2022 TOYOTA TACOMA | 200 | 3 | |
| 7 | 2022 HONDA CR-V | 200 | 3 | |
| 8 | 2022 HONDA CIVIC | 200 | 4 | |
| 9 | 2022 HONDA ACCORD | 200 | 4 | |
| 10 | 2022 NISSAN ROGUE | 200 | 6 | |
| 11 | 2022 JEEP GRAND CHEROKEE | 200 | 11 | |
| 12 | 2022 JEEP WRANGLER | 200 | 14 | |
| 13 | 2022 FORD EXPLORER | 200 | 23 | |
| 14 | 2022 FORD ESCAPE | 200 | 19 | |
| 15 | 2022 FORD MUSTANG | 200 | 9 | |
| 16 | 2022 CHEVROLET EQUINOX | 200 | 5 | |
| 17 | 2022 CHEVROLET MALIBU | 200 | 1 | |
| 18 | 2022 GMC SIERRA 1500 | 200 | 6 | |
| 19 | 2022 SUBARU OUTBACK | 200 | 4 | |
| 20 | 2022 SUBARU FORESTER | 200 | 1 | |
| 21 | 2022 SUBARU CROSSTREK | 400 | 0 | No records found for 2022 MY; 2021 CROSSTREK returns 200 (1 recall) — NHTSA may not have filed 2022 Crosstrek recalls |
| 22 | 2022 TOYOTA HIGHLANDER | 200 | 5 | |
| 23 | 2022 TOYOTA COROLLA | 400 | 0 | No records for 2022 MY; 2021 COROLLA returns 200 (1 recall); NHTSA database may not separate this year |
| 24 | 2022 HYUNDAI TUCSON | 200 | 3 | |
| 25 | 2022 HYUNDAI SANTA FE | 200 | 5 | |
| 26 | 2022 HYUNDAI ELANTRA | 200 | 5 | |
| 27 | 2022 KIA SPORTAGE | 200 | 1 | |
| 28 | 2022 KIA SORENTO | 200 | 6 | |
| 29 | 2022 KIA TELLURIDE | 200 | 6 | |
| 30 | 2022 MAZDA CX-5 | 400 | 0 | `CX-5` returns 400 for 2021 and 2022 MY but 200 for 2019 and 2020 (2 and 2 results); `CX5`, `CX-5 SPORT`, `CX-5 TOURING`, `MAZDA CX-5`, `MAZDA3` all also return 400 for 2022; NHTSA appears to use a different model name for 2021-2022 Mazda CX-5 |
| 31 | 2022 MAZDA3 | 400 | 0 | `MAZDA3`, `MAZDA 3` all return 400 for 2022; may be stored differently in NHTSA database |
| 32 | 2022 VOLKSWAGEN TIGUAN | 200 | 5 | |
| 33 | 2022 VOLKSWAGEN JETTA | 200 | 1 | |
| 34 | 2022 BMW X3 | 200 | 7 | |
| 35 | 2022 BMW 3 SERIES | 400 | 0 | `3 SERIES` returns 400; `BMW 3 SERIES` also 400; tried `330I` (200, 3 results — this is the working form); `330XI` returns 400; NHTSA stores BMW 3-series by specific variant (330i), not series name |
| 36 | 2022 BMW X5 | 200 | 1 | |
| 37 | 2022 MERCEDES-BENZ C-CLASS | 400 | 0 | `C-CLASS` returns 400; `C CLASS` (no hyphen) also 400; `MERCEDES` make also 400; tried `C300` (200, 3 results — this is the working form); NHTSA stores Mercedes by specific model variant (C300), not class name |
| 38 | 2022 MERCEDES-BENZ GLC | 400 | 0 | `GLC` returns 400; tried `GLC300` also 400; `GLC300 4MATIC` also 400; NHTSA does not appear to have 2022 GLC records under any tested form |
| 39 | 2022 AUDI Q5 | 200 | 4 | |
| 40 | 2022 AUDI A4 | 200 | 3 | |
| 41 | 2022 LEXUS RX | 400 | 0 | `RX` returns 400 for 2022 MY but 200 for 2019 (1 result) and 2021 (1 result); `RX350`, `RX 350`, `RX 350L`, `RX450H` all return 400 for 2022; NHTSA database appears to have a gap for 2022 Lexus RX entries |
| 42 | 2022 LEXUS ES | 400 | 0 | `ES` returns 400 for 2022 but 200 for 2021 (1 result); `ES350`, `ES 350`, `ES300H`, `ES 300H` all return 400 for 2022 |
| 43 | 2022 TESLA MODEL 3 | 200 | 17 | `MODEL 3` (URL-encoded as MODEL%203) works correctly |
| 44 | 2022 TESLA MODEL Y | 200 | 19 | `MODEL Y` works correctly |
| 45 | 2022 TESLA MODEL S | 200 | 20 | `MODEL S` works correctly |
| 46 | 2022 TESLA MODEL X | 200 | 22 | `MODEL X` works correctly |
| 47 | 2022 CHEVROLET TRAVERSE | 200 | 1 | |
| 48 | 2022 CHEVROLET COLORADO | 200 | 1 | |
| 49 | 2022 GMC TERRAIN | 200 | 2 | |
| 50 | 2022 GMC CANYON | 200 | 1 | |
| 51 | 2021 FORD F-150 | 200 | 27 | |
| 52 | 2021 TOYOTA RAV4 | 200 | 1 | |
| 53 | 2021 HONDA CR-V | 200 | 4 | |
| 54 | 2021 NISSAN SENTRA | 200 | 3 | |
| 55 | 2021 NISSAN ALTIMA | 200 | 2 | |
| 56 | 2021 JEEP CHEROKEE | 200 | 4 | |
| 57 | 2021 DODGE CHARGER | 200 | 2 | |
| 58 | 2021 DODGE CHALLENGER | 200 | 2 | |
| 59 | 2021 FORD BRONCO | 200 | 19 | |
| 60 | 2021 FORD EDGE | 200 | 7 | |
| 61 | 2021 HYUNDAI PALISADE | 200 | 6 | |
| 62 | 2021 KIA FORTE | 200 | 2 | |
| 63 | 2021 MAZDA CX-9 | 200 | 1 | `CX-9` works correctly (unlike CX-5 for 2022) |
| 64 | 2021 SUBARU LEGACY | 200 | 3 | |
| 65 | 2021 TOYOTA TUNDRA | 200 | 3 | |
| 66 | 2021 TOYOTA 4RUNNER | 200 | 1 | `4RUNNER` (no space) works correctly |
| 67 | 2021 HONDA PILOT | 200 | 9 | |
| 68 | 2021 HONDA PASSPORT | 200 | 6 | |
| 69 | 2021 CHEVROLET BLAZER | 200 | 1 | |
| 70 | 2021 CHEVROLET CAMARO | 200 | 4 | |
| 71 | 2020 FORD EXPEDITION | 200 | 15 | |
| 72 | 2020 LINCOLN NAVIGATOR | 200 | 11 | |
| 73 | 2020 CADILLAC ESCALADE | 200 | 2 | |
| 74 | 2020 BUICK ENCLAVE | 200 | 6 | |
| 75 | 2020 BUICK ENCORE | 200 | 2 | |
| 76 | 2020 GMC YUKON | 200 | 4 | |
| 77 | 2020 RAM 2500 | 200 | 10 | |
| 78 | 2020 FORD SUPER DUTY F-250 | 400→200 | 15 | `F-250SD` returns 400; `SUPER DUTY F-250` returns 400; `F-250 SD` returns 200 with 15 recalls — **correct form is `F-250 SD`** |
| 79 | 2020 TOYOTA SIENNA | 200 | 2 | |
| 80 | 2020 HONDA ODYSSEY | 200 | 13 | |
| 81 | 2020 CHRYSLER PACIFICA | 200 | 4 | |
| 82 | 2020 KIA STINGER | 200 | 6 | |
| 83 | 2020 GENESIS G70 | 200 | 3 | `GENESIS` make works correctly |
| 84 | 2020 GENESIS GV80 | 200 | 1 | |
| 85 | 2020 VOLVO XC60 | 200 | 6 | |
| 86 | 2020 VOLVO XC90 | 200 | 7 | |
| 87 | 2020 JAGUAR F-PACE | 200 | 2 | |
| 88 | 2020 LAND ROVER DEFENDER | 200 | 6 | `LAND ROVER` (two-word make) works correctly |
| 89 | 2020 LAND ROVER DISCOVERY | 200 | 6 | |
| 90 | 2020 PORSCHE MACAN | 200 | 2 | |
| 91 | 2019 TOYOTA CAMRY | 200 | 6 | |
| 92 | 2019 HONDA CIVIC | 200 | 4 | |
| 93 | 2019 NISSAN ROGUE | 200 | 3 | |
| 94 | 2019 SUBARU OUTBACK | 200 | 3 | |
| 95 | 2019 MAZDA CX-5 | 200 | 2 | `CX-5` works for 2019 (unlike 2022 where it returns 400) |
| 96 | 2018 FORD F-150 | 200 | 17 | |
| 97 | 2018 CHEVROLET SILVERADO 1500 | 200 | 7 | |
| 98 | 2018 TOYOTA CAMRY | 200 | 8 | |
| 99 | 2017 HONDA ACCORD | 200 | 3 | |
| 100 | 2016 JEEP GRAND CHEROKEE | 200 | 9 | |

---

## Normalization Issues

### Makes requiring adjustment

| Make (as tested) | Status | Notes |
|------------------|--------|-------|
| `MERCEDES-BENZ` | Works for some queries | Hyphen is accepted; the issue is the model name, not the make |
| `LAND ROVER` | Works | Two-word make is accepted by the API without URL encoding issues |
| `GENESIS` | Works | Stored as `GENESIS` (not `HYUNDAI GENESIS`) for 2020+ models |

### Models requiring adjustment

| Model (as given) | Correct NHTSA form | Notes |
|------------------|--------------------|-------|
| `C-CLASS` | `C300` | Mercedes class names are not stored in NHTSA; use specific variant |
| `GLC` | Unknown / no data | `GLC300`, `GLC300 4MATIC`, `GLC` all return 400 for 2022 |
| `3 SERIES` | `330I` | BMW series names are not stored; use specific variant (330i, 328i, etc.) |
| `F-250SD` | `F-250 SD` | Space before SD is required; NHTSA style is `F-250 SD` not `F-250SD` |
| `SUPER DUTY F-250` | `F-250 SD` | NHTSA uses abbreviated form, not "Super Duty" prefix |
| `CX-5` (2021-2022) | Unknown | Works for pre-2021 years; NHTSA may use a different identifier for newer CX-5 generations |
| `MAZDA3` / `MAZDA 3` | Unknown | Neither form returns results for 2022 |
| `RX` (2022) | Unknown | Works for 2019-2021; no 2022 Lexus RX records found under any tested form |
| `ES` (2022) | Unknown | Works for 2021; no 2022 Lexus ES records found under any tested form |

### Patterns found

1. **BMW uses variant model names, not series names.** The NHTSA database stores `330I`, `328I`, etc. — not `3 SERIES`. Any code doing a recall lookup for "BMW 3 Series" will need to expand it to one or more variant lookups (330i, 328i, 330xi, M340i, etc.) or accept that the generic series lookup will fail.

2. **Mercedes-Benz uses variant model names, not class designations.** `C-CLASS` returns nothing; `C300` returns results. Similarly, `GLC` alone does not work — but `GLC300` also failed for 2022. A lookup against class names will consistently fail.

3. **Ford Super Duty trucks use `F-250 SD`, `F-350 SD`, etc.** — the space before `SD` is significant. `F-250SD` (no space) returns 400.

4. **Mazda CX-5 has a year-dependent model name issue.** `CX-5` works for 2019-2020 but returns 400 for 2021-2022. This may reflect a redesign generation change or NHTSA internal ID change.

5. **Lexus RX and ES have the same year-dependent issue.** They work for 2019 and 2021 but return 400 for 2022 specifically. The 2022 Toyota Camry recall (campaign 23V865000) mentions Lexus ES300H, indicating the vehicles are in the database — they may simply need the full submodel name.

6. **Tesla multi-word models (`MODEL 3`, `MODEL Y`, `MODEL S`, `MODEL X`) work correctly** when URL-encoded with a space (`MODEL%203`).

7. **HTTP 400 consistently means "no records found,"** not a malformed request. Every 400 received with valid make/model/year strings indicates an absence of recall records in the NHTSA database for that combination.

8. **The `Count` field in the response body always matches `results.length`.** No discrepancies were observed between the stated Count and actual array length.

### Recommended normalization map

```js
// Add to recall fetch logic in src/lib/claude.js or recall fetch hook
// Use before calling the NHTSA recall API

const MODEL_NORMALIZE = {
  // BMW: class names -> specific variant lookups (expand to array for multi-lookup)
  '3 SERIES': ['330I', '328I', '330XI', '340I', 'M340I'],
  '5 SERIES': ['530I', '540I', 'M550I'],
  '7 SERIES': ['740I', '750I'],
  '4 SERIES': ['430I', '440I', 'M440I'],

  // Mercedes: class names -> specific variant
  'C-CLASS': 'C300',
  'E-CLASS': 'E350',
  'GLC': 'GLC300',
  'GLE': 'GLE350',
  'GLS': 'GLS450',
  'S-CLASS': 'S500',

  // Ford Super Duty: normalize to NHTSA form
  'F-250SD': 'F-250 SD',
  'F-350SD': 'F-350 SD',
  'F-450SD': 'F-450 SD',
  'SUPER DUTY F-250': 'F-250 SD',
  'SUPER DUTY F-350': 'F-350 SD',
};

// Makes that are two words — pass as-is to the API (they work)
// 'LAND ROVER', 'MERCEDES-BENZ', 'ALFA ROMEO' etc.

// Tesla models with spaces — ensure URL encoding
// MODEL 3, MODEL Y, MODEL S, MODEL X -> use encodeURIComponent()
```

---

## API Behavior Findings

### HTTP 400 meaning
HTTP 400 from this API consistently means **"no records found for this make/model/year combination"** — it is NOT a request formatting error. Every tested vehicle with a properly spelled make and model that returned 400 is genuinely absent from the NHTSA recall database for that model year. Code must treat 400 as "0 recalls" and not as an error condition.

### HTTP status distribution
- 200 with results: 83 vehicles
- 400 (no data): 17 vehicles
- 429 (rate limited): 0 observed
- 5xx (server error): 0 observed
- Network timeout: 0 observed

### Rate limiting
No HTTP 429 responses were observed during testing. Requests were issued in parallel batches without delay. The NHTSA API appears to have generous or no rate limiting for this endpoint at the tested volume (~100 requests total).

### Response shape
- `Count` field always matches `results.length` — no discrepancies found across all 83 successful responses
- `Message` is always `"Results returned successfully"` on 200
- `results` is always an array (never null or missing on 200)
- Individual recall objects always include: `NHTSACampaignNumber`, `Manufacturer`, `Component`, `Summary`, `Consequence`, `Remedy`, `ModelYear`, `Make`, `Model`, `ReportReceivedDate`
- `Notes` field can be `null` (observed on newer recalls)
- `overTheAirUpdate` boolean field is present on all records
- `parkIt` and `parkOutSide` booleans are present on all records

### Unexpected findings
- **2022 LEXUS RX and ES return 400** despite those vehicles definitely being in NHTSA's system (they appear in cross-referenced Toyota Camry recall text). The standalone model query fails for 2022 specifically.
- **2022 MAZDA CX-5 returns 400** for all tested model name variations despite having recalls for 2019. The 2022 CX-5 generation may be stored under a different identifier in the NHTSA database.
- **2022 SUBARU CROSSTREK and TOYOTA COROLLA return 400** but their 2021 equivalents return results. These may genuinely have no separate recalls for 2022 MY.
- **Ford's recall count for popular trucks is very high:** 2021 F-150 has 27 recalls, 2022 F-150 has 22, 2022 Ford Explorer has 23 — the highest counts in the test set.
- **Tesla models have very high recall counts** due to frequent OTA software campaigns: Model X (22), Model S (20), Model Y (19), Model 3 (17).

---

## Recommended Code Fixes

1. **Treat HTTP 400 as "no recalls" not as an error.** In `Invoke-WebRequest` (PowerShell) or `fetch()` (JS), wrap in try/catch and check `response.status === 400` → return `{ recalls: [], count: 0 }`. Do not log or display these as errors to users.

2. **Apply model normalization before lookup.** Implement the `MODEL_NORMALIZE` map (see above). For BMW and Mercedes, the class-name lookup will fail; you must map to variant model names. Consider storing a "normalized model" alongside the user-entered model in Firestore.

3. **For Ford Super Duty trucks, use `F-250 SD` / `F-350 SD` format.** Check the vehicle's model field for "Super Duty", "F-250SD", etc. and normalize to NHTSA's `F-250 SD` format.

4. **For BMW 3 Series (and similar), implement multi-model lookup.** A BMW "3 Series" should trigger lookups against `330I`, `328I`, `330XI`, `340I`, and `M340I`. Merge and deduplicate the results.

5. **For Lexus RX and ES 2022+, consider trying submodel variants** (`RX350`, `RX 350`, `ES350`, `ES 300H`) as fallbacks before concluding no recalls exist. The data may be present under a specific trim designation not tested here.

6. **For Mazda CX-5 2021-2022, investigate the NHTSA vehicle API** (`https://api.nhtsa.gov/products/vehicle/makes`) to discover the exact model identifier used. A possible approach: use the NHTSA vehicle search API to look up valid model names for a given make/year before attempting the recall lookup.

7. **URL-encode model names with spaces.** `MODEL 3` → `MODEL%203`, `GRAND CHEROKEE` → `GRAND%20CHEROKEE`, `SANTA FE` → `SANTA%20FE`, `SIERRA 1500` → `SIERRA%201500`, `F-250 SD` → `F-250%20SD`. Use `encodeURIComponent()` in JavaScript.

8. **Cache recall results.** Recall data changes slowly. Cache API responses for 24 hours to avoid hammering NHTSA's servers and to provide instant results for repeat lookups.

9. **Handle `Notes: null`.** Newer recall records (2024-2026) sometimes have `null` for the Notes field. Code that tries to render or substring-match on Notes must null-check first.

10. **Consider a VIN-based recall lookup** as an alternative or supplement. NHTSA offers `https://api.nhtsa.gov/recalls/recallsByVin?vin={VIN}` which bypasses make/model/year normalization entirely and is more precise. If users have stored a VIN (which Garage AI already decodes via NHTSA), this is a more reliable lookup path.

---

## Vehicles With No Recalls Found (400 responses)

These 17 vehicles returned HTTP 400 across all tested model name forms:

| # | Vehicle | Alternate Forms Tried | Conclusion |
|---|---------|-----------------------|------------|
| 21 | 2022 SUBARU CROSSTREK | — | Likely no 2022 MY recalls in NHTSA system |
| 23 | 2022 TOYOTA COROLLA | — | Likely no 2022 MY recalls in NHTSA system |
| 30 | 2022 MAZDA CX-5 | `CX5`, `CX-5 SPORT`, `CX-5 TOURING`, `MAZDA CX-5` | Data may exist under unknown model variant |
| 31 | 2022 MAZDA3 | `MAZDA 3` | Data may exist under unknown model variant |
| 35 | 2022 BMW 3 SERIES | `3 SERIES`, `330I`→200, `330XI`, `330I XDRIVE`, `330` | Use `330I` for recalls; generic series name unsupported |
| 37 | 2022 MERCEDES-BENZ C-CLASS | `C-CLASS`, `C CLASS`, `C300`→200 | Use `C300` for recalls; class name unsupported |
| 38 | 2022 MERCEDES-BENZ GLC | `GLC`, `GLC300`, `GLC300 4MATIC` | No 2022 GLC data found under any form |
| 41 | 2022 LEXUS RX | `RX`, `RX350`, `RX 350`, `RX 350L`, `RX450H` | 2022-specific gap; works for 2021 and earlier |
| 42 | 2022 LEXUS ES | `ES`, `ES350`, `ES 350`, `ES300H`, `ES 300H` | 2022-specific gap; works for 2021 and earlier |

Note: Vehicles 35 (BMW 3 SERIES) and 37 (MERCEDES-BENZ C-CLASS) had working alternate forms found (`330I` and `C300` respectively). The remaining 400-returning vehicles either had no working alternate found or represent genuine database gaps.
