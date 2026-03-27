import type { JiraConfig } from "./config.js";

export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    issuetype: { name: string };
    priority?: { name: string };
  };
}

interface SearchResponse {
  issues: JiraIssue[];
  total?: number;
}

function authHeader(config: JiraConfig): string {
  return (
    "Basic " +
    Buffer.from(`${config.email}:${config.apiToken}`).toString("base64")
  );
}

async function jiraGet(
  config: JiraConfig,
  endpoint: string,
): Promise<unknown> {
  const url = `${config.baseUrl}/rest/api/3/${endpoint}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader(config),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jira API error (${res.status}): ${body}`);
  }

  return res.json();
}

async function jiraPost(
  config: JiraConfig,
  endpoint: string,
  data: unknown,
): Promise<unknown> {
  const url = `${config.baseUrl}/rest/api/3/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader(config),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jira API error (${res.status}): ${body}`);
  }

  return res.json();
}

/**
 * Search issues using the new /search/jql POST endpoint.
 */
export async function searchIssues(
  config: JiraConfig,
  jql: string,
  fields: string[] = ["summary", "status", "issuetype"],
  maxResults = 30,
): Promise<SearchResponse> {
  const data = await jiraPost(config, "search/jql", {
    jql,
    fields,
    maxResults,
  });
  return data as SearchResponse;
}

/**
 * Get a single issue by key.
 */
export async function getIssue(
  config: JiraConfig,
  key: string,
): Promise<JiraIssue> {
  const data = await jiraGet(
    config,
    `issue/${key}?fields=summary,status,issuetype,priority`,
  );
  return data as JiraIssue;
}

/**
 * Get the authenticated user's display name (used for connection test).
 */
export async function getMyself(
  config: JiraConfig,
): Promise<{ displayName: string; emailAddress: string }> {
  const data = await jiraGet(config, "myself");
  return data as { displayName: string; emailAddress: string };
}

/**
 * Get assigned open tickets for the current user.
 */
export async function getMyOpenIssues(
  config: JiraConfig,
): Promise<JiraIssue[]> {
  const jql =
    "assignee=currentUser() AND status NOT IN (Done, Closed, Resolved) ORDER BY updated DESC";
  const result = await searchIssues(
    config,
    jql,
    ["summary", "status", "issuetype", "priority"],
    30,
  );
  return result.issues ?? [];
}
