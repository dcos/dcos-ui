import { PackageVersion } from "#SRC/js/data/cosmos/PackageVersion";
import { SemVer } from "semver/preload";

export interface FormattedPackageVersion extends PackageVersion {
  display: SemVer | null;
}
