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
