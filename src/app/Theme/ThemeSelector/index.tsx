import clsx from "clsx";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

import { ThemeIcon } from "./ThemeIcon";
import { ThemeItem } from "./ThemeItem";
import { useTheme } from "../ThemeProvider";

type Props = {
  align?: 'left' | 'right';
};

export function ThemeSelector({ align }: Props) {
  const { isDark } = useTheme();

  return (
    <div className="fixed right-2 top-1">
      <Menu as="div" className="relative inline-block text-right">
        <Menu.Button
          as="button"
          className="
          inline-flex justify-center text-sm font-medium text-white
          hover:bg-opacity-30 focus:outline-none
          focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
          "
        >
          <ThemeIcon theme={isDark ? 'dark' : 'light'} />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={clsx(
              "absolute mt-0 w-32 origin-top-right rounded-md overflow-hidden",
              "divide-y divide-gray-100 dark:divide-gray-500",
              "bg-white dark:bg-gray-700",
              "shadow-lg",
              "focus:outline-none",
              "ring-1 ring-opacity-5 ring-black dark:ring-gray-400",
              align === 'left' ? 'left-0' : 'right-0'
            )}
          >
            <ThemeItem theme='light' />
            <ThemeItem theme='dark' />
            <ThemeItem theme='system' />
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
