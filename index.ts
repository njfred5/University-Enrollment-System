import { EventEmitter } from "./src/infrastructure/EventEmitter";
import { EnrollmentService } from "./src/domain/EnrollmentService";
import { Student } from "./src/domain/Student";
import { Course } from "./src/domain/Course";
import { CourseCode, StudentId } from "./src/domain/types";


const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const LINE   = "─".repeat(62);


function log(msg: string) { console.log(msg); }
function section(n: number, title: string) {
  log(`\n${LINE}`);
  log(`  ${BOLD}Scenario ${n}: ${title}${RESET}`);
  log(LINE);
}
function ok(msg: string)   { log(`  ${GREEN}✅  ${msg}${RESET}`); }
function fail(msg: string) { log(`  ${RED}❌  ${msg}${RESET}`); }
function info(msg: string) { log(`  ${CYAN}ℹ   ${msg}${RESET}`); }

function main() {
  const emitter = new EventEmitter();
  const service = new EnrollmentService(emitter);

  emitter.subscribe("StudentEnrolled", (e) => {
    ok(`[EVENT] StudentEnrolled — ${e.studentId} → ${e.courseCode} (${e.semester}) [${e.enrollmentId}]`);
  });

  emitter.subscribe("CourseCapacityReached", (e) => {
    log(`  ${YELLOW}⚠   [EVENT] CourseCapacityReached — ${e.courseCode} is ${e.percentFull}% full (${e.enrolledCount}/${e.capacity})${RESET}`);
  });

  emitter.subscribe("CourseFull", (e) => {
    log(`  ${RED}🔒  [EVENT] CourseFull — ${e.courseCode} has reached max capacity (${e.capacity}/${e.capacity})${RESET}`);
  });

  emitter.subscribe("EnrollmentCancelled", (e) => {
    log(`  ${YELLOW}🚫  [EVENT] EnrollmentCancelled — ${e.enrollmentId} (${e.studentId} / ${e.courseCode})${RESET}`);
  });

  const aliceResult = Student.create("STU100001", "Alice Martin", "alice@epita.fr");
  const bobResult   = Student.create("STU100002", "Bob Dupont", "bob@epita.fr");
  const charlieResult = Student.create("STU100003", "Charlie Leroy", "charlie@epita.fr");

  if (!aliceResult.ok || !bobResult.ok || !charlieResult.ok) {
    fail("Student creation failed");
    return;
  }

  const alice   = aliceResult.value;
  const bob     = bobResult.value;
  const charlie = charlieResult.value;

  const cs101Result  = Course.create("CS101",  "Intro to Computer Science", 3, 5);
  const math201Result = Course.create("MATH201", "Linear Algebra", 4, 2);
  const phys101Result = Course.create("PHYS101", "Classical Mechanics", 6, 1);

  if (!cs101Result.ok || !math201Result.ok || !phys101Result.ok) {
    fail("Course creation failed");
    return;
  }

  const cs101   = cs101Result.value;
  const math201 = math201Result.value;
  const phys101 = phys101Result.value;

  service.addStudent(alice);
  service.addStudent(bob);
  service.addStudent(charlie);
  service.addCourse(cs101);
  service.addCourse(math201);
  service.addCourse(phys101);

  log(`\n${"═".repeat(62)}`);
  log(`  ${BOLD}University Enrollment System — CLI Demo${RESET}`);
  log(`${"═".repeat(62)}`);

  section(1, "Successful Enrollment → StudentEnrolled event");
  info("Enrolling Alice (STU100001) in CS101 for Fall2024...");
  const r1 = service.enroll("STU100001" as StudentId, "CS101" as CourseCode, "Fall2024");
  if (!r1.ok) fail(r1.error);
  info(`Alice now has ${alice.getCreditsForSemester("Fall2024" as any)} credits in Fall2024`);

  section(2, "Course reaches 80% capacity → CourseCapacityReached event");
  info("CS101 has capacity 5. Enrolling students until 80% (4/5)...");
  info("Enrolling Bob (STU100002) in CS101...");
  const r2a = service.enroll("STU100002" as StudentId, "CS101" as CourseCode, "Fall2024");
  if (!r2a.ok) fail(r2a.error);
  info("Enrolling Charlie (STU100003) in CS101...");
  const r2b = service.enroll("STU100003" as StudentId, "CS101" as CourseCode, "Fall2024");
  if (!r2b.ok) fail(r2b.error);

  const extra1 = Student.create("STU100004", "Diana Prince", "diana@epita.fr");
  if (extra1.ok) {
    service.addStudent(extra1.value);
    info("Enrolling Diana (STU100004) in CS101... (this hits 80%)");
    const r2c = service.enroll("STU100004" as StudentId, "CS101" as CourseCode, "Fall2024");
    if (!r2c.ok) fail(r2c.error);
  }

  section(3, "Course becomes full → CourseFull event");
  info(`CS101 capacity is 5. Currently ${cs101.enrolledCount}/5. Enrolling last student...`);
  const extra2 = Student.create("STU100005", "Ethan Hunt", "ethan@epita.fr");
  if (extra2.ok) {
    service.addStudent(extra2.value);
    info("Enrolling Ethan (STU100005) in CS101... (fills course)");
    const r3 = service.enroll("STU100005" as StudentId, "CS101" as CourseCode, "Fall2024");
    if (!r3.ok) fail(r3.error);
  }
  info("Trying to enroll another student in full CS101...");
  const overflow = Student.create("STU100006", "Frank Castle", "frank@epita.fr");
  if (overflow.ok) {
    service.addStudent(overflow.value);
    const r3b = service.enroll("STU100006" as StudentId, "CS101" as CourseCode, "Fall2024");
    if (!r3b.ok) fail(`Correctly rejected: ${r3b.error}`);
  }

  section(4, "Student exceeds 18 credits → Enrollment fails, no event");
  info("PHYS101 gives 6 credits. Alice already has 3 (CS101).");
  info("Enrolling Alice in MATH201 (4 credits → total 7)...");
  const r4a = service.enroll("STU100001" as StudentId, "MATH201" as CourseCode, "Fall2024");
  if (!r4a.ok) fail(r4a.error);
  info(`Alice now has ${alice.getCreditsForSemester("Fall2024" as any)} credits.`);

  const bigCourse1 = Course.create("ENG401", "Advanced Engineering", 4, 50);
  const bigCourse2 = Course.create("BIO301", "Biochemistry", 4, 50);
  const bigCourse3 = Course.create("ECON201", "Macroeconomics", 3, 50);
  if (bigCourse1.ok && bigCourse2.ok && bigCourse3.ok) {
    service.addCourse(bigCourse1.value);
    service.addCourse(bigCourse2.value);
    service.addCourse(bigCourse3.value);
    service.enroll("STU100001" as StudentId, "ENG401" as CourseCode, "Fall2024");
    service.enroll("STU100001" as StudentId, "BIO301" as CourseCode, "Fall2024");
    service.enroll("STU100001" as StudentId, "ECON201" as CourseCode, "Fall2024");
  }
  info(`Alice now has ${alice.getCreditsForSemester("Fall2024" as any)} credits (limit: 18).`);
  info("Enrolling Alice in PHYS101 (6 credits) — should FAIL...");
  const r4b = service.enroll("STU100001" as StudentId, "PHYS101" as CourseCode, "Fall2024");
  if (!r4b.ok) fail(`Correctly rejected: ${r4b.error}`);

  section(5, "Cancel an enrollment → EnrollmentCancelled event");
  const r1Enrollment = service.getAllEnrollments().find(
    (e) => e.studentId === ("STU100001" as StudentId) && e.courseCode === ("MATH201" as CourseCode) && e.isActive()
  );
  if (r1Enrollment) {
    info(`Cancelling Alice's MATH201 enrollment (${r1Enrollment.id})...`);
    const r5 = service.cancelEnrollment(r1Enrollment.id);
    if (!r5.ok) fail(r5.error);
    info(`Alice's credits after cancellation: ${alice.getCreditsForSemester("Fall2024" as any)}`);
    info("Trying to cancel same enrollment again — should FAIL...");
    const r5b = service.cancelEnrollment(r1Enrollment.id);
    if (!r5b.ok) fail(`Correctly rejected: ${r5b.error}`);
  }

  log(`\n${"═".repeat(62)}`);
  log(`  ${BOLD}Final Summary${RESET}`);
  log(`${"═".repeat(62)}`);
  log(`  CS101   — ${cs101.enrolledCount}/${cs101.capacity} enrolled`);
  log(`  MATH201 — ${math201.enrolledCount}/${math201.capacity} enrolled`);
  log(`  PHYS101 — ${phys101.enrolledCount}/${phys101.capacity} enrolled`);
  log(`  Alice credits (Fall2024): ${alice.getCreditsForSemester("Fall2024" as any)}`);

  log(`\n  ${BOLD}Showing unsubscribe works:${RESET}`);
  const tempHandler = () => log("  [TEMP HANDLER] fired");
  emitter.subscribe("StudentEnrolled", tempHandler);
  log("  Subscribed temp handler. Enrolling Bob in PHYS101...");
  service.enroll("STU100002" as StudentId, "PHYS101" as CourseCode, "Fall2024");
  emitter.unsubscribe("StudentEnrolled", tempHandler);
  log("  Unsubscribed temp handler. Temp handler will not fire again.");
  log(`\n${LINE}\n  All 5 scenarios complete.\n${LINE}\n`);
}

main();
