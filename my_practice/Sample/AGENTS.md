# OpenCode Project Agent Rules

> This file is the persistent project instruction source for OpenCode V2.
> All agents working in this repository MUST follow these rules.

## 1. Core Principles

1. `PRD.md` is the **single source of truth (SSOT)** for product requirements.
2. The Agent MUST NOT invent, infer, expand, remove, reinterpret, or silently modify requirements.
3. If a requirement is missing, ambiguous, contradictory, or cannot be implemented as written, STOP the affected work and ask the user.
4. Only the user may approve a requirement change.
5. After the user approves a requirement change, update `PRD.md` first, then continue implementation.
6. Implementation decisions may be made autonomously only when they do not change product requirements, acceptance criteria, externally visible behavior, or agreed scope.
7. Never treat chat assumptions, source code, TODO comments, tests, `progress.yaml`, or `handoff.yaml` as a replacement for `PRD.md`.

## 2. Required Project Files

The project uses the following persistent files:

```text
/
├─ AGENTS.md
├─ CLAUDE.md
├─ PRD.md
└─ .harness/
   ├─ progress.yaml
   └─ handoff.yaml
```

Their responsibilities are strictly separated:

- `AGENTS.md`
  - Persistent operating rules for Coding Agents.
  - Defines workflow, guardrails, verification, and state-management rules.

- `PRD.md`
  - The single authoritative source for requirements.
  - Defines goals, scope, functional requirements, non-functional requirements, constraints, and acceptance criteria.
  - MUST NOT be changed without explicit user approval.

- `.harness/progress.yaml`
  - Machine-readable execution status.
  - Tracks requirement/task progress, current phase, verification state, blockers, and next actions.
  - It records implementation progress only; it MUST NOT redefine requirements.

- `.harness/handoff.yaml`
  - Cross-session handoff state.
  - Records the minimum context required for another Agent/session to continue safely.
  - It MUST NOT redefine or override `PRD.md`.

## 3. Session Startup Protocol

At the beginning of every session, inspect the project before making changes.

### 3.1 Existing Project

If `PRD.md` already exists:

1. Read `AGENTS.md`.
2. Read `PRD.md` completely.
3. Read `.harness/progress.yaml` if it exists.
4. Read `.harness/handoff.yaml` if it exists.
5. Inspect relevant repository files needed for the current task.
6. Reconstruct the current state from:
   - `PRD.md` for requirements;
   - `progress.yaml` for execution status;
   - `handoff.yaml` for cross-session context;
   - repository state for actual implementation.
7. Check whether these sources are consistent.
8. If implementation state conflicts with `PRD.md`, treat `PRD.md` as authoritative and report the conflict.
9. If `progress.yaml` or `handoff.yaml` is missing, stale, or inconsistent, repair the tracking file without changing requirements.
10. Continue from the next unfinished requirement or from the user's explicit instruction.

Do NOT ask the user to repeat requirements that are already clearly documented in `PRD.md`.

### 3.2 New Project / Missing PRD

If `PRD.md` does not exist, this project is not yet initialized.

Before writing application code:

1. Inspect the repository to understand any existing files and constraints.
2. Ask the user for the requirements.
3. Ask only questions necessary to establish an implementable PRD.
4. Do NOT guess unanswered product decisions.
5. Summarize the understood requirements for confirmation when material ambiguity exists.
6. After sufficient requirements are obtained, create:
   - `PRD.md`
   - `.harness/progress.yaml`
   - `.harness/handoff.yaml`
7. Only after `PRD.md` exists may implementation begin.

The Agent MUST NOT bootstrap product requirements from assumptions.

## 4. PRD Rules

`PRD.md` is immutable by default.

### 4.1 Authority

When information conflicts, use this precedence for product requirements:

1. Latest explicit user-approved requirement recorded in `PRD.md`
2. Other content already recorded in `PRD.md`
3. Everything else

Source code, tests, old handoff notes, comments, issue descriptions, and previous chat context cannot override `PRD.md`.

### 4.2 Requirement Changes

If the user asks for behavior that differs from the current PRD:

1. Identify the conflict or requested scope change.
2. Explain which PRD requirement is affected.
3. Obtain explicit user approval if the change is not already explicit in the user's instruction.
4. Update `PRD.md`.
5. Update affected task/status mappings in `.harness/progress.yaml`.
6. Update `.harness/handoff.yaml`.
7. Implement only against the updated PRD.

Never change `PRD.md` merely to make the current implementation or tests pass.

### 4.3 Recommended PRD Structure

When creating a new `PRD.md`, use this structure unless the project clearly requires something else:

```markdown
# Product Requirements Document

## 1. Overview
## 2. Goals
## 3. Non-Goals
## 4. Users / Use Cases
## 5. Functional Requirements
### FR-001 ...
### FR-002 ...

## 6. Non-Functional Requirements
### NFR-001 ...

## 7. Constraints
## 8. Data / Interfaces
## 9. Error Handling
## 10. Security / Privacy Requirements
## 11. Acceptance Criteria
### AC-001 ...

## 12. Open Questions
## 13. User-Approved Requirement Changes
```

Use stable IDs such as `FR-001`, `NFR-001`, and `AC-001` so implementation work can be traced back to the PRD.

## 5. Planning Before Implementation

Before modifying application code:

1. Read the relevant PRD requirements and acceptance criteria.
2. Inspect the relevant code and configuration.
3. Determine the smallest implementation plan that satisfies the PRD.
4. Map planned work to PRD requirement IDs.
5. Update `.harness/progress.yaml` with the planned/current tasks.
6. Identify risks, dependencies, migrations, or destructive operations.
7. Ask the user before proceeding if a required decision would alter scope or requirements.

Do not create speculative features "for completeness."

## 6. Execution Rules

While implementing:

1. Work directly from PRD requirement IDs.
2. Prefer small, verifiable changes.
3. Preserve existing behavior unless the PRD explicitly requires a change.
4. Do not refactor unrelated code unless necessary for the requirement.
5. Do not introduce dependencies without a concrete implementation reason.
6. Follow the repository's existing architecture and conventions where they do not conflict with the PRD.
7. Keep secrets and credentials out of source control.
8. Never fabricate successful command output, test results, files, APIs, or external state.
9. If blocked:
   - record the blocker in `progress.yaml`;
   - record enough context in `handoff.yaml`;
   - ask the user when a product decision is required.

Technical choices that preserve documented behavior may be made autonomously.

## 7. Verification and Acceptance

A task is not complete merely because code was written.

For each implemented requirement:

1. Identify the corresponding PRD acceptance criteria.
2. Run the most relevant available verification:
   - tests;
   - type checks;
   - lint;
   - build;
   - targeted manual verification;
   - other project-specific checks.
3. Record the verification command/method and result in `.harness/progress.yaml`.
4. If verification fails, keep the task incomplete or blocked.
5. Never mark a requirement `done` without evidence that its acceptance criteria are satisfied.

If no automated verification exists, document the manual verification performed or the remaining verification gap.

## 8. Progress Tracking

Maintain `.harness/progress.yaml` throughout the work, not only at the end.

Use the following baseline schema:

```yaml
schema_version: 1
project:
  name: ""
  prd: "PRD.md"

current_phase: "discovery" # discovery | planning | implementation | verification | blocked | complete
updated_at: ""

requirements:
  - id: "FR-001"
    title: ""
    status: "pending" # pending | in_progress | blocked | done
    tasks:
      - id: "TASK-001"
        description: ""
        status: "pending" # pending | in_progress | blocked | done
        files: []
        verification:
          status: "not_run" # not_run | passed | failed | partial
          commands: []
          notes: ""

blockers: []

next_actions: []
```

Rules:

- Requirement IDs MUST correspond to `PRD.md`.
- Do not create fake PRD requirement IDs just to track technical chores.
- Technical chores may be tracked as tasks beneath the requirement they support.
- Keep `updated_at` current.
- Mark only one clearly active task as `in_progress` when practical.
- Completed tasks should include verification evidence.
- Remove or resolve stale blockers instead of accumulating obsolete state.

## 9. Cross-Session Handoff

Maintain `.harness/handoff.yaml` so a new session can resume without relying on chat history.

Use the following baseline schema:

```yaml
schema_version: 1
updated_at: ""

session_summary: ""

current_objective:
  requirement_ids: []
  task_ids: []
  description: ""

completed_since_last_handoff: []

in_progress:
  description: ""
  files: []

decisions:
  - decision: ""
    reason: ""
    requirement_ids: []

blockers: []

verification:
  passed: []
  failed: []
  pending: []

next_steps: []

important_context: []

do_not_assume: []
```

Handoff rules:

1. Write concise facts, not a transcript.
2. Reference PRD IDs whenever possible.
3. Record technical decisions that the next session would otherwise have to rediscover.
4. Record exact blockers and unresolved questions.
5. Record verification already performed.
6. Record the immediate next step.
7. Do not copy the entire PRD into the handoff.
8. Do not place new requirements in the handoff.
9. If handoff content conflicts with `PRD.md`, `PRD.md` wins.

## 10. Before Ending a Work Session

Before giving the final response for a meaningful implementation session:

1. Re-read the relevant PRD acceptance criteria.
2. Check repository changes against the PRD.
3. Run applicable verification.
4. Update `.harness/progress.yaml`.
5. Update `.harness/handoff.yaml`.
6. Ensure the handoff contains a clear next action if work remains.
7. Summarize:
   - what was completed;
   - what was verified;
   - what remains;
   - blockers or decisions needed from the user.

Do not claim the project is complete while any required acceptance criterion remains unverified or unsatisfied.

## 11. Ambiguity and Decision Policy

Use the following rule to decide whether to proceed autonomously.

### Proceed without asking when

The choice is an implementation detail and all reasonable options preserve:

- PRD scope;
- documented behavior;
- acceptance criteria;
- security/privacy constraints;
- compatibility requirements.

Examples:

- local variable naming;
- internal helper extraction;
- equivalent library API usage already available in the project;
- test organization;
- non-user-visible refactoring required to implement a requirement.

### Ask the user when

The decision could change:

- product behavior;
- business rules;
- user experience;
- data semantics;
- security/privacy posture;
- supported platforms;
- compatibility;
- external interfaces;
- acceptance criteria;
- scope, schedule, or deliverables.

When asking, state the exact PRD section or missing requirement that prevents safe execution.

## 12. Existing Code vs. PRD

When existing code does not match the PRD:

1. Do not silently modify the PRD to match the code.
2. Determine whether the code is incomplete, legacy, or conflicting.
3. Treat the PRD as intended behavior.
4. Report material conflicts before destructive or broad changes.
5. Implement toward the PRD unless the user explicitly changes the requirement.

When tests conflict with the PRD, do not blindly preserve the tests. Determine whether the test is stale and update it only when the PRD clearly establishes the intended behavior.

## 13. File Safety

Unless explicitly required by the PRD or user instruction:

- Do not delete user data.
- Do not rewrite unrelated files.
- Do not modify generated artifacts directly.
- Do not expose secrets.
- Do not commit `.env` credentials or API keys.
- Do not execute destructive commands merely to recover from an error.
- Do not perform Git push, force-push, history rewriting, or destructive reset without explicit user authorization.

## 14. Git and Change Hygiene

When Git is available:

1. Inspect `git status` before broad edits.
2. Respect pre-existing user changes.
3. Do not revert unrelated modifications.
4. Keep changes scoped to the active PRD requirement.
5. Use diffs to review implementation before declaring completion.
6. Never claim a commit or push occurred unless it actually occurred.

## 15. Definition of Done

A requirement may be marked `done` only when all of the following are true:

- The implementation satisfies the relevant `PRD.md` requirement.
- Relevant acceptance criteria are satisfied.
- Applicable verification has passed, or an explicit verification limitation is documented.
- No known blocking defect remains for that requirement.
- `.harness/progress.yaml` reflects the result.
- `.harness/handoff.yaml` contains enough state for another session to continue safely.

## 16. Non-Negotiable Rules

These rules always apply:

- **PRD.md is the only source of product requirements.**
- **Do not guess missing requirements.**
- **Do not change requirements without user approval.**
- **Update PRD first when an approved requirement changes.**
- **Track implementation against PRD IDs.**
- **Keep progress.yaml current.**
- **Keep handoff.yaml useful for the next session.**
- **Verify before marking work complete.**
- **Never use progress or handoff files to override the PRD.**
