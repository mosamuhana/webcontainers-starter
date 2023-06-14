import { useRef, useEffect } from "react";
import type { EffectCallback, DependencyList } from "react";

function _useEffectSafe(effect: EffectCallback, dependancies?: DependencyList) {
  const initialized = useRef(true);

  useEffect(() => {
    let effectReturn: void | (() => void) = () => {};

    if (initialized.current) {
      initialized.current = false;
    } else {
      effectReturn = effect();
    }

    if (effectReturn && typeof effectReturn === 'function') {
      return effectReturn;
    }
    return undefined;
  }, dependancies);
}

export const useEffectSafe = import.meta.env.DEV ? _useEffectSafe : useEffect;
