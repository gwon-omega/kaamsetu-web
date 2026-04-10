/**
 * Supabase API client for Shram Sewa
 * Shared between web and android apps
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { districts } from "../constants";
import type {
  HireRecord,
  HireStatus,
  PushPlatform,
  WorkerDisplay,
} from "../types";
import {
  createHireRequestSchema,
  submitReviewSchema,
  updateHireStatusSchema,
  updateWorkerProfileSchema,
  type CreateHireRequestInput,
  type SubmitReviewInput,
  type UpdateHireStatusInput,
  type UpdateWorkerProfileInput,
} from "../validation";

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export type TypedSupabaseClient = SupabaseClient<Database>;

interface SupabaseAuthStorage {
  getItem: (key: string) => string | Promise<string | null> | null;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      persistSession?: boolean;
      autoRefreshToken?: boolean;
      detectSessionInUrl?: boolean;
      storage?: SupabaseAuthStorage;
    };
  };
}

let supabaseClient: TypedSupabaseClient | null = null;

/**
 * Initialize the Supabase client
 * Call this once at app startup with your env variables
 */
export function initSupabase(config: SupabaseConfig): TypedSupabaseClient {
  const auth = config.options?.auth;

  supabaseClient = createClient<Database>(config.url, config.anonKey, {
    auth: {
      persistSession: auth?.persistSession ?? true,
      autoRefreshToken: auth?.autoRefreshToken ?? true,
      detectSessionInUrl: auth?.detectSessionInUrl ?? true,
      storage: auth?.storage,
    },
  });
  return supabaseClient;
}

/**
 * Get the initialized Supabase client
 * Throws if not initialized
 */
export function getSupabase(): TypedSupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      "Supabase client not initialized. Call initSupabase() first.",
    );
  }
  return supabaseClient;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════════════════════

export const authApi = {
  /**
   * Request OTP for phone login
   */
  async requestOtp(phone: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return { success: true };
  },

  /**
   * Verify OTP and complete login
   */
  async verifyOtp(phone: string, token: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    const supabase = getSupabase();
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// WORKERS API
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkerFilters {
  provinceId?: number;
  districtId?: number;
  localUnitId?: number;
  wardNo?: number;
  jobCategoryId?: number;
  isAvailable?: boolean;
  minRating?: number;
  maxDailyRate?: number;
}

type WorkerRelation = {
  user?:
    | {
        full_name?: string | null;
        full_name_np?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        full_name_np?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
      }>
    | null;
  job_category?:
    | {
        name_en?: string | null;
        name_np?: string | null;
        icon?: string | null;
      }
    | Array<{
        name_en?: string | null;
        name_np?: string | null;
        icon?: string | null;
      }>
    | null;
  province?:
    | {
        name_en?: string | null;
        name_np?: string | null;
      }
    | Array<{
        name_en?: string | null;
        name_np?: string | null;
      }>
    | null;
  district?:
    | {
        name_en?: string | null;
        name_np?: string | null;
      }
    | Array<{
        name_en?: string | null;
        name_np?: string | null;
      }>
    | null;
  local_unit?:
    | {
        name_en?: string | null;
        name_np?: string | null;
        unit_type?:
          | "metropolitan"
          | "sub_metropolitan"
          | "municipality"
          | "rural_municipality"
          | null;
      }
    | Array<{
        name_en?: string | null;
        name_np?: string | null;
        unit_type?:
          | "metropolitan"
          | "sub_metropolitan"
          | "municipality"
          | "rural_municipality"
          | null;
      }>
    | null;
};

type WorkerRow = Database["public"]["Tables"]["worker_profiles"]["Row"] &
  WorkerRelation;

type HireRow = Database["public"]["Tables"]["hire_records"]["Row"];
type PushTokenRow = Database["public"]["Tables"]["push_tokens"]["Row"];

const districtToProvinceIdMap = new Map(
  districts.map((district) => [district.id, district.provinceId]),
);

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function safeDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function safeOptionalDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

type LocationContextInput = {
  provinceId?: number;
  districtId?: number;
  localUnitId?: number;
};

async function validateLocationContext(
  supabase: TypedSupabaseClient,
  location: LocationContextInput,
): Promise<void> {
  if (location.districtId && location.provinceId) {
    const expectedProvinceId = districtToProvinceIdMap.get(location.districtId);
    if (!expectedProvinceId || expectedProvinceId !== location.provinceId) {
      throw new Error("District does not belong to the selected province.");
    }
  }

  if (!location.localUnitId) {
    return;
  }

  const { data: localUnitRaw, error: localUnitError } = await (supabase as any)
    .from("local_units")
    .select("id, district_id")
    .eq("id", location.localUnitId)
    .single();

  const localUnit = localUnitRaw as { id: number; district_id: number } | null;

  if (localUnitError || !localUnit) {
    throw new Error("Invalid local unit ID.");
  }

  if (location.districtId && localUnit.district_id !== location.districtId) {
    throw new Error("Local unit does not belong to the selected district.");
  }

  if (location.provinceId) {
    const expectedProvinceId = districtToProvinceIdMap.get(
      localUnit.district_id,
    );
    if (!expectedProvinceId || expectedProvinceId !== location.provinceId) {
      throw new Error("Local unit does not belong to the selected province.");
    }
  }
}

const allowedHireStatusTransitions: Record<HireStatus, HireStatus[]> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["completed", "cancelled"],
  rejected: [],
  completed: [],
  cancelled: [],
};

async function syncWorkerAvailability(
  supabase: TypedSupabaseClient,
  workerProfileId: string,
): Promise<void> {
  const { count, error } = await supabase
    .from("hire_records")
    .select("id", { count: "exact", head: true })
    .eq("worker_id", workerProfileId)
    .eq("status", "accepted");

  if (error) {
    throw error;
  }

  const isBusy = (count ?? 0) > 0;

  const { error: updateError } = await (supabase as any)
    .from("worker_profiles")
    .update({ is_available: !isBusy } as any)
    .eq("id", workerProfileId);

  if (updateError) {
    throw updateError;
  }
}

function mapWorkerRow(row: WorkerRow): WorkerDisplay {
  const user = firstRelation(row.user);
  const jobCategory = firstRelation(row.job_category);
  const province = firstRelation(row.province);
  const district = firstRelation(row.district);
  const localUnit = firstRelation(row.local_unit);

  return {
    id: row.id,
    userId: row.user_id,
    fullName: user?.full_name ?? "",
    fullNameNp: user?.full_name_np ?? undefined,
    avatarUrl: user?.avatar_url ?? undefined,
    jobCategoryId: row.job_category_id,
    jobCategoryNameEn: jobCategory?.name_en ?? undefined,
    jobCategoryNameNp: jobCategory?.name_np ?? undefined,
    provinceId: row.province_id,
    districtId: row.district_id,
    districtNameEn: district?.name_en ?? undefined,
    districtNameNp: district?.name_np ?? undefined,
    localUnitId: row.local_unit_id,
    localUnitNameEn: localUnit?.name_en ?? undefined,
    localUnitNameNp: localUnit?.name_np ?? undefined,
    wardNo: row.ward_no,
    isAvailable: row.is_available,
    isApproved: row.is_approved,
    approvalNote: row.approval_note ?? undefined,
    experienceYrs: row.experience_yrs,
    about: row.about ?? undefined,
    dailyRateNpr: row.daily_rate_npr ?? undefined,
    citizenshipNo: row.citizenship_no ?? undefined,
    totalHires: row.total_hires,
    pendingHires: row.pending_hires,
    avgRating: row.avg_rating,
    totalReviews: row.total_reviews,
    createdAt: safeDate(row.created_at),
    updatedAt: safeDate(row.updated_at),
    user: {
      fullName: user?.full_name ?? "",
      fullNameNp: user?.full_name_np ?? undefined,
      phone: user?.phone ?? "",
      avatarUrl: user?.avatar_url ?? undefined,
    },
    jobCategory: {
      nameEn: jobCategory?.name_en ?? "",
      nameNp: jobCategory?.name_np ?? "",
      icon: jobCategory?.icon ?? undefined,
    },
    province: {
      nameEn: province?.name_en ?? "",
      nameNp: province?.name_np ?? "",
    },
    district: {
      nameEn: district?.name_en ?? "",
      nameNp: district?.name_np ?? undefined,
    },
    localUnit: {
      nameEn: localUnit?.name_en ?? "",
      nameNp: localUnit?.name_np ?? undefined,
      unitType: localUnit?.unit_type ?? "municipality",
    },
  };
}

export const workersApi = {
  /**
   * Search workers with filters
   */
  async search(filters: WorkerFilters, page = 1, pageSize = 20) {
    const supabase = getSupabase();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("worker_profiles")
      .select(
        `
        *,
        user:users(full_name, full_name_np, avatar_url),
        job_category:job_categories(name_en, name_np, icon),
        province:provinces(name_en, name_np),
        district:districts(name_en, name_np),
        local_unit:local_units(name_en, name_np, unit_type)
      `,
        { count: "exact" },
      )
      .eq("is_approved", true)
      .range(from, to);

    if (filters.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable);
    }

    // Apply filters
    if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
    if (filters.districtId) query = query.eq("district_id", filters.districtId);
    if (filters.localUnitId)
      query = query.eq("local_unit_id", filters.localUnitId);
    if (filters.wardNo) query = query.eq("ward_no", filters.wardNo);
    if (filters.jobCategoryId)
      query = query.eq("job_category_id", filters.jobCategoryId);
    if (filters.minRating) query = query.gte("avg_rating", filters.minRating);
    if (filters.maxDailyRate)
      query = query.lte("daily_rate_npr", filters.maxDailyRate);

    const { data, error, count } = await query;
    if (error) throw error;

    const workers = ((data ?? []) as WorkerRow[]).map(mapWorkerRow);

    return {
      data: workers,
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > to + 1,
    };
  },

  /**
   * Get single worker by ID
   */
  async getById(workerId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select(
        `
        *,
        user:users(full_name, full_name_np, avatar_url),
        job_category:job_categories(name_en, name_np, icon),
        province:provinces(name_en, name_np),
        district:districts(name_en, name_np),
        local_unit:local_units(name_en, name_np, unit_type)
      `,
      )
      .eq("id", workerId)
      .single();

    if (error) throw error;
    return mapWorkerRow(data as WorkerRow);
  },

  async getByUserId(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("worker_profiles")
      .select(
        `
        *,
        user:users(full_name, full_name_np, avatar_url),
        job_category:job_categories(name_en, name_np, icon),
        province:provinces(name_en, name_np),
        district:districts(name_en, name_np),
        local_unit:local_units(name_en, name_np, unit_type)
      `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return null;
    }

    return mapWorkerRow(data as WorkerRow);
  },
};

export const workerProfilesApi = {
  async updateById(
    profileId: string,
    input: UpdateWorkerProfileInput,
  ): Promise<WorkerDisplay> {
    const supabase = getSupabase();
    const parsed = updateWorkerProfileSchema.parse(input);

    const { data: existingProfileRaw, error: existingProfileError } = await (
      supabase as any
    )
      .from("worker_profiles")
      .select("province_id, district_id, local_unit_id")
      .eq("id", profileId)
      .single();

    const existingProfile = existingProfileRaw as {
      province_id: number;
      district_id: number;
      local_unit_id: number;
    } | null;

    if (existingProfileError || !existingProfile) {
      throw existingProfileError ?? new Error("Worker profile not found.");
    }

    await validateLocationContext(supabase, {
      provinceId: parsed.provinceId ?? existingProfile.province_id,
      districtId: parsed.districtId ?? existingProfile.district_id,
      localUnitId: parsed.localUnitId ?? existingProfile.local_unit_id,
    });

    const patch: Database["public"]["Tables"]["worker_profiles"]["Update"] = {};

    if (parsed.jobCategoryId !== undefined) {
      patch.job_category_id = parsed.jobCategoryId;
    }

    if (parsed.provinceId !== undefined) {
      patch.province_id = parsed.provinceId;
    }

    if (parsed.districtId !== undefined) {
      patch.district_id = parsed.districtId;
    }

    if (parsed.localUnitId !== undefined) {
      patch.local_unit_id = parsed.localUnitId;
    }

    if (parsed.wardNo !== undefined) {
      patch.ward_no = parsed.wardNo;
    }

    if (parsed.experienceYrs !== undefined) {
      patch.experience_yrs = parsed.experienceYrs;
    }

    if (parsed.about !== undefined) {
      patch.about = parsed.about;
    }

    if (parsed.dailyRateNpr !== undefined) {
      patch.daily_rate_npr = parsed.dailyRateNpr;
    }

    if (parsed.citizenshipNo !== undefined) {
      patch.citizenship_no = parsed.citizenshipNo;
    }

    if (parsed.isAvailable !== undefined) {
      patch.is_available = parsed.isAvailable;
    }

    const { data, error } = await (supabase as any)
      .from("worker_profiles")
      .update(patch as any)
      .eq("id", profileId)
      .select(
        `
        *,
        user:users(full_name, full_name_np, avatar_url),
        job_category:job_categories(name_en, name_np, icon),
        province:provinces(name_en, name_np),
        district:districts(name_en, name_np),
        local_unit:local_units(name_en, name_np, unit_type)
      `,
      )
      .single();

    if (error) throw error;
    return mapWorkerRow(data as WorkerRow);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HIRE RECORDS API
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateHireRequest extends CreateHireRequestInput {
  hireProvinceId?: number;
  hireDistrictId?: number;
  hireLocalUnitId?: number;
}

function mapHireRow(row: HireRow): HireRecord {
  return {
    id: row.id,
    workerId: row.worker_id,
    hirerId: row.hirer_id,
    hirerIp: row.hirer_ip,
    ipFingerprint: row.ip_fingerprint ?? undefined,
    status: row.status as HireStatus,
    hireProvinceId: row.hire_province_id ?? undefined,
    hireDistrictId: row.hire_district_id ?? undefined,
    hireLocalUnitId: row.hire_local_unit_id ?? undefined,
    workDescription: row.work_description ?? undefined,
    agreedRateNpr: row.agreed_rate_npr ?? undefined,
    workDate: safeOptionalDate(row.work_date),
    workDurationDays: row.work_duration_days,
    hiredAt: safeDate(row.hired_at),
    acceptedAt: safeOptionalDate(row.accepted_at),
    completedAt: safeOptionalDate(row.completed_at),
    cancelledAt: safeOptionalDate(row.cancelled_at),
    rating: row.rating ?? undefined,
    reviewText: row.review_text ?? undefined,
    reviewedAt: safeOptionalDate(row.reviewed_at),
  };
}

export const mapperUtils = {
  mapWorkerRow,
  mapHireRow,
};

export const hireApi = {
  async create(request: CreateHireRequest): Promise<HireRecord> {
    const supabase = getSupabase();
    const parsed = createHireRequestSchema.parse(request);

    await validateLocationContext(supabase, {
      provinceId: parsed.hireProvinceId,
      districtId: parsed.hireDistrictId,
      localUnitId: parsed.hireLocalUnitId,
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const hirerId = userData.user?.id;
    if (!hirerId) {
      throw new Error("Authentication is required to create a hire request.");
    }

    if (!parsed.hirerIp) {
      const { data, error } = await supabase.functions.invoke("hire-worker", {
        body: {
          workerId: parsed.workerId,
          ipFingerprint: parsed.ipFingerprint,
          workDescription: parsed.workDescription,
          agreedRateNpr: parsed.agreedRateNpr,
          workDate: parsed.workDate
            ? parsed.workDate.toISOString().slice(0, 10)
            : undefined,
          workDurationDays: parsed.workDurationDays,
          hireProvinceId: parsed.hireProvinceId,
          hireDistrictId: parsed.hireDistrictId,
          hireLocalUnitId: parsed.hireLocalUnitId,
        },
      });

      if (error) throw error;

      const functionPayload = data as {
        hireRecord?: HireRow;
        error?: string;
      } | null;

      if (!functionPayload?.hireRecord) {
        throw new Error(
          functionPayload?.error ??
            "Server-side hire creation did not return a hire record.",
        );
      }

      return mapHireRow(functionPayload.hireRecord);
    }

    const payload: Database["public"]["Tables"]["hire_records"]["Insert"] = {
      worker_id: parsed.workerId,
      hirer_id: hirerId,
      hirer_ip: parsed.hirerIp,
      ip_fingerprint: parsed.ipFingerprint ?? null,
      hire_province_id: parsed.hireProvinceId ?? null,
      hire_district_id: parsed.hireDistrictId ?? null,
      hire_local_unit_id: parsed.hireLocalUnitId ?? null,
      work_description: parsed.workDescription ?? null,
      agreed_rate_npr: parsed.agreedRateNpr ?? null,
      work_date: parsed.workDate
        ? parsed.workDate.toISOString().slice(0, 10)
        : null,
      work_duration_days: parsed.workDurationDays,
      status: "pending",
    };

    const { data, error } = await (supabase as any)
      .from("hire_records")
      .insert(payload as any)
      .select("*")
      .single();

    if (error) throw error;
    return mapHireRow(data as HireRow);
  },

  async updateStatus(input: UpdateHireStatusInput): Promise<HireRecord> {
    const supabase = getSupabase();
    const parsed = updateHireStatusSchema.parse(input);
    const now = new Date().toISOString();

    const { data: existingHireRaw, error: existingHireError } = await (
      supabase as any
    )
      .from("hire_records")
      .select("id, worker_id, status")
      .eq("id", parsed.hireId)
      .single();

    const existingHire = existingHireRaw as {
      id: string;
      worker_id: string;
      status: HireStatus;
    } | null;

    if (existingHireError || !existingHire) {
      throw existingHireError ?? new Error("Hire record not found.");
    }

    const currentStatus = existingHire.status as HireStatus;
    if (parsed.status !== currentStatus) {
      const allowedStatuses = allowedHireStatusTransitions[currentStatus] ?? [];
      if (!allowedStatuses.includes(parsed.status)) {
        throw new Error(
          `Invalid status transition from ${currentStatus} to ${parsed.status}.`,
        );
      }
    }

    const patch: Database["public"]["Tables"]["hire_records"]["Update"] = {
      status: parsed.status,
    };

    if (parsed.status === "accepted") {
      patch.accepted_at = now;
    }

    if (parsed.status === "completed") {
      patch.completed_at = now;
    }

    if (parsed.status === "cancelled") {
      patch.cancelled_at = now;
    }

    const { data, error } = await (supabase as any)
      .from("hire_records")
      .update(patch as any)
      .eq("id", parsed.hireId)
      .select("*")
      .single();

    if (error) throw error;

    await syncWorkerAvailability(supabase, (data as HireRow).worker_id);

    return mapHireRow(data as HireRow);
  },

  async submitReview(input: SubmitReviewInput): Promise<HireRecord> {
    const supabase = getSupabase();
    const parsed = submitReviewSchema.parse(input);

    const patch: Database["public"]["Tables"]["hire_records"]["Update"] = {
      rating: parsed.rating,
      review_text: parsed.reviewText ?? null,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase as any)
      .from("hire_records")
      .update(patch as any)
      .eq("id", parsed.hireId)
      .select("*")
      .single();

    if (error) throw error;
    return mapHireRow(data as HireRow);
  },

  async getById(hireId: string): Promise<HireRecord> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("hire_records")
      .select("*")
      .eq("id", hireId)
      .single();

    if (error) throw error;
    return mapHireRow(data as HireRow);
  },

  async listByHirer(hirerId: string): Promise<HireRecord[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("hire_records")
      .select("*")
      .eq("hirer_id", hirerId)
      .order("hired_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as HireRow[]).map(mapHireRow);
  },

  async listByWorker(workerId: string): Promise<HireRecord[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("hire_records")
      .select("*")
      .eq("worker_id", workerId)
      .order("hired_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as HireRow[]).map(mapHireRow);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS & PUSH TOKENS API
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegisterPushTokenInput {
  token: string;
  platform: PushPlatform;
}

export interface DispatchHireNotificationResult {
  notificationId?: string;
  workerUserId?: string;
  sentCount: number;
  invalidTokenCount: number;
}

export const pushTokensApi = {
  async register(input: RegisterPushTokenInput): Promise<PushTokenRow> {
    const supabase = getSupabase();
    const token = input.token.trim();

    if (!token) {
      throw new Error("Push token is required.");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) {
      throw new Error("Authentication is required to register push tokens.");
    }

    const payload: Database["public"]["Tables"]["push_tokens"]["Insert"] = {
      user_id: userId,
      token,
      platform: input.platform,
      is_active: true,
    };

    const { data, error } = await (supabase as any)
      .from("push_tokens")
      .upsert(payload as any, { onConflict: "user_id,token" })
      .select("*")
      .single();

    if (error) throw error;
    return data as PushTokenRow;
  },

  async deactivate(token: string): Promise<void> {
    const supabase = getSupabase();
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;
    if (!userId) {
      return;
    }

    const { error } = await (supabase as any)
      .from("push_tokens")
      .update({ is_active: false } as any)
      .eq("user_id", userId)
      .eq("token", normalizedToken);

    if (error) throw error;
  },
};

export const notificationsApi = {
  async dispatchHireRequest(
    hireId: string,
  ): Promise<DispatchHireNotificationResult> {
    const supabase = getSupabase();

    const { data, error } = await supabase.functions.invoke(
      "send-notification",
      {
        body: {
          event: "hire_request",
          hireId,
        },
      },
    );

    if (error) throw error;

    return {
      notificationId: data?.notificationId,
      workerUserId: data?.workerUserId,
      sentCount: Number(data?.sentCount ?? 0),
      invalidTokenCount: Number(data?.invalidTokenCount ?? 0),
    };
  },
};

export interface ReportClientErrorInput {
  source: "web" | "android" | "shared" | "edge";
  category:
    | "runtime"
    | "mutation"
    | "query"
    | "auth"
    | "network"
    | "notification"
    | "unknown";
  level?: "error" | "warning" | "info";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export interface ReportClientErrorResult {
  logged: boolean;
  id?: number;
}

export const monitoringApi = {
  async reportClientError(
    input: ReportClientErrorInput,
  ): Promise<ReportClientErrorResult> {
    const supabase = getSupabase();

    const { data, error } = await supabase.functions.invoke("report-error", {
      body: input,
    });

    if (error) {
      throw error;
    }

    return {
      logged: Boolean(data?.logged ?? true),
      id: typeof data?.id === "number" ? data.id : undefined,
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GEODATA API
// ═══════════════════════════════════════════════════════════════════════════════

export const geodataApi = {
  /**
   * Get all provinces
   */
  async getProvinces() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("provinces")
      .select("*")
      .order("id");
    if (error) throw error;
    return data;
  },

  /**
   * Get districts by province
   */
  async getDistricts(provinceId: number) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .eq("province_id", provinceId)
      .order("name_en");
    if (error) throw error;
    return data;
  },

  /**
   * Get local units by district
   */
  async getLocalUnits(districtId: number) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("local_units")
      .select("*")
      .eq("district_id", districtId)
      .order("name_en");
    if (error) throw error;
    return data;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// JOB CATEGORIES API
// ═══════════════════════════════════════════════════════════════════════════════

export const jobCategoriesApi = {
  /**
   * Get all active job categories
   */
  async getAll() {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("job_categories")
      .select("*")
      .eq("is_active", true)
      .order("name_en");
    if (error) throw error;
    return data;
  },
};
