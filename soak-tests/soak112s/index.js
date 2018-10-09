const puppeteer = require("puppeteer");

const ROUTING_PREFIX = "/#/";

const {
  CLUSTER_URL = "https://leader.mesos",
  METRIC_POLL_INTERVAL = 1000,
  USERNAME,
  PASSWORD
} = process.env;

if (!USERNAME || !PASSWORD) {
  throw new Error("USERNAME and PASSWORD environment variable is required");
}

const PAGES = process.env.PAGES
  ? JSON.parse(process.env.PAGES)
  : [
      "dashboard",
      "services/overview",
      "jobs/overview",
      "nodes/agents/table",
      "nodes/masters",
      "secrets"
    ];

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: [
        // Required for Docker version of Puppeteer
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        "--disable-dev-shm-usage"
      ]
    });

    await Promise.all(
      PAGES.map(visitPath).map(async visitor => {
        const page = await browser.newPage();
        await loggedInPage(page);
        await visitor(page);
        pollMetricsForPage(page);
      })
    );

    await waitForAbort();
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

async function loggedInPage(page) {
  try {
    await page.goto(CLUSTER_URL, { waitUntil: "networkidle2" });
    await page.waitForSelector(".modal", {
      timeout: 300000
    });

    await page.type("[name=uid]", USERNAME);
    await page.type("[name=password]", PASSWORD);
    await page.click("button.button-primary");
    await page.waitForNavigation();

    return page;
  } catch (err) {
    console.warn(err);
    await page.goto("about:blank", { waitUntil: "networkidle2" });

    return loggedInPage(page);
  }
}

function visitPath(path) {
  return async page => {
    await page.goto(CLUSTER_URL + ROUTING_PREFIX + path, {
      waitUntil: "networkidle2"
    });
    await page.waitForNavigation();

    return page;
  };
}

function pollMetricsForPage(page, interval = METRIC_POLL_INTERVAL) {
  setInterval(async () => {
    try {
      const metrics = await page.metrics();
      console.log(JSON.stringify({ ...metrics, url: getUrlPath(page) }));
    } catch (err) {
      // TODO: Investigate why this happens so often
      console.error("Could not poll metrics for", getUrlPath(page), err);
      process.exit(1);
    }
  }, interval);
}

function getUrlPath(page) {
  const url = page.url();

  return url
    .substring(0, url.indexOf("?"))
    .replace(CLUSTER_URL.toLocaleLowerCase() + ROUTING_PREFIX, "");
}

function waitForAbort() {
  return new Promise(resolve => {
    process.on("SIGTERM", resolve);
  });
}
