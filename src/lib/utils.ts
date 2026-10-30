import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English numbers to Bengali numbers
export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

// Convert Bengali numerals to English
export function toEnglishNumber(str: string): string {
  if (!str) return '';
  const bengaliToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return str.replace(/[০-৯]/g, (digit) => bengaliToEnglish[digit] || digit);
}

// Format integer poisha into Bengali currency format (e.g. 50000 poisha -> ৳৫০০.০০)
export function formatBDT(poisha: number, includeSymbol: boolean = true): string {
  if (isNaN(poisha)) poisha = 0;
  const bdt = (poisha / 100).toFixed(2);
  const parts = bdt.split('.');
  
  // Format with standard South Asian comma style or standard comma
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Format integer with commas
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  
  const formattedEnglish = `${integerPart}.${decimalPart}`;
  const formattedBengali = toBengaliNumber(formattedEnglish);
  
  return includeSymbol ? `৳${formattedBengali}` : formattedBengali;
}

// Convert BDT decimal input to integer poisha safely
export function bdtToPoisha(bdt: number | string): number {
  const numeric = typeof bdt === 'string' ? parseFloat(toEnglishNumber(bdt)) : bdt;
  if (isNaN(numeric) || numeric < 0) return 0;
  return Math.round(numeric * 100);
}

// Convert poisha to standard BDT float
export function poishaToBDT(poisha: number): number {
  if (!poisha || isNaN(poisha)) return 0;
  return poisha / 100;
}

// Bengali month names
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Format ISO date string or Date to readable Bengali string
export function formatDateBengali(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const day = toBengaliNumber(d.getDate());
    const month = BENGALI_MONTHS[d.getMonth()];
    const year = toBengaliNumber(d.getFullYear());
    return `${day} ${month}, ${year}`;
  } catch {
    return '—';
  }
}

// Format date and time
export function formatDateTimeBengali(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const dateStr = formatDateBengali(d);
    let hours = d.getHours();
    const minutes = toBengaliNumber(d.getMinutes().toString().padStart(2, '0'));
    const ampm = hours >= 12 ? 'বিকাল/রাত' : 'সকাল';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = toBengaliNumber(hours);
    return `${dateStr} (${ampm} ${hourStr}:${minutes})`;
  } catch {
    return '—';
  }
}
