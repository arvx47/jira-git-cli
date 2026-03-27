import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import {
  getConfig,
  setConfig,
  clearConfig,
  getConfigPath,
} from "../lib/config.js";
import { getMyself } from "../lib/jira.js";

export async function configCommand(options: { reset?: boolean }) {
  if (options.reset) {
    clearConfig();
    console.log(chalk.green("✓ Configuration cleared."));
    return;
  }

  const current = getConfig();

  console.log(chalk.bold.cyan("\njira-git-cli setup\n"));

  if (current.baseUrl) {
    console.log(chalk.dim(`Current config: ${getConfigPath()}\n`));
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "baseUrl",
      message: "Jira base URL:",
      default: current.baseUrl || "https://your-org.atlassian.net",
      validate: (v: string) =>
        v.startsWith("https://") || "Must start with https://",
    },
    {
      type: "input",
      name: "email",
      message: "Jira email:",
      default: current.email || undefined,
      validate: (v: string) => v.includes("@") || "Must be a valid email",
    },
    {
      type: "password",
      name: "apiToken",
      message: "Jira API token:",
      mask: "*",
      validate: (v: string) => v.length > 0 || "Token is required",
    },
  ]);

  // Remove trailing slash from base URL
  answers.baseUrl = answers.baseUrl.replace(/\/+$/, "");

  // Test connection
  const spinner = ora("Testing connection...").start();
  try {
    const user = await getMyself(answers);
    spinner.succeed(
      `Connected as ${chalk.green(user.displayName)} (${user.emailAddress})`,
    );
  } catch (err) {
    spinner.fail("Connection failed");
    console.error(
      chalk.red(
        `\n${err instanceof Error ? err.message : "Unknown error"}\n`,
      ),
    );
    console.error(chalk.yellow("Check your credentials and try again."));
    console.error(
      chalk.dim(
        "Generate a token at: https://id.atlassian.net/manage-profile/security/api-tokens\n",
      ),
    );
    process.exit(1);
  }

  setConfig(answers);
  console.log(chalk.green(`\n✓ Config saved to ${getConfigPath()}\n`));
}
