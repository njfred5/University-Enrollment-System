import { Student } from "./Student";
import { Course } from "./Course";
import { Enrollment } from "./Enrollment";
import { StudentId, CourseCode, Semester, Result, createSemester } from "./types";
import { EventEmitter } from "../infrastructure/EventEmitter";

export class EnrollmentService {
  private students = new Map<string, Student>();
  private courses  = new Map<string, Course>();
  private enrollments = new Map<string, Enrollment>();

  constructor(private emitter: EventEmitter) {}

  addStudent(student: Student): void {
    this.students.set(student.id, student);
  }

  addCourse(course: Course): void {
    this.courses.set(course.code, course);
  }

  enroll(
    studentId: StudentId,
    courseCode: CourseCode,
    rawSemester: string
  ): Result<Enrollment> {
    const semResult = createSemester(rawSemester);
    if (!semResult.ok) return semResult;
    const semester = semResult.value;

    const student = this.students.get(studentId);
    if (!student) return { ok: false, error: `Student "${studentId}" not found` };

    const course = this.courses.get(courseCode);
    if (!course) return { ok: false, error: `Course "${courseCode}" not found` };

    if (course.isFull()) {
      return { ok: false, error: `Course "${courseCode}" is full (${course.capacity}/${course.capacity})` };
    }

    const duplicate = Array.from(this.enrollments.values()).find(
      (e) =>
        e.studentId === studentId &&
        e.courseCode === courseCode &&
        e.semester === semester &&
        e.isActive()
    );
    if (duplicate) {
      return { ok: false, error: `Student "${studentId}" is already enrolled in "${courseCode}" for ${semester}` };
    }

    if (!student.canEnroll(semester, course.credits)) {
      const current = student.getCreditsForSemester(semester);
      return {
        ok: false,
        error: `Credit limit exceeded: student has ${current} credits, adding ${course.credits} would exceed 18`,
      };
    }

    const enrollment = Enrollment.create(studentId, courseCode, semester);
    student.addCredits(semester, course.credits);
    course.incrementEnrolled();
    this.enrollments.set(enrollment.id, enrollment);

    this.emitter.emit({
      name: "StudentEnrolled",
      studentId,
      courseCode,
      enrollmentId: enrollment.id,
      semester,
      occurredAt: new Date(),
    });

    if (course.isFull()) {
      this.emitter.emit({
        name: "CourseFull",
        courseCode,
        capacity: course.capacity,
        occurredAt: new Date(),
      });
    } else if (course.isAt80Percent()) {
      this.emitter.emit({
        name: "CourseCapacityReached",
        courseCode,
        enrolledCount: course.enrolledCount,
        capacity: course.capacity,
        percentFull: Math.round((course.enrolledCount / course.capacity) * 100),
        occurredAt: new Date(),
      });
    }

    return { ok: true, value: enrollment };
  }

  cancelEnrollment(enrollmentId: string): Result<void> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return { ok: false, error: `Enrollment "${enrollmentId}" not found` };

    const result = enrollment.cancel();
    if (!result.ok) return result;

    const student = this.students.get(enrollment.studentId);
    const course  = this.courses.get(enrollment.courseCode);

    if (student && course) {
      student.removeCredits(enrollment.semester, course.credits);
      course.decrementEnrolled();
    }

    this.emitter.emit({
      name: "EnrollmentCancelled",
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      courseCode: enrollment.courseCode,
      occurredAt: new Date(),
    });

    return { ok: true, value: undefined };
  }

  getCourse(code: CourseCode): Course | undefined {
    return this.courses.get(code);
  }

  getStudent(id: StudentId): Student | undefined {
    return this.students.get(id);
  }

  getAllEnrollments(): Enrollment[] {
    return Array.from(this.enrollments.values());
  }
}
