import { StudentId, CourseCode, EnrollmentId, Semester } from "./types";

export type DomainEventName =
  | "StudentEnrolled"
  | "CourseCapacityReached"
  | "CourseFull"
  | "EnrollmentCancelled";

export interface StudentEnrolledEvent {
  name: "StudentEnrolled";
  studentId: StudentId;
  courseCode: CourseCode;
  enrollmentId: EnrollmentId;
  semester: Semester;
  occurredAt: Date;
}

export interface CourseCapacityReachedEvent {
  name: "CourseCapacityReached";
  courseCode: CourseCode;
  enrolledCount: number;
  capacity: number;
  percentFull: number;
  occurredAt: Date;
}

export interface CourseFullEvent {
  name: "CourseFull";
  courseCode: CourseCode;
  capacity: number;
  occurredAt: Date;
}

export interface EnrollmentCancelledEvent {
  name: "EnrollmentCancelled";
  enrollmentId: EnrollmentId;
  studentId: StudentId;
  courseCode: CourseCode;
  occurredAt: Date;
}

export type DomainEvent =
  | StudentEnrolledEvent
  | CourseCapacityReachedEvent
  | CourseFullEvent
  | EnrollmentCancelledEvent;
