import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function convertAmountToMiliUnits(amount: number) {
  return Math.round(amount * 1000);
}
export function convertAmountFromMiliUnits(amount: number) {
  return Math.round(amount / 1000);
}
export function formatCurrency(value: number) {
  return Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function calculatePercentageChage(
  current: number | bigint,
  previous: number | bigint
) {
  const currentNum = typeof current === 'bigint' ? Number(current) : current;
  const previousNum = typeof previous === 'bigint' ? Number(previous) : previous;

  if (previousNum == 0) {
    return previousNum === currentNum ? 0 : 100;
  }

  return ((currentNum - previousNum) / previousNum) * 100;
}