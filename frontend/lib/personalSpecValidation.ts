export function isFullNameValid(fullName: string): boolean {
  return fullName.trim().length > 0;
}

export function isEmailFormatValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function canProceedStep1(fullName: string): boolean {
  return isFullNameValid(fullName);
}

export function canFinish(emailCount: number, accountCount: number): boolean {
  return emailCount + accountCount >= 1;
}
