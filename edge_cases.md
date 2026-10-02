# Edge Cases & Validation Scenarios: Ask Photos Back MVP

This document outlines the edge cases and boundary conditions that must be validated during the development and testing phases of the "Ask Photos Back" MVP.

## 1. Input & Query Edge Cases
* **Gibberish or Nonsensical Queries**: The user searches for arbitrary strings (e.g., "asdfghjkl").
  * *Expected Behavior*: The Failure Detection module identifies 0 results. The Query Analyzer should gracefully handle the input, potentially falling back to generic prompts (e.g., "Can you describe what's in the photo?") or skipping the disambiguation flow if no semantic meaning can be derived.
* **Contradictory Clues**: The user provides a clue that contradicts the original query (e.g., Original: "Dog", Clue: "Cat").
  * *Expected Behavior*: The Query Synthesis engine should either prioritize the new clue, merge them as an `OR` condition, or fail gracefully, but the system must not crash.
* **Overly Broad Clues**: The user provides a clue that does not sufficiently narrow down the search (e.g., Original: "Sky", Clue: "Blue").
  * *Expected Behavior*: The re-search may still trigger the "Overloaded results" state. Since the MVP specifies a single-turn interaction, the system should either return the large result set or display a polite "Still too many results" message rather than entering an infinite clarification loop.
* **Empty or Whitespace Clues**: The user submits the clarification prompt with no text.
  * *Expected Behavior*: The UI should disable the submit button until valid input is provided, or the API should reject the empty payload and prompt the user again.
* **Unsupported Languages**: The user enters a query in a language not fully supported by the NLP/Query Analyzer model.
  * *Expected Behavior*: The system should gracefully bypass the disambiguation UI and return the standard search failure state.

## 2. LLM & Query Analyzer Edge Cases
* **Hallucinated or Irrelevant Prompts**: The Query Analyzer generates clarification categories that are irrelevant to the original query (e.g., Query: "Screenshot of a recipe", Prompt: "Who is in this photo?").
  * *Expected Behavior*: Rely on guardrails within the Prompt Generation engine to ensure categories map logically to the detected intent. Fall back to generic prompts if confidence is low.
* **Safety & Policy Violations**: The original query or the provided clue triggers safety filters (e.g., explicit content, PII violations).
  * *Expected Behavior*: The Query Analyzer must immediately reject the request and return a standard (non-clarified) zero-result state.
* **Latency Timeouts**: The Query Analyzer takes longer than the allocated latency budget (e.g., > 200ms) to return prompts.
  * *Expected Behavior*: The API Gateway must enforce a strict timeout and fallback to displaying the standard search failure state (empty state or normal photo grid) rather than blocking the UI indefinitely.

## 3. Result State Edge Cases
* **Double Zero-Match**: The refined query (Original + Clue) STILL returns zero results.
  * *Expected Behavior*: The system should display a standard "No results found" empty state. It must not loop back and ask for a second clue (per the single-turn MVP constraint).
* **"Wrong Match" Ambiguity**: The original query returns a small number of results (e.g., 2), but they are not what the user is looking for.
  * *Expected Behavior*: The MVP currently defines failure via `result_count == 0` or `result_count > THRESHOLD`. The system will not intervene here unless we implement confidence score thresholds. If so, the user should have a manual way to trigger the disambiguation UI (e.g., a "Didn't find what you were looking for?" button).

## 4. UI & Interaction Edge Cases
* **Concurrent UI Interaction**: The user ignores the Disambiguation UI popup and begins typing a new query in the main search bar.
  * *Expected Behavior*: The new search should take precedence, instantly clearing the Disambiguation UI and resetting the Search Session Manager.
* **Rapid Multi-Clicking**: The user aggressively taps multiple clarification chips before the API can respond.
  * *Expected Behavior*: The UI must debounce clicks and visually disable other options once an initial selection is made to prevent race conditions.
* **App Backgrounding / Screen Rotation**: The user rotates the device or backgrounds the app while the Disambiguation UI is visible.
  * *Expected Behavior*: The state must be preserved upon resume/re-render, ensuring the user doesn't lose the context of the clarification prompt.
