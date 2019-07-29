// @ts-ignore
import { request } from "@dcos/mesos-client";

import Node from "#SRC/js/structs/Node";

interface MesosDrainAgentOptions {
  max_grace_period?: { seconds: number };
  mark_gone?: { value: boolean };
}

const NodeMaintenanceActions = {
  reactivateNode: (
    node: Node,
    {
      onSuccess,
      onError
    }: {
      onSuccess: () => void;
      onError: ({ code, message }: { code: number; message: string }) => void;
    }
  ) => {
    return request({
      type: "REACTIVATE_AGENT",
      reactivate_agent: {
        agent_id: { value: node.getID() }
      }
    }).subscribe({
      next: onSuccess,
      error: onError
    });
  },
  deactivateNode: (
    node: Node,
    {
      onSuccess,
      onError
    }: {
      onSuccess: () => void;
      onError: ({ code, message }: { code: number; message: string }) => void;
    }
  ) => {
    return request({
      type: "DEACTIVATE_AGENT",
      deactivate_agent: {
        agent_id: { value: node.getID() }
      }
    }).subscribe({
      next: onSuccess,
      error: onError
    });
  },
  drainNode: (
    node: Node,
    drainOptions: {
      maxGracePeriod: number | null;
      decommission: boolean;
    },
    {
      onSuccess,
      onError
    }: {
      onSuccess: () => void;
      onError: ({ code, message }: { code: number; message: string }) => void;
    }
  ) => {
    const options: MesosDrainAgentOptions = {};
    if (drainOptions.maxGracePeriod) {
      options.max_grace_period = {
        seconds: drainOptions.maxGracePeriod
      };
    }

    if (drainOptions.decommission) {
      options.mark_gone = { value: true };
    }

    return request({
      type: "DRAIN_AGENT",
      drain_agent: { agent_id: { value: node.getID() } },
      ...options
    }).subscribe({
      next: onSuccess,
      error: onError
    });
  }
};

export { NodeMaintenanceActions as default };
