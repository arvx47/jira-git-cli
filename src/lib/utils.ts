/**
 * Sanitize a string for use as a git branch name.
 * Matches the bash version: lowercase, replace non-alphanum with dashes,
 * collapse consecutive dashes, trim leading/trailing dashes, max 60 chars.
 */
export function sanitizeBranchName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * Build a branch name from ticket key and summary.
 */
export function buildBranchName(
  ticketKey: string,
  summary: string,
  prefix = "feature",
): string {
  const sanitized = sanitizeBranchName(summary);
  return `${prefix}/${ticketKey}-${sanitized}`;
}
