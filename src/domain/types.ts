export type Brand<K, T> = K & { __brand: T };

export type StudentId  = Brand<string, "StudentId">;
export type CourseCode = Brand<string, "CourseCode">;
export type Email      = Brand<string, "Email">;
export type Credits    = Brand<number, "Credits">;
export type Semester   = Brand<string, "Semester">;
export type EnrollmentId = Brand<string, "EnrollmentId">;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function Ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function Err<T>(error: string): Result<T> {
  return { ok: false, error };
}

const VALID_CREDITS = [1, 2, 3, 4, 6] as const;
let enrollmentCounter = 1;

export function createStudentId(raw: string): Result<StudentId> {
  const trimmed = raw.trim().toUpperCase();
  if (!/^STU\d{6}$/.test(trimmed)) {
    return Err(`Invalid StudentId "${raw}": must be STU followed by 6 digits (e.g. STU123456)`);
  }
  return Ok(trimmed as StudentId);
}

export function createCourseCode(raw: string): Result<CourseCode> {
  const trimmed = raw.trim().toUpperCase();
  if (!/^[A-Z]{2,4}\d{3}$/.test(trimmed)) {
    return Err(`Invalid CourseCode "${raw}": must be 2–4 letters + 3 digits (e.g. CS101)`);
  }
  return Ok(trimmed as CourseCode);
}

export function createEmail(raw: string): Result<Email> {
  const trimmed = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return Err(`Invalid email "${raw}"`);
  }
  return Ok(trimmed as Email);
}

export function createCredits(value: number): Result<Credits> {
  if (!(VALID_CREDITS as readonly number[]).includes(value)) {
    return Err(`Invalid credits "${value}": must be one of 1, 2, 3, 4, 6`);
  }
  return Ok(value as Credits);
}

export function createSemester(raw: string): Result<Semester> {
  const trimmed = raw.trim();
  if (!/^(Fall|Spring|Summer)\d{4}$/.test(trimmed)) {
    return Err(`Invalid semester "${raw}": must be Fall|Spring|Summer + year (e.g. Fall2024)`);
  }
  return Ok(trimmed as Semester);
}

export function createEnrollmentId(): EnrollmentId {
  const id = `ENR-${String(enrollmentCounter++).padStart(6, "0")}`;
  return id as EnrollmentId;
}
