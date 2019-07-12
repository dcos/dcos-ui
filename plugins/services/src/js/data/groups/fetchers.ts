//@ts-ignore
import { request, RequestResponse } from "@dcos/http-service";
import { Observable, of, from } from "rxjs";
import { map, catchError } from "rxjs/operators";

import Config from "#SRC/js/config/Config";
//@ts-ignore
import MarathonStore from "../../stores/MarathonStore";
import ServiceTree from "../../structs/ServiceTree";
import { MesosRole } from "../../types/MesosRoles";

export function fetchServiceGroups(): Observable<ServiceTree[]> {
  const serviceTree = MarathonStore.get("groups");
  if (!(serviceTree instanceof ServiceTree)) {
    return of([]);
  }
  const groups = serviceTree
    .getItems()
    .reduce((groups: ServiceTree[], item) => {
      if (item instanceof ServiceTree) {
        groups.push(item);
      }
      return groups;
    }, []);
  return of(groups);
}

export function fetchRoles(): Observable<MesosRole[]> {
  if (Config.useFixtures) {
    return rolesFromFixtures();
  }

  // We are using v0 roles endpoint here based on recommendation from the Mesos
  // Core team. The v0 endpoint should have better performance.
  return request<string>("/mesos/roles", {
    method: "GET",
    responseType: "text",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  }).pipe(
    map(({ response }: RequestResponse<string>) => response),
    map((response: string) => {
      const parsed = JSON.parse(response);
      if (parsed.roles) {
        return parsed.roles as MesosRole[];
      }
      return [];
    }),
    catchError(() => of([]))
  );
}

function rolesFromFixtures(): Observable<MesosRole[]> {
  // @ts-ignore
  const quotaRolesFixture = import(/* quotaRolesFixture */ "../../../../../../tests/_fixtures/quota-management/roles.json");
  return from(quotaRolesFixture).pipe(
    map(response => response.roles as MesosRole[])
  );
}
