import { RefObject } from "react";

export function isElementContainsTarget<T extends HTMLElement>(ref: RefObject<T>, _target: EventTarget | null) {
  const el = ref.current;
  if (el) {
    const target = _target as HTMLElement;
    return target === el || el.contains(target);
  }
  return false;
}