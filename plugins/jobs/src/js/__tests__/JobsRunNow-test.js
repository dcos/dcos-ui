import { Observable } from "rxjs";
import { marbles } from "rxjs-marbles/jest";
import { resolvers } from "../data/JobModel";
import * as jobsRunNow from "../JobsRunNow";

describe("Jobs Run Now Action", function() {
  describe("#runAction", function() {
    it("runNowEvent call is made with onItemSelect", function(done) {
      const jobsRunNowAction = jobsRunNow.jobsRunNowAction("test");
      jobsRunNow.runNowEvent$.subscribe(job => {
        expect(job.id).toBe("test");
        done();
      });
      jobsRunNowAction.onItemSelect();
    });

    it(
      "returns the jobId",
      marbles(m => {
        m.bind();
        const result$ = resolvers({
          fetchJobDetail: () => Observable.of({ id: "foo" }),
          pollingInterval: m.time("-|"),
          runJob: () => Observable.of({ jobId: "foo" })
        }).Mutation.runJob({}, { id: "foo" });

        m.expect(result$.take(1)).toBeObservable(
          m.cold("(x|)", {
            x: { jobId: "foo" }
          })
        );
      })
    );
  });
});
