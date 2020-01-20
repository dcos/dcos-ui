const puppeteer = require("puppeteer");
const lynx = require("lynx");

const ROUTING_PREFIX = "/#/";

const {
  CLUSTER_URL = "https://leader.mesos",
  METRIC_POLL_INTERVAL = 1000,
  REFRESH_INTERVAL = 5 * 60 * 1000,
  USERNAME,
  PASSWORD,
  STATSD_PREFIX = "ui",
  STATSD_UDP_PORT,
  STATSD_UDP_HOST
} = process.env;

if (!USERNAME || !PASSWORD) {
  throw new Error("USERNAME and PASSWORD environment variable is required");
}

const metrics =
  STATSD_UDP_HOST && STATSD_UDP_PORT
    ? new lynx(STATSD_UDP_HOST, STATSD_UDP_PORT, {
        prefix: STATSD_PREFIX
      })
    : null;

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

const cleanupTasks = [];
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received, cleaning up");
  cleanupTasks.forEach(task => task());
  console.log("Cleanup is done");
});

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

    if (metrics) {
      metrics.increment("browsers");
      cleanupTasks.push(() => {
        metrics.decrement("browsers");
      });
    }

    const page = await browser.newPage();
    await loggedInPage(page);
    console.info("Logged in");

    await Promise.all(
      PAGES.map(visitPath).map(async ({ visitor, path }) => {
        const page = await browser.newPage();
        await visitor(page);
        if (metrics) {
          metrics.increment(`page_${sanitizeKeyName(path)}`);
          cleanupTasks.push(() => {
            metrics.decrement(`page_${sanitizeKeyName(path)}`);
          });
        }
        pollMetricsForPage(path, page);
        refreshPage(path, page);
      })
    );

    await waitForAbort();
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
    if (metrics) {
      cleanupTasks.push(() => {
        metrics.close();
      });
    }
  }
})();

async function loggedInPage(page) {
  try {
    await page.goto(CLUSTER_URL, { timeout: 3000001 });
    await page.waitForSelector(".modal", { timeout: 300002 });

    await page.type("[name=uid]", USERNAME);
    await page.type("[name=password]", PASSWORD);
    await page.click("button.button-primary");
    await page.waitForNavigation({ timeout: 3000003 });

    return page;
  } catch (err) {
    console.warn(err);
    await page.goto("about:blank", { waitUntil: "networkidle2" });

    return loggedInPage(page);
  }
}

function visitPath(path) {
  console.info(`Visiting: ${path}`);
  const errHandler = err => console.log("Page error: " + err.toString());

  const visitor = async page => {
    try {
      page.on("pageerror", errHandler);

      await page.goto(CLUSTER_URL + ROUTING_PREFIX + path, {
        waitUntil: "load",
        timeout: 3000004
      });

      return page;
    } catch (err) {
      console.error(`Visiting: ${path} was not successful: `, err);

      throw err;
    }
  };

  return { visitor, path };
}

function refreshPage(path, page, interval = REFRESH_INTERVAL) {
  setInterval(async () => {
    console.error(`Refreshing: ${path}`);

    try {
      await page.goBack();
      await page.goForward();
    } catch (err) {
      console.error(err);
    }
  }, interval);
}

function pollMetricsForPage(path, page, interval = METRIC_POLL_INTERVAL) {
  console.info(`Polling metrics for: ${path}`);

  setInterval(async () => {
    try {
      const pageMetrics = await page.metrics();
      console.log("Metrics", JSON.stringify({ ...pageMetrics, url: path }));

      if (metrics) {
        Object.entries(pageMetrics)
          .filter(([metricName]) => metricName !== "Timestamp")
          .forEach(([metricName, metricValue]) => {
            console.log(
              "Sending metric",
              `metric_${sanitizeKeyName(
                path
              )}_${metricName.toLocaleLowerCase()}`,
              metricValue
            );
            metrics.gauge(
              `metric_${sanitizeKeyName(
                path
              )}_${metricName.toLocaleLowerCase()}`,
              metricValue
            );
          });
      }
    } catch (err) {
      console.error("Could not poll metrics for", path, err);
      process.exit(1);
    }
  }, interval);
}

function waitForAbort() {
  return new Promise(resolve => {
    process.on("SIGTERM", resolve);
  });
}

// From https://github.com/etsy/statsd/blob/8d5363cb109cc6363661a1d5813e0b96787c4411/stats.js#L170-L172
function sanitizeKeyName(key) {
  return key
    .replace(/\s+/g, "_")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z_\-0-9.]/g, "");
}
