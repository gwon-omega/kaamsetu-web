/**
 * WatermelonDB Models — Worker Profile
 * Offline-first local database model for workers
 */

import { Model } from "@nozbe/watermelondb";
import { field, readonly, date, relation } from "@nozbe/watermelondb/decorators";
import type { Associations } from "@nozbe/watermelondb/Model";

export default class Worker extends Model {
  static table = "workers";

  static associations: Associations = {
    hire_records: { type: "has_many", foreignKey: "worker_id" },
  };

  @field("user_id") userId!: string;
  @field("job_category_id") jobCategoryId!: number;
  @field("province_id") provinceId!: number;
  @field("district_id") districtId!: number;
  @field("local_unit_id") localUnitId!: number;
  @field("ward_no") wardNo!: number;

  // Profile info
  @field("full_name") fullName!: string;
  @field("full_name_np") fullNameNp?: string;
  @field("avatar_url") avatarUrl?: string;

  // Status
  @field("is_available") isAvailable!: boolean;
  @field("is_approved") isApproved!: boolean;

  // Work details
  @field("experience_yrs") experienceYrs!: number;
  @field("about") about?: string;
  @field("daily_rate_npr") dailyRateNpr?: number;
  @field("citizenship_no") citizenshipNo?: string;

  // Stats (denormalized for performance)
  @field("total_hires") totalHires!: number;
  @field("pending_hires") pendingHires!: number;
  @field("avg_rating") avgRating!: number;
  @field("total_reviews") totalReviews!: number;

  // Sync metadata
  @field("server_id") serverId?: string; // UUID from Supabase
  @field("is_synced") isSynced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
  @date("last_synced_at") lastSyncedAt?: Date;
}
