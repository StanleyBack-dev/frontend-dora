import type {
  BroadcastAudience,
  UserGroup,
} from "@/shared/graphql/schema-enums";

export type { BroadcastAudience };

export type Broadcast = {
  id: string;
  title: string;
  body: string;
  audience: BroadcastAudience;
  /** Target access group (only when the audience is GRUPO). */
  targetGroup: UserGroup | null;
  sendEmail: boolean;
  recipients: number;
  authorName: string | null;
  createdAt: string;
};

/** The broadcasts at a glance ("recent": the last 30 days). */
export type BroadcastStats = {
  total: number;
  recent: number;
  withEmail: number;
  recentRecipients: number;
};

export type BroadcastInput = {
  title: string;
  body: string;
  audience: BroadcastAudience;
  targetGroup: UserGroup | null;
  sendEmail: boolean;
};
