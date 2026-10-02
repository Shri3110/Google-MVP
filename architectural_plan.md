# Architectural Plan: Ask Photos Back MVP

## 1. Overview
This document outlines the system architecture for the "Ask Photos Back" MVP. The system is designed to resolve ambiguous or failed photo searches by guiding users to provide one additional clarifying clue, specifically addressing the "Zero/Wrong-match" and "Overloaded" result failure modes.

## 2. System Components

### 2.1. Client Application (Mobile / Web)
* **Search Session Manager**: Maintains the state of the current search session, including the original query and any subsequent clues provided.
* **Disambiguation UI**: A new interface component triggered when a search fails. It presents guided, contextual clarification prompts (e.g., "Who was with you?", "When was this?").
* **Photo Grid**: The standard photo rendering component, which updates seamlessly upon query refinement.

### 2.2. API Gateway / Search Orchestrator
* Serves as the primary entry point for all search requests from the client.
* **Failure Detection Module**: Analyzes the response from the Core Search Engine to determine if it meets the criteria for MVP intervention:
  * *Zero / Wrong-match*: `result_count == 0` or very low relevance scores.
  * *Overloaded results*: `result_count > THRESHOLD` with low variance in relevance.

### 2.3. Query Analyzer & Clarification Service (LLM / ML)
* **Context Inference**: Analyzes the failed initial query to identify missing semantic dimensions (e.g., Time, Location, People, Objects).
* **Prompt Generation**: Generates contextual clarification options based on the missing dimensions to present to the user.
* **Query Synthesis**: Intelligently combines the original query and the user's newly provided clue into a unified, high-precision search representation.

### 2.4. Core Search Engine
* The existing Google Photos backend search infrastructure.
* Responsible for executing the refined, synthesized queries to retrieve the final accurate set of photos.

## 3. System Data Flow

### Sequence 1: Initial Search & Failure Detection
1. **Request**: User enters an initial, broad query (e.g., "beach").
2. **Execution**: Client sends the query to the API Gateway, which forwards it to the Core Search Engine.
3. **Failure**: The Search Engine returns 10,000+ results.
4. **Detection**: The API Gateway detects the "Overloaded" failure mode and intercepts the standard response.

### Sequence 2: Guided Clarification Generation
1. **Analysis**: API Gateway sends the original query ("beach") and the failure state to the Query Analyzer.
2. **Generation**: Query Analyzer infers missing context and returns structured clarification vectors (e.g., "Location", "Timeframe", "People").
3. **Delivery**: API Gateway returns the failure state and clarification options to the Client.
4. **Display**: Client pauses loading the photo grid and displays the "Ask Photos Back" disambiguation UI.

### Sequence 3: Query Refinement & Re-Search
1. **Interaction**: User selects a clarification option and provides a clue (e.g., Location: "Oahu").
2. **Submission**: Client sends the context payload `[{query: "beach"}, {clue: "Oahu", type: "Location"}]` to the API Gateway.
3. **Synthesis**: API Gateway utilizes the Query Analyzer to merge the payload into a highly specific query (e.g., "beach in Oahu").
4. **Re-Execution**: API Gateway queries the Core Search Engine with the refined query.
5. **Resolution**: Search Engine returns a narrow, highly relevant result set. API Gateway returns these results to the Client for display.

## 4. MVP Constraints & Considerations
* **Single-Turn Interaction**: The MVP will restrict the disambiguation flow to *one* additional clue request to maintain a lightweight, frictionless user experience.
* **Latency Budget**: The Query Analyzer and Prompt Generation steps must operate within strict latency limits (e.g., < 200ms) to ensure the disambiguation UI appears instantaneously when a search fails.
* **Telemetry**: Comprehensive logging must be implemented around the failure detection and the user's interaction with the clarification UI to measure the MVP's effectiveness at bridging the memory gap.
