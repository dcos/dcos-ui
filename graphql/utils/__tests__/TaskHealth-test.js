jest.unmock('../TaskHealth');

import getTaskHealth, {
  getTaskHealthFromMesos,
  getTaskHealthFromMarathon
} from '../TaskHealth';

describe('getTaskHealthFromMesos()', () => {

  it('returns null if no task.statuses', () => {
    expect(getTaskHealthFromMesos({})).toBeNull();
  });

  it('returns null if length of statuses === 0', () => {
    let task = {
      statuses: []
    };

    expect(getTaskHealthFromMesos(task)).toBeNull();
  });

  it('returns null if health is undefined on a status', () => {
    let task = {
      statuses: [
        {
          healthy: true
        },
        {
          healthy: false
        },
        {
          foo: 'bar'
        }
      ]
    };

    expect(getTaskHealthFromMesos(task)).toBeNull();
  });

  it('returns true if a status reports healthy', () => {
    let task = {
      statuses: [
        {
          healthy: false
        },
        {
          healthy: true
        },
        {
          healthy: false
        }
      ]
    };

    expect(getTaskHealthFromMesos(task)).toEqual(true);
  });

  it('returns false if no status reports healthy', () => {
    let task = {
      statuses: [
        {
          healthy: false
        },
        {
          healthy: false
        },
        {
          healthy: false
        }
      ]
    };

    expect(getTaskHealthFromMesos(task)).toEqual(false);
  });
});

describe('getTaskHealthFromMarathon()', () => {

  it('returns null if no healthCheckResults', () => {
    expect(getTaskHealthFromMarathon({})).toBeNull();
  });

  it('returns null if length of healthCheckResults === 0', () => {
    let task = {
      healthCheckResults: []
    };

    expect(getTaskHealthFromMarathon(task)).toBeNull();
  });

  it('returns true if all healthCheckResults report alive', () => {
    let task = {
      healthCheckResults: [
        {
          alive: true
        },
        {
          alive: true
        },
        {
          alive: true
        }
      ]
    };

    expect(getTaskHealthFromMarathon(task)).toEqual(true);
  });

  it('returns false if any healthCheckResult reports alive=false', () => {
    let task = {
      healthCheckResults: [
        {
          healthy: true
        },
        {
          healthy: false
        },
        {
          healthy: true
        }
      ]
    };

    expect(getTaskHealthFromMarathon(task)).toEqual(false);
  });
});

describe('getTaskHealth()', () => {

  it('returns "Created" if mesos state is TASK_CREATED', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_CREATED'
      }
    })).toEqual('Created');
  });

  it('returns "Staging" if mesos state is TASK_STAGING', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_STAGING'
      }
    })).toEqual('Staging');
  });

  it('returns "Starting" if mesos state is TASK_STARTING', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_STARTING'
      }
    })).toEqual('Starting');
  });

  it('returns "Started" if mesos state is TASK_STARTED', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_STARTED'
      }
    })).toEqual('Started');
  });

  it('returns "Running" if mesos state is TASK_RUNNING', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_RUNNING'
      }
    })).toEqual('Running');
  });

  it('returns "Killing" if mesos state is TASK_KILLING', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_KILLING'
      }
    })).toEqual('Killing');
  });

  it('returns "Finished" if mesos state is TASK_FINISHED', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_FINISHED'
      }
    })).toEqual('Finished');
  });

  it('returns "Killed" if mesos state is TASK_KILLED', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_KILLED'
      }
    })).toEqual('Killed');
  });

  it('returns "Failed" if mesos state is TASK_FAILED', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_FAILED'
      }
    })).toEqual('Failed');
  });

  it('returns "Lost" if mesos state is TASK_LOST', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_LOST'
      }
    })).toEqual('Lost');
  });

  it('returns "Error" if mesos state is TASK_ERROR', () => {
    expect(getTaskHealth({
      mesos: {
        state: 'TASK_ERROR'
      }
    })).toEqual('Error');
  });

  it('returns "Healthy" if getTaskHealthFromMesos() returns true', () => {
    expect(getTaskHealth({
      mesos: {
        state: "TASK_CREATED",
        statuses: [
          {
            healthy: true
          }
        ]
      }
    })).toEqual('Healthy');
  });

  it('returns "Unhealthy" if getTaskHealthFromMesos() returns false', () => {
    expect(getTaskHealth({
      mesos: {
        state: "TASK_CREATED",
        statuses: [
          {
            healthy: false
          }
        ]
      }
    })).toEqual('Unhealthy');
  });

  it('returns "Healthy" if getTaskHealthFromMarathon() returns true', () => {
    expect(getTaskHealth({
      mesos: {
        state: "TASK_CREATED"
      },
      marathon: {
        healthCheckResults: [
          {
            alive: true
          }
        ]
      }
    })).toEqual('Healthy');
  });

  it('returns "Unhealthy" if getTaskHealthFromMarathon() returns false', () => {
    expect(getTaskHealth({
      mesos: {
        state: "TASK_CREATED"
      },
      marathon: {
        healthCheckResults: [
          {
            alive: false
          }
        ]
      }
    })).toEqual('Unhealthy');
  });

  it('prioritizes health result from mesos over marathon', () => {
    expect(getTaskHealth({
      mesos: {
        state: "TASK_CREATED",
        statuses: [
          {
            healthy: true
          }
        ]
      },
      marathon: {
        healthCheckResults: [
          {
            alive: false
          }
        ]
      }
    })).toEqual('Healthy');
  });

});
