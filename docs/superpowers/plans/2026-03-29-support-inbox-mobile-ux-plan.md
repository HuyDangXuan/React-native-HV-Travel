# Support Inbox Mobile UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a customer-support entry card and clearer support conversation UX to the mobile inbox without changing the ASP.NET schema in this pass.

**Architecture:** Reuse the existing inbox/chat screens, add a small support-focused selection layer for the primary conversation, and move all new copy into i18n. Preserve current backend contracts and avoid coupling mobile to unfinished ASP.NET auth changes.

**Tech Stack:** React Native, Expo, React Navigation, TypeScript, existing ChatService/dataAdapters, i18n/runtime theme

---

### Task 1: Support inbox content model

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\services\dataAdapters.ts`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\services\ChatService.ts`

- [ ] Add helpers to identify and prioritize the main support conversation.
- [ ] Keep current API contracts unchanged.
- [ ] Expose just enough metadata for the inbox card and history section.

### Task 2: Inbox support card UX

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Inbox\InboxScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\vi.ts`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\en.ts`

- [ ] Add a top support card with title, subtitle, and CTA.
- [ ] Add a clearer `Chat history` section heading.
- [ ] Keep the current conversation list but bias the support thread to the top.
- [ ] Preserve runtime theme and loading states.

### Task 3: Chat detail support shell

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Inbox\Chat\ChatScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\vi.ts`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\en.ts`

- [ ] Replace read-only copy with a proper support-oriented shell.
- [ ] Improve timeline labels, intro card, and empty states.
- [ ] Keep behavior safe if no active support conversation exists.

### Task 4: Verification

**Files:**
- Verify only

- [ ] Run `npm.cmd run build:test`
- [ ] Summarize what is done now versus what still depends on ASP.NET integration/auth decisions.
