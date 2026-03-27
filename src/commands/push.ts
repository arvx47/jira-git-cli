import chalk from "chalk";
import ora from "ora";
import { isGitRepo, currentBranch, pushWithUpstream } from "../lib/git.js";

export async function pushCommand() {
  if (!(await isGitRepo())) {
    console.error(chalk.red("✗ Not a git repository."));
    process.exit(1);
  }

  const branch = await currentBranch();
  const spinner = ora(`Pushing ${branch}...`).start();

  try {
    await pushWithUpstream();
    spinner.succeed(`Pushed ${chalk.blue(branch)} and upstream set`);
  } catch (err) {
    spinner.fail("Push failed");
    console.error(
      chalk.red(err instanceof Error ? err.message : "Unknown error"),
    );
    process.exit(1);
  }
}
