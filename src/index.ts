#!/usr/bin/env node
import { Command } from "commander";
import { configCommand } from "./commands/config.js";
import { listCommand } from "./commands/list.js";
import { startCommand } from "./commands/start.js";
import { commitCommand } from "./commands/commit.js";
import { pushCommand } from "./commands/push.js";
import { doneCommand } from "./commands/done.js";

const program = new Command();

program
  .name("jg")
  .description("Automate Git branch creation and commits from Jira tickets")
  .version("1.0.0");

program
  .command("config")
  .description("Setup Jira credentials (interactive wizard)")
  .option("--reset", "Clear all stored configuration")
  .action(configCommand);

program
  .command("list")
  .alias("ls")
  .description("List your assigned open tickets")
  .action(listCommand);

program
  .command("start [ticket]")
  .description(
    "Create a branch from a Jira ticket (interactive picker if no ticket given)",
  )
  .action(startCommand);

program
  .command("commit [message]")
  .alias("ci")
  .description("Commit with ticket ID prefix (auto-detected from branch)")
  .action(commitCommand);

program
  .command("push")
  .description("Push current branch and set upstream")
  .action(pushCommand);

program
  .command("done [message]")
  .description("Commit + push in one shot (default message: 'Done')")
  .action(doneCommand);

program.parse();
