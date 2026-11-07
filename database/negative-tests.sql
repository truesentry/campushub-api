-- Run after schema.sql and seed.sql. Every failed insert/delete is caught inside
-- a transaction, so the original seed data is restored by ROLLBACK.
BEGIN;

DO $$
BEGIN
  INSERT INTO users (name, email) VALUES ('Duplicate email', 'olena.kovalenko@example.com');
  RAISE EXCEPTION 'Expected UNIQUE violation for users.email';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'PASS: duplicate email was rejected by UNIQUE';
END $$;

DO $$
BEGIN
  INSERT INTO registrations (user_id, event_id) VALUES (1, 2);
  RAISE EXCEPTION 'Expected UNIQUE violation for (user_id, event_id)';
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'PASS: duplicate registration was rejected by UNIQUE';
END $$;

DO $$
BEGIN
  INSERT INTO events (title, starts_at, ends_at, capacity, category_id)
  VALUES ('Invalid capacity', '2030-07-01T10:00:00Z', '2030-07-01T11:00:00Z', 0, 1);
  RAISE EXCEPTION 'Expected CHECK violation for capacity';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'PASS: zero capacity was rejected by CHECK';
END $$;

DO $$
BEGIN
  INSERT INTO events (title, starts_at, ends_at, capacity, category_id)
  VALUES ('Invalid schedule', '2030-07-01T11:00:00Z', '2030-07-01T10:00:00Z', 10, 1);
  RAISE EXCEPTION 'Expected CHECK violation for event time range';
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'PASS: end before start was rejected by CHECK';
END $$;

DO $$
BEGIN
  INSERT INTO registrations (user_id, event_id) VALUES (1, 9999);
  RAISE EXCEPTION 'Expected foreign-key violation for a missing event';
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'PASS: registration for a missing event was rejected by FK';
END $$;

DO $$
BEGIN
  DELETE FROM categories WHERE id = 1;
  RAISE EXCEPTION 'Expected foreign-key violation when deleting used category';
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'PASS: category with events was protected by RESTRICT';
END $$;

DELETE FROM events WHERE id = 2;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM registrations WHERE event_id = 2)
     OR EXISTS (SELECT 1 FROM materials WHERE event_id = 2) THEN
    RAISE EXCEPTION 'Cascade deletion did not remove dependent rows';
  END IF;
  RAISE NOTICE 'PASS: deleting an event cascaded to registrations and materials';
END $$;

ROLLBACK;
