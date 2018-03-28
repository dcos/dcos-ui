import * as httpService from "@dcos/http-service";
import Rx from "rxjs";
import Config from "#SRC/js/config/Config";
import {
  fetchRepositories,
  addRepository,
  deleteRepository
} from "../repositoriesStream";

jest.mock("@dcos/http-service");

describe("#fetchRepositories", function() {
  it("makes the call with correct arguments", function(done) {
    const spy = jest
      .spyOn(httpService, "request")
      .mockReturnValueOnce(Rx.Observable.of(""));

    fetchRepositories().subscribe(function() {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/list",
      {
        method: "POST",
        body: "{}",
        headers: {
          Accept: "application/vnd.dcos.package.repository.list-response+json;charset=utf-8;version=v1",
          "Content-Type": "application/vnd.dcos.package.repository.list-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });
});

describe("#addRepository", function() {
  it("makes the call with correct arguments", function(done) {
    const spy = jest
      .spyOn(httpService, "request")
      .mockReturnValueOnce(Rx.Observable.of(""));

    addRepository("bar", "foo", 1).subscribe(function() {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/add",
      {
        method: "POST",
        body: JSON.stringify({ name: "bar", uri: "foo", index: 1 }),
        headers: {
          Accept: "application/vnd.dcos.package.repository.add-response+json;charset=utf-8;version=v1",
          "Content-Type": "application/vnd.dcos.package.repository.add-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });
});

describe("#deleteRepository", function() {
  it("makes the call with correct arguments", function(done) {
    const spy = jest
      .spyOn(httpService, "request")
      .mockReturnValueOnce(Rx.Observable.of(""));

    deleteRepository("bar", "foo").subscribe(function() {
      done();
    });

    expect(spy).toHaveBeenCalledWith(
      Config.cosmosAPIPrefix + "/repository/delete",
      {
        method: "POST",
        body: JSON.stringify({ name: "bar", uri: "foo" }),
        headers: {
          Accept: "application/vnd.dcos.package.repository.delete-response+json;charset=utf-8;version=v1",
          "Content-Type": "application/vnd.dcos.package.repository.delete-request+json;charset=utf-8;version=v1"
        }
      }
    );
  });
});
