import { FormError } from "./JobFormData";
import { I18n } from "@lingui/core";

/**
 * Translates message in each error in array.
 * Error messages must be marked using i18nMark.
 */
export const translateErrorMessages = (errors: FormError[], i18n: I18n) =>
  errors.slice().map((e) => ({ ...e, message: i18n._(e.message) }));

export const getFieldError = (path: string, errors: FormError[]): string =>
  errors
    .filter((e) => e.path.join(".") === path)
    .map((e) => e.message)
    .join(". ");
