import { setupWorker, rest } from "msw";

const memo = {};
const fx_ = (name) => {
  memo[name] = memo[name] || require(`../../tests/_fixtures/${name}.json`);
  return memo[name];
};
const fx = (name) => (_, res, ctx) => res(ctx.json(fx_(name)));

setupWorker(
  rest.get("/dcos-metadata/ui-config.json", fx("config/no-plugins")),
  rest.get("/dcos-metadata/dcos-version.json", fx("dcos/dcos-version")),
  rest.post(/mesos\/api\/v1/, (req, res, ctx) => {
    const mesosMap = {
      subscribe: "marathon-1-task/mesos-subscribe",
      GET_MASTER: "marathon-1-task/mesos-get-master",
      GET_VERSION: "v1/get-version",
      // @ts-ignore
    }[[...req.url.searchParams.keys()][0]];
    return res(ctx.json(fx_(mesosMap)));
  }),
  rest.get("/mesos/master/state-summary", fx("marathon-1-task/summary")),
  rest.get("/metadata", fx("dcos/metadata")),
  rest.get("/navstar/lashup/key", (_, res, ctx) => res(ctx.json({}))),

  rest.get("/service/marathon/v2/groups", fx("marathon-1-task/groups")),
  rest.get("/service/metronome/v1/jobs", fx("metronome/jobs")),
  rest.get("/service/metronome/v1/jobs/:id", fx("metronome/job"))
).start();

document.cookie =
  "dcos-acs-info-cookie=eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCJ9Cg=="; // {"uid":"ui-bot","description":"UI Automated Test Bot"}
// "dcos-acs-info-cookie=eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCIsImlzX3JlbW90ZSI6dHJ1ZX0K" // {"uid":"ui-bot","description":"UI Automated Test Bot","is_remote":true}
