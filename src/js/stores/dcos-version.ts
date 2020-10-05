import Config from "#SRC/js/config/Config";
import container from "#SRC/js/container";
import * as Version from "#SRC/js/utils/Version";
import {
  NotificationService,
  NotificationServiceType,
} from "@extension-kid/notification-service";
import {
  ToastAppearance,
  ToastNotification,
} from "@extension-kid/toast-notifications";
import { from, Observable, throwError } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, shareReplay, switchMap } from "rxjs/operators";
import { retryWithLinearBackoff } from "../utils/rxjsUtils";

export default fromFetch(
  `${Config.rootUrl}/dcos-metadata/dcos-version.json`
).pipe(
  switchMap((response) =>
    from(
      response.json().then((json) => ({
        version: json.version as string,
        imageCommit: json["dcos-image-commit"] as string,
        bootstrapId: json["bootstrap-id"] as string,
        variant: json["dcos-variant"] as string,
        // we could just pass through the version itself. but having long identifiers will make it easier to understand why some code is conditional and also to remove that conditional again.
        hasCalicoNetworking: Version.compare(json.version, "2.1.0-alpha") >= 0,
        hasVerticalBursting: Version.compare(json.version, "2.1.0-alpha") >= 0,

        hasCSI: Version.compare(json.version, "2.2.0-alpha") >= 0,
        hasJobsWithDeps: Version.compare(json.version, "2.2.0-alpha") >= 0,
      }))
    )
  ),
  retryWithLinearBackoff(),
  toastifyError((e) => ({
    title: "Error while fetching data",
    description: `An error occurred while fetching ${Config.rootUrl}/dcos-metadata/dcos-version.json. Here's the internal error: ${e}`,
  })),

  shareReplay(1)
);

/**
 * Transparently shows a Toast Notification for every error in the stream.
 */
function toastifyError(
  generateConfig: (
    error: string
  ) => {
    title: string;
    description?: string;
    appearance?: ToastAppearance;
  }
): <T>(source: Observable<T>) => Observable<T> {
  const notificationService = container.get<NotificationService>(
    NotificationServiceType
  );
  return (source) =>
    source.pipe(
      catchError((e) => {
        const {
          title,
          description,
          appearance = ToastAppearance.Danger,
        } = generateConfig(e);
        notificationService.push(
          new ToastNotification(title, { appearance, description })
        );
        return throwError(title);
      })
    );
}
