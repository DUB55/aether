"Your critical task is to implement a dynamic and visually distinct display mechanism for the `dub5 ai`'s responses within the chat interface of the AI web app builder. The goal is to clearly separate the AI's internal 'thinking' process from its 'real response,' mirroring the user experience of advanced AI platforms.

The `dub5 ai` (accessible via `https://chatbot-beta-weld.vercel.app/api/chatbot`) has been configured to preface its internal thought process with the exact string `THINKING: ` (case-sensitive, including the space after the colon) within its streamed output chunks. You must use this prefix as the trigger for the following UI/UX and backend logic:

**1. Backend Logic (within the AI Web App Builder's code):**

*   **Stream Processing**: When receiving the streaming response from `dub5 ai`'s `/api/chatbot` endpoint, continuously parse each `data: ` chunk.
*   **Content Segmentation**:
    *   Maintain two internal buffers for each AI turn: one for 'thinking' content and one for 'real response' content.
    *   For each `{"type": "chunk", "content": "..."}` object received:
        *   If the `content` string **starts with `THINKING: `**:
            *   Append the `content` (after removing the `THINKING: ` prefix) to the 'thinking' buffer.
            *   Signal the frontend that 'thinking' content is being streamed.
        *   If the `content` string **does NOT start with `THINKING: `**:
            *   If the 'thinking' buffer is not empty, this signifies the end of the 'thinking' phase. Signal the frontend to finalize the 'thinking' display.
            *   Append the `content` to the 'real response' buffer.
            *   Signal the frontend that 'real response' content is being streamed.
*   **End of Stream**: When `{"type": "end"}` is received, ensure both buffers are flushed and their respective displays are finalized.

**2. Frontend UI/UX (for the AI Web App Builder's chat interface):**

*   **Initial State**: When a user sends a message, immediately display a placeholder for the AI's response.
*   **The 'Thinking' Phase Display**:
    *   **Dedicated Container**: Create a distinct, separate, and initially visible container (e.g., a `div` or `section`) for the AI's 'thinking' process. This container should appear *above* where the 'real response' will eventually be displayed.
    *   **Labeling**: Label this container clearly, for example, with "Gedacht" (Dutch for "Thought") or "AI Thought Process."
    *   **Streaming Content**: As 'thinking' chunks are received from the backend, stream this text into the dedicated 'thinking' container in real-time.
    *   **Visual Indicator**: Implement a subtle, continuous animation (e.g., a pulsing ellipsis, a gentle shimmer effect, or a small spinning icon) within or next to the 'thinking' container to visually indicate that the AI is actively processing.
    *   **Styling**: Use a muted, secondary styling for this container and its text (e.g., smaller font, lighter gray text, a slightly darker background than the main chat area) to differentiate it from the main conversation.
*   **The Transition**:
    *   **Trigger**: When the backend signals the end of the 'thinking' phase (i.e., the first non-`THINKING:` chunk is received, or the stream ends while only 'thinking' content was present).
    *   **Action**:
        *   **Collapse/Minimize**: The 'thinking' container should smoothly collapse or minimize. It should not disappear entirely but become less prominent. Options include:
            *   Collapsing to a single line summary (e.g., "Gedacht voor X seconden").
            *   Shrinking vertically to a small, clickable icon or label that can expand the full thought process if desired.
            *   A smooth `height` transition or `scaleY` animation for the collapse.
        *   **Focus Shift**: The visual focus should immediately and smoothly shift to the area directly below the now-collapsed 'thinking' container, preparing for the 'real response'.
*   **The 'Real AI Response' Display**:
    *   **Placement**: This response must appear directly below the (collapsed) 'thinking' container.
    *   **Streaming Content**: As 'real response' chunks are received from the backend, stream this text into the main chat area, token-by-token (or word-by-word), using the standard, prominent styling for AI messages.
    *   **Syntax Highlighting**: Ensure that any code blocks within the 'real response' are automatically and correctly syntax-highlighted (e.g., using `highlight.js`).
    *   **Visual Separation**: Maintain a clear visual separation between the collapsed 'thinking' container and the streaming 'real response' below it.

**Example Scenario (how the builder agent should process and display):**

*User Input:* "Goodmorning can you explain how chatgpt works"

*`dub5 ai` Streamed Output (after backend processing and `THINKING:` prefix removal):*

```
// Streamed to 'thinking' container:
"User is asking about ChatGPT. My instructions are to be a DUB5 AI expert programmer, provide code solutions and technical help. However, I also need to be conversational and helpful. This is a general knowledge question, not directly coding. I should provide a concise, one-paragraph explanation of ChatGPT, as per previous instructions for brevity, and then offer further coding assistance."

// Streamed to 'real response' container (after 'thinking' container collapses):
"ChatGPT is built on a transformer neural network that learns language patterns through massive pre-training on Internet text, using an objective called causal language modeling to predict the next token. During fine-tuning, the model is optimized with reinforcement learning from human feedback (RLHF), where human reviewers rank model responses and the algorithm updates a preference model to improve alignment and safety. The architecture is transformer-based: multi-head self-attention layers capture long-range dependencies, while feed-forward networks add non-linearity, and positional embeddings encode token order. At inference, the model generates text token-by-token, sampling from the probability distribution limited by temperature and top-k/p sampling to balance coherence and diversity."
```

