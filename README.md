# Taskra

Taskra is a recurring task and productivity planner built for people who want to manage repeated actions, track completion patterns, and review progress by day, week, and month. The product is designed around a local-first workflow with optional cloud sync and authentication, so users can plan in a desktop-first interface while keeping their task history available across devices.

## Product overview

This app combines three core ideas:

- recurring task planning with date-aware scheduling
- lightweight daily execution tracking for completed vs missed work
- a dashboard that shows progress patterns over time, not just a raw list of tasks

The main experience is split into two primary panes:

- a task rail for today/tomorrow actions and task management
- a calendar dashboard for weekly and monthly analytics

Users can create recurring or one-off tasks, mark occurrences complete, review carry-over tasks, and inspect progress by day. The interface is optimized for a desktop workflow, but it still supports responsive use on smaller screens.

## What the app does

### Recurring tasks

Tasks can be created as recurring or non-recurring:

- recurring tasks follow rules like daily, weekly, or custom schedules
- non-recurring tasks behave like scheduled actions that can appear on their own date and be marked complete
- completed actions are tracked at the occurrence level rather than as a single global task state

This is important because recurring task systems need to distinguish:

- the task definition
- the occurrence for a date
- whether that specific date was completed

The logic lives in the task engine and recurrence utilities, which compute what should appear for a selected date and how historical completion should be shown.

### Daily execution model

Each task occurrence has a status:

- pending
- completed
- deleted or no longer active in some historical cases

The app computes per-day summaries like:

- task count for the date
- completed count
- completion percentage
- carry-over or overdue items

This powers the dashboard alongside weekly and monthly views.

### Weekly and monthly analytics

The right-hand dashboard is not just a calendar; it is a productivity view. It includes:

- weekly summary cards
- completion trends
- streaks and productivity metrics
- per-day detail modals for completed vs missed items
- monthly calendar cells with completion percentages and click-to-open detail flow

On the analytics side, the app tracks metrics such as:

- current streak
- best streak
- 7-day completion rate
- 30-day completion rate
- active recurring task count
- carry-over count

## Architecture

This project is a Next.js application using the App Router and client-side state management with Dexie for local persistence.

### Frontend

The UI is centered around:

- a task rail for task creation and editing
- a calendar dock for focus views
- modals for add/edit, delete confirmation, auth, and daily details
- a resizable split layout for left and right panels

The app uses Radix and shadcn-style primitives for dialogs, popovers, selects, and buttons, which gives the interface a more modern desktop feel than a plain custom form.

### Local-first data layer

The app stores task data in IndexedDB via Dexie. This gives fast local access and allows the user to work offline without interruption.

The task engine computes derived views from:

- task definitions
- persisted occurrences
- the current local date context

This makes the calendar and analytics feed accurate even when the user is working with historical data or editing dates.

### Sync and authentication

Authentication is handled server-side and supports:

- username/password registration and login
- Google and Facebook OAuth flows
- server-managed sessions
- sync endpoints for keeping local and server data aligned

The app is designed to support data synchronization between devices while still retaining local-first performance. The auth flow is intentionally explicit and user-friendly, including popup-based login windows and confirmation states if login fails or the popup is closed.

### Trusted clock handling

One of the core reliability features is that the app does not blindly trust the device clock. It uses a server-backed time strategy so that task dates and analytics remain stable even when a user changes their phone time manually. This prevents the app from incorrectly shifting yesterday/today scheduling based on local clock tampering.

## Core workflow

### Creating a task

The user can open the new task modal and configure:

- title and description
- recurrence settings
- date selection
- whether it is recurring or one-off

The modal uses modern form controls and a date picker so the user can choose a schedule without dealing with a clumsy manual input flow.

### Editing and deleting

Tasks can be updated from the task list, and destructive actions open confirmation dialogs rather than immediately removing items. This prevents accidental data loss and keeps the user intent explicit.

### Daily review

Each day in the dashboard can be opened to inspect:

- which tasks were completed
- which were still pending
- how completion percentages changed

This encourages reflection on whether a day was productive rather than just whether a task list is filled.

### Weekly and monthly review

The analytics panel functions as a retrospective view:

- weekly summary of effort and execution
- monthly calendar with completion states
- trend-based evaluation across multiple days

## Repository structure

- src/app: app routes, entry pages, auth callbacks, and API endpoints
- src/components: task rail, dashboard, modals, and UI primitives
- src/lib/engine: recurrence rules, date utilities, analytics, and computed task logic
- src/lib/hooks: data access and client task/auth state
- src/lib/server: auth/session and database logic
- src/lib/sync: sync manager and broadcast handling
- data: local or persisted app data

## Key technical stack

- Next.js 16
- React 19
- TypeScript
- Dexie + IndexedDB
- Radix UI primitives
- date-fns and react-day-picker
- Tailwind CSS

## Notes for contributors

This project is intentionally opinionated around productive workflows:

- local-first data access for speed and resilience
- explicit task occurrence tracking for recurring workflows
- analytics-driven views instead of a simple checklist
- desktop-oriented layout with responsive support

If you are changing task behavior, especially around recurrence, streak logic, or historical completion, check the engine code before adjusting the UI. The core rules are defined in the task engine and recurrence utilities, and the dashboard simply reflects those calculations.

## Summary

Taskra is a recurring task manager built around execution quality, historical tracking, and productivity patterns. It is not a generic todo app: it is designed to help users plan repeated actions, review what they completed, identify patterns in streaks and daily performance, and maintain reliable state through local-first storage plus optional sync.
