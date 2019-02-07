import { PackageVersion } from "src/js/data/cosmos/PackageVersion";

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
