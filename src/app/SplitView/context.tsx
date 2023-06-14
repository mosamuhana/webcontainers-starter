import { ReactNode, createContext, useContext } from "react";

import { Layout, SplitViewPaneInfo } from "./types";

export type PaneData = SplitViewPaneInfo & { position: number };

type ContextType = {
  layout: Layout;
  paneMap: Map<string, PaneData>;
  testId?: string;
};

const SplitViewContext = createContext<ContextType>({
  layout: "horizontal",
  paneMap: new Map<string, PaneData>(),
});

export const useSplitView = () => useContext(SplitViewContext);

type Props = {
  children: ReactNode;
  value: ContextType;
};

export const SplitViewProvider = ({ children, value }: Props) => {
  return (<SplitViewContext.Provider value={value}>{children}</SplitViewContext.Provider>);
};
