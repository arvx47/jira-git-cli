import { simpleGit, SimpleGit } from "simple-git";

let _git: SimpleGit | null = null;

function git(): SimpleGit {
  if (!_git) {
    _git = simpleGit();
  }
  return _git;
}

/**
 * Get current branch name.
 */
export async function currentBranch(): Promise<string> {
  const branch = await git().revparse(["--abbrev-ref", "HEAD"]);
  return branch.trim();
}

/**
 * Extract Jira ticket ID from branch name (e.g., feature/PROJ-123-some-title → PROJ-123).
 */
export function extractTicketFromBranch(branchName: string): string | null {
  const match = branchName.match(/[A-Z]+-\d+/);
  return match ? match[0] : null;
}

/**
 * Check if a local branch exists.
 */
export async function branchExists(name: string): Promise<boolean> {
  const branches = await git().branchLocal();
  return branches.all.includes(name);
}

/**
 * Create and checkout a new branch.
 */
export async function createBranch(name: string): Promise<void> {
  await git().checkoutLocalBranch(name);
}

/**
 * Checkout an existing branch.
 */
export async function checkout(name: string): Promise<void> {
  await git().checkout(name);
}

/**
 * Stage all changes, commit with message.
 */
export async function commitAll(message: string): Promise<string> {
  await git().add("-A");
  const result = await git().commit(message);
  return result.commit;
}

/**
 * Check if there are staged or unstaged changes.
 */
export async function hasChanges(): Promise<boolean> {
  const status = await git().status();
  return !status.isClean();
}

/**
 * Push current branch and set upstream.
 */
export async function pushWithUpstream(): Promise<void> {
  const branch = await currentBranch();
  await git().push(["-u", "origin", branch]);
}

/**
 * Check if we're inside a git repo.
 */
export async function isGitRepo(): Promise<boolean> {
  try {
    await git().revparse(["--git-dir"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Write commit template to .git/COMMIT_TEMPLATE.
 */
export async function writeCommitTemplate(content: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const gitDir = (await git().revparse(["--git-dir"])).trim();
  const templatePath = path.join(gitDir, "COMMIT_TEMPLATE");
  await fs.writeFile(templatePath, content, "utf-8");
  return templatePath;
}
