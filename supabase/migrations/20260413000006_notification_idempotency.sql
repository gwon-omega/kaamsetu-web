-- Notification idempotency hardening
-- 1) Remove duplicate hire_request notifications for the same hire/recipient pair.
-- 2) Enforce uniqueness to prevent repeated spam notifications.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY hire_id, user_id, type
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM notifications
  WHERE type = 'hire_request'
)
DELETE FROM notifications n
USING ranked r
WHERE n.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_hire_user_type_unique
  ON notifications (hire_id, user_id, type)
  WHERE type = 'hire_request' AND hire_id IS NOT NULL;
