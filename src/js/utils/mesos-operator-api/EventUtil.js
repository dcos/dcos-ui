const EventTypes = {
  ADD: 1,
  UPDATE: 2,
  REMOVE: 3
};

module.exports = EventTypes;

const generateEvent = function(type, path, value = undefined) {
  return {
    type,
    path,
    value
  };
};

const generateEventsFromFields = function(obj, fields, baseType, id) {
  const ret = [];
  fields.forEach(function(field) {
    if (obj[field]) {
      if (obj[field] instanceof Array) {
        obj[field].forEach(function(item) {
          ret.push(
            generateEvent(EventTypes.UPDATE, [baseType, id, field], [item])
          );
        });
      } else {
        ret.push(
          generateEvent(EventTypes.UPDATE, [baseType, id, field], obj[field])
        );
      }
    }
  });

  return ret;
};

const EventUtil = {
  generateEventsFromTask(task, update) {
    const ret = [];
    const taskId = task["task_id"]["value"];
    if (!update) {
      ret.push(generateEvent(EventTypes.ADD, ["TASK", taskId]));
    }
    ret.push(
      generateEvent(
        EventTypes.UPDATE,
        ["TASK", taskId, "agent_id"],
        task["agent_id"]["value"]
      )
    );
    ret.push(
      generateEvent(
        EventTypes.UPDATE,
        ["TASK", taskId, "framework_id"],
        task["framework_id"]["value"]
      )
    );
    const fields = [
      "name",
      "state",
      "statuses",
      "resources",
      "container",
      "discovery"
    ];

    ret.push.apply(ret, generateEventsFromFields(task, fields, "TASK", taskId));

    return ret;
  },

  generateEventsFromTaskUpdate(taskUpdate) {
    const ret = [];
    const taskId = taskUpdate["status"]["task_id"]["value"];

    const fields = ["status"];

    ret.push.apply(
      ret,
      generateEventsFromFields(taskUpdate, fields, "TASK", taskId)
    );

    return ret;
  },

  generateEventsFromFramework(framework, update) {
    const ret = [];
    const frameworkId = framework["framework_info"]["id"]["value"];

    if (!update) {
      ret.push(generateEvent(EventTypes.ADD, ["FRAMEWORK", frameworkId]));
    }

    const fields = [
      "name",
      "active",
      "connected",
      "recover",
      "resources",
      "registered_time",
      "unregistered_time"
    ];
    ret.push.apply(
      ret,
      generateEventsFromFields(framework, fields, "FRAMEWORK", frameworkId)
    );

    ret.push.apply(
      ret,
      EventUtil.generateEventsFromFrameworkInfo(framework["framework_info"])
    );

    return ret;
  },

  generateEventsFromFrameworkInfo(framework_info) {
    const ret = [];
    const frameworkId = framework_info["id"]["value"];

    const fields = [
      "hostname",
      "failover_timeout",
      "checkpoint",
      "name",
      "principal",
      "role",
      "user",
      "webui_url"
    ];

    ret.push.apply(
      ret,
      generateEventsFromFields(framework_info, fields, "FRAMEWORK", frameworkId)
    );

    return ret;
  },

  generateEventsFromFrameworkRemoved(framework_removed) {
    const ret = [];
    const frameworkId = framework_removed["framework_info"]["id"]["value"];

    ret.push(generateEvent(EventTypes.REMOVE, ["FRAMEWORK", frameworkId]));

    return ret;
  },

  generateEventsFromAgent(agent, update) {
    const ret = [];
    const agentId = agent["agent_info"]["id"]["value"];
    if (!update) {
      ret.push(generateEvent(EventTypes.ADD, ["AGENT", agentId]));
    }

    const fields = [
      "active",
      "version",
      "capabilities",
      "offered_resources",
      "registered_time",
      "unregistered_time",
      "total_resources"
    ];

    ret.push.apply(
      ret,
      generateEventsFromFields(agent, fields, "AGENT", agentId)
    );

    ret.push.apply(
      ret,
      EventUtil.generateEventsFromAgentInfo(agent["agent_info"])
    );

    return ret;
  },

  generateEventsFromAgentInfo(agent_info) {
    const ret = [];
    const agentId = agent_info["id"]["value"];

    const fields = ["hostname", "port", "resources"];

    ret.push.apply(
      ret,
      generateEventsFromFields(agent_info, fields, "AGENT", agentId)
    );

    return ret;
  },

  generateEventsFromAgentRemoved(agent_removed) {
    const ret = [];
    const agentId = agent_removed["agent_info"]["id"]["value"];

    ret.push(generateEvent(EventTypes.REMOVE, ["AGENT", agentId]));

    return ret;
  },

  generateEventsFromSubscribed(state) {
    const ret = [];
    const agents = state["get_agents"]["agents"];
    if (agents) {
      agents.forEach(function(agent) {
        ret.push.apply(ret, EventUtil.generateEventsFromAgent(agent, false));
      });
    }

    const frameworks = state["get_frameworks"]["frameworks"];
    if (frameworks) {
      frameworks.forEach(function(framework) {
        ret.push.apply(
          ret,
          EventUtil.generateEventsFromFramework(framework, false)
        );
      });
    }

    const completed_frameworks =
      state["get_frameworks"]["completed_frameworks"];
    if (completed_frameworks) {
      completed_frameworks.forEach(function(framework) {
        ret.push.apply(
          ret,
          EventUtil.generateEventsFromFramework(framework, false)
        );
      });
    }

    const tasks = state["get_tasks"]["tasks"];
    if (tasks) {
      tasks.forEach(function(task) {
        ret.push.apply(ret, EventUtil.generateEventsFromTask(task, false));
      });
    }

    const completed_tasks = state["get_tasks"]["completed_tasks"];
    if (completed_tasks) {
      completed_tasks.forEach(function(task) {
        ret.push.apply(ret, EventUtil.generateEventsFromTask(task, false));
      });
    }

    return ret;
  }
};

module.exports = EventUtil;
