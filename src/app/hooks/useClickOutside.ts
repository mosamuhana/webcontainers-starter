import { useRef, useEffect } from "react";
import type { RefObject } from "react";

import { isElementContainsTarget } from "../Theme/utils";

export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, cb: (e: MouseEvent | TouchEvent) => void) {
  const refCb = useRef(cb);

  useEffect(() => {
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
}
