import { PackageVersion } from "#SRC/js/types/PackageVersion";

export interface Package {
  name: string;
  versions: PackageVersion[];
}

export const PackageSchema = `
type Package {
  name: String!
  versions: [PackageVersion!]!
}
`;
