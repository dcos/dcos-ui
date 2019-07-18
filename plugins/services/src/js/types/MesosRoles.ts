// Types related to the Mesos v0 response for /roles

type MesosResources = {
  cpus?: number;
  disk?: number;
  gpus?: number;
  mem?: number;
  ports?: string;
};

export type MesosRole = {
  name: string;
  weight: number;
  frameworks?: string[];
  resources?: MesosResources;
  quota?: {
    role?: string;
    principal?: string;
    guarantee?: MesosResources;
    limit?: MesosResources;
    consumed?: MesosResources;
  };
};
