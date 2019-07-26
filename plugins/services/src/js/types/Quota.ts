export interface QuotaData {
  force: boolean;
  cpus: string;
  mem: string;
  disk: string;
  gpus: string;
}

export type QuotaFields = "cpus" | "mem" | "disk" | "gpus";
export const quotaFields: QuotaFields[] = ["cpus", "mem", "disk", "gpus"];
export const QuotaFieldLabels = {
  cpus: "CPU",
  mem: "Mem",
  disk: "Disk",
  gpus: "GPU"
};
