import { FormError } from "./JobFormData";

/**
 * Translates message in each error in array.
 * Error messages must be marked using i18nMark.
 */
export function translateErrorMessages(errors: FormError[], i18n: any) {
  const errorCopy = errors.slice();
  if (!i18n) {
    return errorCopy;
  }

  return errorCopy.map(e => {
    return {
      ...e,
      message: i18n._(e.message)
    };
  });
}
