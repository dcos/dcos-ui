const LOCAL_DEV_VERSION = "0.0.0-dev+semantic-release";

export function parseVersion(version: string): string {
  if (version === LOCAL_DEV_VERSION) {
    return "0.0.0";
  }
  if (!version) {
    return "";
  }
  if (typeof version !== "string") {
    return "";
  }
  const versionSplit = version.split("+");
  if (versionSplit.length > 1) {
    return versionSplit[1];
  }
  return version;
}
