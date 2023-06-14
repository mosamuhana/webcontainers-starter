import { memo } from "react";
import deepEqual from "deep-equal";

type Props = {
  url?: string;
};

const _Header = ({ url }: Props) => {
  return (
    <header
      className="
      flex items-center gap-5 px-5 w-full h-full pr-10
      bg-gray-200 dark:bg-gray-700
      border-b border-b-gray-300 dark:border-b-gray-900
    "
    >
      <a
        href="https://webcontainers.io"
        target="_blank"
        rel="noreferrer noopener"
      >
        📖{" "}
        <span className="flex-none text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500 underline drop-shadow-2xl">
          WebContainers API
        </span>
      </a>

      {!!url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 text-blue-800 dark:text-blue-400 hover:underline text-xs"
          title={url}
        >
          Remote Url
        </a>
      )}
    </header>
  );
};

export const Header = memo(_Header, deepEqual);
