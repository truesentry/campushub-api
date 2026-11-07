-- 1. Show future events ordered from the nearest starting event.
SELECT title, starts_at, capacity
FROM events
WHERE starts_at > CURRENT_TIMESTAMP
ORDER BY starts_at ASC;

-- 2. Show registrations for user 1, including the event and registration timestamps.
SELECT u.name AS user_name, e.title AS event_title, e.starts_at, r.registered_at
FROM users AS u
JOIN registrations AS r ON r.user_id = u.id
JOIN events AS e ON e.id = r.event_id
WHERE u.id = 1
ORDER BY e.starts_at ASC;

-- 3. Count participants for every event, including events with zero registrations.
SELECT e.title, COUNT(r.id) AS participant_count
FROM events AS e
LEFT JOIN registrations AS r ON r.event_id = e.id
GROUP BY e.id, e.title
ORDER BY e.starts_at ASC;

-- 4. Search event titles without regard to letter case.
SELECT id, title, starts_at
FROM events
WHERE title ILIKE '%sql%'
ORDER BY starts_at ASC;

-- 5. Show every event with its category and starting timestamp.
SELECT e.title AS event_title, c.name AS category_name, e.starts_at
FROM events AS e
JOIN categories AS c ON c.id = e.category_id
ORDER BY e.starts_at ASC;
