# University Enrollment System

EPITA — Advanced JavaScript  
Module: Domain-Driven Design, Branded Types & Observer Pattern

---

## What this is

A TypeScript enrollment system built around DDD principles. The idea was to treat the domain seriously where students have credit limits, courses have capacities, and nothing gets created without going through a smart constructor first. If the data is wrong, you get an error back. If it's right, you get a typed value you can trust everywhere.

---

## Run it

```bash
npm install
npm run dev
```

---

## Structure

```
index.ts                        # CLI entry point, all 5 scenarios
src/
  domain/
    types.ts                    # Brand<K,T> + all 6 branded types + smart constructors
    events.ts                   # Typed domain events
    Student.ts                  # Student entity
    Course.ts                   # Course entity
    Enrollment.ts               # Enrollment entity with status
    EnrollmentService.ts        # Business logic, wires everything together
  infrastructure/
    EventEmitter.ts             # Observer pattern (subscribe / unsubscribe / emit)
docs/
  spec.md
```

---

## Branded types

| Type | Valid format | Example |
|------|-------------|---------|
| StudentId | STU + 6 digits | STU100001 |
| CourseCode | 2–4 letters + 3 digits | CS101 |
| Email | standard email | alice@epita.fr |
| Credits | one of 1, 2, 3, 4, 6 | 4 |
| Semester | Fall/Spring/Summer + year | Fall2024 |
| EnrollmentId | ENR- + counter | ENR-000001 |

Every type is created through a smart constructor that returns `Result<T>`. You cannot construct an invalid value and pass it around — the type system prevents it.

---

## Business rules enforced

- Max 18 credits per student per semester
- Course capacity between 1 and 200
- No duplicate enrollment (same student + course + semester)
- Only active enrollments can be cancelled
- `CourseCapacityReached` fires when a course hits 80% full
- `CourseFull` fires when the last spot is taken

---

## CLI scenarios

1. Successful enrollment — `StudentEnrolled` event fires
2. Course hits 80% — `CourseCapacityReached` event fires
3. Course hits 100% — `CourseFull` event fires, next attempt is rejected
4. Student tries to exceed 18 credits — rejected silently, no event
5. Cancel an enrollment — `EnrollmentCancelled` event fires, credits returned

---

## Design notes

The `Result<T>` type replaces exceptions for domain errors. Smart constructors are the only way into branded types — there is no escape hatch. The `EventEmitter` is fully typed so handlers only receive the event shape they subscribed to. The `EnrollmentService` is the only place that coordinates between entities — entities themselves don't know about each other.
