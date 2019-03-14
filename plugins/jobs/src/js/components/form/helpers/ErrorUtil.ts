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

export function getFieldError(path: string, errors: FormError[]): string {
  return errors
    .filter(e => {
      const match = e.path.join(".");
      return match === path;
    })
    .map(e => e.message)
    .join(" ");
}
