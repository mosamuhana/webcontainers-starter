import { WebContainer } from "@webcontainer/api";

export let webContainerInstance: WebContainer | undefined;

export async function getWebContainerInstance() {
  if (!webContainerInstance) {
    webContainerInstance = await WebContainer.boot();
  }
  return webContainerInstance;
}
