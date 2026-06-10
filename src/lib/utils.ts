import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NG').format(num);
}

export function calculatePlatformFee(totalAmount: number, feePercentage: number = 0.20): number {
  return totalAmount * feePercentage;
}

export function calculateWorkerPool(totalAmount: number, feePercentage: number = 0.20): number {
  return totalAmount * (1 - feePercentage);
}

export function calculatePricePerSubscriber(subscribers: number): number {
  // Base price is ₦150 per subscriber
  const basePrice = 150;

  // Apply volume discounts
  if (subscribers >= 2000) {
    return 140; // ₦140 per subscriber for 2000+
  } else if (subscribers >= 1000) {
    return 150; // Standard ₦150
  } else if (subscribers >= 500) {
    return 150;
  } else {
    return 150;
  }
}

export function calculateTotalPrice(subscribers: number): number {
  return subscribers * calculatePricePerSubscriber(subscribers);
}
