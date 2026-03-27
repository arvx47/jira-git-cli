import chalk from "chalk";
import ora from "ora";
import { validateConfig } from "../lib/config.js";
import { getMyOpenIssues } from "../lib/jira.js";

export async function listCommand() {
  const config = validateConfig();
  const spinner = ora("Fetching your tickets...").start();

  try {
    const issues = await getMyOpenIssues(config);

    if (issues.length === 0) {
      spinner.warn("No open tickets assigned to you.");
      return;
    }

    spinner.stop();
    console.log(
      chalk.bold.cyan(`\nYour Open Tickets`) +
        ` (${issues.length})\n`,
    );

    for (const issue of issues) {
      const key = chalk.green(issue.key.padEnd(12));
      const status = chalk.yellow(issue.fields.status.name.padEnd(14));
      const type = chalk.blue(issue.fields.issuetype.name.padEnd(10));
      console.log(`${key} ${status} ${type} ${issue.fields.summary}`);
    }

    console.log();
  } catch (err) {
    spinner.fail("Failed to fetch tickets");
    console.error(
      chalk.red(err instanceof Error ? err.message : "Unknown error"),
    );
    process.exit(1);
  }
}
