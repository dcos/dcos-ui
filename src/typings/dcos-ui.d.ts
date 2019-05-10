declare global {
  interface Window {
    DCOS_UI_VERSION: string;
  }
}

interface Resources {
  mem: number;
  disk: number;
  cpus: number;
  gpus: number;
  ports: string;
}

interface ResourcesByFramework {
  [index: string]: Resources;
}

interface ServiceColors {
  [index: string]: number;
}
