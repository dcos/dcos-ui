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

type DCOSData = {
  bootstrapId: string;
  imageCommit: string;
  variant: string;
  version: string;
  hasQuotaSupport: boolean;
};

export default fromFetch(
  `${Config.rootUrl}/dcos-metadata/dcos-version.json`
).pipe(
  switchMap((response) =>
    from(
      response.json().then((json) => ({
        version: json.version,
        imageCommit: json["dcos-image-commit"],
        bootstrapId: json["bootstrap-id"],
        variant: json["dcos-variant"],
        hasQuotaSupport: Version.compare(json.version, "2.0.0") >= 0,
      }))
    )
  ),
  retryWithLinearBackoff(),
  toastifyError((e) => ({
    title: "Error while fetching data",
    description: `An error occurred while fetching ${Config.rootUrl}/dcos-metadata/dcos-version.json. Here's the internal error: ${e}`,
  })),

  shareReplay<DCOSData>(1)
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
