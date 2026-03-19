import { EnrollmentId, StudentId, CourseCode, Semester, Result, createEnrollmentId } from "./types";

export type EnrollmentStatus = "active" | "cancelled";

interface EnrollmentProps {
  id: EnrollmentId;
  studentId: StudentId;
  courseCode: CourseCode;
  semester: Semester;
  status: EnrollmentStatus;
  createdAt: Date;
}

export class Enrollment {
  private props: EnrollmentProps;

  private constructor(props: EnrollmentProps) {
    this.props = props;
  }

  static create(
    studentId: StudentId,
    courseCode: CourseCode,
    semester: Semester
  ): Enrollment {
    return new Enrollment({
      id: createEnrollmentId(),
      studentId,
      courseCode,
      semester,
      status: "active",
      createdAt: new Date(),
    });
  }

  get id(): EnrollmentId { return this.props.id; }
  get studentId(): StudentId { return this.props.studentId; }
  get courseCode(): CourseCode { return this.props.courseCode; }
  get semester(): Semester { return this.props.semester; }
  get status(): EnrollmentStatus { return this.props.status; }

  isActive(): boolean {
    return this.props.status === "active";
  }

  cancel(): Result<void> {
    if (this.props.status !== "active") {
      return { ok: false, error: `Cannot cancel enrollment ${this.props.id}: it is already ${this.props.status}` };
    }
    this.props.status = "cancelled";
    return { ok: true, value: undefined };
  }
}
