import { CSSProperties } from "react";
import clsx from "clsx";

import { useSplitView } from "./context";
import { SplitViewPaneProps } from "./types";

export function SplitViewPane({ paneKey, children, className }: SplitViewPaneProps) {
  const { layout, paneMap } = useSplitView();
  const paneData = paneMap.get(paneKey);

  if (!paneData) return null;

  const style: CSSProperties = {};
  if (layout === "horizontal") {
    style.height = "100%";
    style.width = paneData?.size!;
    style.left = paneData.position;
    style.top = 0;
  } else {
    style.width = "100%";
    style.height = paneData?.size!;
    style.top = paneData.position;
    style.left = 0;
  }

  return (
    <div className={clsx('split-view-pane', className)} style={style}>
      {children}
    </div>
  );
}
