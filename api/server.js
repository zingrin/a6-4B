var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/server.ts
import "dotenv/config";

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express2 from "express";
import cors from "cors";

// src/lib/auth.ts
import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// generated/prisma/enums.ts
var UserRoles = {
  ADMIN: "ADMIN",
  TUTOR: "TUTOR",
  STUDENT: "STUDENT",
  INSTITUTE: "INSTITUTE",
  MENTOR: "MENTOR",
  MODERATOR: "MODERATOR"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var AvailabilityStatus = {
  AVAILABLE: "AVAILABLE",
  BOOKED: "BOOKED"
};
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};
var CourseLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
};

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  phone         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role              UserRoles\n  status            UserStatus         @default(ACTIVE)\n  tutorProfile      TutorProfiles?\n  instituteProfile  InstituteProfile?\n  mentorProfile     MentorProfile?\n  studentBookings   Booking[]\n  studentReviews    Review[]\n  courseEnrollments CourseEnrollment[]\n  payments          Payment[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nenum UserRoles {\n  ADMIN\n  TUTOR\n  STUDENT\n  INSTITUTE\n  MENTOR\n  MODERATOR\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nmodel Availability {\n  id        String             @id @default(uuid())\n  tutorId   String\n  day       WeekDay\n  startTime String\n  endTime   String\n  status    AvailabilityStatus @default(AVAILABLE)\n\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n  booking Booking[]\n\n  @@index([tutorId])\n  @@map("availability")\n}\n\nenum AvailabilityStatus {\n  AVAILABLE\n  BOOKED\n}\n\nenum WeekDay {\n  MONDAY\n  TUESDAY\n  WEDNESDAY\n  THURSDAY\n  FRIDAY\n  SATURDAY\n  SUNDAY\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  studentId      String\n  tutorId        String\n  subjectId      String?\n  availabilityId String?\n  status         BookingStatus @default(PENDING)\n  price          Int\n  createdAt      DateTime      @default(now())\n  completedAt    DateTime?\n\n  student      User          @relation(fields: [studentId], references: [id])\n  tutor        TutorProfiles @relation(fields: [tutorId], references: [id])\n  subject      Subject?      @relation(fields: [subjectId], references: [id])\n  availability Availability? @relation(fields: [availabilityId], references: [id], onDelete: SetNull)\n  review       Review?\n  payment      Payment?\n\n  @@index([studentId, tutorId])\n  @@map("bookings")\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Category {\n  id          String   @id @default(uuid())\n  name        String   @unique\n  description String?\n  createdAt   DateTime @default(now())\n\n  tutors   TutorProfiles[]\n  subjects Subject[]\n  courses  Course[]\n\n  @@map("categories")\n}\n\nmodel InstituteProfile {\n  id              String   @id @default(uuid())\n  userId          String   @unique\n  name            String\n  description     String?\n  logoUrl         String?\n  contactEmail    String?\n  website         String?\n  establishedYear Int?\n  createdAt       DateTime @default(now())\n\n  user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n  mentors MentorProfile[]\n  courses Course[]\n\n  @@map("institute_profiles")\n}\n\nmodel Course {\n  id           String      @id @default(uuid())\n  instituteId  String\n  title        String\n  description  String\n  price        Int\n  thumbnailUrl String?\n  level        CourseLevel @default(BEGINNER)\n  duration     String?\n  isPublished  Boolean     @default(false)\n  categoryId   String?\n  createdAt    DateTime    @default(now())\n\n  institute   InstituteProfile   @relation(fields: [instituteId], references: [id], onDelete: Cascade)\n  mentors     MentorProfile[]\n  category    Category?          @relation(fields: [categoryId], references: [id])\n  enrollments CourseEnrollment[]\n\n  @@index([instituteId])\n  @@map("courses")\n}\n\nmodel CourseEnrollment {\n  id         String   @id @default(uuid())\n  studentId  String\n  courseId   String\n  status     String   @default("ACTIVE")\n  enrolledAt DateTime @default(now())\n\n  student User     @relation(fields: [studentId], references: [id])\n  course  Course   @relation(fields: [courseId], references: [id])\n  payment Payment?\n\n  @@unique([studentId, courseId])\n  @@map("course_enrollments")\n}\n\nenum CourseLevel {\n  BEGINNER\n  INTERMEDIATE\n  ADVANCED\n}\n\nmodel MentorProfile {\n  id          String   @id @default(uuid())\n  userId      String   @unique\n  instituteId String\n  title       String?\n  bio         String?\n  expertise   String?\n  avatarUrl   String?\n  createdAt   DateTime @default(now())\n\n  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n  institute InstituteProfile @relation(fields: [instituteId], references: [id], onDelete: Cascade)\n  courses   Course[]\n\n  @@index([instituteId])\n  @@map("mentor_profiles")\n}\n\nmodel Payment {\n  id            String         @id @default(uuid())\n  status        PaymentStatus  @default(PENDING)\n  gateway       PaymentGateway @default(STRIPE)\n  amount        Float\n  currency      String         @default("USD")\n  transactionId String?        @unique\n  gatewayRef    String?\n  metadata      Json?\n\n  // Who paid\n  studentId String\n  student   User   @relation(fields: [studentId], references: [id])\n\n  // What they paid for \u2014 either a 1-on-1 booking OR a course enrollment\n  bookingId          String?           @unique\n  booking            Booking?          @relation(fields: [bookingId], references: [id])\n  courseEnrollmentId String?           @unique\n  courseEnrollment   CourseEnrollment? @relation(fields: [courseEnrollmentId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([studentId])\n  @@map("payments")\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  REFUNDED\n}\n\nenum PaymentGateway {\n  STRIPE\n}\n\nmodel Review {\n  id        String   @id @default(uuid())\n  bookingId String   @unique\n  studentId String\n  tutorId   String\n  rating    Decimal  @db.Decimal(2, 1)\n  review    String\n  createdAt DateTime @default(now())\n\n  student User          @relation(fields: [studentId], references: [id])\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id], onDelete: Cascade)\n  booking Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)\n\n  @@index([studentId])\n  @@index([tutorId])\n  @@map("reviews")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Subject {\n  id         String   @id @default(uuid())\n  name       String   @unique\n  categoryId String\n  createdAt  DateTime @default(now())\n\n  category Category       @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  tutors   TutorSubject[]\n  bookings Booking[]\n\n  @@index([categoryId])\n  @@map("subjects")\n}\n\nmodel TutorProfiles {\n  id           String   @id @default(uuid())\n  userId       String   @unique\n  bio          String?\n  hourlyRate   Int?\n  categoryId   String?\n  isFeatured   Boolean  @default(false)\n  avgRating    Decimal  @default(0) @db.Decimal(2, 1)\n  totalReviews Int      @default(0)\n  createdAt    DateTime @default(now())\n\n  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  category     Category?      @relation(fields: [categoryId], references: [id])\n  availability Availability[]\n  bookings     Booking[]\n  reviews      Review[]\n  subjects     TutorSubject[]\n\n  @@index([categoryId])\n  @@map("tutor_profiles")\n}\n\nmodel TutorSubject {\n  tutorId   String\n  subjectId String\n\n  tutor   TutorProfiles @relation(fields: [tutorId], references: [id])\n  subject Subject       @relation(fields: [subjectId], references: [id])\n\n  @@id([tutorId, subjectId])\n  @@map("tutor_subjects")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"UserRoles"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"tutorProfile","kind":"object","type":"TutorProfiles","relationName":"TutorProfilesToUser"},{"name":"instituteProfile","kind":"object","type":"InstituteProfile","relationName":"InstituteProfileToUser"},{"name":"mentorProfile","kind":"object","type":"MentorProfile","relationName":"MentorProfileToUser"},{"name":"studentBookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"studentReviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"courseEnrollments","kind":"object","type":"CourseEnrollment","relationName":"CourseEnrollmentToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"day","kind":"enum","type":"WeekDay"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AvailabilityStatus"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"AvailabilityToTutorProfiles"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"}],"dbName":"availability"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"price","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"completedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"BookingToTutorProfiles"},{"name":"subject","kind":"object","type":"Subject","relationName":"BookingToSubject"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingToPayment"}],"dbName":"bookings"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"tutors","kind":"object","type":"TutorProfiles","relationName":"CategoryToTutorProfiles"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CategoryToSubject"},{"name":"courses","kind":"object","type":"Course","relationName":"CategoryToCourse"}],"dbName":"categories"},"InstituteProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"contactEmail","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"establishedYear","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"InstituteProfileToUser"},{"name":"mentors","kind":"object","type":"MentorProfile","relationName":"InstituteProfileToMentorProfile"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToInstituteProfile"}],"dbName":"institute_profiles"},"Course":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"instituteId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Int"},{"name":"thumbnailUrl","kind":"scalar","type":"String"},{"name":"level","kind":"enum","type":"CourseLevel"},{"name":"duration","kind":"scalar","type":"String"},{"name":"isPublished","kind":"scalar","type":"Boolean"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"institute","kind":"object","type":"InstituteProfile","relationName":"CourseToInstituteProfile"},{"name":"mentors","kind":"object","type":"MentorProfile","relationName":"CourseToMentorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToCourse"},{"name":"enrollments","kind":"object","type":"CourseEnrollment","relationName":"CourseToCourseEnrollment"}],"dbName":"courses"},"CourseEnrollment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"courseId","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"enrolledAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"CourseEnrollmentToUser"},{"name":"course","kind":"object","type":"Course","relationName":"CourseToCourseEnrollment"},{"name":"payment","kind":"object","type":"Payment","relationName":"CourseEnrollmentToPayment"}],"dbName":"course_enrollments"},"MentorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"instituteId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"expertise","kind":"scalar","type":"String"},{"name":"avatarUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"MentorProfileToUser"},{"name":"institute","kind":"object","type":"InstituteProfile","relationName":"InstituteProfileToMentorProfile"},{"name":"courses","kind":"object","type":"Course","relationName":"CourseToMentorProfile"}],"dbName":"mentor_profiles"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"gateway","kind":"enum","type":"PaymentGateway"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"gatewayRef","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToPayment"},{"name":"courseEnrollmentId","kind":"scalar","type":"String"},{"name":"courseEnrollment","kind":"object","type":"CourseEnrollment","relationName":"CourseEnrollmentToPayment"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"payments"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Decimal"},{"name":"review","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"ReviewToTutorProfiles"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"}],"dbName":"reviews"},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToSubject"},{"name":"tutors","kind":"object","type":"TutorSubject","relationName":"SubjectToTutorSubject"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToSubject"}],"dbName":"subjects"},"TutorProfiles":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Int"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"avgRating","kind":"scalar","type":"Decimal"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfilesToUser"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorProfiles"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfiles"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfiles"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfiles"},{"name":"subjects","kind":"object","type":"TutorSubject","relationName":"TutorProfilesToTutorSubject"}],"dbName":"tutor_profiles"},"TutorSubject":{"fields":[{"name":"tutorId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfiles","relationName":"TutorProfilesToTutorSubject"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorSubject"}],"dbName":"tutor_subjects"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilityScalarFieldEnum: () => AvailabilityScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  CourseEnrollmentScalarFieldEnum: () => CourseEnrollmentScalarFieldEnum,
  CourseScalarFieldEnum: () => CourseScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  InstituteProfileScalarFieldEnum: () => InstituteProfileScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MentorProfileScalarFieldEnum: () => MentorProfileScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubjectScalarFieldEnum: () => SubjectScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfilesScalarFieldEnum: () => TutorProfilesScalarFieldEnum,
  TutorSubjectScalarFieldEnum: () => TutorSubjectScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Availability: "Availability",
  Booking: "Booking",
  Category: "Category",
  InstituteProfile: "InstituteProfile",
  Course: "Course",
  CourseEnrollment: "CourseEnrollment",
  MentorProfile: "MentorProfile",
  Payment: "Payment",
  Review: "Review",
  Subject: "Subject",
  TutorProfiles: "TutorProfiles",
  TutorSubject: "TutorSubject"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  phone: "phone",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AvailabilityScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  day: "day",
  startTime: "startTime",
  endTime: "endTime",
  status: "status"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorId: "tutorId",
  subjectId: "subjectId",
  availabilityId: "availabilityId",
  status: "status",
  price: "price",
  createdAt: "createdAt",
  completedAt: "completedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  createdAt: "createdAt"
};
var InstituteProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  name: "name",
  description: "description",
  logoUrl: "logoUrl",
  contactEmail: "contactEmail",
  website: "website",
  establishedYear: "establishedYear",
  createdAt: "createdAt"
};
var CourseScalarFieldEnum = {
  id: "id",
  instituteId: "instituteId",
  title: "title",
  description: "description",
  price: "price",
  thumbnailUrl: "thumbnailUrl",
  level: "level",
  duration: "duration",
  isPublished: "isPublished",
  categoryId: "categoryId",
  createdAt: "createdAt"
};
var CourseEnrollmentScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  courseId: "courseId",
  status: "status",
  enrolledAt: "enrolledAt"
};
var MentorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  instituteId: "instituteId",
  title: "title",
  bio: "bio",
  expertise: "expertise",
  avatarUrl: "avatarUrl",
  createdAt: "createdAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  status: "status",
  gateway: "gateway",
  amount: "amount",
  currency: "currency",
  transactionId: "transactionId",
  gatewayRef: "gatewayRef",
  metadata: "metadata",
  studentId: "studentId",
  bookingId: "bookingId",
  courseEnrollmentId: "courseEnrollmentId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorId: "tutorId",
  rating: "rating",
  review: "review",
  createdAt: "createdAt"
};
var SubjectScalarFieldEnum = {
  id: "id",
  name: "name",
  categoryId: "categoryId",
  createdAt: "createdAt"
};
var TutorProfilesScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  hourlyRate: "hourlyRate",
  categoryId: "categoryId",
  isFeatured: "isFeatured",
  avgRating: "avgRating",
  totalReviews: "totalReviews",
  createdAt: "createdAt"
};
var TutorSubjectScalarFieldEnum = {
  tutorId: "tutorId",
  subjectId: "subjectId"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import { createAuthMiddleware } from "better-auth/api";

// src/utils/sendVerificationEmail.tsx
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var getEmailTemplate = (userName, verificationUrl) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SkillBridge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px;">
                <table role="presentation" style="width: 540px; max-width: 100%; border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 0 0 48px; text-align: left;">
                            <h1 style="margin: 0; color: #000000; font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">SkillBridge</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 0;">
                            <h2 style="margin: 0 0 16px; color: #000000; font-size: 26px; font-weight: 500; letter-spacing: -0.5px; line-height: 1.3;">
                                Verify your email
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Hi ${userName}, welcome to SkillBridge.
                            </p>
                            
                            <p style="margin: 0 0 32px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Click the button below to verify your email address and get started.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 32px;">
                                <tr>
                                    <td>
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #088395; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                                            Verify email address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 8px; color: #999999; font-size: 14px; line-height: 1.5;">
                                Or copy this link:
                            </p>
                            
                            <p style="margin: 0 0 40px; color: #999999; font-size: 13px; word-break: break-all; line-height: 1.5;">
                                ${verificationUrl}
                            </p>
                            
                            <!-- Divider -->
                            <table role="presentation" style="width: 100%; margin: 0 0 32px;">
                                <tr>
                                    <td style="border-top: 1px solid #e5e7eb;"></td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 24px; color: #999999; font-size: 14px; line-height: 1.5;">
                                This link expires in 24 hours. If you didn't create this account, you can ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 0 0;">
                            <p style="margin: 0 0 8px; color: #999999; font-size: 13px;">
                                Questions? <a href="mailto:support@skillbridge.com" style="color: #000000; text-decoration: none;">Contact support</a>
                            </p>
                            <p style="margin: 0; color: #cccccc; font-size: 13px;">
                                \xA9 2026 SkillBridge
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
var sendVerificationEmail = async ({ user, url, token }) => {
  try {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const info = await transporter.sendMail({
      from: '"SkillBridge" <skillbridge@mail.com>',
      to: user.email,
      subject: "Verify Your Email Address - SkillBridge",
      text: `Hi ${user.name},

Thank you for signing up with SkillBridge! Please verify your email address by clicking this link: ${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The SkillBridge Team`,
      html: getEmailTemplate(user.name, url)
    });
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
var sendVerificationEmail_default = sendVerificationEmail;

// src/lib/auth.ts
import "dotenv/config";
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  // trustedOrigins : [process.env.APP_URL!],
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");
    const allowedOrigins2 = [
      process.env.APP_URL,
      process.env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
      "https://skillbridge-frontend-murex.vercel.app",
      "https://skillbridge-frontend-murex.vercel.app"
    ].filter(Boolean);
    if (!origin || allowedOrigins2.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return [origin];
    }
    return [];
  },
  basePath: "/api/auth",
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
    // requireEmailVerification : true
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log(url);
      sendVerificationEmail_default({ user: { ...user, image: user.image ?? null }, url, token });
    },
    autoSignInAfterVerification: true
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        if (ctx.body.role === UserRoles.ADMIN && process.env.ALLOW_ADMIN_SEED !== "true") {
          throw new APIError("BAD_REQUEST", {
            message: "You can't sign up as admin"
          });
        }
        if (ctx.body.role === UserRoles.MODERATOR || ctx.body.role === UserRoles.MENTOR) {
          const inviteToken = ctx.headers?.get("x-invite-token");
          if (!inviteToken) {
            throw new APIError("BAD_REQUEST", { message: "You cannot register as a moderator or mentor without an invite code" });
          }
          const verification = await prisma.verification.findFirst({
            where: {
              identifier: { endsWith: `:${ctx.body.email}` },
              value: inviteToken
            }
          });
          if (!verification || verification.expiresAt < /* @__PURE__ */ new Date()) {
            throw new APIError("BAD_REQUEST", { message: "Invalid or expired invite" });
          }
        }
      }
    })
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user.role === UserRoles.TUTOR) {
              await prisma.tutorProfiles.create({
                data: {
                  userId: user.id
                }
              });
            } else if (user.role === UserRoles.INSTITUTE) {
              await prisma.instituteProfile.create({
                data: {
                  userId: user.id,
                  name: user.name
                }
              });
            }
            if (user.role === UserRoles.MODERATOR || user.role === UserRoles.MENTOR) {
              if (user.role === UserRoles.MENTOR) {
                const verification = await prisma.verification.findFirst({
                  where: { identifier: { startsWith: "invite:mentor:", endsWith: `:${user.email}` } }
                });
                if (verification) {
                  const instituteId = verification.identifier.split(":")[2];
                  await prisma.mentorProfile.create({
                    data: {
                      userId: user.id,
                      instituteId
                    }
                  });
                }
              }
              await prisma.verification.deleteMany({
                where: { identifier: { endsWith: `:${user.email}` } }
              });
              await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true }
              });
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }
});

// src/modules/user/user.router.ts
import { Router } from "express";

// src/modules/user/user.service.ts
import crypto from "crypto";

// src/utils/email.ts
import ejs from "ejs";
import nodemailer2 from "nodemailer";
import path2 from "path";

// src/config/env.ts
import "dotenv/config";
var loadEnvVariables = () => {
  const required = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "APP_URL",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "OPENROUTER_API_KEY"
  ];
  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  }
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    APP_URL: process.env.APP_URL,
    ALLOW_ADMIN_SEED: process.env.ALLOW_ADMIN_SEED,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
  };
};
var envVars = loadEnvVariables();

// src/utils/email.ts
console.log(envVars.EMAIL_SENDER.SMTP_HOST, envVars.EMAIL_SENDER.SMTP_USER, envVars.EMAIL_SENDER.SMTP_PASS, envVars.EMAIL_SENDER.SMTP_PORT);
var transporter2 = nodemailer2.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  console.log(envVars.EMAIL_SENDER.SMTP_HOST, envVars.EMAIL_SENDER.SMTP_USER, envVars.EMAIL_SENDER.SMTP_PASS, envVars.EMAIL_SENDER.SMTP_PORT);
  try {
    const templatePath = path2.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`
    );
    const html = await ejs.renderFile(templatePath, templateData);
    await transporter2.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType
      }))
    });
  } catch (error) {
    console.error("\n============= EMAIL SENDING FAILED =============");
    console.error("SMTP Error:", error instanceof Error ? error.message : String(error));
    console.error("\nBut don't worry! For development, here is the simulated email data:");
    console.error("To:", to);
    console.error("Subject:", subject);
    if (templateData.inviteUrl) console.error("URL:", templateData.inviteUrl);
    if (templateData.acceptUrl) console.error("URL:", templateData.acceptUrl);
    if (templateData.url) console.error("URL:", templateData.url);
    console.error("================================================\n");
    if (envVars.NODE_ENV !== "development") {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Email could not be sent: ${message}`);
    }
  }
};

// src/modules/user/user.service.ts
var listUsers = async ({
  page,
  limit,
  sortBy,
  skip,
  sortOrder,
  role
}) => {
  const whereCondition = role ? { role } : {};
  const total = await prisma.user.count({
    where: whereCondition
  });
  const result = await prisma.user.findMany({
    where: whereCondition,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getUser = async (user) => {
  return await prisma.user.findUnique({
    where: {
      id: user.id
    },
    include: {
      studentReviews: user.role === UserRoles.STUDENT,
      studentBookings: user.role === UserRoles.STUDENT,
      tutorProfile: user.role === UserRoles.TUTOR && {
        include: {
          subjects: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });
};
var updateUserData = async (data, user) => {
  const { name, image, phone } = data;
  if (!name && !image && !phone) {
    throw new Error("Invalid input fields");
  }
  const userExists = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id
    }
  });
  return await prisma.user.update({
    where: {
      id: userExists.id
    },
    data: {
      ...name && { name },
      ...image && { image },
      ...phone && { phone }
    },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true
    }
  });
};
var updateUserStatus = async (status8, userId) => {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status: status8
    }
  });
};
var getStudentStats = async (studentId) => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalEnrolledCourses,
      totalReviews
    ] = await Promise.all([
      tx.booking.count({ where: { studentId } }),
      tx.booking.findMany({
        where: {
          studentId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] }
        },
        take: 3,
        orderBy: { createdAt: "asc" },
        include: {
          tutor: { include: { user: { select: { name: true, image: true } } } },
          subject: { select: { name: true } },
          availability: { select: { day: true, startTime: true, endTime: true } }
        }
      }),
      tx.booking.count({
        where: { studentId, status: BookingStatus.COMPLETED }
      }),
      tx.courseEnrollment.count({
        where: { studentId, status: "ACTIVE" }
      }),
      tx.review.count({
        where: { studentId }
      })
    ]);
    const totalSpentResult = await tx.payment.aggregate({
      where: { studentId, status: "COMPLETED" },
      _sum: { amount: true }
    });
    const totalSpent = totalSpentResult._sum.amount ?? 0;
    const coursePaymentSum = await tx.payment.aggregate({
      where: { studentId, status: "COMPLETED", NOT: { courseEnrollmentId: null } },
      _sum: { amount: true }
    });
    const bookingPaymentSum = await tx.payment.aggregate({
      where: { studentId, status: "COMPLETED", NOT: { bookingId: null } },
      _sum: { amount: true }
    });
    const serviceMix = [
      { name: "Courses", value: coursePaymentSum._sum.amount ?? 0 },
      { name: "Tutoring", value: bookingPaymentSum._sum.amount ?? 0 }
    ];
    const categoryGroups = await tx.courseEnrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      include: {
        course: { include: { category: true } }
      }
    });
    const categoryMap = {};
    categoryGroups.forEach((enrollment) => {
      const catName = enrollment.course.category?.name || "Other";
      categoryMap[catName] = (categoryMap[catName] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const recentPayments = await tx.payment.findMany({
      where: {
        studentId,
        status: "COMPLETED",
        createdAt: { gte: sixMonthsAgo }
      },
      select: { amount: true, createdAt: true }
    });
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthMap[key] = 0;
    }
    for (const p of recentPayments) {
      const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthMap[key] !== void 0) {
        monthMap[key] += p.amount;
      }
    }
    const spendingTrend = Object.entries(monthMap).map(([month, amount]) => ({
      month,
      amount
    }));
    const recentEnrollments = await tx.courseEnrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      include: {
        course: {
          include: {
            institute: { select: { name: true } },
            category: true
          }
        }
      },
      orderBy: { enrolledAt: "desc" },
      take: 4
    });
    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      totalEnrolledCourses,
      totalSpent,
      totalReviews,
      serviceMix,
      categoryDistribution,
      spendingTrend,
      recentEnrollments
    };
  });
};
var getAdminAnalytics = async () => {
  return await prisma.$transaction(async (tx) => {
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalInstitutes,
      totalBookings,
      completedBookings,
      totalRevenue,
      totalReviews,
      averageRating,
      allRolesDistribution,
      bookingStatusDistribution,
      monthlyRevenue,
      monthlyUserGrowth
    ] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { role: "STUDENT" } }),
      tx.user.count({ where: { role: "TUTOR" } }),
      tx.user.count({ where: { role: "INSTITUTE" } }),
      tx.booking.count(),
      tx.booking.count({ where: { status: "COMPLETED" } }),
      tx.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true }
      }),
      tx.review.count(),
      tx.review.aggregate({ _avg: { rating: true } }),
      // Distributions
      tx.user.groupBy({
        by: ["role"],
        _count: { _all: true }
      }),
      tx.booking.groupBy({
        by: ["status"],
        _count: { _all: true }
      }),
      // Trends
      tx.payment.findMany({
        where: { status: "COMPLETED", createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true }
      }),
      tx.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { role: true, createdAt: true }
      })
    ]);
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthMap[key] = { revenue: 0, signups: 0 };
    }
    for (const p of monthlyRevenue) {
      const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthMap[key]) monthMap[key].revenue += p.amount;
    }
    for (const u of monthlyUserGrowth) {
      const key = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthMap[key]) monthMap[key].signups += 1;
    }
    const platformTrend = Object.entries(monthMap).map(([month, data]) => ({
      month,
      ...data
    }));
    return {
      totalUsers,
      totalStudents,
      totalTutors,
      totalInstitutes,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      roleDistribution: allRolesDistribution.map((r) => ({ name: r.role, value: r._count._all })),
      bookingDistribution: bookingStatusDistribution.map((b) => ({ name: b.status, value: b._count._all })),
      platformTrend
    };
  });
};
var inviteModerator = async (email, name) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verification.deleteMany({
    where: { identifier: `invite:moderator:${email}` }
  });
  await prisma.verification.create({
    data: {
      id: crypto.randomUUID(),
      identifier: `invite:moderator:${email}`,
      value: token,
      expiresAt: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 7)
      // 7 days
    }
  });
  const inviteUrl = `${envVars.APP_URL}/accept-invite?token=${token}&email=${encodeURIComponent(email)}&role=${UserRoles.MODERATOR}&name=${encodeURIComponent(name)}`;
  await sendEmail({
    to: email,
    subject: "You're Invited to SkillBridge",
    templateName: "invite",
    templateData: {
      invitedName: name,
      roleName: "Moderator",
      inviterName: "SkillBridge Admin",
      inviteUrl
    }
  });
  return { message: "Invitation sent successfully" };
};
var userService = {
  getUser,
  listUsers,
  updateUserStatus,
  updateUserData,
  getStudentStats,
  getAdminAnalytics,
  inviteModerator
};

// src/utils/paginationHelper.tsx
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return { page, limit, skip, sortBy, sortOrder };
};
var paginationHelper_default = paginationSortingHelper;

// src/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/modules/user/user.controller.ts
import status from "http-status";
var getUser2 = async (req, res, next) => {
  try {
    const result = await userService.getUser(req.user);
    return res.status(200).json({ success: true, message: "User data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var listUsers2 = async (req, res, next) => {
  try {
    const paginations = paginationHelper_default(req.query);
    const role = req.query.role;
    const result = await userService.listUsers({ ...paginations, role });
    return res.status(200).json({ success: true, message: "Users data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    if (!req.body?.status) {
      throw new AppError_default(status.BAD_REQUEST, "Status is required");
    }
    const result = await userService.updateUserStatus(req.body.status, req.params.userId);
    return res.status(200).json({ success: true, message: "User status updated", data: result });
  } catch (e) {
    next(e);
  }
};
var updateUserData2 = async (req, res, next) => {
  try {
    const result = await userService.updateUserData(req.body, req.user);
    return res.status(200).json({ success: true, message: "Updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getStudentStats2 = async (req, res, next) => {
  try {
    const result = await userService.getStudentStats(req.user?.id);
    return res.status(200).json({ success: true, message: "Student stats retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getAdminAnalytics2 = async (req, res, next) => {
  try {
    const result = await userService.getAdminAnalytics();
    return res.status(200).json({ success: true, message: "Admin analytics retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var inviteModerator2 = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      throw new AppError_default(status.BAD_REQUEST, "Email and name are required");
    }
    const result = await userService.inviteModerator(email, name);
    return res.status(200).json({ success: true, message: "Invitation sent successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var userController = {
  getUser: getUser2,
  listUsers: listUsers2,
  updateUserStatus: updateUserStatus2,
  updateUserData: updateUserData2,
  getStudentStats: getStudentStats2,
  getAdminAnalytics: getAdminAnalytics2,
  inviteModerator: inviteModerator2
};

// src/middlewares/auth.ts
import status2 from "http-status";
var auth3 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized");
      }
      req.user = session.user;
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        throw new AppError_default(status2.FORBIDDEN, "You don't have permission to perform this action.");
      }
      if (req.user.role === UserRoles.TUTOR) {
        const tutorProfile = await prisma.tutorProfiles.findUnique({
          where: {
            userId: req.user.id
          },
          select: {
            id: true
          }
        });
        if (tutorProfile) {
          req.tutorId = tutorProfile.id;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/middlewares/validateRequest.ts
import "zod";
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return next(new Error("Invalid JSON in 'data' field"));
      }
    }
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/config/multer.config.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var deleteFileFromCloudinary = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
      });
      console.log(`File ${publicId} deleted from Cloudinary`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};
var cloudinaryInstance = cloudinary;

// src/config/multer.config.ts
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "image/webp"
];
var fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Accepted types: JPG, PNG, SVG, WebP"));
  }
};
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryInstance,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    return {
      folder: `skillbridge/images`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer({ storage, fileFilter });
var uploadProfilePhoto = multerUpload.single("image");
var uploadInstituteLogo = multerUpload.single("logo");
var uploadCourseThumbnail = multerUpload.single("thumbnail");

// src/modules/user/user.validation.ts
import z2 from "zod";
var inviteModeratorZodSchema = z2.object({
  email: z2.string().email("Invalid email address"),
  name: z2.string().min(2, "Name must be at least 2 characters")
});
var updateUserZodSchema = z2.object({
  name: z2.string().min(2).optional(),
  phone: z2.string().optional().nullable(),
  image: z2.string().url().optional().nullable()
});

// src/modules/user/user.router.ts
var router = Router();
router.get("/me", auth3(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN, UserRoles.INSTITUTE, UserRoles.MODERATOR, UserRoles.MENTOR), userController.getUser);
router.put("/update", auth3(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN, UserRoles.INSTITUTE, UserRoles.MODERATOR, UserRoles.MENTOR), uploadProfilePhoto, validateRequest(updateUserZodSchema), userController.updateUserData);
router.get("/student/stats", auth3(UserRoles.STUDENT), userController.getStudentStats);
router.get("/admin/analytics", auth3(UserRoles.ADMIN), userController.getAdminAnalytics);
router.get("/list", auth3(UserRoles.ADMIN, UserRoles.MODERATOR), userController.listUsers);
router.put("/ban/:userId", auth3(UserRoles.ADMIN, UserRoles.MODERATOR), userController.updateUserStatus);
router.post("/moderator/invite", auth3(UserRoles.ADMIN), validateRequest(inviteModeratorZodSchema), userController.inviteModerator);
var userRouter = router;

// src/modules/tutor/tutor.router.ts
import { Router as Router2 } from "express";

// src/modules/tutor/tutor.service.ts
var getAllTutors = async ({ search, hourlyRate, categoryId, isFeatured, avgRating, totalReviews, subjectId, page, limit, sortBy, skip, sortOrder }) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (subjectId) {
    andConditions.push({
      subjects: {
        some: {
          subjectId
        }
      }
    });
  }
  if (hourlyRate) {
    andConditions.push({
      hourlyRate: {
        lte: hourlyRate
      }
    });
  }
  if (categoryId) {
    andConditions.push({
      categoryId
    });
  }
  if (isFeatured !== null) {
    andConditions.push({
      isFeatured
    });
  }
  if (avgRating) {
    andConditions.push({
      avgRating: {
        gte: avgRating
      }
    });
  }
  if (totalReviews) {
    andConditions.push({
      totalReviews: {
        gte: totalReviews
      }
    });
  }
  andConditions.push({
    user: {
      status: UserStatus.ACTIVE
    }
  });
  const result = await prisma.tutorProfiles.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      user: true,
      availability: true,
      category: true,
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });
  const total = await prisma.tutorProfiles.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getTutorById = async (tutorId) => {
  const tutor = await prisma.tutorProfiles.findUnique({
    where: {
      id: tutorId
    },
    include: {
      user: true,
      category: true,
      availability: true,
      reviews: {
        include: {
          student: true
        }
      },
      subjects: {
        include: {
          subject: true
        }
      }
    }
  });
  if (!tutor) return null;
  const relatedTutors = tutor.categoryId ? await prisma.tutorProfiles.findMany({
    where: {
      categoryId: tutor.categoryId,
      id: { not: tutorId },
      user: { status: "ACTIVE" }
    },
    take: 4,
    include: {
      user: true,
      category: true,
      availability: true,
      _count: { select: { reviews: true } }
    },
    orderBy: { avgRating: "desc" }
  }) : [];
  return { ...tutor, relatedTutors };
};
var updateTutor = async (data, user) => {
  if (user.role !== UserRoles.ADMIN) {
    delete data.isFeatured;
    delete data.avgRating;
    delete data.totalReviews;
  }
  return await prisma.tutorProfiles.update({
    where: {
      userId: user.id
    },
    data
  });
};
var updateTutorSubjects = async (subjectIds, user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id
    }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  if (!tutorProfile.categoryId) {
    throw new Error("Tutor profile category not found");
  }
  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds }
    },
    select: {
      id: true,
      categoryId: true
    }
  });
  if (subjects.length !== subjectIds.length) {
    throw new Error("One or more subjects are invalid");
  }
  const invalidSubject = subjects.find(
    (s) => s.categoryId !== tutorProfile.categoryId
  );
  if (invalidSubject) {
    throw new Error("You selected a subject outside your category");
  }
  return await prisma.$transaction(async (tx) => {
    await tx.tutorSubject.deleteMany({
      where: {
        tutorId: tutorProfile.id
      }
    });
    const data = subjectIds.map((subjectId) => ({ tutorId: tutorProfile.id, subjectId }));
    return await tx.tutorSubject.createManyAndReturn({
      data
    });
  });
};
var deleteTutorSubject = async (subjectId, user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: { userId: user.id }
  });
  if (!tutorProfile) {
    throw new Error("Tutor not found");
  }
  return await prisma.tutorSubject.delete({
    where: {
      tutorId_subjectId: {
        tutorId: tutorProfile.id,
        subjectId
      }
    }
  });
};
var featureTutor = async (isFeatured, tutorId) => {
  return await prisma.tutorProfiles.update({
    where: {
      id: tutorId
    },
    data: {
      isFeatured
    }
  });
};
var getTutorDashboardOverview = async (user) => {
  const tutorProfile = await prisma.tutorProfiles.findUnique({
    where: {
      userId: user.id
    },
    select: {
      id: true,
      bio: true,
      hourlyRate: true,
      avgRating: true,
      totalReviews: true,
      isFeatured: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      subjects: {
        select: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return await prisma.$transaction(async (tx) => {
    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      upcomingBookings,
      totalEarnings,
      recentReviews,
      availabilities
    ] = await Promise.all([
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id
        }
      }),
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED"
        }
      }),
      tx.booking.count({
        where: {
          tutorId: tutorProfile.id,
          status: "CANCELLED"
        }
      }),
      tx.booking.findMany({
        where: {
          tutorId: tutorProfile.id,
          status: { in: ["CONFIRMED", "PENDING"] }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          price: true,
          status: true,
          createdAt: true,
          completedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          availability: {
            select: {
              day: true,
              startTime: true,
              endTime: true
            }
          }
        }
      }),
      tx.booking.aggregate({
        where: {
          tutorId: tutorProfile.id,
          status: "COMPLETED"
        },
        _sum: {
          price: true
        }
      }),
      tx.review.findMany({
        where: {
          tutorId: tutorProfile.id
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }),
      tx.availability.findMany({
        where: {
          tutorId: tutorProfile.id
        },
        orderBy: {
          day: "asc"
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          status: true
        }
      })
    ]);
    const activeAvailabilities = availabilities.filter((a) => a.status === AvailabilityStatus.AVAILABLE);
    return {
      profile: {
        bio: tutorProfile.bio,
        hourlyRate: tutorProfile.hourlyRate,
        avgRating: tutorProfile.avgRating,
        totalReviews: tutorProfile.totalReviews,
        isFeatured: tutorProfile.isFeatured,
        category: tutorProfile.category,
        subjects: tutorProfile.subjects.map((tutorSubejct) => tutorSubejct.subject)
      },
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        upcomingCount: upcomingBookings.length,
        totalEarnings: totalEarnings._sum.price ?? 0
      },
      upcomingBookings,
      recentReviews,
      availability: {
        total: availabilities.length,
        activeSlots: activeAvailabilities.length,
        slots: availabilities
      }
    };
  });
};
var tutorService = { getAllTutors, getTutorById, updateTutor, updateTutorSubjects, deleteTutorSubject, featureTutor, getTutorDashboardOverview };

// src/modules/tutor/tutor.controller.ts
var getAllTutors2 = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search ? req.query.search : null,
      hourlyRate: req.query.hourlyRate ? Number(req.query.hourlyRate) : null,
      categoryId: req.query.categoryId ? req.query.categoryId : null,
      isFeatured: req.query.isFeatured ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : null : null,
      avgRating: req.query.avgRating ? Number(req.query.avgRating) : null,
      totalReviews: req.query.totalReviews ? Number(req.query.totalReviews) : null,
      subjectId: req.query.subjectId ? req.query.subjectId : null
    };
    const paginations = paginationHelper_default(req.query);
    const result = await tutorService.getAllTutors({ ...filters, ...paginations });
    if (result.data.length < 1) {
      return res.status(200).json({ success: true, message: "No tutors found", data: [] });
    }
    return res.status(200).json({ success: true, message: "Tutors data retrieved successfully", data: result.data, pagination: result.pagination });
  } catch (e) {
    next(e);
  }
};
var getTutorById2 = async (req, res, next) => {
  try {
    const result = await tutorService.getTutorById(req.params.tutorId);
    if (result === null) {
      return res.status(400).json({ success: false, message: "Tutor not found", data: null });
    }
    return res.status(200).json({ success: true, message: "Tutors data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateTutor2 = async (req, res, next) => {
  try {
    const result = await tutorService.updateTutor(req.body, req.user);
    return res.status(200).json({ success: true, message: "Tutors data updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateTutorSubjects2 = async (req, res, next) => {
  try {
    const { subjectIds } = req.body;
    if (!Array.isArray(subjectIds) || subjectIds.length === 0 || !subjectIds.every((id) => typeof id === "string")) {
      return res.status(400).json({
        success: false,
        message: "Invalid format. Expected: subjectIds: ['id1', 'id2']"
      });
    }
    const result = await tutorService.updateTutorSubjects(subjectIds, req.user);
    return res.status(200).json({ success: true, message: "Subjects updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteTutorSubject2 = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId || typeof subjectId !== "string") {
      return res.status(400).json({
        success: false,
        message: "subjectId is required"
      });
    }
    const result = await tutorService.deleteTutorSubject(subjectId, req.user);
    return res.status(200).json({ success: true, message: "Subject deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var featureTutor2 = async (req, res, next) => {
  try {
    if (Object.keys(req.body).some((key) => key !== "isFeatured")) {
      return res.status(400).json({
        success: false,
        message: "Invalid field input. Only isFeatured is allowed."
      });
    }
    const result = await tutorService.featureTutor(req.body.isFeatured, req.params.tutorId);
    return res.status(200).json({ success: true, message: "Tutor featured status updated", data: result });
  } catch (e) {
    next(e);
  }
};
var getTutorDashboardOverview2 = async (req, res, next) => {
  try {
    const result = await tutorService.getTutorDashboardOverview(req.user);
    return res.status(200).json({ success: true, message: "Retrieved tutors overview successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var tutorController = { getAllTutors: getAllTutors2, getTutorById: getTutorById2, updateTutor: updateTutor2, updateTutorSubjects: updateTutorSubjects2, deleteTutorSubject: deleteTutorSubject2, featureTutor: featureTutor2, getTutorDashboardOverview: getTutorDashboardOverview2 };

// src/modules/tutor/tutor.router.ts
var router2 = Router2();
router2.get("/", tutorController.getAllTutors);
router2.get("/overview", auth3(UserRoles.TUTOR), tutorController.getTutorDashboardOverview);
router2.get("/:tutorId", tutorController.getTutorById);
router2.put("/update", auth3(UserRoles.TUTOR), uploadProfilePhoto, tutorController.updateTutor);
router2.put("/subjects", auth3(UserRoles.TUTOR), tutorController.updateTutorSubjects);
router2.put("/feature/:tutorId", auth3(UserRoles.ADMIN), tutorController.featureTutor);
router2.delete("/subjects/:subjectId", auth3(UserRoles.TUTOR), tutorController.deleteTutorSubject);
var tutorRouter = router2;

// src/middlewares/globalErrorHandler.ts
import status5 from "http-status";
import { z as z3 } from "zod";

// src/errorHelpers/handlePrismaErrors.ts
import status3 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") return status3.CONFLICT;
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) return status3.NOT_FOUND;
  if (["P1000", "P6002"].includes(errorCode)) return status3.UNAUTHORIZED;
  if (["P1010", "P6010"].includes(errorCode)) return status3.FORBIDDEN;
  if (errorCode === "P6003") return status3.PAYMENT_REQUIRED;
  if (["P1008", "P2004", "P6004"].includes(errorCode)) return status3.GATEWAY_TIMEOUT;
  if (errorCode === "P5011") return status3.TOO_MANY_REQUESTS;
  if (errorCode === "P6009") return 413;
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) return status3.SERVICE_UNAVAILABLE;
  if (errorCode.startsWith("P2")) return status3.BAD_REQUEST;
  return status3.INTERNAL_SERVER_ERROR;
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const meta = error.meta;
  const modelName = meta?.modelName;
  const cause = meta?.cause;
  const target = meta?.target;
  let message;
  let errorPath = error.code;
  switch (error.code) {
    case "P2025":
      message = modelName ? `${modelName} record not found` : cause || "The requested record was not found";
      break;
    case "P2002": {
      const fields = Array.isArray(target) ? target.join(", ") : target ?? "field";
      message = `A record with this ${fields} already exists`;
      errorPath = String(fields);
      break;
    }
    case "P2003": {
      const field = meta?.field_name;
      message = field ? `Foreign key constraint failed on field: ${field}` : "Foreign key constraint failed";
      errorPath = field ?? error.code;
      break;
    }
    default:
      message = error.message.replace(/Invalid `.*?` invocation:?\s*/i, "").split("\n")[0] || "A database error occurred";
  }
  return {
    success: false,
    statusCode,
    message,
    errorSources: [{ path: errorPath, message }]
  };
};
var handlePrismaClientValidationError = (error) => {
  return {
    success: false,
    statusCode: status3.BAD_REQUEST,
    message: "Database validation failed",
    errorSources: [{ path: "database", message: error.message.split("\n")[0] || "Check your data" }]
  };
};

// src/errorHelpers/handleZodError.ts
import status4 from "http-status";
var handleZodError = (err) => {
  const statusCode = status4.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = err.issues.map((issue) => {
    return {
      path: issue.path.join(" => "),
      message: issue.message
    };
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/utils/deleteUploadedFiles.ts
var deleteUploadedFilesFromGlobalErrorHandler = async (req) => {
  try {
    const filesToDelete = [];
    if (req.file && req.file?.path) {
      filesToDelete.push(req.file.path);
    } else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
      Object.values(req.files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file.path) {
              filesToDelete.push(file.path);
            }
          });
        }
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          filesToDelete.push(file.path);
        }
      });
    }
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((url) => deleteFileFromCloudinary(url))
      );
      console.log(`
Deleted ${filesToDelete.length} uploaded file(s) from Cloudinary due to an error during request processing.
`);
    }
  } catch (error) {
    console.error("Error deleting uploaded files from Global Error Handler", error);
  }
};

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  await deleteUploadedFilesFromGlobalErrorHandler(req);
  let errorSources = [];
  let statusCode = status5.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z3.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status5.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? stack : void 0,
    statusCode
  };
  res.status(statusCode).json(errorResponse);
};

// src/middlewares/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    message: "Route not  found"
  });
};

// src/modules/category/category.router.ts
import { Router as Router3 } from "express";

// src/modules/category/category.service.ts
var createCategory = async (data) => {
  return await prisma.category.create({
    data
  });
};
var createSubject = async (data) => {
  return await prisma.subject.create({
    data
  });
};
var getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      subjects: true
    }
  });
};
var updateCategory = async (data, categoryId) => {
  return await prisma.category.update({
    where: {
      id: categoryId
    },
    data
  });
};
var updateSubject = async (data, subjectId) => {
  return await prisma.subject.update({
    where: {
      id: subjectId
    },
    data
  });
};
var deleteCategory = async (categoryId) => {
  return await prisma.category.delete({
    where: {
      id: categoryId
    }
  });
};
var deleteSubject = async (subjectId) => {
  return await prisma.subject.delete({
    where: {
      id: subjectId
    }
  });
};
var categoryService = { getAllCategories, createCategory, createSubject, updateCategory, updateSubject, deleteCategory, deleteSubject };

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(req.body);
    return res.status(201).json({ success: true, message: "Category created successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var createSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.createSubject(req.body);
    return res.status(201).json({ success: true, message: "Subject created successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getAllCategories2 = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories();
    if (result.length < 1) {
      return res.status(200).json({ success: true, message: "No categories found", data: [] });
    }
    return res.status(200).json({ success: true, message: "Categories data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.updateCategory(req.body, req.params.categoryId);
    return res.status(200).json({ success: true, message: "Category updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.updateSubject(req.body, req.params.subjectId);
    return res.status(200).json({ success: true, message: "Subject updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.categoryId);
    return res.status(200).json({ success: true, message: "Category deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteSubject2 = async (req, res, next) => {
  try {
    const result = await categoryService.deleteSubject(req.params.subjectId);
    return res.status(200).json({ success: true, message: "Subject deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var categoryController = { getAllCategories: getAllCategories2, createCategory: createCategory2, createSubject: createSubject2, updateCategory: updateCategory2, updateSubject: updateSubject2, deleteCategory: deleteCategory2, deleteSubject: deleteSubject2 };

// src/modules/category/category.router.ts
var router3 = Router3();
router3.get("/", categoryController.getAllCategories);
router3.post("/create", auth3(UserRoles.ADMIN), categoryController.createCategory);
router3.post("/subject/create", auth3(UserRoles.ADMIN), categoryController.createSubject);
router3.put("/update/:categoryId", auth3(UserRoles.ADMIN), categoryController.updateCategory);
router3.put("/update/subject/:subjectId", auth3(UserRoles.ADMIN), categoryController.updateSubject);
router3.delete("/delete/:categoryId", auth3(UserRoles.ADMIN), categoryController.deleteCategory);
router3.delete("/delete/subject/:subjectId", auth3(UserRoles.ADMIN), categoryController.deleteSubject);
var categoryRouter = router3;

// src/modules/availability/availability.router.ts
import Router4 from "express";

// src/modules/availability/availability.service.ts
var createAvailability = async (data, tutorId) => {
  const { day, startTime, endTime } = data;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Time must be in HH:mm format");
  }
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
  const conflict = await prisma.availability.findFirst({
    where: {
      tutorId,
      day,
      status: "AVAILABLE",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  if (conflict) {
    throw new Error("This time slot overlaps with existing availability");
  }
  return prisma.availability.create({
    data: {
      tutorId,
      day,
      startTime,
      endTime
    }
  });
};
var getAllAvailabilities = async (tutorId) => {
  return await prisma.availability.findMany({
    where: {
      tutorId
    }
  });
};
var updateAvailability = async (data, tutorId, availabilityId) => {
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId, tutorId }
  });
  if (!existing) {
    throw new Error("Availability not found");
  }
  if (existing.tutorId !== tutorId) {
    throw new Error("Not authorized to update this availability");
  }
  if (existing.status === "BOOKED") {
    throw new Error("Cannot modify a booked availability");
  }
  const day = data.day ?? existing.day;
  const startTime = data.startTime ?? existing.startTime;
  const endTime = data.endTime ?? existing.endTime;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Time must be in HH:mm format");
  }
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
  const conflict = await prisma.availability.findFirst({
    where: {
      tutorId,
      day,
      status: AvailabilityStatus.AVAILABLE,
      NOT: { id: availabilityId },
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  if (conflict) {
    throw new Error("This time slot overlaps with existing availability");
  }
  return prisma.availability.update({
    where: { id: availabilityId },
    data: {
      day,
      startTime,
      endTime
    }
  });
};
var deleteAvailability = async (availabilityId, tutorId) => {
  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId }
  });
  if (!existing) {
    throw new Error("Availability not found");
  }
  if (existing.tutorId !== tutorId) {
    throw new Error("Not authorized to delete this availability");
  }
  if (existing.status === AvailabilityStatus.BOOKED) {
    throw new Error("Cannot delete a booked availability");
  }
  return prisma.availability.delete({
    where: { id: availabilityId }
  });
};
var availabilityService = { getAllAvailabilities, createAvailability, updateAvailability, deleteAvailability };

// src/modules/availability/availability.controller.ts
var createAvailability2 = async (req, res, next) => {
  try {
    const result = await availabilityService.createAvailability(req.body, req.tutorId);
    return res.json({ success: true, message: "Tutor availability slot created successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getAllAvailabilities2 = async (req, res, next) => {
  try {
    const result = await availabilityService.getAllAvailabilities(req.tutorId);
    return res.json({ success: true, message: "Tutor availability data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateAvailability2 = async (req, res, next) => {
  try {
    const data = req.body;
    const tutorId = req.tutorId;
    const availabilityId = req.params.availabilityId;
    const result = await availabilityService.updateAvailability(data, tutorId, availabilityId);
    return res.json({ success: true, message: "Tutor availability slot updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var deleteAvailability2 = async (req, res, next) => {
  try {
    const tutorId = req.tutorId;
    const availabilityId = req.params.availabilityId;
    const result = await availabilityService.deleteAvailability(availabilityId, tutorId);
    return res.json({ success: true, message: "Tutor availability slot deleted successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var availabilityController = { getAllAvailabilities: getAllAvailabilities2, createAvailability: createAvailability2, updateAvailability: updateAvailability2, deleteAvailability: deleteAvailability2 };

// src/modules/availability/availability.router.ts
var router4 = Router4();
router4.get("/", auth3(UserRoles.TUTOR), availabilityController.getAllAvailabilities);
router4.post("/create", auth3(UserRoles.TUTOR), availabilityController.createAvailability);
router4.put("/update/:availabilityId", auth3(UserRoles.TUTOR), availabilityController.updateAvailability);
router4.delete("/delete/:availabilityId", auth3(UserRoles.TUTOR), availabilityController.deleteAvailability);
var availabilityRouter = router4;

// src/modules/booking/booking.router.ts
import { Router as Router5 } from "express";

// src/modules/booking/booking.service.ts
var getAllBookings = async (user, tutorId) => {
  if (user.role === UserRoles.STUDENT) {
    return await prisma.booking.findMany({
      where: {
        studentId: user.id
      },
      include: {
        tutor: {
          include: {
            user: true
          }
        },
        availability: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.TUTOR) {
    return await prisma.booking.findMany({
      where: {
        tutorId
      },
      include: {
        student: true,
        availability: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.ADMIN) {
    return prisma.booking.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        availability: true,
        tutor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  throw new Error("Unauthorized");
};
var getBookingById = async (user, tutorId, bookingId) => {
  if (user.role === UserRoles.STUDENT) {
    return await prisma.booking.findFirst({
      where: {
        studentId: user.id,
        id: bookingId
      },
      include: {
        student: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  if (user.role === UserRoles.TUTOR) {
    return await prisma.booking.findFirst({
      where: {
        tutorId,
        id: bookingId
      },
      include: {
        student: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  if (user.role === UserRoles.ADMIN) {
    return await prisma.booking.findFirst({
      where: {
        id: bookingId
      },
      include: {
        student: true,
        tutor: {
          include: {
            user: true
          }
        },
        subject: true,
        availability: true,
        review: true
      }
    });
  }
  throw new Error("Unauthorized");
};
var createBooking = async (data, studentId) => {
  const { tutorId, availabilityId, subjectId } = data;
  if (!availabilityId || !tutorId || !subjectId) {
    throw new Error("Availability ID, Tutor ID, and Subject ID are required");
  }
  const tutorInfo = await prisma.$transaction(async (tx) => {
    const availability = await tx.availability.findUniqueOrThrow({
      where: {
        id: availabilityId,
        tutorId
      }
    });
    const tutor = await tx.tutorProfiles.findUniqueOrThrow({
      where: {
        id: tutorId
      }
    });
    return { ...tutor, availability };
  });
  if (tutorInfo.availability.status === AvailabilityStatus.BOOKED) {
    throw new Error("This availability is already booked");
  }
  const { startTime, endTime } = tutorInfo.availability;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const duration = (end - start) / 60;
  const price = tutorInfo.hourlyRate * duration;
  return prisma.$transaction(async (tx) => {
    return await tx.booking.create({
      data: {
        studentId,
        tutorId,
        availabilityId,
        price,
        subjectId,
        status: BookingStatus.PENDING
      }
    });
  });
};
var updateBookingStatus = async (bookingId, status8, user, tutorId) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId }
  });
  if (user.role === UserRoles.STUDENT) {
    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error("You can't change a completed booking");
    }
    if (status8 !== BookingStatus.CANCELLED) {
      throw new Error("Students can only cancel their bookings");
    }
    if (booking.studentId !== user.id) {
      throw new Error("Not authorized to cancel this booking");
    }
  }
  if (tutorId) {
    if (user.role === UserRoles.TUTOR) {
      if (booking.status === BookingStatus.CANCELLED) {
        throw new Error("You can't change a cancelled booking");
      }
      if (status8 !== BookingStatus.COMPLETED) {
        throw new Error("Tutors can only complete bookings");
      }
      if (booking.tutorId !== tutorId) {
        throw new Error("Not authorized to complete this booking");
      }
    }
  }
  return await prisma.$transaction(async (tx) => {
    await tx.availability.update({
      where: {
        id: booking.availabilityId
      },
      data: {
        status: AvailabilityStatus.AVAILABLE
      }
    });
    return await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: status8,
        completedAt: status8 === BookingStatus.COMPLETED ? /* @__PURE__ */ new Date() : null
      }
    });
  });
};
var bookingService = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus
};

// src/modules/booking/booking.controller.ts
var getAllBookings2 = async (req, res, next) => {
  try {
    const result = await bookingService.getAllBookings(req.user, req.tutorId);
    return res.json({ success: true, message: "Bookings data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var getBookingById2 = async (req, res, next) => {
  try {
    const result = await bookingService.getBookingById(req.user, req.tutorId, req.params.bookingId);
    return res.json({ success: true, message: "Booking data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var createBooking2 = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const result = await bookingService.createBooking(data, studentId);
    return res.json({ success: true, message: "Booking created successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateBookingStatus2 = async (req, res, next) => {
  try {
    const { status: status8 } = req.body;
    if (!status8) {
      return res.json({ success: false, message: "Invalid input" });
    }
    if (!Object.values(BookingStatus).includes(status8)) {
      return res.status(400).json({ success: false, message: "Invalid status type" });
    }
    const tutorId = req.user?.role === UserRoles.TUTOR ? req.tutorId : null;
    const bookingId = req.params.bookingId;
    const result = await bookingService.updateBookingStatus(bookingId, status8, req.user, tutorId);
    return res.json({ success: true, message: "Booking status updated", data: result });
  } catch (e) {
    next(e);
  }
};
var bookingController = { createBooking: createBooking2, updateBookingStatus: updateBookingStatus2, getAllBookings: getAllBookings2, getBookingById: getBookingById2 };

// src/modules/booking/booking.router.ts
var router5 = Router5();
router5.get("/", auth3(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN), bookingController.getAllBookings);
router5.get("/:bookingId", auth3(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN), bookingController.getBookingById);
router5.post("/create", auth3(UserRoles.STUDENT), bookingController.createBooking);
router5.put("/update/:bookingId", auth3(UserRoles.STUDENT, UserRoles.TUTOR, UserRoles.ADMIN), bookingController.updateBookingStatus);
var bookingRouter = router5;

// src/modules/review/review.router.ts
import { Router as Router6 } from "express";

// src/modules/review/review.service.ts
var createReview = async (data, studentId) => {
  const { bookingId, rating, review } = data;
  if (!bookingId) {
    throw new Error("Booking ID is required");
  }
  if (!review || review.trim().length === 0) {
    throw new Error("Review cannot be empty");
  }
  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    throw new Error("Rating must be a number");
  }
  if (numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5.0");
  }
  const roundedRating = Number(numericRating.toFixed(1));
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: {
        id: true,
        studentId: true,
        tutorId: true,
        status: true
      }
    });
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new Error("Booking must be completed to leave a review");
    }
    if (booking.studentId !== studentId) {
      throw new Error("Not authorized to leave a review for this booking");
    }
    const existingReview = await tx.review.findUnique({
      where: { bookingId }
    });
    if (existingReview) {
      throw new Error("Review already exists for this booking");
    }
    const tutorReviews = await tx.review.findMany({
      where: { tutorId: booking.tutorId },
      select: { rating: true }
    });
    const totalOld = tutorReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const newAverage = Number(((totalOld + roundedRating) / (tutorReviews.length + 1)).toFixed(1));
    await tx.tutorProfiles.update({
      where: { id: booking.tutorId },
      data: {
        totalReviews: tutorReviews.length + 1,
        avgRating: newAverage
      }
    });
    return await tx.review.create({
      data: {
        bookingId: booking.id,
        studentId,
        tutorId: booking.tutorId,
        rating: roundedRating,
        review: review.trim()
      }
    });
  });
};
var updateReview = async (reviewId, data, studentId) => {
  const { rating, review } = data;
  if (!review || review.trim().length === 0) {
    throw new Error("Review cannot be empty");
  }
  const numericRating = Number(rating);
  if (isNaN(numericRating)) {
    throw new Error("Rating must be a number");
  }
  if (numericRating < 1 || numericRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  const roundedRating = Number(numericRating.toFixed(1));
  return await prisma.$transaction(async (tx) => {
    const existingReview = await tx.review.findUniqueOrThrow({
      where: { id: reviewId },
      select: {
        id: true,
        studentId: true,
        tutorId: true,
        rating: true
      }
    });
    if (existingReview.studentId !== studentId) {
      throw new Error("You can only edit your own review");
    }
    const tutor = await tx.tutorProfiles.findUniqueOrThrow({
      where: { id: existingReview.tutorId },
      select: {
        avgRating: true,
        totalReviews: true
      }
    });
    const totalOld = Number(tutor.avgRating) * tutor.totalReviews;
    const newAverage = Number(
      ((totalOld - Number(existingReview.rating) + roundedRating) / tutor.totalReviews).toFixed(1)
    );
    await tx.tutorProfiles.update({
      where: { id: existingReview.tutorId },
      data: {
        avgRating: newAverage
      }
    });
    return await tx.review.update({
      where: { id: reviewId },
      data: {
        rating: roundedRating,
        review: review.trim()
      }
    });
  });
};
var getAllReviews = async (user, tutorId) => {
  if (user.role === UserRoles.STUDENT) {
    return await prisma.review.findMany({
      where: {
        studentId: user.id
      },
      include: {
        student: true,
        tutor: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.TUTOR) {
    return await prisma.review.findMany({
      where: {
        tutorId
      },
      include: {
        student: true,
        tutor: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  if (user.role === UserRoles.ADMIN) {
    return prisma.review.findMany({
      include: {
        student: true,
        tutor: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  throw new Error("Unauthorized");
};
var reviewService = { createReview, updateReview, getAllReviews };

// src/modules/review/review.controller.ts
var getAllReviews2 = async (req, res, next) => {
  try {
    const result = await reviewService.getAllReviews(req.user, req.tutorId);
    return res.json({ success: true, message: "Reviews data retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var createReview2 = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const result = await reviewService.createReview(data, studentId);
    return res.json({ success: true, message: "Review added successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateReview2 = async (req, res, next) => {
  try {
    const data = req.body;
    const studentId = req.user?.id;
    const reviewId = req.params.reviewId;
    const result = await reviewService.updateReview(reviewId, data, studentId);
    return res.json({ success: true, message: "Review updated successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var reviewController = { createReview: createReview2, updateReview: updateReview2, getAllReviews: getAllReviews2 };

// src/modules/review/review.router.ts
var router6 = Router6();
router6.get("/", auth3(UserRoles.STUDENT, UserRoles.TUTOR), reviewController.getAllReviews);
router6.post("/create", auth3(UserRoles.STUDENT), reviewController.createReview);
router6.put("/update/:reviewId", auth3(UserRoles.STUDENT), reviewController.updateReview);
var reviewRouter = router6;

// src/modules/payment/payment.router.ts
import { Router as Router7 } from "express";
import express from "express";

// src/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/modules/payment/payment.service.ts
import "stripe";
var handleStripeWebhookEvent = async (event) => {
  const existingEvent = await prisma.payment.findFirst({
    where: {
      metadata: {
        path: ["stripeEventId"],
        equals: event.id
      }
    }
  });
  if (existingEvent) {
    console.log(`Event ${event.id} already processed. Skipping.`);
    return { message: `Event ${event.id} already processed.` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      const type = session.metadata?.type;
      if (!paymentId || !type) {
        console.error("\u26A0\uFE0F Missing metadata in webhook event");
        return { message: "Missing metadata" };
      }
      const paymentData = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          student: { select: { name: true, email: true } },
          booking: {
            include: { tutor: { include: { user: { select: { name: true } } } } }
          },
          courseEnrollment: {
            include: { course: { select: { title: true } } }
          }
        }
      });
      if (!paymentData) {
        console.error(`\u26A0\uFE0F Payment ${paymentId} not found.`);
        return { message: "Payment not found" };
      }
      if (paymentData.status === PaymentStatus.COMPLETED) {
        console.log(`Payment ${paymentId} already marked as COMPLETED. Skipping.`);
        return { message: "Payment already completed" };
      }
      await prisma.$transaction(async (tx) => {
        const status8 = session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: status8,
            transactionId: session.payment_intent || null,
            gatewayRef: session.id,
            metadata: {
              stripeEventId: event.id,
              sessionData: JSON.parse(JSON.stringify(session))
            }
          }
        });
        if (status8 === PaymentStatus.COMPLETED) {
          if (type === "course" && paymentData.courseEnrollmentId) {
            await tx.courseEnrollment.update({
              where: { id: paymentData.courseEnrollmentId },
              data: { status: "ACTIVE" }
            });
          } else if (type === "booking" && paymentData.bookingId) {
            await tx.booking.update({
              where: { id: paymentData.bookingId },
              data: { status: "CONFIRMED" }
            });
            if (paymentData.booking?.availabilityId) {
              await tx.availability.update({
                where: { id: paymentData.booking.availabilityId },
                data: { status: "BOOKED" }
              });
            }
          }
        }
      });
      if (session.payment_status === "paid") {
        try {
          const itemTitle = type === "course" ? paymentData.courseEnrollment?.course.title ?? "Course" : `Session with ${paymentData.booking?.tutor.user.name ?? "Tutor"}`;
          const itemSubtitle = type === "course" ? "Course Enrollment" : "1-on-1 Tutoring Session";
          await sendEmail({
            to: paymentData.student.email,
            subject: `Payment Confirmed - ${itemTitle} \xB7 SkillBridge`,
            templateName: "invoice",
            templateData: {
              payeeName: paymentData.student.name,
              invoiceId: paymentId,
              transactionId: session.payment_intent ?? "",
              gatewayRef: session.id,
              paymentDate: (/* @__PURE__ */ new Date()).toLocaleDateString(),
              itemTitle,
              itemSubtitle,
              type,
              amount: paymentData.amount,
              currency: paymentData.currency,
              invoiceUrl: null
            }
          });
          console.log(`\u2705 Invoice email sent to ${paymentData.student.email}`);
        } catch (emailError) {
          console.error("\u274C Failed to send invoice email:", emailError);
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { booking: true }
        });
        if (payment) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: PaymentStatus.FAILED,
                gatewayRef: session.id,
                metadata: {
                  stripeEventId: event.id,
                  sessionData: JSON.parse(JSON.stringify(session))
                }
              }
            });
          });
        }
      }
      console.log(`Checkout session ${session.id} expired.`);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.log(`Payment intent ${intent.id} failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  return { message: `Webhook event ${event.id} processed successfully` };
};
var createBookingCheckoutSession = async (bookingId, user) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutor: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true } }
    }
  });
  if (!booking || booking.studentId !== user.id) {
    throw new Error("Booking not found or access denied.");
  }
  let payment = await prisma.payment.findUnique({
    where: { bookingId: booking.id }
  });
  if (payment) {
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new Error("This booking has already been paid.");
    }
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PENDING }
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        studentId: user.id,
        bookingId: booking.id,
        amount: booking.price,
        currency: "USD",
        status: PaymentStatus.PENDING
      }
    });
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    expires_at: Math.floor(Date.now() / 1e3) + 35 * 60,
    // Expire in 35 minutes
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tutoring Session: ${booking.subject?.name ?? "Session"}`,
            description: `1-on-1 session with ${booking.tutor.user.name}`
          },
          unit_amount: Math.round(booking.price * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      paymentId: payment.id,
      bookingId: booking.id,
      type: "booking"
    },
    success_url: `${envVars.APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.APP_URL}/dashboard/bookings?error=payment_cancelled`
  });
  return { paymentUrl: session.url };
};
var createCourseCheckoutSession = async (courseId, user) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isPublished: true }
  });
  if (!course) throw new Error("Course not found.");
  let enrollment = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId: user.id, courseId } }
  });
  if (enrollment) {
    if (enrollment.status === "ACTIVE") {
      throw new Error("You are already enrolled in this course.");
    }
  } else {
    enrollment = await prisma.courseEnrollment.create({
      data: { studentId: user.id, courseId, status: "PENDING" }
    });
  }
  let payment = await prisma.payment.findUnique({
    where: { courseEnrollmentId: enrollment.id }
  });
  if (payment) {
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new Error("This course enrollment has already been paid.");
    }
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PENDING }
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        studentId: user.id,
        courseEnrollmentId: enrollment.id,
        amount: course.price,
        currency: "USD",
        status: PaymentStatus.PENDING
      }
    });
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    expires_at: Math.floor(Date.now() / 1e3) + 35 * 60,
    // Expire in 35 minutes
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Course: ${course.title}`,
            description: course.description.substring(0, 100)
          },
          unit_amount: Math.round(course.price * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      paymentId: payment.id,
      enrollmentId: enrollment.id,
      courseId: course.id,
      type: "course"
    },
    success_url: `${envVars.APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.APP_URL}/courses/${courseId}?error=payment_cancelled`
  });
  return { paymentUrl: session.url };
};
var getMyPayments = async (userId) => {
  return prisma.payment.findMany({
    where: { studentId: userId },
    include: {
      booking: {
        include: {
          tutor: { include: { user: { select: { name: true, image: true } } } },
          subject: { select: { name: true } }
        }
      },
      courseEnrollment: {
        include: {
          course: { select: { title: true, thumbnailUrl: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getTutorPayments = async (userId) => {
  return prisma.payment.findMany({
    where: {
      booking: {
        tutor: { userId }
      },
      status: PaymentStatus.COMPLETED
    },
    include: {
      student: { select: { name: true, image: true, email: true } },
      booking: {
        include: {
          subject: { select: { name: true } },
          availability: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var verifySession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const mockEvent = {
        id: session.id + "_verify",
        type: "checkout.session.completed",
        data: { object: session }
      };
      await handleStripeWebhookEvent(mockEvent);
      return { verified: true };
    }
    return { verified: false };
  } catch (e) {
    console.error("Session verification failed", e);
    return { verified: false };
  }
};
var listAllPayments = async (query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const total = await prisma.payment.count();
  const data = await prisma.payment.findMany({
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      student: { select: { name: true, email: true, image: true } },
      booking: {
        include: {
          tutor: { include: { user: { select: { name: true } } } },
          subject: { select: { name: true } }
        }
      },
      courseEnrollment: {
        include: {
          course: { select: { title: true } }
        }
      }
    }
  });
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var paymentService = {
  handleStripeWebhookEvent,
  createBookingCheckoutSession,
  createCourseCheckoutSession,
  getMyPayments,
  getTutorPayments,
  verifySession,
  listAllPayments
};

// src/modules/payment/payment.controller.ts
var handleStripeWebhook = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ success: false, message: "Missing Stripe signature" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      envVars.STRIPE.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Webhook verification failed";
    console.error("Stripe webhook error:", msg);
    return res.status(400).json({ success: false, message: msg });
  }
  try {
    const result = await paymentService.handleStripeWebhookEvent(event);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
var createBookingPayment = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }
    const result = await paymentService.createBookingCheckoutSession(
      bookingId,
      req.user
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
var createCoursePayment = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }
    const result = await paymentService.createCourseCheckoutSession(
      courseId,
      req.user
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
var getMyPayments2 = async (req, res, next) => {
  try {
    const data = await paymentService.getMyPayments(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
var verifySession2 = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }
    const result = await paymentService.verifySession(sessionId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
var getTutorPayments2 = async (req, res, next) => {
  try {
    const data = await paymentService.getTutorPayments(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
var listAllPayments2 = async (req, res, next) => {
  try {
    const data = await paymentService.listAllPayments(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
var paymentController = {
  handleStripeWebhook,
  createBookingPayment,
  createCoursePayment,
  getMyPayments: getMyPayments2,
  getTutorPayments: getTutorPayments2,
  verifySession: verifySession2,
  listAllPayments: listAllPayments2
};

// src/modules/payment/payment.router.ts
var router7 = Router7();
router7.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);
router7.post(
  "/booking/:bookingId",
  auth3(UserRoles.STUDENT),
  paymentController.createBookingPayment
);
router7.post(
  "/course/:courseId",
  auth3(UserRoles.STUDENT),
  paymentController.createCoursePayment
);
router7.get(
  "/me",
  auth3(UserRoles.STUDENT, UserRoles.ADMIN, UserRoles.MODERATOR),
  paymentController.getMyPayments
);
router7.get(
  "/verify/:sessionId",
  auth3(UserRoles.STUDENT),
  paymentController.verifySession
);
router7.get(
  "/tutor",
  auth3(UserRoles.TUTOR),
  paymentController.getTutorPayments
);
router7.get(
  "/",
  auth3(UserRoles.ADMIN),
  paymentController.listAllPayments
);
var paymentRouter = router7;

// src/modules/institute/institute.router.ts
import { Router as Router8 } from "express";

// src/modules/institute/institute.service.ts
import crypto2 from "crypto";
var getOverview = async (instituteId) => {
  return await prisma.$transaction(async (tx) => {
    const totalMentors = await tx.mentorProfile.count({ where: { instituteId } });
    const totalCourses = await tx.course.count({ where: { instituteId } });
    const totalEnrollments = await tx.courseEnrollment.count({
      where: { course: { instituteId } }
    });
    const revenueResult = await tx.payment.aggregate({
      where: {
        status: "COMPLETED",
        courseEnrollment: { course: { instituteId } }
      },
      _sum: { amount: true }
    });
    const totalRevenue = revenueResult._sum.amount ?? 0;
    const topCourses = await tx.course.findMany({
      where: { instituteId },
      select: {
        title: true,
        level: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5
    });
    const enrollmentsByCourse = topCourses.map((c) => ({
      name: c.title.length > 22 ? c.title.slice(0, 22) + "\u2026" : c.title,
      enrollments: c._count.enrollments,
      level: c.level
    }));
    const levelGroups = await tx.course.groupBy({
      by: ["level"],
      where: { instituteId },
      _count: { _all: true }
    });
    const coursesByLevel = levelGroups.map((g) => ({
      name: g.level.charAt(0) + g.level.slice(1).toLowerCase(),
      value: g._count._all
    }));
    const publishedCount = await tx.course.count({ where: { instituteId, isPublished: true } });
    const draftCount = await tx.course.count({ where: { instituteId, isPublished: false } });
    const coursesByStatus = [
      { name: "Published", value: publishedCount },
      { name: "Draft", value: draftCount }
    ];
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const recentEnrollments = await tx.courseEnrollment.findMany({
      where: {
        course: { instituteId },
        enrolledAt: { gte: sixMonthsAgo }
      },
      select: { enrolledAt: true }
    });
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthMap[key] = 0;
    }
    for (const e of recentEnrollments) {
      const key = new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthMap[key] !== void 0) {
        monthMap[key] += 1;
      }
    }
    const enrollmentsTrend = Object.entries(monthMap).map(([month, count]) => ({
      month,
      enrollments: count
    }));
    const recentCourses = await tx.course.findMany({
      where: { instituteId },
      select: {
        id: true,
        title: true,
        level: true,
        price: true,
        isPublished: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    return {
      stats: { totalCourses, totalMentors, totalEnrollments, totalRevenue },
      enrollmentsByCourse,
      coursesByLevel,
      coursesByStatus,
      enrollmentsTrend,
      recentCourses
    };
  });
};
var listMentors = async (instituteId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const total = await prisma.mentorProfile.count({ where: { instituteId } });
  const data = await prisma.mentorProfile.findMany({
    where: { instituteId },
    include: { user: { select: { name: true, email: true, image: true, phone: true } } },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var inviteMentor = async (instituteId, email, name) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }
  const institute = await prisma.instituteProfile.findUnique({ where: { id: instituteId } });
  if (!institute) throw new Error("Institute not found");
  const token = crypto2.randomBytes(32).toString("hex");
  const identifier = `invite:mentor:${instituteId}:${email}`;
  await prisma.verification.deleteMany({
    where: { identifier }
  });
  await prisma.verification.create({
    data: {
      id: crypto2.randomUUID(),
      identifier,
      value: token,
      expiresAt: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 7)
    }
  });
  const inviteUrl = `${envVars.APP_URL}/accept-invite?token=${token}&email=${encodeURIComponent(email)}&role=${UserRoles.MENTOR}&name=${encodeURIComponent(name)}`;
  await sendEmail({
    to: email,
    subject: "You're Invited to be a Mentor",
    templateName: "mentor-invite",
    templateData: {
      mentorName: name,
      instituteName: institute.name,
      courseTitle: null,
      acceptUrl: inviteUrl
    }
  });
  return { message: "Invitation sent successfully" };
};
var updateMentorProfile = async (instituteId, mentorId, data) => {
  const mentor = await prisma.mentorProfile.findFirst({
    where: { id: mentorId, instituteId }
  });
  if (!mentor) throw new Error("Mentor not found or doesn't belong to this institute");
  return await prisma.mentorProfile.update({
    where: { id: mentorId },
    data: {
      title: data.title,
      bio: data.bio,
      expertise: data.expertise
    }
  });
};
var removeMentor = async (instituteId, mentorId) => {
  const mentor = await prisma.mentorProfile.findFirst({
    where: { id: mentorId, instituteId }
  });
  if (!mentor) throw new Error("Mentor not found or doesn't belong to this institute");
  await prisma.mentorProfile.delete({ where: { id: mentorId } });
  return { message: "Mentor removed successfully" };
};
var listStudents = async (instituteId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const where = { course: { instituteId } };
  const total = await prisma.courseEnrollment.count({ where });
  const data = await prisma.courseEnrollment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { id: true, title: true } }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var listReviews = async (instituteId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const mentors = await prisma.mentorProfile.findMany({
    where: { instituteId },
    select: { userId: true }
  });
  const mentorUserIds = mentors.map((m) => m.userId);
  const tutorProfiles = await prisma.tutorProfiles.findMany({
    where: { userId: { in: mentorUserIds } },
    select: { id: true }
  });
  const tutorProfileIds = tutorProfiles.map((t) => t.id);
  const where = { tutorId: { in: tutorProfileIds } };
  const total = await prisma.review.count({ where });
  const data = await prisma.review.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, image: true } },
      tutor: {
        include: {
          user: { select: { name: true, image: true } }
        }
      }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var listPayments = async (instituteId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const where = { courseEnrollment: { course: { instituteId } } };
  const total = await prisma.payment.count({ where });
  const data = await prisma.payment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      courseEnrollment: {
        include: {
          course: { select: { id: true, title: true } }
        }
      }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var instituteService = {
  getOverview,
  listMentors,
  inviteMentor,
  updateMentorProfile,
  removeMentor,
  listStudents,
  listReviews,
  listPayments
};

// src/modules/institute/institute.controller.ts
import status6 from "http-status";
var getInstituteId = async (userId) => {
  const profile = await prisma.instituteProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError_default(status6.NOT_FOUND, "Institute profile not found for this user");
  return profile.id;
};
var getOverview2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.getOverview(instituteId);
    return res.status(200).json({ success: true, message: "Institute overview retrieved", data: result });
  } catch (e) {
    next(e);
  }
};
var listMentors2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.listMentors(instituteId, req.query);
    return res.status(200).json({ success: true, message: "Mentors retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var inviteMentor2 = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      throw new AppError_default(status6.BAD_REQUEST, "Email and name are required");
    }
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.inviteMentor(instituteId, email, name);
    return res.status(200).json({ success: true, message: "Invitation sent successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var updateMentorProfile2 = async (req, res, next) => {
  try {
    const mentorId = req.params.mentorId;
    if (!mentorId) {
      throw new AppError_default(status6.BAD_REQUEST, "Mentor ID is required");
    }
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.updateMentorProfile(instituteId, mentorId, req.body);
    return res.status(200).json({ success: true, message: "Mentor profile updated", data: result });
  } catch (e) {
    next(e);
  }
};
var removeMentor2 = async (req, res, next) => {
  try {
    const mentorId = req.params.mentorId;
    if (!mentorId) {
      throw new AppError_default(status6.BAD_REQUEST, "Mentor ID is required");
    }
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.removeMentor(instituteId, mentorId);
    return res.status(200).json({ success: true, message: "Mentor removed", data: result });
  } catch (e) {
    next(e);
  }
};
var listInstituteStudents = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.listStudents(instituteId, req.query);
    return res.status(status6.OK).json({ success: true, message: "Students retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var listInstituteReviews = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.listReviews(instituteId, req.query);
    return res.status(status6.OK).json({ success: true, message: "Reviews retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var listInstitutePayments = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId(req.user.id);
    const result = await instituteService.listPayments(instituteId, req.query);
    return res.status(status6.OK).json({ success: true, message: "Payments retrieved successfully", data: result });
  } catch (e) {
    next(e);
  }
};
var instituteController = {
  getOverview: getOverview2,
  listMentors: listMentors2,
  inviteMentor: inviteMentor2,
  updateMentorProfile: updateMentorProfile2,
  removeMentor: removeMentor2,
  listInstituteStudents,
  listInstituteReviews,
  listInstitutePayments
};

// src/modules/institute/institute.validation.ts
import z4 from "zod";
var inviteMentorZodSchema = z4.object({
  email: z4.string().email("Must be a valid email address"),
  name: z4.string().min(2, "Name must be at least 2 characters")
});
var updateInstituteProfileZodSchema = z4.object({
  name: z4.string().min(2).optional(),
  description: z4.string().optional().nullable(),
  logoUrl: z4.string().url().optional().nullable(),
  contactEmail: z4.string().email().optional().nullable(),
  website: z4.string().url().optional().nullable(),
  establishedYear: z4.coerce.number().int().positive().optional().nullable()
});

// src/modules/institute/institute.router.ts
var router8 = Router8();
router8.get("/overview", auth3(UserRoles.INSTITUTE), instituteController.getOverview);
router8.get("/mentors", auth3(UserRoles.INSTITUTE), instituteController.listMentors);
router8.get("/students", auth3(UserRoles.INSTITUTE), instituteController.listInstituteStudents);
router8.get("/reviews", auth3(UserRoles.INSTITUTE), instituteController.listInstituteReviews);
router8.get("/payments", auth3(UserRoles.INSTITUTE), instituteController.listInstitutePayments);
router8.post("/mentors/invite", auth3(UserRoles.INSTITUTE), validateRequest(inviteMentorZodSchema), instituteController.inviteMentor);
router8.put("/mentors/update/:mentorId", auth3(UserRoles.INSTITUTE), instituteController.updateMentorProfile);
router8.delete("/mentors/delete/:mentorId", auth3(UserRoles.INSTITUTE), instituteController.removeMentor);
var instituteRouter = router8;

// src/modules/mentor/mentor.router.ts
import { Router as Router9 } from "express";

// src/modules/mentor/mentor.service.ts
var getOverview3 = async (userId) => {
  return await prisma.$transaction(async (tx) => {
    const profile = await tx.mentorProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error("Mentor profile not found");
    const mentorId = profile.id;
    const totalCourses = await tx.course.count({
      where: { mentors: { some: { id: mentorId } } }
    });
    const totalStudents = await tx.courseEnrollment.count({
      where: { course: { mentors: { some: { id: mentorId } } } }
    });
    const tutor = await tx.tutorProfiles.findUnique({
      where: { userId },
      select: { avgRating: true, totalReviews: true }
    });
    const avgRating = tutor?.avgRating ? Number(tutor.avgRating) : 0;
    const totalReviews = tutor?.totalReviews ?? 0;
    const levelGroups = await tx.course.groupBy({
      by: ["level"],
      where: { mentors: { some: { id: mentorId } } },
      _count: { _all: true }
    });
    const coursesByLevel = levelGroups.map((g) => ({
      name: g.level.charAt(0) + g.level.slice(1).toLowerCase(),
      value: g._count._all
    }));
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const recentEnrollments = await tx.courseEnrollment.findMany({
      where: {
        course: { mentors: { some: { id: mentorId } } },
        enrolledAt: { gte: sixMonthsAgo }
      },
      select: { enrolledAt: true }
    });
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthMap[key] = 0;
    }
    for (const e of recentEnrollments) {
      const key = new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthMap[key] !== void 0) monthMap[key]++;
    }
    const enrollmentsTrend = Object.entries(monthMap).map(([month, count]) => ({
      month,
      enrollments: count
    }));
    const topCourses = await tx.course.findMany({
      where: { mentors: { some: { id: mentorId } } },
      select: {
        title: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5
    });
    const recentActivity = await tx.courseEnrollment.findMany({
      where: { course: { mentors: { some: { id: mentorId } } } },
      include: {
        student: { select: { name: true, image: true } },
        course: { select: { title: true } }
      },
      orderBy: { enrolledAt: "desc" },
      take: 5
    });
    return {
      stats: { totalCourses, totalStudents, avgRating, totalReviews },
      enrollmentsTrend,
      coursesByLevel,
      topCourses: topCourses.map((c) => ({ name: c.title, enrollments: c._count.enrollments })),
      recentActivity,
      instituteId: profile.instituteId
    };
  });
};
var listAssignedCourses = async (userId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Mentor profile not found");
  const where = { mentors: { some: { id: profile.id } } };
  const total = await prisma.course.count({ where });
  const data = await prisma.course.findMany({
    where,
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true } }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var listMentorStudents = async (userId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Mentor profile not found");
  const where = { course: { mentors: { some: { id: profile.id } } } };
  const total = await prisma.courseEnrollment.count({ where });
  const data = await prisma.courseEnrollment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      course: { select: { id: true, title: true } }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};
var getMyProfile = async (userId) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, image: true } } }
  });
  if (!profile) throw new Error("Mentor profile not found");
  return profile;
};
var updateProfile = async (userId, data) => {
  return await prisma.$transaction(async (tx) => {
    if (data.name || data.avatarUrl) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...data.name && { name: data.name },
          ...data.avatarUrl && { image: data.avatarUrl }
        }
      });
    }
    return await tx.mentorProfile.update({
      where: { userId },
      data: {
        title: data.title,
        bio: data.bio,
        expertise: data.expertise,
        avatarUrl: data.avatarUrl
      }
    });
  });
};
var mentorService = {
  getOverview: getOverview3,
  listAssignedCourses,
  listMentorStudents,
  getMyProfile,
  updateProfile
};

// src/modules/mentor/mentor.controller.ts
var getOverview4 = async (req, res, next) => {
  try {
    const result = await mentorService.getOverview(req.user.id);
    res.status(200).json({ success: true, message: "Mentor overview retrieved", data: result });
  } catch (e) {
    next(e);
  }
};
var listAssignedCourses2 = async (req, res, next) => {
  try {
    const result = await mentorService.listAssignedCourses(req.user.id, req.query);
    res.status(200).json({ success: true, message: "Assigned courses retrieved", data: result });
  } catch (e) {
    next(e);
  }
};
var listMentorStudents2 = async (req, res, next) => {
  try {
    const result = await mentorService.listMentorStudents(req.user.id, req.query);
    res.status(200).json({ success: true, message: "Mentor students retrieved", data: result });
  } catch (e) {
    next(e);
  }
};
var getMyProfile2 = async (req, res, next) => {
  try {
    const result = await mentorService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, message: "Mentor profile retrieved", data: result });
  } catch (e) {
    next(e);
  }
};
var updateProfile2 = async (req, res, next) => {
  try {
    const result = await mentorService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: "Mentor profile updated", data: result });
  } catch (e) {
    next(e);
  }
};
var mentorController = { getOverview: getOverview4, listAssignedCourses: listAssignedCourses2, listMentorStudents: listMentorStudents2, getMyProfile: getMyProfile2, updateProfile: updateProfile2 };

// src/modules/mentor/mentor.validation.ts
import z5 from "zod";
var updateMentorProfileZodSchema = z5.object({
  name: z5.string().max(100).optional(),
  title: z5.string().max(100).optional().nullable(),
  bio: z5.string().max(1e3).optional().nullable(),
  expertise: z5.string().max(100).optional().nullable(),
  avatarUrl: z5.string().url().optional().nullable()
});

// src/modules/mentor/mentor.router.ts
var router9 = Router9();
router9.get("/overview", auth3(UserRoles.MENTOR), mentorController.getOverview);
router9.get("/profile", auth3(UserRoles.MENTOR), mentorController.getMyProfile);
router9.get("/courses", auth3(UserRoles.MENTOR), mentorController.listAssignedCourses);
router9.get("/students", auth3(UserRoles.MENTOR), mentorController.listMentorStudents);
router9.put("/update", auth3(UserRoles.MENTOR), validateRequest(updateMentorProfileZodSchema), mentorController.updateProfile);
var mentorRouter = router9;

// src/modules/course/course.router.ts
import { Router as Router10 } from "express";

// src/modules/course/course.service.ts
var getPublicCourses = async (query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const where = { isPublished: true };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } }
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.level) where.level = query.level;
  if (query.maxPrice) where.price = { lte: Number(query.maxPrice) };
  const total = await prisma.course.count({ where });
  const data = await prisma.course.findMany({
    where,
    include: {
      institute: { select: { name: true, logoUrl: true } },
      mentors: { include: { user: { select: { name: true, image: true } } } },
      category: true,
      _count: { select: { enrollments: true } }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
var getCourseDetails = async (courseId) => {
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      institute: { select: { name: true, logoUrl: true, description: true } },
      mentors: { include: { user: { select: { name: true, image: true } } } },
      category: true,
      _count: { select: { enrollments: true } }
    }
  });
  const relatedCourses = course.categoryId ? await prisma.course.findMany({
    where: {
      categoryId: course.categoryId,
      id: { not: courseId },
      isPublished: true
    },
    take: 4,
    include: {
      institute: { select: { name: true, logoUrl: true } },
      mentors: { include: { user: { select: { name: true, image: true } } } },
      category: true,
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" }
  }) : [];
  return { ...course, relatedCourses };
};
var getInstituteCourses = async (instituteId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const total = await prisma.course.count({ where: { instituteId } });
  const data = await prisma.course.findMany({
    where: { instituteId },
    include: {
      mentors: { include: { user: { select: { name: true } } } },
      _count: { select: { enrollments: true } },
      category: true
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
var createCourse = async (instituteId, data) => {
  return await prisma.course.create({
    data: {
      instituteId,
      title: data.title,
      description: data.description,
      price: data.price,
      thumbnailUrl: data.thumbnailUrl,
      level: data.level,
      duration: data.duration,
      isPublished: data.isPublished || false,
      categoryId: data.categoryId,
      ...data.mentorIds?.length ? { mentors: { connect: data.mentorIds.map((id) => ({ id })) } } : {}
    }
  });
};
var updateCourse = async (instituteId, courseId, data) => {
  const course = await prisma.course.findFirst({ where: { id: courseId, instituteId } });
  if (!course) throw new Error("Course not found or access denied");
  const { mentorIds, ...restData } = data;
  const updateData = { ...restData };
  if (mentorIds) {
    updateData.mentors = { set: mentorIds.map((id) => ({ id })) };
  }
  return await prisma.course.update({
    where: { id: courseId },
    data: updateData
  });
};
var deleteCourse = async (instituteId, courseId) => {
  const course = await prisma.course.findFirst({ where: { id: courseId, instituteId } });
  if (!course) throw new Error("Course not found or access denied");
  await prisma.course.delete({ where: { id: courseId } });
  return { message: "Course deleted successfully" };
};
var getAssignedCourses = async (mentorId, query) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const total = await prisma.course.count({ where: { mentors: { some: { id: mentorId } } } });
  const data = await prisma.course.findMany({
    where: { mentors: { some: { id: mentorId } } },
    include: {
      _count: { select: { enrollments: true } },
      category: true
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
var getCourseRoster = async (mentorId, courseId, query) => {
  const course = await prisma.course.findFirst({ where: { id: courseId, mentors: { some: { id: mentorId } } } });
  if (!course) throw new Error("Course not found or access denied");
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  const total = await prisma.courseEnrollment.count({ where: { courseId } });
  const data = await prisma.courseEnrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, name: true, email: true, image: true, phone: true } } },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
var getEnrolledCourses = async (studentId, query) => {
  let { page, limit, skip, sortBy, sortOrder } = paginationHelper_default(query);
  if (sortBy === "createdAt") sortBy = "enrolledAt";
  const total = await prisma.courseEnrollment.count({ where: { studentId, status: "ACTIVE" } });
  const data = await prisma.courseEnrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          mentors: { include: { user: { select: { name: true } } } },
          institute: { select: { name: true } },
          category: true
        }
      }
    },
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder }
  });
  console.log(data);
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
var dropCourse = async (studentId, courseId) => {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } }
  });
  if (!enrollment) throw new Error("Enrollment not found");
  await prisma.courseEnrollment.delete({ where: { id: enrollment.id } });
  return { message: "Course dropped successfully" };
};
var courseService = {
  getPublicCourses,
  getCourseDetails,
  getInstituteCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getAssignedCourses,
  getCourseRoster,
  getEnrolledCourses,
  dropCourse
};

// src/modules/course/course.controller.ts
import status7 from "http-status";
var getInstituteId2 = async (userId) => {
  const profile = await prisma.instituteProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError_default(status7.NOT_FOUND, "Institute profile not found for this user");
  return profile.id;
};
var getMentorId = async (userId) => {
  const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError_default(status7.NOT_FOUND, "Mentor profile not found for this user");
  return profile.id;
};
var getPublicCourses2 = async (req, res, next) => {
  try {
    const result = await courseService.getPublicCourses(req.query);
    res.status(200).json({ success: true, message: "Courses retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var getCourseDetails2 = async (req, res, next) => {
  try {
    const result = await courseService.getCourseDetails(req.params.courseId);
    res.status(200).json({ success: true, message: "Course details retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var getInstituteCourses2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId2(req.user.id);
    const result = await courseService.getInstituteCourses(instituteId, req.query);
    res.status(200).json({ success: true, message: "Institute courses retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var createCourse2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId2(req.user.id);
    const result = await courseService.createCourse(instituteId, req.body);
    res.status(201).json({ success: true, message: "Course created successfully", data: result });
  } catch (error) {
    next(error);
  }
};
var updateCourse2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId2(req.user.id);
    const result = await courseService.updateCourse(instituteId, req.params.courseId, req.body);
    res.status(200).json({ success: true, message: "Course updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};
var deleteCourse2 = async (req, res, next) => {
  try {
    const instituteId = await getInstituteId2(req.user.id);
    const result = await courseService.deleteCourse(instituteId, req.params.courseId);
    res.status(200).json({ success: true, message: "Course deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};
var getAssignedCourses2 = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const result = await courseService.getAssignedCourses(mentorId, req.query);
    res.status(200).json({ success: true, message: "Assigned courses retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var getCourseRoster2 = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const result = await courseService.getCourseRoster(mentorId, req.params.courseId, req.query);
    res.status(200).json({ success: true, message: "Course roster retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var getEnrolledCourses2 = async (req, res, next) => {
  try {
    const result = await courseService.getEnrolledCourses(req.user.id, req.query);
    res.status(200).json({ success: true, message: "Enrolled courses retrieved", data: result });
  } catch (error) {
    next(error);
  }
};
var dropCourse2 = async (req, res, next) => {
  try {
    const result = await courseService.dropCourse(req.user.id, req.params.courseId);
    res.status(200).json({ success: true, message: "Dropped course successfully", data: result });
  } catch (error) {
    next(error);
  }
};
var courseController = {
  getPublicCourses: getPublicCourses2,
  getCourseDetails: getCourseDetails2,
  getInstituteCourses: getInstituteCourses2,
  createCourse: createCourse2,
  updateCourse: updateCourse2,
  deleteCourse: deleteCourse2,
  getAssignedCourses: getAssignedCourses2,
  getCourseRoster: getCourseRoster2,
  getEnrolledCourses: getEnrolledCourses2,
  dropCourse: dropCourse2
};

// src/modules/course/course.validation.ts
import z7 from "zod";

// src/utils/validationHelper.ts
import z6 from "zod";
var booleanCoerce = z6.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z6.boolean());
var numberCoerce = z6.coerce.number();

// src/modules/course/course.validation.ts
var createCourseZodSchema = z7.object({
  title: z7.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z7.string().min(10, "Description must be at least 10 characters"),
  price: numberCoerce.nonnegative("Price cannot be negative"),
  thumbnailUrl: z7.string().url("Thumbnail must be a valid URL").optional().nullable(),
  level: z7.enum([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]).default(CourseLevel.BEGINNER),
  duration: z7.string().optional().nullable(),
  isPublished: booleanCoerce.default(false),
  categoryId: z7.string().uuid("Invalid category ID").optional().nullable(),
  mentorIds: z7.array(z7.string().uuid("Invalid mentor ID")).optional()
});
var updateCourseZodSchema = z7.object({
  title: z7.string().min(3).max(100).optional(),
  description: z7.string().min(10).optional(),
  price: numberCoerce.nonnegative().optional(),
  thumbnailUrl: z7.string().url().optional().nullable(),
  level: z7.enum([CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED]).optional(),
  duration: z7.string().optional().nullable(),
  isPublished: booleanCoerce.optional(),
  categoryId: z7.string().uuid().optional().nullable(),
  mentorIds: z7.array(z7.string().uuid()).optional()
});

// src/modules/course/course.router.ts
var router10 = Router10();
router10.get("/", courseController.getPublicCourses);
router10.get("/institute/list", auth3(UserRoles.INSTITUTE), courseController.getInstituteCourses);
router10.post("/create", auth3(UserRoles.INSTITUTE), validateRequest(createCourseZodSchema), courseController.createCourse);
router10.put("/update/:courseId", auth3(UserRoles.INSTITUTE), validateRequest(updateCourseZodSchema), courseController.updateCourse);
router10.delete("/delete/:courseId", auth3(UserRoles.INSTITUTE), courseController.deleteCourse);
router10.get("/assigned/list", auth3(UserRoles.MENTOR), courseController.getAssignedCourses);
router10.get("/roster/:courseId", auth3(UserRoles.MENTOR), courseController.getCourseRoster);
router10.get("/enrolled/list", auth3(UserRoles.STUDENT), courseController.getEnrolledCourses);
router10.delete("/drop/:courseId", auth3(UserRoles.STUDENT), courseController.dropCourse);
router10.get("/:courseId", courseController.getCourseDetails);
var courseRouter = router10;

// src/modules/ai/ai.router.ts
import { Router as Router11 } from "express";

// src/utils/ai.ts
var OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
var callOpenRouter = async (options) => {
  const {
    model = "openai/gpt-4o-mini",
    messages,
    tools: tools2,
    temperature = 0.7,
    max_tokens
  } = options;
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${envVars.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": envVars.APP_URL || "http://localhost:3000",
      "X-Title": "SkillBridge"
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tools2,
      temperature,
      max_tokens,
      response_format: options.response_format
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("OpenRouter API Error Details:", JSON.stringify(data, null, 2));
    throw new Error(data.error?.message || `OpenRouter API error: ${response.statusText}`);
  }
  if (!data.choices || data.choices.length === 0) {
    throw new Error("Invalid response form OpenRouter: No choices returned");
  }
  return data.choices[0].message;
};

// src/modules/ai/ai.service.ts
var SYSTEM_PROMPT = `You are SkillBridge AI, the helpful assistant for SkillBridge, a premium educational platform.
Your goal is to help users find courses, discover tutors, and manage their learning experience.
You have access to the platform's database through tools. Always use these tools to provide accurate, up-to-date information.

Frontend URL Context:
The frontend application is running at: ${envVars.APP_URL}
Course Detail Path: ${envVars.APP_URL}/courses/[courseId]
Tutor Detail Path: ${envVars.APP_URL}/tutors/[tutorId]

Formatting Guidelines:
1. **Always use Markdown**: Use bold for titles, bullet points for lists, and headings for sections.
2. **Space out your content**: Use double line breaks between paragraphs and sections to avoid "walls of text".
3. **Structured Lists & Links**: When listing courses or tutors, always link the title/name to its detail page. Format like:
   ### [[Course Name]](${envVars.APP_URL}/courses/[id])
   - **Tutor/Institute**: [Name]
   - **Brief Description**: [One sentence]
   - **Price**: [Price]
4. Be friendly, professional, and concise. Don't make up courses or tutors.
5. If a user asks for "suggestions" without specifics, show a mix of top courses and featured tutors.
`;
var tools = [
  {
    type: "function",
    function: {
      name: "searchCourses",
      description: "Search for published courses in the database based on keywords.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keyword for title or description" },
          limit: { type: "number", default: 5 }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getCourseDetails",
      description: "Get full details for a specific course by its ID.",
      parameters: {
        type: "object",
        properties: {
          courseId: { type: "string", description: "The ID of the course" }
        },
        required: ["courseId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchTutors",
      description: "Search for tutors in the database based on keywords.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keyword for tutor name or bio" },
          limit: { type: "number", default: 5 }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getFeaturedTutors",
      description: "Get a list of featured tutors.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 5 }
        }
      }
    }
  }
];
var toolHandlers = {
  searchCourses: async ({ query, limit = 5 }) => {
    const whereClause = { isPublished: true };
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ];
    }
    return await prisma.course.findMany({
      where: whereClause,
      take: limit,
      include: { category: true, institute: { select: { name: true } } }
    });
  },
  getCourseDetails: async ({ courseId }) => {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: { category: true, institute: { select: { name: true, logoUrl: true } }, mentors: { include: { user: { select: { name: true } } } } }
    });
  },
  searchTutors: async ({ query, limit = 5 }) => {
    return await prisma.tutorProfiles.findMany({
      where: query ? {
        OR: [
          { bio: { contains: query, mode: "insensitive" } },
          { user: { name: { contains: query, mode: "insensitive" } } }
        ]
      } : {},
      take: limit,
      include: { user: { select: { name: true, email: true } }, category: true }
    });
  },
  getFeaturedTutors: async ({ limit = 5 }) => {
    return await prisma.tutorProfiles.findMany({
      where: {
        isFeatured: true
      },
      take: limit,
      include: { user: { select: { name: true } }, category: true }
    });
  }
};
var chatWithDB = async (messages, user) => {
  const userContext = user ? `
Current User Context: Name: ${user.name}, Email: ${user.email}.` : "";
  const message = await callOpenRouter({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + userContext },
      ...messages
    ],
    tools
  });
  if (message.tool_calls) {
    const toolMessages = [...messages, message];
    for (const toolCall of message.tool_calls) {
      const handler = toolHandlers[toolCall.function.name];
      if (handler) {
        const result = await handler(JSON.parse(toolCall.function.arguments));
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(result)
        });
      }
    }
    const secondMessage = await callOpenRouter({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + userContext },
        ...toolMessages
      ]
    });
    return secondMessage.content;
  }
  return message.content;
};
var generateDescription = async (details) => {
  const prompt = `Generate a compelling and professional description for a course or subject titled "${details.title}"${details.category ? ` in the category of ${details.category}` : ""}.${details.tags?.length ? ` Key themes: ${details.tags.join(", ")}.` : ""}
Keep it engaging, highlight why students should enroll, and keep it under 200 words.`;
  const message = await callOpenRouter({
    model: "google/gemini-2.0-flash-001",
    messages: [{ role: "user", content: prompt }]
  });
  return message.content;
};
var getSmartRecommendations = async (userId) => {
  if (!userId) return [];
  try {
    const upcomingCourses = await prisma.course.findMany({
      where: {
        isPublished: true
      },
      take: 10,
      include: { category: true, institute: { select: { name: true } } }
    });
    if (upcomingCourses.length === 0) return [];
    const eventList = upcomingCourses.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category?.name || "General",
      description: e.description?.substring(0, 100)
    }));
    const prompt = `Suggest the top 4 courses from this list: ${JSON.stringify(eventList)}.
Return ONLY a JSON object with a 'recommendations' key containing an array of objects with 'id' and 'reason' (max 10 words).`;
    const response = await callOpenRouter({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const recommendationData = JSON.parse(response.content);
    const rawRecs = recommendationData.recommendations || (Array.isArray(recommendationData) ? recommendationData : []);
    let aiResults = rawRecs.map((rec) => {
      const course = upcomingCourses.find((c) => c.id === rec.id);
      if (course) {
        return { ...course, aiReason: rec.reason };
      }
      return null;
    }).filter(Boolean);
    let finalResults = [...aiResults];
    if (finalResults.length < 4) {
      const filler = upcomingCourses.filter((e) => !finalResults.some((r) => r.id === e.id)).slice(0, 4 - finalResults.length).map((e) => ({ ...e, aiReason: "Featured as a trending learning path in SkillBridge." }));
      finalResults = [...finalResults, ...filler];
    }
    return finalResults.slice(0, 4);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
var AIService = {
  chatWithDB,
  generateDescription,
  getSmartRecommendations
};

// src/modules/ai/ai.controller.ts
var chat = async (req, res) => {
  try {
    const { messages } = req.body;
    let user = req.user;
    if (user?.id) {
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, email: true, role: true }
      });
      if (fullUser) {
        user = { ...user, name: fullUser.name };
      }
    }
    const result = await AIService.chatWithDB(messages, user);
    res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate AI response" });
  }
};
var generateDescription2 = async (req, res) => {
  try {
    const { title, category, tags } = req.body;
    const result = await AIService.generateDescription({ title, category, tags });
    res.status(200).json({
      success: true,
      message: "Description generated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate description" });
  }
};
var getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?.id || "";
    const result = await AIService.getSmartRecommendations(userId);
    res.status(200).json({
      success: true,
      message: "Recommendations generated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to get recommendations" });
  }
};
var AIController = {
  chat,
  generateDescription: generateDescription2,
  getRecommendations
};

// src/modules/ai/ai.validation.ts
import { z as z8 } from "zod";
var chatSchema = z8.object({
  messages: z8.array(z8.any()).min(1, "Messages array cannot be empty")
});
var generateDescriptionSchema = z8.object({
  title: z8.string().min(1, "Title is required"),
  category: z8.string().optional(),
  tags: z8.array(z8.string()).optional()
});
var AIValidation = {
  chatSchema,
  generateDescriptionSchema
};

// src/modules/ai/ai.router.ts
var router11 = Router11();
var parseUserOptional = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (session && session.user) {
      req.user = session.user;
    }
  } catch (error) {
  }
  next();
};
var checkAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
router11.post(
  "/chat",
  parseUserOptional,
  validateRequest(AIValidation.chatSchema),
  AIController.chat
);
router11.post(
  "/generate-description",
  checkAuth,
  validateRequest(AIValidation.generateDescriptionSchema),
  AIController.generateDescription
);
router11.get(
  "/recommendations",
  parseUserOptional,
  AIController.getRecommendations
);
var aiRouter = router11;

// src/app.ts
console.log(process.env.APP_URL);
var app = express2();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:4000",
  process.env.PROD_APP_URL,
  // Production frontend URL
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use("/api/payments", paymentRouter);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express2.json());
app.use("/api/user", userRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/institutes", instituteRouter);
app.use("/api/mentors", mentorRouter);
app.use("/api/courses", courseRouter);
app.use("/api/ai", aiRouter);
app.get("/", (_, res) => {
  res.json("Welcome to Skillbridge server");
});
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var PORT = process.env.PORT;
async function main() {
  try {
    await prisma.$connect();
    console.log("DB connected successfully.");
    app_default.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
