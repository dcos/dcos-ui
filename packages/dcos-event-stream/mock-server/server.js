import express from "express";
import fs from "fs";
import path from "path";

const app = express();

const subscribeTxt = fs.readFileSync(
  path.resolve(__dirname, "./data/subscribe.txt"),
  "utf-8"
);
const heartbeatTxt = fs.readFileSync(
  path.resolve(__dirname, "./data/heartbeat.txt"),
  "utf-8"
);

app.get("/", (req, res) => {
  res.write("Mock Server Running\n");
  res.write("POST /mesos/api/v1 to connect to stream\n");
  res.end();
});

app.post("/mesos/api/v1", (req, res) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.write(`${subscribeTxt}`);
  setInterval(function() {
    console.log(heartbeatTxt);
    res.write(`${heartbeatTxt}`);
    // res.flushHeaders();
  }, 5000);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
