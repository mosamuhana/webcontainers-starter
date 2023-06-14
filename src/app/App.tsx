import { useRef, useState, useEffect } from "react";
import { ServerReadyListener } from "@webcontainer/api";
import MonacoEditor from "@monaco-editor/react";

import { webContainerInstance } from "./webcontainer/api";
import { files } from "./webcontainer/files";
import { loadProject } from "./webcontainer/project";
import { Layout } from "./Layout";
import { Header } from "./Header";
import { ThemeSelector, useTheme } from "./Theme";
import { useDebounce } from "./hooks/useDebounce";

async function load(onReady: ServerReadyListener) {
  await loadProject({
    files,
    onReady,
    onStartServer: (data) => {
      console.log("[START] " + data);
    },
    onInstall: (data) => {
      console.log("[INSTALL] " + data);
    },
  });
}

async function updateFile(filecontent: string) {
  if (webContainerInstance) {
    await webContainerInstance.fs.writeFile("index.js", filecontent, "utf-8");
  }
}

export default function App() {
  const initContent = files["index.js"].file.contents;
  const loadedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | undefined>(undefined);
  const [content, setContent] = useState(initContent);
  const value = useDebounce(content, 1000);
  const { isDark } = useTheme();
  const editorTheme = isDark ? "vs-dark" : "light";

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      load((_, url) => {
        setRemoteUrl(url);
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      });
    }
  }, []);

  useEffect(() => {
    updateFile(value);
  }, [value]);

  return (
    <>
      <Layout
        header={<Header url={remoteUrl} />}
        footer={<div></div>}
        editor={
          <MonacoEditor
            className="editor"
            defaultLanguage="javascript"
            defaultValue={initContent}
            onChange={(v) => setContent(v ?? "")}
            theme={editorTheme}
          />
        }
        preview={
          <iframe
            ref={iframeRef}
            src="loading.html"
            className="w-full h-full border border-gray-100 rounded"
          />
        }
      />
      <ThemeSelector align="right" />
    </>
  );
}
