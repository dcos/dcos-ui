interface Window {
  Cypress?: unknown;
  DCOS_UI_VERSION: string;
  msCrypto?: Crypto;
  actionTypes: Record<string, any>;
}

interface Crypto {
  readonly webkitSubtle?: SubtleCrypto;
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
