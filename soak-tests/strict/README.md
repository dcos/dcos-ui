# DC/OS UI Soak Test

To deploy run the `./build.sh` script. It will publish a new version on
dockerhub.

## Environment variables

- `CLUSTER_URL`: defaults to `https://leader.mesos` (must not contain trailing slash)
- `USERNAME`: used to log in (required)
- `PASSWORD`: used to log in (required)
- `METRIC_POLL_INTERVAL`: defaults to `1000` (one second)
- `REFRESH_INTERVAL`: defaults to 5 minutes
- `PAGES`: JSON array of paths to visit (defaults to most commonly used pages)

## Testing locally

`CLUSTER_URL='<ee-cluster-url>' USERNAME='bootstrapuser' PASSWORD='deleteme' node ./index.js`

## Deploying the Soak test to a DC/OS cluster

1. [Get the cluster access to dockerhub](https://docs.mesosphere.com/1.12/deploying-services/private-docker-registry/#step-2-add-the-secret-to-your-service-or-pod-definition)

- Please note that the email mentioned is your dockerhub username, so it should be `echo -n 'username:password' | base64`
- If you want to follow along with this instruction you should name the secret "dockerhub"

2. Install the [marathon.json](./marathon.json) to the cluster

- You will need to fill in the `USERNAME` and `PASSWORD` environment variables
