# AI Prompts

Prompts used during development with Claude Code.

---

## 1. Cache tool messages

> "update the cache after tool calls"

Extended `handleToolCalls` in `Session.ts` to call `saveChatMessage` for both the tool result message and the AI follow-up, so the in-memory cache stays consistent with what the AI has seen.

---

## 2. Markdown rendering for AI messages

> "In the frontend, the messages from the AI are not being displayed as markdown, just plain text. Is there a package I can use for this?"

Installed `react-markdown` and wrapped AI message content in a `<Markdown>` component. A follow-up fix was needed: the newer version of `react-markdown` dropped the `className` prop, so the component was wrapped in a `<div className="markdown">` instead.

---

## 3. WebSocket close error

> "Uncaught Error at webSocketClose ... Can you involve the function in a try catch to prevent crashing?"

Wrapped the body of `webSocketMessage` in a `try/catch`. An unhandled error inside the message handler was crashing the connection and triggering `webSocketClose` with a bad state. The catch block sends an error string to the client and logs to console.

---

## 4. Load chat history on camp selection

> "I want to make it so the message history loads in the frontend when I go to a camp id. Use the backend endpoint get_history"

In `useChat`, added an effect on `campId` that fetches history and populates the messages state before the WebSocket is used for new messages.

---

## 5. CORS

> "Cross-Origin Request Blocked..."
> "Create an env variable with the frontend url as an allowed origin"

Added `hono/cors` middleware to the Hono app. Origin is read from a `ALLOWED_ORIGIN` environment binding rather than hardcoded. Set via `backend/.dev.vars` locally (`ALLOWED_ORIGIN=http://localhost:5173`) and `wrangler.jsonc` vars for production.

---

## 6. Functional "Add camp" button

> "I want to make the button to create a new camp, actually work. Can I also use the ai tool to create a new camp?"

Added `POST /camps` and `DELETE /camps/:id` routes to the backend. On the frontend, built an inline expandable form in the sidebar for name, description, quantity, start date, and end date. Added `handleAddCamp` and `handleDeleteCamp` handlers in `App.tsx`. Also added a `create_camp` AI tool so the assistant can create camps through conversation.

---

## 7. Schedule display

> "Make me a ScheduleTable component to display a 7 day schedule as an html table."

Built a `ScheduleTable` component rendering a 2-row (Morning / Afternoon) × 7-column (Mon–Sun) table. The component fetches the schedule list for the selected camp and displays slots with activity name and room.

---

## 8. Auto-refresh schedule after AI tool calls

> "Refresh the schedule after the AI sends a tool response."

In `useChat`, detect messages starting with `[Tool Used:` and call an `onToolResponse` callback. In `App.tsx`, the callback increments a `scheduleKey` state value passed as the `key` prop to `ScheduleTable`, forcing a remount and refetch.

---

## 9. Scroll-to-bottom button

> "I want to make a button that appears on the bottom of the conversation whenever the conversation is not all the way down. The button should scroll all the way down and disappear."

Added a `showScrollButton` state in `ChatWindow`. A `handleScroll` listener shows the button when the user is more than 50px from the bottom. Auto-scroll on new messages only fires if the user is already at the bottom. The button is positioned absolutely within the chat container.


---

## 10. Code review

> "Look at my code. What am I missing?"

Triggered a full review of all source files. Issues identified:
- `get_schedule` tool passing `args.camp_id` but `getSchedule` now expects `schedule_id`
- `saveChatMessage` D1 write not awaited — cache could get ahead of the DB
- Race condition in `useChat` — WebSocket could receive messages before history fetch resolves
- Shared DO session for all camps — no per-camp isolation

---