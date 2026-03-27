# jira-git-cli (`jg`)

Automate Git branch creation and commits from Jira tickets. No more copy-pasting ticket IDs.

## Install

```bash
npm install -g jira-git-cli
```

## Link Locally (for development)

If you want to test this repo locally as the `jg` command:

```bash
# from this repository
npm install
npm run build
npm link
```

Then you can run:

```bash
jg --help
```

To remove the global link later:

```bash
npm unlink -g jira-git-cli
```

## Setup

Run the interactive setup wizard:

```bash
jg config
```

It will ask for:

- **Jira base URL** — e.g. `https://your-org.atlassian.net`
- **Jira email** — your Atlassian account email
- **API token** — generate one at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.net/manage-profile/security/api-tokens)

> Alternatively, set environment variables `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN`. Env vars take precedence over stored config.

## Usage

### `jg start` — Start working on a ticket

```bash
# Interactive picker — shows your assigned tickets
jg start

# Direct — create branch from a specific ticket
jg start PROJ-123
```

Creates a branch like `feature/PROJ-123-ticket-title-sanitized` and sets up a commit template.

### `jg commit` — Commit with ticket prefix

```bash
# Interactive — prompts for message, pre-fills ticket summary
jg commit

# Direct — quick commit
jg commit "added input validation"
# → PROJ-123: added input validation
```

The ticket ID is auto-detected from the branch name.

### `jg push` — Push and set upstream

```bash
jg push
```

### `jg done` — Wrap up (commit + push)

```bash
# Default message: "Done"
jg done

# Custom message
jg done "finished auth flow"
```

### `jg list` — List your open tickets

```bash
jg list
```

### `jg config` — Manage configuration

```bash
# Setup wizard
jg config

# Reset stored credentials
jg config --reset
```

## Command Reference

| Command | Alias | Description |
|---|---|---|
| `jg start [ticket]` | | Pick a ticket → create branch |
| `jg commit [message]` | `jg ci` | Commit with ticket prefix |
| `jg push` | | Push + set upstream |
| `jg done [message]` | | Commit + push |
| `jg list` | `jg ls` | List open tickets |
| `jg config` | | Setup credentials |

## How it works

1. `jg start` fetches your assigned Jira tickets via the API and lets you pick one
2. It creates a branch named `feature/PROJ-123-sanitized-title`
3. `jg commit` detects the ticket ID from the branch name and prefixes your commit message
4. `jg done` stages all changes, commits, and pushes in one command

## Requirements

- Node.js 18+
- Git

## License

MIT
