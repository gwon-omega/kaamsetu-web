/**
 * WatermelonDB Models — Hire Record
 * Offline-first local database model for hire records
 */

import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";
import type Worker from "./Worker";

export default class HireRecord extends Model {
  static table = "hire_records";

  static associations: Associations = {
    workers: { type: "belongs_to", key: "worker_id" },
  };

  @relation("workers", "worker_id") worker!: Worker;

  @field("worker_id") workerId!: string;
  @field("hirer_id") hirerId!: string;

  // IP tracking
  @field("hirer_ip") hirerIp!: string;
  @field("ip_fingerprint") ipFingerprint?: string;

  // Status
  @field("status") status!: "pending" | "accepted" | "rejected" | "completed" | "cancelled";

  // Location context
  @field("hire_province_id") hireProvinceId?: number;
  @field("hire_district_id") hireDistrictId?: number;
  @field("hire_local_unit_id") hireLocalUnitId?: number;

  // Work details
  @field("work_description") workDescription?: string;
  @field("agreed_rate_npr") agreedRateNpr?: number;
  @date("work_date") workDate?: Date;
  @field("work_duration_days") workDurationDays!: number;

  // Timeline
  @date("hired_at") hiredAt!: Date;
  @date("accepted_at") acceptedAt?: Date;
  @date("completed_at") completedAt?: Date;
  @date("cancelled_at") cancelledAt?: Date;

  // Review
  @field("rating") rating?: number;
  @field("review_text") reviewText?: string;
  @date("reviewed_at") reviewedAt?: Date;

  // Sync metadata
  @field("server_id") serverId?: string; // UUID from Supabase
  @field("is_synced") isSynced!: boolean;
  @field("needs_upload") needsUpload!: boolean; // Pending upload to server
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
  @date("last_synced_at") lastSyncedAt?: Date;
}
