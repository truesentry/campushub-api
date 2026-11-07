# Expected query and negative-test results

Run `database/schema.sql`, then `database/seed.sql`, then this command:

```bash
psql -d campushub -f database/queries.sql
```

## Expected query results

1. Future events: PostgreSQL Fundamentals, TypeScript Architecture, Campus Career Day, and Student Research Showcase - ordered by `starts_at`.
2. User `id = 1` (Olena Kovalenko): registrations for PostgreSQL Fundamentals and TypeScript Architecture.
3. Participant counts: Web Accessibility Review `0`, PostgreSQL Fundamentals `2`, TypeScript Architecture `2`, Campus Career Day `2`, Student Research Showcase `0`.
4. Case-insensitive `sql` search: PostgreSQL Fundamentals.
5. Five rows with every event, its category (Programming or Campus life), and `starts_at`.

## Expected negative-test output

```text
NOTICE: PASS: duplicate email was rejected by UNIQUE
NOTICE: PASS: duplicate registration was rejected by UNIQUE
NOTICE: PASS: zero capacity was rejected by CHECK
NOTICE: PASS: end before start was rejected by CHECK
NOTICE: PASS: registration for a missing event was rejected by FK
NOTICE: PASS: category with events was protected by RESTRICT
NOTICE: PASS: deleting an event cascaded to registrations and materials
```

The last check runs inside a transaction and ends with `ROLLBACK`, so event 2 and its dependent seed rows remain available after testing.
