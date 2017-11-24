import {
  GET_AGENTS,
  AGENT_ADDED,
  AGENT_REMOVED
} from "../../../constants/MesosStreamMessageTypes";
import { scalar } from "./ProtobufUtil";

function processAgent(agentMessage) {
  let agent = agentMessage;

  // recovering_agents consist only of AgentInfo
  if (agentMessage.agent_info) {
    const { agent_info, ...rest } = agentMessage;
    agent = { ...agent_info, ...rest };
  }

  agent.id = scalar(agent.id);

  return agent;
}

export function getAgentsAction(state, message) {
  if (message.type !== GET_AGENTS) {
    return state;
  }

  const agents = Object.keys(message.get_agents).reduce((acc, key) => {
    return acc.concat(message.get_agents[key].map(processAgent));
  }, []);

  return Object.assign({}, state, { slaves: agents });
}

export function agentAddedAction(state, message) {
  if (message.type !== AGENT_ADDED) {
    return state;
  }

  const agent = processAgent(message.agent_added.agent);

  return Object.assign({}, state, { slaves: [...state.slaves, agent] });
}

export function agentRemovedAction(state, message) {
  if (message.type !== AGENT_REMOVED) {
    return state;
  }

  const removedAgent = processAgent(message.agent_removed.agent);
  const slaves = state.slaves.filter(agent => removedAgent.id !== agent.id);

  return Object.assign({}, state, { slaves });
}
