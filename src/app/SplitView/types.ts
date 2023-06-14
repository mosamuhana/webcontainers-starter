import type { ReactNode, MutableRefObject } from "react";

export type Layout = "horizontal" | "vertical";

export type SplitViewPaneInfo = {
  paneKey: string;
  size?: number;
  minSize: number;
  maxSize?: number;
  snapable?: boolean;
  snapped?: boolean;
  snappedSize?: number;
  priority?: number;
};

export type SplitViewProps = {
  layout?: Layout;
  paneData: SplitViewPaneInfo[];
  onChange?: (paneInfo: SplitViewPaneInfo[]) => void;
  hoverDelay?: number;
  sashSize?: number;
  viewName?: string;
  actionRef?: MutableRefObject<{ updatePaneData?: () => void }>;
  children?: ReactNode;
};

export type SplitViewPaneProps = {
  paneKey: string;
  className?: string | undefined;
  children?: ReactNode;
};

export type SplitViewSashProps = {
  index: number;
  position: number;
  layout: Layout;
  sashState?: SplitViewSashState;
  onSashDraging?: (delta: number, index: number) => void;
  onSashDragStoped?: () => void;
  size?: number;
  delay?: number;
};

export const enum SplitViewSashState {
  Disabled,
  Minimum,
  Maximum,
  Enabled,
}
