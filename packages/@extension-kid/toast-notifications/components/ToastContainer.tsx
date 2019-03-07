import * as React from "react";
import { Container } from "inversify";
import { combineLatest, of } from "rxjs";
import { catchError, startWith, map } from "rxjs/operators";

import { Toaster } from "@dcos/ui-kit";
import { componentFromStream } from "@dcos/data-service";

import { ToastNotification } from "../ToastNotification";
import ToastExtension from "../ToastExtension";
import {
  NotificationService,
  NotificationServiceType
} from "@extension-kid/notification-service";
import makeToast from "./Toast";

interface ToastContainerProps {
  className: string;
  primaryActionClassName?: string;
  secondaryActionClassName?: string;
}

function makeToastContainer(
  container: Container
): React.ComponentType<ToastContainerProps> {
  return componentFromStream<ToastContainerProps>(props$ => {
    const ns = container.get<NotificationService>(NotificationServiceType);
    const extension = ns.findExtension(ToastNotification.NotificationType);
    if (!extension) {
      return of(<div />);
    }
    const toastExtension = extension as ToastExtension;
    return combineLatest<[ToastContainerProps, ToastNotification[]]>([
      props$,
      toastExtension.Toast$
    ]).pipe(
      map(([props, toasts]) => {
        return (
          <div className={props.className}>
            <Toaster>
              {toasts.map(toast =>
                makeToast(
                  toast,
                  toastExtension,
                  props.primaryActionClassName,
                  props.secondaryActionClassName
                )
              )}
            </Toaster>
          </div>
        );
      }),
      catchError(() => of(<div />)),
      startWith(<div />)
    );
  });
}

export { makeToastContainer, ToastContainerProps };
