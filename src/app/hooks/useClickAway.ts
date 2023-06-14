import { useRef, useEffect } from "react";

import { isElementContainsTarget } from "../Theme/utils";

export function useClickAway<T extends HTMLElement>(cb: (e: MouseEvent | TouchEvent) => void) {
  const ref = useRef<T>(null);
  const refCb = useRef(cb);

  useEffect(() => {
    /*
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const element = ref.current;
      if (element && !element.contains(target)) {
        refCb.current(e);
      }
    };
    */
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !isElementContainsTarget(ref, e.target)) {
        refCb.current(e);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return ref;
}
