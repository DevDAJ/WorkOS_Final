import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WithElementRef<T> = T & { ref?: Element | null };
export type WithoutChild<T> = T;
export type WithoutChildrenOrChild<T> = T;
