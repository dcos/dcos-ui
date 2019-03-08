import * as semver from "semver";
import {
  NotificationService,
  NotificationServiceType
} from "@extension-kid/notification-service";

import container from "#SRC/js/container";
import { Package } from "#SRC/js/data/cosmos/Package";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";

import { FormattedPackageVersion } from "#PLUGINS/ui-update/types/FormattedPackageVersion";

function parseCurrentVersion(uiMetadata: UIMetadata): semver.SemVer | null {
  const coercedPackageVersion = semver.coerce(uiMetadata.packageVersion || "");
  if (coercedPackageVersion !== null) {
    return coercedPackageVersion;
  }
  const coercedServerBuild = semver.coerce(uiMetadata.serverBuild || "");
  if (coercedServerBuild !== null) {
    return coercedServerBuild;
  }
  return null;
}

function versionUpdateAvailable(
  packageInfo: Package,
  uiMetadata: UIMetadata
): FormattedPackageVersion | null {
  const currentVersion = parseCurrentVersion(uiMetadata);
  if (currentVersion === null) {
    return null;
  }
  // Compare to package versions to find the greatest available version
  const availableVersions = packageInfo.versions
    .map(val => ({ display: semver.coerce(val.version), ...val }))
    .filter((val: FormattedPackageVersion) => val.display !== null)
    .filter(
      (val: FormattedPackageVersion) =>
        // @ts-ignore
        val.display.major === currentVersion.major
    )
    .sort((a: FormattedPackageVersion, b: FormattedPackageVersion) =>
      // @ts-ignore
      semver.rcompare(a.display, b.display)
    );
  if (availableVersions.length === 0) {
    return null;
  }
  // if greatest version !== installed version, return it, otherwise return null
  // @ts-ignore
  if (semver.gt(availableVersions[0].display, currentVersion)) {
    return availableVersions[0];
  }
  return null;
}

function getNotificationService(): NotificationService {
  return container.get<NotificationService>(NotificationServiceType);
}

export { getNotificationService, versionUpdateAvailable };
