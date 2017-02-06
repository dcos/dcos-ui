# Steps For Video recording

## Setup
1. Launch a DC/OS OSS cluster with 0 public nodes and 10 private nodes for 1 hour.
2. SSH into two of the Nodes and run the following command to mark them as unhealthy, only run one of the commands in each node
  * `systemctl stop dcos-log-agent.service`
  * `systemctl stop dcos-mesos-slave.service`
3. Start these services
   * ```
   {
     "id": "/dev-agility/alice/web-service",
     "instances": 1,
     "mem": 2500,
     "cpus": 3,
     "cmd": "sleep 10",
     "disk": 10000
   }
   ```
   * ```
   {
     "id": "/marketing/email-outreach",
     "instances": 1,
     "mem": 5000,
     "cpus": 1.5,
     "cmd": "sleep 6",
     "disk": 20000
   }
   ```
   * ```
   {
     "id": "/sales/analytics-report",
     "instances": 1,
     "mem": 5000,
     "cpus": 99,
     "cmd": "sleep 6",
     "disk": 20000
   }
   ```
4. Install the following services
  * Jenkins
  * Cassandra
  * Marathon
5. Before setp 5, be ready to record the video. Use cloudapp to create gif
6. Install Kafka

## Record
1. Begin looking at the dashboard, hover over graphs, they should show allocation going up and down.
2. Go to Services
3. Click on Kafka
4. Go to the Broker task
5. Go to the Logs and scroll
6. Go to Universe
7. Go to the Nodes page
