import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, time: number = 600): T {
  const [state, setState] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setState(value), time);
    return () => clearTimeout(handler);
  }, [value, time]);

  return state;
}
