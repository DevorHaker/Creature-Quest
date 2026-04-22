import { getTypeBgClass } from "@/lib/type-colors";

export function useTypeColor(type: string) {
  return getTypeBgClass(type);
}
