export interface UserProfile {
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

export interface RoadmapFormField {
  name: string;
  label: string;
  prefillFrom: string | null;
}

export interface RoadmapNode {
  id: string;
  order: number;
  title: string;
  description: string;
  requirements: string[];
  fee_php: number;
  duration_weeks: number;
  office_visit: boolean;
  steps: string[];
  form: RoadmapFormField[];
  status: NodeStatus;
  reference_no: string | null;
}

export interface RoadmapSummary {
  total_fee_php: number;
  total_weeks_estimate: number;
  office_visits: number;
}

export interface RoadmapData {
  journey_id: string;
  title: string;
  subtitle: string;
  nodes: RoadmapNode[];
  summary: RoadmapSummary;
}

export interface AuthResult {
  user: UserProfile;
  simulated: boolean;
}

export interface SubmitResult {
  status: "SUBMITTED";
  reference_no: string;
  node_id: string;
  next_node_id: string | null;
  simulated: true;
}

export interface ChatResult {
  text: string;
  credits_remaining?: number;
  simulated: boolean;
}
