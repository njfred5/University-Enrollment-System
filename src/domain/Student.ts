import { StudentId, Email, Credits, Semester, Result } from "./types";
import { createStudentId, createEmail } from "./types";

interface StudentProps {
  id: StudentId;
  name: string;
  email: Email;
  creditsBySemester: Map<Semester, number>;
}

export class Student {
  private props: StudentProps;

  private constructor(props: StudentProps) {
    this.props = props;
  }

  static create(rawId: string, name: string, rawEmail: string): Result<Student> {
    const idResult = createStudentId(rawId);
    if (!idResult.ok) return idResult;

    const emailResult = createEmail(rawEmail);
    if (!emailResult.ok) return emailResult;

    if (name.trim().length < 2) {
      return { ok: false, error: "Student name must be at least 2 characters" };
    }

    return {
      ok: true,
      value: new Student({
        id: idResult.value,
        name: name.trim(),
        email: emailResult.value,
        creditsBySemester: new Map(),
      }),
    };
  }

  get id(): StudentId { return this.props.id; }
  get name(): string { return this.props.name; }
  get email(): Email { return this.props.email; }

  getCreditsForSemester(semester: Semester): number {
    return this.props.creditsBySemester.get(semester) ?? 0;
  }

  canEnroll(semester: Semester, courseCredits: Credits): boolean {
    return this.getCreditsForSemester(semester) + courseCredits <= 18;
  }

  addCredits(semester: Semester, credits: Credits): void {
    const current = this.getCreditsForSemester(semester);
    this.props.creditsBySemester.set(semester, current + credits);
  }

  removeCredits(semester: Semester, credits: Credits): void {
    const current = this.getCreditsForSemester(semester);
    this.props.creditsBySemester.set(semester, Math.max(0, current - credits));
  }
}
