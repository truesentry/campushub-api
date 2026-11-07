-- Test users: all email addresses are deliberately lowercase.
INSERT INTO users (id, name, email, created_at) VALUES
  (1, 'Olena Kovalenko', 'olena.kovalenko@example.com', '2026-01-10T09:00:00Z'),
  (2, 'Danylo Petrenko', 'danylo.petrenko@example.com', '2026-01-11T09:00:00Z'),
  (3, 'Iryna Melnyk', 'iryna.melnyk@example.com', '2026-01-12T09:00:00Z');

INSERT INTO categories (id, name) VALUES
  (1, 'Programming'),
  (2, 'Campus life');

-- Event 1 is past; events 2-5 are future. Event 5 intentionally has no registrations.
INSERT INTO events (id, title, description, starts_at, ends_at, capacity, category_id) VALUES
  (1, 'Web Accessibility Review', 'Completed accessibility review session.', '2025-10-10T10:00:00Z', '2025-10-10T12:00:00Z', 20, 1),
  (2, 'PostgreSQL Fundamentals', 'Introduction to relational database design.', '2030-03-10T10:00:00Z', '2030-03-10T13:00:00Z', 30, 1),
  (3, 'TypeScript Architecture', 'Patterns for maintainable Node.js applications.', '2030-04-15T11:00:00Z', '2030-04-15T14:00:00Z', 25, 1),
  (4, 'Campus Career Day', 'Meet employers and alumni.', '2030-05-20T09:00:00Z', '2030-05-20T16:00:00Z', 100, 2),
  (5, 'Student Research Showcase', 'Present student research projects.', '2030-06-05T10:00:00Z', '2030-06-05T15:00:00Z', 60, 2);

-- One user attends several events; events 2-4 have multiple participants.
INSERT INTO registrations (id, user_id, event_id, registered_at) VALUES
  (1, 1, 2, '2026-02-01T10:00:00Z'),
  (2, 1, 3, '2026-02-01T10:10:00Z'),
  (3, 2, 2, '2026-02-02T09:00:00Z'),
  (4, 2, 4, '2026-02-02T09:10:00Z'),
  (5, 3, 3, '2026-02-03T08:00:00Z'),
  (6, 3, 4, '2026-02-03T08:10:00Z');

-- Event 2 deliberately has multiple materials.
INSERT INTO materials (id, event_id, title, url) VALUES
  (1, 2, 'Workshop slides', 'https://example.com/materials/postgresql-slides'),
  (2, 2, 'Practice tasks', 'https://example.com/materials/postgresql-tasks'),
  (3, 3, 'Architecture checklist', 'https://example.com/materials/typescript-checklist');

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT MAX(id) FROM events));
SELECT setval(pg_get_serial_sequence('registrations', 'id'), (SELECT MAX(id) FROM registrations));
SELECT setval(pg_get_serial_sequence('materials', 'id'), (SELECT MAX(id) FROM materials));
