import { describe, expect, it } from "vitest";
import {
  canFinish,
  canProceedStep1,
  isEmailFormatValid,
  isFullNameValid,
} from "./personalSpecValidation";

describe("isFullNameValid", () => {
  it("rejects empty and whitespace-only names", () => {
    expect(isFullNameValid("")).toBe(false);
    expect(isFullNameValid("   ")).toBe(false);
  });

  it("accepts a non-empty name", () => {
    expect(isFullNameValid("Ada Lovelace")).toBe(true);
  });
});

describe("isEmailFormatValid", () => {
  it("rejects malformed emails", () => {
    expect(isEmailFormatValid("not-an-email")).toBe(false);
    expect(isEmailFormatValid("a@b")).toBe(false);
  });

  it("accepts a well-formed email", () => {
    expect(isEmailFormatValid("ada@example.com")).toBe(true);
  });
});

describe("canProceedStep1", () => {
  it("mirrors full name validity", () => {
    expect(canProceedStep1("")).toBe(false);
    expect(canProceedStep1("Ada")).toBe(true);
  });
});

describe("canFinish", () => {
  it("requires at least one account across emails and accounts", () => {
    expect(canFinish(0, 0)).toBe(false);
    expect(canFinish(1, 0)).toBe(true);
    expect(canFinish(0, 1)).toBe(true);
  });
});
