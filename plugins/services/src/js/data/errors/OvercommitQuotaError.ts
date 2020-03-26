const OVERCOMMIT_ERROR_CHECK = "this is more than the requested limits";

export interface OvercommittedQuotaResource {
  resourceName: string;
  consumed: number;
  requestedLimit: number;
}

const MESSAGE_REGEX = /is\salready\sconsuming\s\'(.*)\'\;\sthis\sis\smore\sthan\sthe\srequested\slimits\s\'(.*)\'\s\(/;

function parseResources(resources: string): Record<string, number> {
  const result: Record<string, number> = {};
  return resources
    .split(" ")
    .map((rs) => rs.replace(";", ""))
    .map((rs) => {
      const parts = rs.split(":");
      if (parts.length < 2) {
        return null;
      }
      return {
        resourceName: parts[0],
        value: parseFloat(parts[1]),
      };
    })
    .reduce((resources, resource) => {
      if (resource !== null && !Number.isNaN(resource.value)) {
        resources[resource.resourceName] = resource.value;
      }
      return resources;
    }, result);
}

function parseResourcesFromMessage(
  message: string
): OvercommittedQuotaResource[] {
  const result: OvercommittedQuotaResource[] = [];
  const matches: RegExpMatchArray | null = message.match(MESSAGE_REGEX);
  if (!matches || matches.length < 3) {
    return result;
  }
  const consumedResourcesString = matches[1];
  const limitedResourcesString = matches[2];
  const consumedResources = parseResources(consumedResourcesString);
  const limitedResources = parseResources(limitedResourcesString);
  Object.keys(consumedResources).forEach((resourceName) => {
    if (!(resourceName in limitedResources)) {
      return;
    }
    const consumed = consumedResources[resourceName];
    const requestedLimit = limitedResources[resourceName];
    if (consumed > requestedLimit) {
      result.push({
        resourceName,
        consumed,
        requestedLimit,
      });
    }
  });

  return result;
}

export class OvercommitQuotaError extends Error {
  public static isOvercommitError(message: string): boolean {
    return message.includes(OVERCOMMIT_ERROR_CHECK);
  }
  public readonly responseCode: number;
  public readonly overcommittedResources: OvercommittedQuotaResource[];
  constructor(message: string, code: number = 400) {
    super(message);
    this.name = "OvercommitQuotaError";
    this.responseCode = code;
    this.overcommittedResources = parseResourcesFromMessage(message);
  }
}
