#!/usr/env/var bash

# path of this file
SCRIPT_PATH="$(cd $(dirname "$0")/$(dirname "$(readlink "$0")") && pwd)"

# project root for this file
PROJECT_ROOT="$( cd "$( echo "${SCRIPT_PATH}" | sed s+/scripts/ci++)" && pwd )"

# params
VERSION_PLACEHOLDER="$1"
VERSION="$2"

# first, replace placeholder in dist bundle and verify that it worked
sed -i'' "s/${VERSION_PLACEHOLDER}/${VERSION}/" ${PROJECT_ROOT}/dist/index.html
if ! grep "${VERSION}" "${PROJECT_ROOT}/dist/index.html"; then
  echo "Version injection into dist/index.html failed!"
  exit 1
fi

# second, create tarball
tar czf ${PROJECT_ROOT}/release.tar.gz ${PROJECT_ROOT}/dist

# third, create buildinfo.json
cat <<EOF > "${PROJECT_ROOT}/buildinfo.json"
{
  "single_source": {
    "kind": "url_extract",
    "url": "$(echo "https://github.com/dcos/dcos-ui/releases/download/${VERSION}/release.tar.gz")",
    "sha1": "$(shasum "${PROJECT_ROOT}/release.tar.gz" | cut -d " " -f1)",
    "gitTag": "${VERSION}"
  }
}
EOF
