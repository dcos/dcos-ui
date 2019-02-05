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
