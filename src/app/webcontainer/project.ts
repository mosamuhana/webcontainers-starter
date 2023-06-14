import { FileSystemTree, ServerReadyListener } from "@webcontainer/api";
import { getWebContainerInstance, webContainerInstance } from "./api";

type EmitFn = (data: string) => void;

type Props = {
  files: FileSystemTree;
  onReady: ServerReadyListener;
  onInstall?: EmitFn;
  onStartServer?: EmitFn;
};

async function installDependencies(props: Props) {
  const { onInstall } = props;
  onInstall?.('Install dependencies...');
  const proc = await webContainerInstance!.spawn("npm", ["install"]);
  if (onInstall) {
    proc.output.pipeTo(
      new WritableStream({
        write(data) {
          //console.log(data);
          onInstall(data);
        },
      })
    );
  }
  // Wait for install command to exit
  const code = await proc.exit;
  onInstall?.('Dependencies installed successfully.');
  return code;
}

async function startDevServer(props: Props) {
  const { onStartServer, onReady } = props;
  onStartServer?.('Starting Dev Server...');
  const proc = await webContainerInstance!.spawn("npm", ["run", "start"]);
  if (onStartServer) {
    proc.output.pipeTo(
      new WritableStream({
        write(data) {
          //console.log(data);
          onStartServer(data);
        },
      })
    );
  }

  webContainerInstance!.on("server-ready", (port, url) => {
    onStartServer?.('Dev Server Ready.');
    onStartServer?.(`${url} ${port}`);
    onReady(port, url);
  });

  const code = await proc.exit;
  return code;
}

export async function loadProject(props: Props) {
  const wc = await getWebContainerInstance();
  await wc.mount(props.files);

  const exitCode = await installDependencies(props);
  if (exitCode !== 0) {
    throw new Error("Installation failed");
  }

  await startDevServer(props);
}
