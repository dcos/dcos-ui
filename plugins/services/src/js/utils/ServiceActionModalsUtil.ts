import { i18nMark } from "@lingui/react";

export function getActionModalReadableError(errorMsg: any): any {
  if (errorMsg === " error.min") {
    return i18nMark("Must be bigger than or equal to 0");
  }
  return errorMsg;
}
