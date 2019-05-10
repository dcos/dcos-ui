export { DCOSUIUpdateClient } from "./src/DCOSUIUpdateClient";

export interface UIVersionResponse {
  default: boolean;
  packageVersion: string;
  buildVersion: string;
}
