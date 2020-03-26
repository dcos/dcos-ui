import { supportsWebCryptography } from "#SRC/js/utils/crypto";

const UID_REGEXP = /^[a-zA-Z0-9-_@\.]+$/;
const UID_MAXLEN = 96;
const SECRET_REGEXP = /^(\/?[a-zA-Z0-9-_])+$/;

const ERROR_CODES_TO_DEFINITION_NAME: { [index: string]: string } = {
  ERR_INVALID_PUBLIC_KEY: "public_key",
  ERR_USER_EXISTS: "uid",
  ERR_INVALID_USER_ID: "uid",
  ERR_INVALID_DATA: "description",
  DEFAULT: "uid",
};

export interface ServiceAccountFormData {
  description?: string;
  uid?: string;
  public_key?: string;
  key_method?: "auto-generate" | "manual";
  secret_path?: string;
  private_key?: string;
}

export type Errors = {
  [prop in keyof ServiceAccountFormData]: React.ReactNode;
} & {
  unanchored?: React.ReactNode;
} & { [index: string]: React.ReactNode };

export function hasErrors(errors: any): boolean {
  return typeof errors === "object" && !!Object.keys(errors).length;
}

export function requiredFieldPresent(
  fieldName: keyof ServiceAccountFormData,
  formData: ServiceAccountFormData
): boolean {
  // Returns true if required field is present in form data,
  // false otherwise.
  return Boolean(
    formData &&
      fieldName &&
      formData[fieldName] != null &&
      (formData[fieldName] as string).trim() !== ""
  );
}

export function getErrors(errorCode: string, errorMsg: string): Errors {
  const errors: Errors = {};
  if (!errorCode || !errorMsg) {
    return errors;
  }
  errors[
    ERROR_CODES_TO_DEFINITION_NAME[errorCode] ||
      ERROR_CODES_TO_DEFINITION_NAME.DEFAULT
  ] = errorMsg;

  return errors;
}

export function validUid(uid: string | undefined): boolean {
  return (
    typeof uid === "string" && uid.length <= UID_MAXLEN && UID_REGEXP.test(uid)
  );
}

export function validSecretPath(path: string | undefined): boolean {
  return typeof path === "string" && SECRET_REGEXP.test(path);
}

export function defaultFormData(): ServiceAccountFormData {
  return {
    description: "",
    uid: "",
    public_key: "",
    key_method: supportsWebCryptography() ? "auto-generate" : "manual",
  };
}
