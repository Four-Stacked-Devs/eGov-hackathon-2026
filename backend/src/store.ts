import { randomBytes } from "crypto";

/** The ONLY identity fields that ever leave the backend. */
export interface SanitizedProfile {
  full_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  gender: string | null;
  birth_date: string;
  mobile_number: string | null;
  email: string | null;
  full_address: string | null;
  marital_status: string | null;
}

export type NodeStatus = "locked" | "active" | "done";

export interface NodeProgress {
  status: NodeStatus;
  reference_no?: string;
}

export interface User {
  id: string;
  profile: SanitizedProfile;
  roadmap: Record<string, NodeProgress>;
}

// PROD: replace with Postgres
export const users = new Map<string, User>(); // key: identity dedupe key
export const sessions = new Map<string, User>(); // key: gabai_session cookie value

function identityKey(profile: SanitizedProfile): string {
  return [profile.first_name, profile.last_name, profile.birth_date]
    .join("|")
    .toLowerCase();
}

/**
 * Match an existing user by personal details if present, else auto-register
 * (per eGovPH SSO logic). Profiles are LOCKED — managed by eGovPH — so a
 * returning user's profile is refreshed from the gov source, never edited.
 */
export function findOrCreateUser(
  profile: SanitizedProfile,
  initialRoadmap: Record<string, NodeProgress>
): User {
  const key = identityKey(profile);
  const existing = users.get(key);
  if (existing) {
    existing.profile = profile;
    return existing;
  }
  const user: User = {
    id: randomBytes(16).toString("hex"),
    profile,
    roadmap: initialRoadmap,
  };
  users.set(key, user);
  return user;
}

export function createSession(user: User): string {
  const sessionId = randomBytes(32).toString("hex");
  sessions.set(sessionId, user);
  return sessionId;
}
