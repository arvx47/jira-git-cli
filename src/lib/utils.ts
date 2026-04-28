function sanitizeBranchName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function buildBranchName(
  ticketKey: string,
  prefix = "feature",
  summary?: string,
): string {
  const suffix = summary ? `-${sanitizeBranchName(summary)}` : "";
  return `${prefix}/${ticketKey}${suffix}`;
}
