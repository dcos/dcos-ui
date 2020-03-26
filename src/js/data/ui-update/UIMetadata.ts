import { parseVersion } from "./utils";

const defaultClientBuild = parseVersion(window.DCOS_UI_VERSION);

export interface UIMetadata {
  clientBuild?: string;
  packageVersion?: string;
  packageVersionIsDefault?: boolean;
  serverBuild?: string;
}

export const UIMetadataSchema = `
  type UIMetadata {
    clientBuild: String!
    packageVersion: String!
    packageVersionIsDefault: Boolean!
    serverBuild: String
  }
`;

export const DEFAULT_UI_METADATA: UIMetadata = {
  clientBuild: defaultClientBuild,
};
