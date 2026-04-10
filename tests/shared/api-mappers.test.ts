import { describe, expect, it } from "vitest";
import { mapperUtils } from "../../packages/shared/src/api/index";

describe("shared api mappers", () => {
  it("maps worker rows with joined relations into WorkerDisplay", () => {
    const row = {
      id: "worker-profile-1",
      user_id: "user-1",
      job_category_id: 2,
      province_id: 3,
      district_id: 18,
      local_unit_id: 99,
      ward_no: 7,
      is_available: true,
      is_approved: true,
      approval_note: null,
      experience_yrs: 6,
      about: "Experienced mason",
      daily_rate_npr: 2500,
      citizenship_no: "12-34-56-78901",
      total_hires: 11,
      pending_hires: 2,
      avg_rating: 4.7,
      total_reviews: 9,
      created_at: "2026-04-01T10:00:00.000Z",
      updated_at: "2026-04-04T10:00:00.000Z",
      user: [
        {
          full_name: "Ram Bahadur",
          full_name_np: "राम बहादुर",
          phone: "9812345678",
          avatar_url: "https://example.com/avatar.jpg",
        },
      ],
      job_category: {
        name_en: "Mason",
        name_np: "मिस्त्री",
        icon: "🧱",
      },
      province: {
        name_en: "Bagmati",
        name_np: "बागमती",
      },
      district: {
        name_en: "Kathmandu",
        name_np: "काठमाडौं",
      },
      local_unit: {
        name_en: "Kageshwori Manohara",
        name_np: "कागेश्वरी मनोहरा",
        unit_type: "municipality",
      },
    };

    const mapped = mapperUtils.mapWorkerRow(row as never);

    expect(mapped.id).toBe("worker-profile-1");
    expect(mapped.user.fullName).toBe("Ram Bahadur");
    expect(mapped.user.fullNameNp).toBe("राम बहादुर");
    expect(mapped.jobCategory.nameEn).toBe("Mason");
    expect(mapped.localUnit.unitType).toBe("municipality");
    expect(mapped.dailyRateNpr).toBe(2500);
    expect(mapped.createdAt).toBeInstanceOf(Date);
    expect(mapped.createdAt.toISOString()).toBe("2026-04-01T10:00:00.000Z");
  });

  it("maps hire rows with optional timeline/review fields", () => {
    const row = {
      id: "hire-1",
      worker_id: "worker-profile-1",
      hirer_id: "hirer-1",
      hirer_ip: "203.0.113.42",
      ip_fingerprint: "fp_abc123",
      status: "accepted",
      hire_province_id: 3,
      hire_district_id: 18,
      hire_local_unit_id: 99,
      work_description: "Build retaining wall",
      agreed_rate_npr: 3000,
      work_date: "2026-04-10",
      work_duration_days: 3,
      hired_at: "2026-04-06T09:30:00.000Z",
      accepted_at: "2026-04-06T10:00:00.000Z",
      completed_at: null,
      cancelled_at: null,
      rating: null,
      review_text: null,
      reviewed_at: null,
    };

    const mapped = mapperUtils.mapHireRow(row as never);

    expect(mapped.id).toBe("hire-1");
    expect(mapped.workerId).toBe("worker-profile-1");
    expect(mapped.hirerIp).toBe("203.0.113.42");
    expect(mapped.status).toBe("accepted");
    expect(mapped.agreedRateNpr).toBe(3000);
    expect(mapped.workDurationDays).toBe(3);
    expect(mapped.workDate).toBeInstanceOf(Date);
    expect(mapped.workDate?.toISOString()).toContain("2026-04-10");
    expect(mapped.completedAt).toBeUndefined();
    expect(mapped.reviewText).toBeUndefined();
  });
});
