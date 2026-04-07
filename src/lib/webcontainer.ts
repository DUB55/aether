import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

/**
 * Initialize or get the existing WebContainer instance.
 */
export async function getWebContainer() {
  if (!webcontainerInstance) {
    if (!window.crossOriginIsolated) {
      console.warn('WebContainer requires cross-origin isolation. Please ensure COOP/COEP headers are set or open the app in a new tab.');
      // We still try to boot, but it might fail with the SharedArrayBuffer error
    }
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

/**
 * Mount files into the WebContainer.
 * Files should be in the format: { [path: string]: { file: { contents: string } } }
 */
export async function mountFiles(files: any) {
  const wc = await getWebContainer();
  await wc.mount(files);
}

/**
 * Run a command in the WebContainer.
 */
export async function runCommand(command: string, args: string[], onData?: (data: string) => void) {
  const wc = await getWebContainer();
  const process = await wc.spawn(command, args);
  
  if (onData) {
    process.output.pipeTo(new WritableStream({
      write(data) {
        onData(data);
      }
    }));
  }

  return process;
}
