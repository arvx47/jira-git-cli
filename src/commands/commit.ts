import chalk from "chalk";
import inquirer from "inquirer";
import { validateConfig } from "../lib/config.js";
import { getIssue } from "../lib/jira.js";
import {
  isGitRepo,
  currentBranch,
  extractTicketFromBranch,
  commitAll,
  hasChanges,
} from "../lib/git.js";

export async function commitCommand(message?: string) {
  if (!(await isGitRepo())) {
    console.error(chalk.red("✗ Not a git repository."));
    process.exit(1);
  }

  const branch = await currentBranch();
  const ticketKey = extractTicketFromBranch(branch);

  if (!ticketKey) {
    console.error(chalk.red("✗ Could not detect ticket ID from branch name."));
    console.error("  Branch name should contain a pattern like PROJ-123");
    process.exit(1);
  }

  if (!(await hasChanges())) {
    console.log(chalk.yellow("No changes to commit."));
    return;
  }

  // If no message provided, prompt interactively
  if (!message) {
    let summary = "";
    try {
      const config = validateConfig();
      const issue = await getIssue(config, ticketKey);
      summary = issue.fields.summary ?? "";
    } catch {
      // Non-fatal, continue without summary
    }

    const { userMessage } = await inquirer.prompt([
      {
        type: "input",
        name: "userMessage",
        message: `Commit message (${chalk.green(ticketKey)}):`,
        default: summary || undefined,
        validate: (v: string) => v.length > 0 || "Message is required",
      },
    ]);

    message = userMessage;
  }

  const fullMessage = `[${ticketKey}] ${message}`;
  const hash = await commitAll(fullMessage);

  if (hash) {
    console.log(chalk.green(`✓ Committed: ${fullMessage}`));
  } else {
    console.log(chalk.yellow("Nothing was committed."));
  }
}
