import { request } from "@dcos/http-service";
import Config from "#SRC/js/config/Config";

export const fetchRepositories = type =>
  request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/list`, {
    method: "POST",
    body: JSON.stringify({ type }),
    headers: {
      Accept: "application/vnd.dcos.package.repository.list-response+json;charset=utf-8;version=v1",
      "Content-Type": "application/vnd.dcos.package.repository.list-request+json;charset=utf-8;version=v1"
    }
  });

export const addRepository = (name, uri, index) =>
  request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/add`, {
    method: "POST",
    body: JSON.stringify({ name, uri, index }),
    headers: {
      Accept: "application/vnd.dcos.package.repository.add-response+json;charset=utf-8;version=v1",
      "Content-Type": "application/vnd.dcos.package.repository.add-request+json;charset=utf-8;version=v1"
    }
  });

export const deleteRepository = (name, uri) =>
  request(`${Config.rootUrl}${Config.cosmosAPIPrefix}/repository/delete`, {
    method: "POST",
    body: JSON.stringify({ name, uri }),
    headers: {
      Accept: "application/vnd.dcos.package.repository.delete-response+json;charset=utf-8;version=v1",
      "Content-Type": "application/vnd.dcos.package.repository.delete-request+json;charset=utf-8;version=v1"
    }
  });
