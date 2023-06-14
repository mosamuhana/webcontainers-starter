import { useRef, useEffect, useState } from "react";

type ScreenSize = "sm" | "md" | "lg" | "xl" | "2xl";

const screenSizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

const sizes: Record<ScreenSize, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

const getMinWidthQuery = (screen: ScreenSize) => {
  if (!screenSizes.includes(screen)) throw new Error(`Invalid ScreenSize '${screen}'`);
  return `(min-width: ${sizes[screen]})`;
};

export const useBreakpoint = (screen: ScreenSize) => {
  const mqRef = useRef(window.matchMedia(getMinWidthQuery(screen)));
  const [matches, setMatches] = useState(mqRef.current.matches);

  useEffect(() => {
    const listener = () => {
      if (mqRef.current.matches !== matches) {
        setMatches(mqRef.current.matches);
      }
    };

    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
}, [matches, screen]);

  return matches;
};
