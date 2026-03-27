import chalk from "chalk";
import { validateConfig } from "../lib/config.js";
import {
  isGitRepo,
  currentBranch,
  extractTicketFromBranch,
  commitAll,
  hasChanges,
  pushWithUpstream,
} from "../lib/git.js";

export async function doneCommand(message = "Done") {
  const config = validateConfig();

  if (!(await isGitRepo())) {
    console.error(chalk.red("✗ Not a git repository."));
    process.exit(1);
  }

  const branch = await currentBranch();
  const ticketKey = extractTicketFromBranch(branch);

  if (!ticketKey) {
    console.error(chalk.red("✗ Could not detect ticket ID from branch name."));
    process.exit(1);
  }

  // Stage and commit if there are changes
  if (await hasChanges()) {
    const fullMessage = `${ticketKey}: ${message}`;
    await commitAll(fullMessage);
    console.log(chalk.green(`✓ Committed: ${fullMessage}`));
  } else {
    console.log(chalk.yellow("No changes to commit."));
  }

  // Push
  try {
    await pushWithUpstream();
    console.log(chalk.green(`✓ Pushed ${chalk.blue(branch)}`));
  } catch (err) {
    console.error(chalk.red("✗ Push failed"));
    console.error(
      chalk.red(err instanceof Error ? err.message : "Unknown error"),
    );
    process.exit(1);
  }

  console.log(
    chalk.bold.green(`\n✓ ${ticketKey} — work pushed!`),
  );
  console.log(
    chalk.cyan(`  Ticket: ${config.baseUrl}/browse/${ticketKey}\n`),
  );
}
