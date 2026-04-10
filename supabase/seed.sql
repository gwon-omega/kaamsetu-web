-- ═══════════════════════════════════════════════════════════════════════════════
-- SHRAM SEWA — Seed Data
-- Nepal Provinces, Districts, Job Categories
-- Source: Pratik-Kattel/Nepal-Administrative-Data-JSON
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROVINCES (7)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO provinces (id, name_en, name_np, color_hex) VALUES
  (1, 'Koshi Pradesh', 'कोशी प्रदेश', '#FF6B6B'),
  (2, 'Madhesh Pradesh', 'मधेश प्रदेश', '#4ECDC4'),
  (3, 'Bagmati Pradesh', 'बागमती प्रदेश', '#45B7D1'),
  (4, 'Gandaki Pradesh', 'गण्डकी प्रदेश', '#96CEB4'),
  (5, 'Lumbini Pradesh', 'लुम्बिनी प्रदेश', '#FFEAA7'),
  (6, 'Karnali Pradesh', 'कर्णाली प्रदेश', '#DDA0DD'),
  (7, 'Sudurpashchim Pradesh', 'सुदूरपश्चिम प्रदेश', '#F0E68C');

-- ═══════════════════════════════════════════════════════════════════════════════
-- DISTRICTS (77)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Province 1: Koshi Pradesh (14 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (1, 1, 'Bhojpur', 'भोजपुर'),
  (2, 1, 'Dhankuta', 'धनकुटा'),
  (3, 1, 'Ilam', 'इलाम'),
  (4, 1, 'Jhapa', 'झापा'),
  (5, 1, 'Khotang', 'खोटाङ'),
  (6, 1, 'Morang', 'मोरङ'),
  (7, 1, 'Okhaldhunga', 'ओखलढुङ्गा'),
  (8, 1, 'Panchthar', 'पाँचथर'),
  (9, 1, 'Sankhuwasabha', 'संखुवासभा'),
  (10, 1, 'Solukhumbu', 'सोलुखुम्बु'),
  (11, 1, 'Sunsari', 'सुनसरी'),
  (12, 1, 'Taplejung', 'ताप्लेजुङ'),
  (13, 1, 'Terhathum', 'तेह्रथुम'),
  (14, 1, 'Udayapur', 'उदयपुर');

-- Province 2: Madhesh Pradesh (8 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (15, 2, 'Bara', 'बारा'),
  (16, 2, 'Dhanusha', 'धनुषा'),
  (17, 2, 'Mahottari', 'महोत्तरी'),
  (18, 2, 'Parsa', 'पर्सा'),
  (19, 2, 'Rautahat', 'रौतहट'),
  (20, 2, 'Saptari', 'सप्तरी'),
  (21, 2, 'Sarlahi', 'सर्लाही'),
  (22, 2, 'Siraha', 'सिरहा');

-- Province 3: Bagmati Pradesh (13 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (23, 3, 'Bhaktapur', 'भक्तपुर'),
  (24, 3, 'Chitwan', 'चितवन'),
  (25, 3, 'Dhading', 'धादिङ'),
  (26, 3, 'Dolakha', 'दोलखा'),
  (27, 3, 'Kathmandu', 'काठमाडौं'),
  (28, 3, 'Kavrepalanchok', 'काभ्रेपलाञ्चोक'),
  (29, 3, 'Lalitpur', 'ललितपुर'),
  (30, 3, 'Makwanpur', 'मकवानपुर'),
  (31, 3, 'Nuwakot', 'नुवाकोट'),
  (32, 3, 'Ramechhap', 'रामेछाप'),
  (33, 3, 'Rasuwa', 'रसुवा'),
  (34, 3, 'Sindhuli', 'सिन्धुली'),
  (35, 3, 'Sindhupalchok', 'सिन्धुपाल्चोक');

-- Province 4: Gandaki Pradesh (11 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (36, 4, 'Baglung', 'बाग्लुङ'),
  (37, 4, 'Gorkha', 'गोरखा'),
  (38, 4, 'Kaski', 'कास्की'),
  (39, 4, 'Lamjung', 'लमजुङ'),
  (40, 4, 'Manang', 'मनाङ'),
  (41, 4, 'Mustang', 'मुस्ताङ'),
  (42, 4, 'Myagdi', 'म्याग्दी'),
  (43, 4, 'Nawalparasi East', 'नवलपरासी पूर्व'),
  (44, 4, 'Parbat', 'पर्वत'),
  (45, 4, 'Syangja', 'स्याङ्जा'),
  (46, 4, 'Tanahun', 'तनहुँ');

-- Province 5: Lumbini Pradesh (12 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (47, 5, 'Arghakhanchi', 'अर्घाखाँची'),
  (48, 5, 'Banke', 'बाँके'),
  (49, 5, 'Bardiya', 'बर्दिया'),
  (50, 5, 'Dang', 'दाङ'),
  (51, 5, 'Gulmi', 'गुल्मी'),
  (52, 5, 'Kapilvastu', 'कपिलवस्तु'),
  (53, 5, 'Nawalparasi West', 'नवलपरासी पश्चिम'),
  (54, 5, 'Palpa', 'पाल्पा'),
  (55, 5, 'Pyuthan', 'प्यूठान'),
  (56, 5, 'Rolpa', 'रोल्पा'),
  (57, 5, 'Rupandehi', 'रुपन्देही'),
  (58, 5, 'Rukum East', 'रुकुम पूर्व');

-- Province 6: Karnali Pradesh (10 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (59, 6, 'Dailekh', 'दैलेख'),
  (60, 6, 'Dolpa', 'डोल्पा'),
  (61, 6, 'Humla', 'हुम्ला'),
  (62, 6, 'Jajarkot', 'जाजरकोट'),
  (63, 6, 'Jumla', 'जुम्ला'),
  (64, 6, 'Kalikot', 'कालिकोट'),
  (65, 6, 'Mugu', 'मुगु'),
  (66, 6, 'Rukum West', 'रुकुम पश्चिम'),
  (67, 6, 'Salyan', 'सल्यान'),
  (68, 6, 'Surkhet', 'सुर्खेत');

-- Province 7: Sudurpashchim Pradesh (9 districts)
INSERT INTO districts (id, province_id, name_en, name_np) VALUES
  (69, 7, 'Achham', 'अछाम'),
  (70, 7, 'Baitadi', 'बैतडी'),
  (71, 7, 'Bajhang', 'बझाङ'),
  (72, 7, 'Bajura', 'बाजुरा'),
  (73, 7, 'Dadeldhura', 'डडेल्धुरा'),
  (74, 7, 'Darchula', 'दार्चुला'),
  (75, 7, 'Doti', 'डोटी'),
  (76, 7, 'Kailali', 'कैलाली'),
  (77, 7, 'Kanchanpur', 'कञ्चनपुर');

-- ═══════════════════════════════════════════════════════════════════════════════
-- JOB CATEGORIES (12)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO job_categories (slug, name_en, name_np, icon, description) VALUES
  ('mason', 'Mason', 'डकर्मी', '🧱', 'Brick laying, concrete work, building construction'),
  ('plumber', 'Plumber', 'प्लम्बर', '🔧', 'Pipe fitting, water supply, drainage systems'),
  ('electrician', 'Electrician', 'इलेक्ट्रिसियन', '⚡', 'Electrical wiring, repairs, installations'),
  ('carpenter', 'Carpenter', 'सिकर्मी', '🪚', 'Woodwork, furniture, door/window installation'),
  ('painter', 'Painter', 'रङ्गाई', '🎨', 'Wall painting, finishing, decorative work'),
  ('gardener', 'Gardener', 'माली', '🌱', 'Garden maintenance, landscaping, plant care'),
  ('cleaner', 'Cleaner', 'सफाइ कर्मी', '🧹', 'House cleaning, office cleaning, deep cleaning'),
  ('driver', 'Driver', 'चालक', '🚗', 'Vehicle driving, transportation services'),
  ('cook', 'Cook', 'खाना पकाउने', '👨‍🍳', 'Cooking, catering, kitchen services'),
  ('helper', 'Helper', 'सहयोगी', '🙋', 'General assistance, loading/unloading, errands'),
  ('farmer', 'Farm Worker', 'किसान मजदुर', '🌾', 'Agricultural work, harvesting, soil preparation'),
  ('guard', 'Security Guard', 'सुरक्षा गार्ड', '💂', 'Security services, watchman duties');

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE LOCAL UNITS (Major cities only, for demo)
-- Full 753 local units would be seeded from external data file
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO local_units (district_id, name_en, name_np, unit_type, ward_count) VALUES
  -- Province 1
  (6, 'Biratnagar', 'विराटनगर', 'metropolitan', 19),
  (11, 'Dharan', 'धरान', 'sub_metropolitan', 20),
  (11, 'Itahari', 'इटहरी', 'sub_metropolitan', 20),
  (4, 'Birtamod', 'विर्तामोड', 'municipality', 14),
  (4, 'Damak', 'दमक', 'municipality', 10),

  -- Province 2
  (16, 'Janakpur', 'जनकपुर', 'sub_metropolitan', 25),
  (15, 'Kalaiya', 'कलैया', 'sub_metropolitan', 27),
  (22, 'Lahan', 'लहान', 'municipality', 25),
  (22, 'Siraha', 'सिरहा', 'municipality', 22),

  -- Province 3
  (27, 'Kathmandu', 'काठमाडौं', 'metropolitan', 32),
  (29, 'Lalitpur', 'ललितपुर', 'metropolitan', 29),
  (23, 'Bhaktapur', 'भक्तपुर', 'municipality', 10),
  (24, 'Bharatpur', 'भरतपुर', 'metropolitan', 29),
  (28, 'Banepa', 'बनेपा', 'municipality', 14),

  -- Province 4
  (38, 'Pokhara', 'पोखरा', 'metropolitan', 33),
  (37, 'Gorkha', 'गोरखा', 'municipality', 11),
  (46, 'Damauli', 'दमौली', 'municipality', 14),

  -- Province 5
  (50, 'Ghorahi', 'घोराही', 'sub_metropolitan', 18),
  (50, 'Tulsipur', 'तुल्सीपुर', 'sub_metropolitan', 20),
  (57, 'Butwal', 'बुटवल', 'sub_metropolitan', 19),
  (57, 'Siddharthanagar', 'सिद्धार्थनगर', 'municipality', 13),
  (48, 'Nepalgunj', 'नेपालगञ्ज', 'sub_metropolitan', 23),

  -- Province 6
  (68, 'Birendranagar', 'वीरेन्द्रनगर', 'municipality', 16),
  (63, 'Chandannath', 'चन्दननाथ', 'municipality', 9),

  -- Province 7
  (76, 'Dhangadhi', 'धनगढी', 'sub_metropolitan', 19),
  (77, 'Mahendranagar', 'महेन्द्रनगर', 'municipality', 18),
  (69, 'Mangalsen', 'मंगलसेन', 'municipality', 14);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DISTRICT COVERAGE NORMALIZATION
-- Ensure at least one local unit exists per district to support Nepal-wide seeds.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO local_units (district_id, name_en, name_np, unit_type, ward_count)
SELECT
  d.id,
  d.name_en || ' Municipality',
  COALESCE(d.name_np, d.name_en) || ' नगरपालिका',
  'municipality',
  9
FROM districts d
WHERE NOT EXISTS (
  SELECT 1
  FROM local_units lu
  WHERE lu.district_id = d.id
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTH + USER + WORKER DEMO POPULATION
-- 100 hirers + 100 workers, distributed across all 7 provinces.
-- Phone format follows Nepal mobile ranges (97/98 + 8 digits).
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Deterministic seed for reproducible local demo data.
SELECT setseed(0.42026);

-- Clean previous synthetic seed accounts before reinserting.
DELETE FROM hire_records
WHERE hirer_id IN (
  SELECT id
  FROM auth.users
  WHERE email LIKE '%@seed.shramsewa.com.np'
)
OR worker_id IN (
  SELECT wp.id
  FROM worker_profiles wp
  JOIN auth.users au ON au.id = wp.user_id
  WHERE au.email LIKE '%@seed.shramsewa.com.np'
);

DELETE FROM notifications
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE email LIKE '%@seed.shramsewa.com.np'
);

DELETE FROM push_tokens
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE email LIKE '%@seed.shramsewa.com.np'
);

DELETE FROM worker_profiles
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE email LIKE '%@seed.shramsewa.com.np'
);

DELETE FROM auth.users
WHERE email LIKE '%@seed.shramsewa.com.np';

CREATE TEMP TABLE tmp_seed_people (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  province_id SMALLINT NOT NULL,
  district_id SMALLINT NOT NULL,
  local_unit_id INT NOT NULL,
  ward_no SMALLINT NOT NULL,
  full_name TEXT NOT NULL,
  full_name_np TEXT NOT NULL,
  phone_local TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  email TEXT NOT NULL,
  identity_no TEXT NOT NULL
) ON COMMIT DROP;

WITH province_role_counts AS (
  SELECT *
  FROM (
    VALUES
      -- Hirers (100 total)
      ('hirer'::TEXT, 1::SMALLINT, 15::INT),
      ('hirer'::TEXT, 2::SMALLINT, 18::INT),
      ('hirer'::TEXT, 3::SMALLINT, 24::INT),
      ('hirer'::TEXT, 4::SMALLINT, 12::INT),
      ('hirer'::TEXT, 5::SMALLINT, 17::INT),
      ('hirer'::TEXT, 6::SMALLINT, 6::INT),
      ('hirer'::TEXT, 7::SMALLINT, 8::INT),

      -- Workers (100 total)
      ('worker'::TEXT, 1::SMALLINT, 16::INT),
      ('worker'::TEXT, 2::SMALLINT, 18::INT),
      ('worker'::TEXT, 3::SMALLINT, 22::INT),
      ('worker'::TEXT, 4::SMALLINT, 12::INT),
      ('worker'::TEXT, 5::SMALLINT, 18::INT),
      ('worker'::TEXT, 6::SMALLINT, 6::INT),
      ('worker'::TEXT, 7::SMALLINT, 8::INT)
  ) AS t(role, province_id, target_count)
),
expanded AS (
  SELECT
    prc.role,
    prc.province_id,
    gs AS seq
  FROM province_role_counts prc
  CROSS JOIN LATERAL generate_series(1, prc.target_count) AS gs
),
name_bank AS (
  SELECT
    ARRAY[
      'Aarav', 'Aashish', 'Aayush', 'Abhishek', 'Amit', 'Anil', 'Arjun', 'Ashok',
      'Bikash', 'Bimal', 'Deepak', 'Dhiraj', 'Dipesh', 'Gopal', 'Hari', 'Hemant',
      'Ishan', 'Jeevan', 'Kamal', 'Kiran', 'Krishna', 'Laxman', 'Madan', 'Mahesh',
      'Manish', 'Nabin', 'Niraj', 'Nischal', 'Pawan', 'Prabin', 'Prakash', 'Pramod',
      'Rabin', 'Rajan', 'Raju', 'Ramesh', 'Roshan', 'Sagar', 'Santosh', 'Saroj',
      'Shyam', 'Siddharth', 'Subash', 'Sudip', 'Suman', 'Sunil', 'Suraj', 'Suresh',
      'Tek', 'Umesh', 'Yogesh', 'Alina', 'Anjana', 'Asmita', 'Bimala', 'Binita',
      'Deepa', 'Gita', 'Kabita', 'Karuna', 'Laxmi', 'Manju', 'Nirmala', 'Puja',
      'Radhika', 'Ranjana', 'Sangita', 'Sarita', 'Shanti', 'Sita', 'Sunita', 'Tara'
    ]::TEXT[] AS first_names_en,
    ARRAY[
      'Adhikari', 'Ale', 'Baniya', 'Basnet', 'Bhandari', 'Bhattarai', 'Chaudhary',
      'Dahal', 'Dhakal', 'Gautam', 'Gharti', 'Giri', 'Gurung', 'Jha', 'Kafle',
      'Karki', 'Khadka', 'KC', 'Lama', 'Magar', 'Maharjan', 'Neupane', 'Panday',
      'Pokharel', 'Poudel', 'Rai', 'Regmi', 'Rokaya', 'Shah', 'Sharma', 'Shrestha',
      'Subedi', 'Thapa', 'Tamang', 'Yadav'
    ]::TEXT[] AS last_names_en,
    ARRAY[
      'आरव', 'आशिष', 'आयुष', 'अभिषेक', 'अमित', 'अनिल', 'अर्जुन', 'अशोक',
      'विकास', 'विमल', 'दिपक', 'धिरज', 'दिपेश', 'गोपाल', 'हरि', 'हेमन्त',
      'ईशान', 'जीवन', 'कमल', 'किरण', 'कृष्ण', 'लक्ष्मण', 'मदन', 'महेश',
      'मनीष', 'नविन', 'निरज', 'निश्चल', 'पवन', 'प्रविण', 'प्रकाश', 'प्रमोद',
      'रविन', 'राजन', 'राजु', 'रमेश', 'रोशन', 'सागर', 'सन्तोष', 'सरोज',
      'श्याम', 'सिद्धार्थ', 'सुबास', 'सुदिप', 'सुमन', 'सुनिल', 'सुरज', 'सुरेश',
      'टेक', 'उमेश', 'योगेश', 'अलिना', 'अञ्जना', 'अस्मिता', 'विमला', 'विनिता',
      'दिपा', 'गीता', 'कविता', 'करुणा', 'लक्ष्मी', 'मञ्जु', 'निर्मला', 'पूजा',
      'राधिका', 'रञ्जना', 'संगीता', 'सरिता', 'शान्ति', 'सीता', 'सुनिता', 'तारा'
    ]::TEXT[] AS first_names_np,
    ARRAY[
      'अधिकारी', 'आले', 'बनियाँ', 'बस्नेत', 'भण्डारी', 'भट्टराई', 'चौधरी',
      'दाहाल', 'ढकाल', 'गौतम', 'घर्ती', 'गिरी', 'गुरुङ', 'झा', 'काफ्ले',
      'कार्की', 'खड्का', 'केसी', 'लामा', 'मगर', 'महार्जन', 'न्यौपाने', 'पाण्डे',
      'पोखरेल', 'पौडेल', 'राई', 'रेग्मी', 'रोकाया', 'शाह', 'शर्मा', 'श्रेष्ठ',
      'सुबेदी', 'थापा', 'तामाङ', 'यादव'
    ]::TEXT[] AS last_names_np
),
localized AS (
  SELECT
    e.role,
    e.province_id,
    e.seq,
    lu.id AS local_unit_id,
    lu.district_id,
    lu.ward_count
  FROM expanded e
  JOIN LATERAL (
    SELECT
      lu.id,
      lu.district_id,
      lu.ward_count
    FROM local_units lu
    JOIN districts d ON d.id = lu.district_id
    WHERE d.province_id = e.province_id
    ORDER BY random()
    LIMIT 1
  ) lu ON TRUE
),
generated AS (
  SELECT
    gen_random_uuid() AS user_id,
    l.role,
    l.province_id,
    l.district_id,
    l.local_unit_id,
    GREATEST(
      1,
      LEAST(35, (1 + floor(random() * GREATEST(l.ward_count, 1))::INT))
    )::SMALLINT AS ward_no,
    nb.first_names_en[1 + floor(random() * array_length(nb.first_names_en, 1))::INT] AS first_en,
    nb.last_names_en[1 + floor(random() * array_length(nb.last_names_en, 1))::INT] AS last_en,
    nb.first_names_np[1 + floor(random() * array_length(nb.first_names_np, 1))::INT] AS first_np,
    nb.last_names_np[1 + floor(random() * array_length(nb.last_names_np, 1))::INT] AS last_np,
    row_number() OVER (PARTITION BY l.role ORDER BY l.province_id, l.seq) AS role_rn
  FROM localized l
  CROSS JOIN name_bank nb
)
INSERT INTO tmp_seed_people (
  user_id,
  role,
  province_id,
  district_id,
  local_unit_id,
  ward_no,
  full_name,
  full_name_np,
  phone_local,
  phone_e164,
  email,
  identity_no
)
SELECT
  g.user_id,
  g.role,
  g.province_id,
  g.district_id,
  g.local_unit_id,
  g.ward_no,
  initcap(g.first_en || ' ' || g.last_en),
  g.first_np || ' ' || g.last_np,
  CASE
    WHEN g.role = 'hirer' THEN '98' || lpad((20000000 + g.role_rn)::TEXT, 8, '0')
    ELSE '97' || lpad((50000000 + g.role_rn)::TEXT, 8, '0')
  END AS phone_local,
  '+977' || CASE
    WHEN g.role = 'hirer' THEN '98' || lpad((20000000 + g.role_rn)::TEXT, 8, '0')
    ELSE '97' || lpad((50000000 + g.role_rn)::TEXT, 8, '0')
  END AS phone_e164,
  CASE
    WHEN g.role = 'hirer' THEN 'hirer' || lpad(g.role_rn::TEXT, 3, '0') || '@seed.shramsewa.com.np'
    ELSE 'worker' || lpad(g.role_rn::TEXT, 3, '0') || '@seed.shramsewa.com.np'
  END AS email,
  CASE
    WHEN g.role = 'hirer' THEN 'H-' || lpad(g.role_rn::TEXT, 4, '0')
    ELSE 'W-' || lpad(g.role_rn::TEXT, 4, '0')
  END AS identity_no
FROM generated g;

-- Insert auth users first (public.users rows are auto-created by trigger).
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000'::UUID,
  p.user_id,
  'authenticated',
  'authenticated',
  p.email,
  crypt('SeedPass#2026', gen_salt('bf')),
  NOW(),
  p.phone_e164,
  NOW(),
  jsonb_build_object('provider', 'phone', 'providers', ARRAY['phone']),
  jsonb_build_object(
    'full_name', p.full_name,
    'full_name_np', p.full_name_np,
    'seed_role', p.role
  ),
  NOW() - ((1 + floor(random() * 240)::INT)::TEXT || ' days')::INTERVAL,
  NOW()
FROM tmp_seed_people p;

-- Enrich user profiles in the project-owned public.users table.
UPDATE public.users u
SET
  phone = p.phone_local,
  full_name = p.full_name,
  full_name_np = p.full_name_np,
  role = p.role,
  is_verified = TRUE,
  is_active = TRUE,
  updated_at = NOW()
FROM tmp_seed_people p
WHERE u.id = p.user_id;

-- Attach deterministic demo avatars for seeded users.
WITH ranked_people AS (
  SELECT
    p.user_id,
    p.role,
    row_number() OVER (PARTITION BY p.role ORDER BY p.email) AS role_rn
  FROM tmp_seed_people p
)
UPDATE public.users u
SET avatar_url = format(
  'https://i.pravatar.cc/150?img=%s',
  CASE
    WHEN rp.role = 'worker' THEN 1 + ((rp.role_rn - 1) % 70)
    ELSE 71 + ((rp.role_rn - 1) % 29)
  END
)
FROM ranked_people rp
WHERE u.id = rp.user_id;

-- Ensure admin account exists with requested credentials.
-- Email: admin@shramsewa.com.np
-- Password: projectsewa
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@shramsewa.com.np'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000'::UUID,
      v_admin_id,
      'authenticated',
      'authenticated',
      'admin@shramsewa.com.np',
      crypt('projectsewa', gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object(
        'full_name', 'Shram Sewa Admin',
        'full_name_np', 'श्रम सेवा एडमिन'
      ),
      NOW(),
      NOW()
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('projectsewa', gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      raw_user_meta_data = jsonb_build_object(
        'full_name', 'Shram Sewa Admin',
        'full_name_np', 'श्रम सेवा एडमिन'
      ),
      updated_at = NOW()
    WHERE id = v_admin_id;
  END IF;

  INSERT INTO public.users (
    id,
    phone,
    full_name,
    full_name_np,
    role,
    is_verified,
    is_active
  )
  VALUES (
    v_admin_id,
    '9812345678',
    'Shram Sewa Admin',
    'श्रम सेवा एडमिन',
    'admin',
    TRUE,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE
  SET
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    full_name_np = EXCLUDED.full_name_np,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
END $$;

-- Seed 100 worker profiles with realistic category/rate variation.
INSERT INTO worker_profiles (
  user_id,
  job_category_id,
  province_id,
  district_id,
  local_unit_id,
  ward_no,
  is_available,
  is_approved,
  approval_note,
  experience_yrs,
  about,
  daily_rate_npr,
  citizenship_no
)
SELECT
  p.user_id,
  jc.id,
  p.province_id,
  p.district_id,
  p.local_unit_id,
  p.ward_no,
  (random() > 0.18),
  TRUE,
  'Profile auto-approved for development seed',
  exp.years,
  format(
    '%s worker based in %s, %s with %s years of local experience.',
    jc.name_en,
    lu.name_en,
    d.name_en,
    exp.years
  ),
  (
    CASE jc.slug
      WHEN 'mason' THEN 1700
      WHEN 'plumber' THEN 1850
      WHEN 'electrician' THEN 1950
      WHEN 'carpenter' THEN 1750
      WHEN 'painter' THEN 1450
      WHEN 'gardener' THEN 1200
      WHEN 'cleaner' THEN 1100
      WHEN 'driver' THEN 1850
      WHEN 'cook' THEN 1300
      WHEN 'helper' THEN 1000
      WHEN 'farmer' THEN 1150
      WHEN 'guard' THEN 1200
      ELSE 1300
    END
    + (exp.years * 40)
    + floor(random() * 280)::INT
  ),
  'NP-' || lpad((70000000 + row_number() OVER (ORDER BY p.user_id))::TEXT, 8, '0')
FROM tmp_seed_people p
JOIN local_units lu ON lu.id = p.local_unit_id
JOIN districts d ON d.id = p.district_id
JOIN LATERAL (
  SELECT id, slug, name_en
  FROM job_categories
  WHERE is_active = TRUE
  ORDER BY random()
  LIMIT 1
) jc ON TRUE
CROSS JOIN LATERAL (
  SELECT (1 + floor(random() * 18)::INT)::SMALLINT AS years
) exp
WHERE p.role = 'worker'
ON CONFLICT (user_id) DO NOTHING;

-- Rebalance seeded workers so categories and locations are well distributed.
WITH seeded_workers AS (
  SELECT
    wp.id AS profile_id,
    row_number() OVER (ORDER BY au.email) AS worker_rn
  FROM worker_profiles wp
  JOIN auth.users au ON au.id = wp.user_id
  WHERE au.email LIKE 'worker%@seed.shramsewa.com.np'
),
category_rank AS (
  SELECT
    jc.id,
    jc.slug,
    jc.name_en,
    row_number() OVER (ORDER BY jc.id) AS rank_no,
    count(*) OVER () AS total_count
  FROM job_categories jc
  WHERE jc.is_active = TRUE
),
local_unit_rank AS (
  SELECT
    lu.id AS local_unit_id,
    lu.name_en AS local_unit_name_en,
    d.id AS district_id,
    d.name_en AS district_name_en,
    d.province_id,
    row_number() OVER (ORDER BY d.province_id, lu.id) AS rank_no,
    count(*) OVER () AS total_count
  FROM local_units lu
  JOIN districts d ON d.id = lu.district_id
),
assigned AS (
  SELECT
    sw.profile_id,
    sw.worker_rn,
    cr.id AS job_category_id,
    cr.slug,
    cr.name_en AS category_name_en,
    lur.local_unit_id,
    lur.local_unit_name_en,
    lur.district_id,
    lur.district_name_en,
    lur.province_id,
    (1 + ((sw.worker_rn - 1) % 18))::SMALLINT AS experience_yrs
  FROM seeded_workers sw
  JOIN category_rank cr
    ON cr.rank_no = ((sw.worker_rn - 1) % (SELECT max(total_count) FROM category_rank)) + 1
  JOIN local_unit_rank lur
    ON lur.rank_no = ((sw.worker_rn - 1) % (SELECT max(total_count) FROM local_unit_rank)) + 1
)
UPDATE worker_profiles wp
SET
  job_category_id = a.job_category_id,
  province_id = a.province_id,
  district_id = a.district_id,
  local_unit_id = a.local_unit_id,
  ward_no = (1 + ((a.worker_rn + a.province_id) % 9))::SMALLINT,
  is_available = TRUE,
  is_approved = TRUE,
  experience_yrs = a.experience_yrs,
  daily_rate_npr = (
    CASE a.slug
      WHEN 'mason' THEN 1700
      WHEN 'plumber' THEN 1850
      WHEN 'electrician' THEN 1950
      WHEN 'carpenter' THEN 1750
      WHEN 'painter' THEN 1450
      WHEN 'gardener' THEN 1200
      WHEN 'cleaner' THEN 1100
      WHEN 'driver' THEN 1850
      WHEN 'cook' THEN 1300
      WHEN 'helper' THEN 1000
      WHEN 'farmer' THEN 1150
      WHEN 'guard' THEN 1200
      ELSE 1300
    END
    + (a.experience_yrs * 35)
    + ((a.worker_rn * 17) % 220)
  ),
  about = format(
    '%s worker based in %s, %s with %s years of local experience.',
    a.category_name_en,
    a.local_unit_name_en,
    a.district_name_en,
    a.experience_yrs
  )
FROM assigned a
WHERE wp.id = a.profile_id;

DO $$
DECLARE
  seeded_hirers INT;
  seeded_workers INT;
  seeded_profiles INT;
BEGIN
  SELECT COUNT(*) INTO seeded_hirers
  FROM auth.users
  WHERE email LIKE 'hirer%@seed.shramsewa.com.np';

  SELECT COUNT(*) INTO seeded_workers
  FROM auth.users
  WHERE email LIKE 'worker%@seed.shramsewa.com.np';

  SELECT COUNT(*) INTO seeded_profiles
  FROM worker_profiles wp
  JOIN auth.users au ON au.id = wp.user_id
  WHERE au.email LIKE 'worker%@seed.shramsewa.com.np';

  RAISE NOTICE 'Seed complete: % hirers, % workers, % worker_profiles (admin: admin@shramsewa.com.np)',
    seeded_hirers,
    seeded_workers,
    seeded_profiles;
END $$;
