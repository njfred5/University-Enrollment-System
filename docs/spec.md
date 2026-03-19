# University Enrollment System — Spec

## Branded Types

| Type | Format | Example |
|------|--------|---------|
| StudentId | STU + 6 digits | STU123456 |
| CourseCode | 2–4 letters + 3 digits | CS101 |
| Email | valid email | alice@epita.fr |
| Credits | one of 1,2,3,4,6 | 3 |
| Semester | Fall|Spring|Summer + YYYY | Fall2024 |
| EnrollmentId | ENR- + counter | ENR-000001 |

## Business Rules

1. Max 18 credits per student per semester
2. Course capacity 1–200
3. No duplicate enrollments (same student + course + semester)
4. Only active enrollments can be cancelled
5. CourseCapacityReached fires at >= 80% full
6. CourseFull fires when enrolledCount == capacity

## Events

- StudentEnrolled
- CourseCapacityReached
- CourseFull
- EnrollmentCancelled
