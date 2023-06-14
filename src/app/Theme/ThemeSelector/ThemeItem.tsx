import clsx from "clsx";
import deepEqual from 'deep-equal';
import { memo } from "react";
import { Menu } from "@headlessui/react";

import type { Theme } from "../types";
import { useTheme } from "../ThemeProvider";
import { ThemeIcon } from "./ThemeIcon";

type Props = {
  theme: Theme;
};

const _ThemeItem = ({ theme }: Props) => {
  const { theme: t, setTheme } = useTheme();
  const selected = t === theme;

  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={() => setTheme(theme)}
          className={clsx(
            "flex gap-2 w-full items-center px-2 py-2 text-sm",
            selected && "font-semibold",
            selected ? "text-sky-500" : (
              active ? "text-white dark:text-black" : "text-black dark:text-white"
            ),
            active && "bg-violet-300",
          )}
        >
          <ThemeIcon theme={theme} />
          {themeMap[theme]}
        </button>
      )}
    </Menu.Item>
  );
};

export const ThemeItem = memo(_ThemeItem, deepEqual);

const themeMap: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};