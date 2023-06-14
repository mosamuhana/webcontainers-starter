import { useState, type ReactNode } from "react";

import { SplitView, SplitViewPane, SplitViewPaneInfo } from "./SplitView";

const headerPaneInfo: SplitViewPaneInfo = {
  paneKey: "header",
  minSize: 30,
  maxSize: 30,
};

const footerPaneInfo: SplitViewPaneInfo = {
  paneKey: "footer",
  minSize: 22,
  maxSize: 22,
};

const contentPaneInfo: SplitViewPaneInfo = {
  paneKey: "content",
  minSize: 120,
};

const initContentPaneData: SplitViewPaneInfo[] = [
  {
    paneKey: "editor",
    minSize: 100,
    snapable: true,
  },
  {
    paneKey: "preview",
    minSize: 100,
    snapable: true,
  },
];

function getMainPaneData({ header, footer }: { header?: ReactNode; footer?: ReactNode; }) {
  const list: SplitViewPaneInfo[] = [];
  if (header) list.push(headerPaneInfo);
  list.push(contentPaneInfo);
  if (footer) list.push(footerPaneInfo);
  return list;
}

type Props = {
  editor: ReactNode;
  preview: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

export function Layout({ editor, preview, header, footer }: Props) {
  const [paneData1, setPaneData1] = useState<SplitViewPaneInfo[]>(getMainPaneData({ header, footer }));
  const [paneData2, setPaneData2] = useState<SplitViewPaneInfo[]>(initContentPaneData);

  return (
    <div className="w-full h-full">
      <SplitView
        viewName="main"
        paneData={paneData1}
        onChange={(paneData) => setPaneData1(paneData)}
        layout="vertical"
      >
        {!!header && (
          <SplitViewPane paneKey="header">
            { header }
          </SplitViewPane>
        )}
        <SplitViewPane paneKey="content">
          <SplitView
            viewName="middle"
            paneData={paneData2}
            onChange={(paneData) => setPaneData2(paneData)}
          >
            <SplitViewPane paneKey="editor">
              <div className="bg-zinc-700 w-full h-full">
                {editor}
              </div>
            </SplitViewPane>
            <SplitViewPane paneKey="preview">
              <div className="bg-gray-50 w-full h-full outline outline-gray-500/50">
                {preview}
              </div>
            </SplitViewPane>
          </SplitView>
        </SplitViewPane>
        {!!footer && (
          <SplitViewPane paneKey="footer">
            <div className="bg-blue-700 w-full h-full">
              {footer}
            </div>
          </SplitViewPane>
        )}
      </SplitView>
    </div>
  );
}
