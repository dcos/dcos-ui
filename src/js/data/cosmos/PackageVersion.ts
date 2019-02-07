export interface PackageVersion {
  version: string;
  revision: string;
}

export const PackageVersionSchema = `
type PackageVersion {
  version: String!
  revision: String!
}
`;
