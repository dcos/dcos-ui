import { Observable } from "rxjs/Observable";
import compareVersions from "compare-versions";
import { request, RequestResponse } from "@dcos/http-service";
import { BehaviorSubject } from "rxjs";

import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";
import Util from "#SRC/js/utils/Util";
import { SAVED_STATE_KEY } from "#SRC/js/constants/UserSettings";

export const UpdateStreamType: symbol = Symbol("UpdateStreamType");
const CHECK_DELAY: number = 24 * 60 * 60 * 1000; // Once every 24 hours
const DCOS_UI_VERSION_SETTING: string = "dcosUIVersion";
const DISMISSED_VERSION: string = "dismissedVersion";
const LAST_TIME_CHECK: string = "lastTimeCheck";

export function showNotification(newVersion: string): void {
  // TODO: show notification
  // When dismissing, save dismissed version in local storage
  const currentVersion: string = (window as any).DCOS_UI_VERSION;
  alert(
    `A new version of DCOS UI is available. Upgrade ${currentVersion} to ${newVersion}. Dismiss.`
  );
}

function getVersionFromVersionObject(versionObject: any): string {
  return Object.keys(versionObject.response.results)[0];
}

function getFromLocalStorage(key: string): any {
  const value: any = Util.findNestedPropertyInObject(
    UserSettingsStore.getKey(SAVED_STATE_KEY),
    DCOS_UI_VERSION_SETTING + "." + key
  );

  return value;
}

function setInLocalStorage(key: string, value: any): void {
  const savedStates: any = UserSettingsStore.getKey(SAVED_STATE_KEY) || {};
  savedStates[DCOS_UI_VERSION_SETTING] = {
    dismissedVersion: localStorageDismissedVersion.getValue(),
    lastTimeCheck: localStorageCheckedTime.getValue()
  };
  savedStates[DCOS_UI_VERSION_SETTING][key] = value;
  UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
  if (key === DISMISSED_VERSION) {
    localStorageDismissedVersion.next(value);
  } else if (key === LAST_TIME_CHECK) {
    localStorageCheckedTime.next(value);
  }
}

function getContentType({ action, actionType, entity, version }: any): string {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}

const localStorageDismissedVersion: BehaviorSubject<
  string
> = new BehaviorSubject(
  getFromLocalStorage(DISMISSED_VERSION)
    ? getFromLocalStorage(DISMISSED_VERSION)
    : "0"
);
const localStorageCheckedTime: BehaviorSubject<number> = new BehaviorSubject(
  getFromLocalStorage(LAST_TIME_CHECK)
    ? getFromLocalStorage(LAST_TIME_CHECK)
    : 0
);

setInLocalStorage(DISMISSED_VERSION, "2.24.2"); // stub

const filteredDismissedVersion: Observable<
  string
> = localStorageDismissedVersion.filter(
  () => new Date().getTime() >= localStorageCheckedTime.getValue() + CHECK_DELAY
);

const fetchedVersion: Observable<RequestResponse<{}>> = request(
  "/package/list-versions",
  {
    method: "POST",
    headers: {
      "Content-Type": getContentType({
        action: "list-versions",
        actionType: "request",
        entity: "package",
        version: "v1"
      }),
      Accept: getContentType({
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

export const compare: Observable<string> = Observable.timer(
  0,
  CHECK_DELAY
).switchMap(() =>
  Observable.combineLatest(filteredDismissedVersion, fetchedVersion)
    .filter(values => {
      const filteredDismissedVersion = values[0];
      const newVersion = getVersionFromVersionObject(values[1]);
      setInLocalStorage(LAST_TIME_CHECK, new Date().getTime());

      return compareVersions(newVersion, filteredDismissedVersion) === 1;
    })
    .map(values => getVersionFromVersionObject(values[1]))
);
