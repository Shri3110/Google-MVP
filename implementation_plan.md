# Implementation Plan: Ask Photos Back MVP

This document outlines a phase-wise approach to implementing the architecture defined in the "Ask Photos Back" MVP.

## Phase 1: Foundation & Proof of Concept (Weeks 1-2)
**Goal:** Establish the basic data flow and failure detection logic with mocked ML services to unblock frontend development.

* **API Gateway:**
  * Setup routing for search requests.
  * Implement the **Failure Detection Module** using static rules and hardcoded thresholds (e.g., flag as "overloaded" if `result_count > 1000`).
* **Query Analyzer (Mock):**
  * Create a stubbed service that returns static clarification prompts based on simple keyword matching (e.g., if query contains "car", ask for "color" or "location").
  * Implement simple string-concatenation for Query Synthesis (e.g., `query + " " + clue`).
* **Client UI:**
  * Implement the **Search Session Manager** state machine to track `Initial Query -> Failure -> Disambiguation State`.

## Phase 2: Core Service & ML Implementation (Weeks 3-5)
**Goal:** Replace the mocked services with the actual LLM/ML implementation for contextual analysis and query synthesis.

* **Query Analyzer & Clarification Service:**
  * Develop the **Context Inference** model to accurately identify missing semantic dimensions from failed queries.
  * Implement the **Prompt Generation** engine to return relevant, structured options.
  * Develop the **Query Synthesis** logic to intelligently combine the original query and the new clue into a format optimized for the Core Search Engine.
* **Integration:**
  * Connect the API Gateway to the live Query Analyzer.
  * Ensure the API Gateway correctly routes the synthesized query to the Core Search Engine and processes the final result set.

## Phase 3: Client UI Development & Integration (Weeks 5-7)
**Goal:** Build the user-facing experience and connect it fully to the backend APIs.

* **Disambiguation UI:**
  * Build the user interface components (e.g., suggestion chips, follow-up text inputs) that render the prompts provided by the Query Analyzer.
  * Ensure smooth UI transitions between the failed search state and the clarification state.
* **Client Integration:**
  * Connect the Client application to the API Gateway to handle Sequence 2 (Guided Clarification) and Sequence 3 (Query Refinement).
  * Ensure the **Photo Grid** updates correctly with the refined results without flashing or jarring layout shifts.

## Phase 4: Optimization, Telemetry, & Launch Prep (Weeks 8-9)
**Goal:** Ensure the system meets performance requirements, handles edge cases, and is heavily instrumented for analysis.

* **Performance Tuning:**
  * Optimize the Query Analyzer to strictly adhere to the < 200ms latency budget.
  * Implement caching strategies at the API Gateway where appropriate.
* **Refining Thresholds:**
  * Tune the Failure Detection Module using historical search data to accurately identify true "Overloaded" and "Zero-match" scenarios without false positives.
* **Telemetry & Logging:**
  * Instrument the Client and API Gateway to track:
    * Frequency of disambiguation UI triggers.
    * User interaction rates (click-through on clarification prompts vs. abandonment).
    * Success rate of the synthesized query (did the user interact with the resulting photos?).
* **Testing:**
  * Conduct End-to-End (E2E) integration testing and User Acceptance Testing (UAT).
