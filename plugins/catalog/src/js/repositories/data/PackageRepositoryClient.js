import { request } from "@dcos/http-service";
import { Subject } from "rxjs/Subject";
import Config from "#SRC/js/config/Config";
import "rxjs/add/operator/do";
import "rxjs/add/operator/concatMap";

const reloadSubject = new Subject();

export const fetchRepositories = type => {
  return reloadSubject.startWith(null).concatMap(() =>
    request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/list`, {
      method: "POST",
      body: JSON.stringify({ type }),
      headers: {
        Accept:
          "application/vnd.dcos.package.repository.list-response+json;charset=utf-8;version=v1",
        "Content-Type":
          "application/vnd.dcos.package.repository.list-request+json;charset=utf-8;version=v1"
      }
    })
  );
};

export const liveFetchRepositories = type => {
  return reloadSubject.startWith(null).concatMap(() => fetchRepositories(type));
};

export const addRepository = (name, uri, index) =>
  request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/add`, {
    method: "POST",
    body: JSON.stringify({ name, uri, index }),
    headers: {
      Accept:
        "application/vnd.dcos.package.repository.add-response+json;charset=utf-8;version=v1",
      "Content-Type":
        "application/vnd.dcos.package.repository.add-request+json;charset=utf-8;version=v1"
    }
  }).do(() => reloadSubject.next());

export const deleteRepository = (name, uri) =>
  request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/delete`, {
    method: "POST",
    body: JSON.stringify({ name, uri }),
    headers: {
      Accept:
        "application/vnd.dcos.package.repository.delete-response+json;charset=utf-8;version=v1",
      "Content-Type":
        "application/vnd.dcos.package.repository.delete-request+json;charset=utf-8;version=v1"
    }
  }).do(() => reloadSubject.next());
