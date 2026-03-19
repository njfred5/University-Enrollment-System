import { CourseCode, Credits, Result } from "./types";
import { createCourseCode, createCredits } from "./types";

interface CourseProps {
  code: CourseCode;
  name: string;
  credits: Credits;
  capacity: number;
  enrolledCount: number;
}
export class Course {
  private props: CourseProps;

  private constructor(props: CourseProps) {
    this.props = props;
  }

  static create(
    rawCode: string,
    name: string,
    rawCredits: number,
    capacity: number
  ): Result<Course> {
    const codeResult = createCourseCode(rawCode);
    if (!codeResult.ok) return codeResult;

    const creditsResult = createCredits(rawCredits);
    if (!creditsResult.ok) return creditsResult;

    if (capacity < 1 || capacity > 200) {
      return { ok: false, error: "Course capacity must be between 1 and 200" };
    }

    if (name.trim().length < 3) {
      return { ok: false, error: "Course name must be at least 3 characters" };
    }

    return {
      ok: true,
      value: new Course({
        code: codeResult.value,
        name: name.trim(),
        credits: creditsResult.value,
        capacity,
        enrolledCount: 0,
      }),
    };
  }

  get code(): CourseCode { return this.props.code; }
  get name(): string { return this.props.name; }
  get credits(): Credits { return this.props.credits; }
  get capacity(): number { return this.props.capacity; }
  get enrolledCount(): number { return this.props.enrolledCount; }
  get availableSpots(): number { return this.props.capacity - this.props.enrolledCount; }

  isFull(): boolean {
    return this.props.enrolledCount >= this.props.capacity;
  }

  isAt80Percent(): boolean {
    return this.props.enrolledCount / this.props.capacity >= 0.8;
  }

  incrementEnrolled(): void {
    this.props.enrolledCount += 1;
  }

  decrementEnrolled(): void {
    if (this.props.enrolledCount > 0) {
      this.props.enrolledCount -= 1;
    }
  }
}
