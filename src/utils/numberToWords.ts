import { toWords } from "number-to-words";

export function numberToWords(num: number): string {
  return toWords(num).replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}
