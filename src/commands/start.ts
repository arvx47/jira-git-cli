import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import { validateConfig } from "../lib/config.js";
import { getMyOpenIssues, getIssue } from "../lib/jira.js";
import {
  isGitRepo,
  branchExists,
  createBranch,
  checkout,
  writeCommitTemplate,
} from "../lib/git.js";
import { buildBranchName } from "../lib/utils.js";

export async function startCommand(ticketKey?: string) {
  const config = validateConfig();

  if (!(await isGitRepo())) {
    console.error(chalk.red("✗ Not a git repository."));
    process.exit(1);
  }

  // If no ticket key, show interactive picker
  if (!ticketKey) {
    const spinner = ora("Fetching your tickets...").start();
    const issues = await getMyOpenIssues(config);

    if (issues.length === 0) {
      spinner.warn("No open tickets assigned to you.");
      return;
    }

    spinner.stop();

    const { selected } = await inquirer.prompt([
      {
        type: "list",
        name: "selected",
        message: "Pick a ticket to start working on:",
        choices: issues.map((issue) => ({
          name: `${chalk.green(issue.key)} ${chalk.dim("|")} ${chalk.yellow(issue.fields.status.name)} ${chalk.dim("|")} ${issue.fields.summary}`,
          value: issue.key,
          short: issue.key,
        })),
        pageSize: 15,
      },
    ]);

    ticketKey = selected as string;
  }

  // Fetch ticket details
  const spinner = ora(`Fetching ${ticketKey}...`).start();

  let issue;
  try {
    issue = await getIssue(config, ticketKey);
  } catch {
    spinner.fail(`Could not find ticket ${ticketKey}`);
    process.exit(1);
  }

  const summary = issue.fields.summary;
  const status = issue.fields.status.name;

  if (!summary) {
    spinner.fail(`Ticket ${ticketKey} has no summary`);
    process.exit(1);
  }

  spinner.stop();

  // Build branch name
  const branchName = buildBranchName(ticketKey, summary);

  console.log();
  console.log(`${chalk.bold("Ticket:")}  ${chalk.green(ticketKey)} — ${summary}`);
  console.log(`${chalk.bold("Status:")}  ${chalk.yellow(status)}`);
  console.log(`${chalk.bold("Branch:")}  ${chalk.blue(branchName)}`);
  console.log();

  // Create or switch to branch
  if (await branchExists(branchName)) {
    console.log(chalk.yellow("Branch already exists. Switching..."));
    await checkout(branchName);
  } else {
    await createBranch(branchName);
    console.log(chalk.green("✓ Branch created and checked out"));
  }

  // Write commit template
  try {
    await writeCommitTemplate(`${ticketKey}: `);
    console.log(chalk.green("✓ Commit template set"));
  } catch {
    // Non-fatal, skip silently
  }
}
