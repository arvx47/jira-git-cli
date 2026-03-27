import Conf from "conf";
import chalk from "chalk";

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

const store = new Conf<JiraConfig>({
  projectName: "jira-git-cli",
  schema: {
    baseUrl: { type: "string", default: "" },
    email: { type: "string", default: "" },
    apiToken: { type: "string", default: "" },
  },
});

/**
 * Get config, checking env vars first then falling back to stored config.
 * Env vars take precedence so existing users of the bash script can migrate easily.
 */
export function getConfig(): JiraConfig {
  return {
    baseUrl: process.env.JIRA_BASE_URL || store.get("baseUrl", ""),
    email: process.env.JIRA_EMAIL || store.get("email", ""),
    apiToken: process.env.JIRA_API_TOKEN || store.get("apiToken", ""),
  };
}

export function setConfig(config: Partial<JiraConfig>): void {
  if (config.baseUrl) store.set("baseUrl", config.baseUrl);
  if (config.email) store.set("email", config.email);
  if (config.apiToken) store.set("apiToken", config.apiToken);
}

export function clearConfig(): void {
  store.clear();
}

export function getConfigPath(): string {
  return store.path;
}

export function validateConfig(): JiraConfig {
  const config = getConfig();
  const missing: string[] = [];

  if (!config.baseUrl) missing.push("JIRA_BASE_URL");
  if (!config.email) missing.push("JIRA_EMAIL");
  if (!config.apiToken) missing.push("JIRA_API_TOKEN");

  if (missing.length > 0) {
    console.error(chalk.red(`\n✗ Missing configuration: ${missing.join(", ")}`));
    console.error(chalk.yellow("\nRun setup wizard:"));
    console.error(`  ${chalk.cyan("jg config")}\n`);
    console.error(chalk.yellow("Or set environment variables:"));
    console.error('  export JIRA_BASE_URL="https://your-org.atlassian.net"');
    console.error('  export JIRA_EMAIL="your-email@example.com"');
    console.error('  export JIRA_API_TOKEN="your-api-token"\n');
    process.exit(1);
  }

  return config;
}
