export function buildRequestHeader(
  action: string,
  actionType: string,
  entity: string,
  version: string
) {
  return `application/vnd.dcos.${entity}.${action}-${actionType}+json;charset=utf-8;version=${version}`;
}
