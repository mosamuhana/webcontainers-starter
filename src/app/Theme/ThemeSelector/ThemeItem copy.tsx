import clsx from "clsx";
import deepEqual from 'deep-equal';
import type { ReactNode } from "react";
import { memo } from "react";
import { Menu } from "@headlessui/react";

import { useTheme } from "../ThemeProvider";
import type { Theme } from "../types";

type Props = {
  theme: Theme;
  children: ReactNode;
};

const getBackground = (active: boolean, selected: boolean) => {
  if (selected) {
    if (active) {
      return "bg-slate-200 dark:bg-slate-300";
    } else {
      return "bg-slate-200 dark:bg-slate-300";
    }
  } else {
    if (active) {
      return "bg-slate-200 dark:bg-slate-300";
    } else {
      return "bg-slate-200 dark:bg-slate-300";
    }
  }
};

const getText = (active: boolean, selected: boolean) => {
  if (selected) {
    if (active) {
      return "bg-slate-200 dark:bg-slate-300";
    } else {
      return "bg-slate-200 dark:bg-slate-300";
    }
  } else {
    if (active) {
      return "bg-slate-200 dark:bg-slate-300";
    } else {
      return "bg-slate-200 dark:bg-slate-300";
    }
  }
};

const _ThemeItem = ({ children, theme }: Props) => {
  const { theme: savedTheme, setTheme } = useTheme();
  const selected = savedTheme === theme;

  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={() => setTheme(theme)}
          className={clsx(
            "flex gap-2 w-full items-center px-2 py-2 text-sm text-gray-900 dark:text-white",
            selected && "font-semibold",
            getBackground(active, selected),
            selected
              ? "text-sky-500 dark:text-sky-500"
              : (active && "text-white" )
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

export const ThemeItem = memo(_ThemeItem, deepEqual);

/*
          className={clsx(
            "flex gap-2 w-full items-center px-2 py-2 text-sm text-gray-900 dark:text-white",
            //active && "bg-violet-300",
            active && "bg-slate-200 dark:bg-slate-300",
            selected
              ? "text-sky-500 dark:text-sky-500 font-semibold"
              : (active && "text-white" )
          )}
*/
