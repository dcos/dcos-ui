import * as httpService from "@dcos/http-service";
import { of } from "rxjs";
import Config from "#SRC/js/config/Config";
import {
  fetchRepositories,
  liveFetchRepositories,
  addRepository,
  deleteRepository
} from "../PackageRepositoryClient";

jest.mock("@dcos/http-service");

describe("#fetchRepositories", () => {
  it("makes the call with correct arguments", done => {
    const spy = jest.spyOn(httpService, "request").mockReturnValueOnce(of(""));

    fetchRepositories().subscribe(() => {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/list",
      {
        method: "POST",
        body: "{}",
        headers: {
          Accept:
            "application/vnd.dcos.package.repository.list-response+json;charset=utf-8;version=v1",
          "Content-Type":
            "application/vnd.dcos.package.repository.list-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });
});

describe("#liveFetchRepositories", () => {
  it("makes the call with correct arguments", done => {
    const spy = jest.spyOn(httpService, "request").mockReturnValueOnce(of(""));

    liveFetchRepositories().subscribe(() => {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/list",
      {
        method: "POST",
        body: "{}",
        headers: {
          Accept:
            "application/vnd.dcos.package.repository.list-response+json;charset=utf-8;version=v1",
          "Content-Type":
            "application/vnd.dcos.package.repository.list-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });
});

describe("#addRepository", () => {
  it("makes the call with correct arguments", done => {
    const spy = jest.spyOn(httpService, "request").mockReturnValue(of(""));

    addRepository("bar", "foo", 1).subscribe(() => {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/add",
      {
        method: "POST",
        body: JSON.stringify({ name: "bar", uri: "foo", index: 1 }),
        headers: {
          Accept:
            "application/vnd.dcos.package.repository.add-response+json;charset=utf-8;version=v1",
          "Content-Type":
            "application/vnd.dcos.package.repository.add-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });

  it("triggers #liveFetchRepositories", done => {
    jest.spyOn(httpService, "request").mockReturnValue(of(""));

    addRepository("bar", "foo", 1).subscribe(() => {});

    let fetchTriggerTimes = 0;
    liveFetchRepositories().subscribe(() => {
      fetchTriggerTimes += 1;
      if (fetchTriggerTimes === 2) {
        done();
      }
    });

    addRepository("bar", "foo", 1).subscribe();
    expect(fetchTriggerTimes).toBe(2);
  });
});

describe("#deleteRepository", () => {
  it("makes the call with correct arguments", done => {
    const spy = jest.spyOn(httpService, "request").mockReturnValue(of(""));

    deleteRepository("bar", "foo").subscribe(() => {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/delete",
      {
        method: "POST",
        body: JSON.stringify({ name: "bar", uri: "foo" }),
        headers: {
          Accept:
            "application/vnd.dcos.package.repository.delete-response+json;charset=utf-8;version=v1",
          "Content-Type":
            "application/vnd.dcos.package.repository.delete-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });

  it("triggers #liveFetchRepositories", done => {
    jest.spyOn(httpService, "request").mockReturnValue(of(""));

    addRepository("bar", "foo", 1).subscribe(() => {});

    let fetchTriggerTimes = 0;
    liveFetchRepositories().subscribe(() => {
      fetchTriggerTimes += 1;
      if (fetchTriggerTimes === 2) {
        done();
      }
    });

    deleteRepository("bar", "foo").subscribe(() => {});
    expect(fetchTriggerTimes).toBe(2);
  });
});
