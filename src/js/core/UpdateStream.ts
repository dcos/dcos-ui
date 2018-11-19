import { Observable } from "rxjs/Observable";
import compareVersions from "compare-versions";
import { request, RequestResponse } from "@dcos/http-service";
import { BehaviorSubject } from "rxjs";

import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";
import Util from "#SRC/js/utils/Util";
import { SAVED_STATE_KEY } from "#SRC/js/constants/UserSettings";

export const UpdateStreamType = Symbol("UpdateStreamType");
const CHECK_DELAY = 24 * 60 * 60 * 1000; // Once every 24 hours
const DCOS_UI_VERSION_SETTING = "dcosUIVersion";
const DISMISSED_VERSION = "dismissedVersion";
const LAST_TIME_CHECK = "lastTimeCheck";

interface ContentTypeObject {
  action: string;
  actionType: string;
  entity: string;
  version: string;
}

interface DCOSUserSettings {
  dcosUIVersion: DCOSUIVersion;
}

interface DCOSUIVersion {
  dismissedVersion: string | number | null;
  lastTimeCheck: string | number | null;
  [key: string]: string | number | null;
}

interface VersionObject {
  response?: ResponseObject;
}

interface ResponseObject {
  results?: object;
}

function getVersionFromVersionObject(versionObject: VersionObject): string {
  if (
    versionObject &&
    versionObject.response &&
    versionObject.response.results
  ) {
    return Object.keys(versionObject.response.results)[0];
  }
  return "0";
}

function getFromLocalStorage(key: string): string | number | null {
  const value: any = Util.findNestedPropertyInObject(
    UserSettingsStore.getKey(SAVED_STATE_KEY),
    DCOS_UI_VERSION_SETTING + "." + key
  );

  return value;
}

function setInLocalStorage(key: string, value: any): void {
  const savedStates: DCOSUserSettings =
    UserSettingsStore.getKey(SAVED_STATE_KEY) || {};
  savedStates.dcosUIVersion = {
    dismissedVersion: localStorageDismissedVersion.getValue(),
    lastTimeCheck: localStorageCheckedTime.getValue()
  };
  savedStates.dcosUIVersion[key] = value;
  UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
  if (key === DISMISSED_VERSION) {
    localStorageDismissedVersion.next(value);
  } else if (key === LAST_TIME_CHECK) {
    localStorageCheckedTime.next(value);
  }
}

function getCosmosHeaderString({
  action,
  actionType,
  entity,
  version
}: ContentTypeObject): string {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}

const localStorageDismissedVersion: BehaviorSubject<
  string | number | null
> = new BehaviorSubject(
  getFromLocalStorage(DISMISSED_VERSION)
    ? getFromLocalStorage(DISMISSED_VERSION)
    : null
);
const localStorageCheckedTime: BehaviorSubject<
  string | number | null
> = new BehaviorSubject(
  getFromLocalStorage(LAST_TIME_CHECK)
    ? getFromLocalStorage(LAST_TIME_CHECK)
    : null
);

const filteredDismissedVersion: Observable<
  string | number | null
> = localStorageDismissedVersion.filter(
  () =>
    new Date().getTime() >=
    Number(localStorageCheckedTime.getValue()) + CHECK_DELAY
);

const fetchedVersion: Observable<RequestResponse<ResponseObject>> = request(
  "/package/list-versions",
  {
    method: "POST",
    headers: {
      "Content-Type": getCosmosHeaderString({
        action: "list-versions",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      Accept: getCosmosHeaderString({
        action: "list-versions",
        actionType: "response",
        entity: "package",
        version: "v1"
      })
    },
    body: JSON.stringify({
      includePackageVersions: true,
      packageName: "dcos-ui"
    })
  }
).retry(4);

export function compareStream(
  delay: number,
  dismissedVersion: Observable<string | number | null>,
  newFetchedVersion: Observable<VersionObject>
): Observable<string | number | null> {
  return Observable.timer(0, delay)
    .switchMap(() =>
      Observable.combineLatest(dismissedVersion, newFetchedVersion)
    )
    .filter(([dismissed, nextVersion]) => {
      const newVersion = getVersionFromVersionObject(nextVersion);
      try {
        compareVersions(newVersion, String(dismissed));
      } catch (error) {
        dismissed = "0";
      }

      return compareVersions(newVersion, String(dismissed)) === 1;
    })
    .do(() => {
      setInLocalStorage(LAST_TIME_CHECK, new Date().getTime());
    })
    .map(([, nextVersion]) => getVersionFromVersionObject(nextVersion));
}

export const compare = compareStream(
  CHECK_DELAY,
  filteredDismissedVersion,
  fetchedVersion
);
