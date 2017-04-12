const Status = `
  enum HEALTH {
    Healthy
    Unhealthy
    Created
    Staging
    Starting
    Started
    Running
    Killing
    Finished
    Killed
    Failed
    Lost
    Error
  }
`;

export default () => [Status];
