import AgentStore from './agents';
import FrameworkStore from './frameworks';
import GroupsStore from './groups';
import TaskStore from './tasks';

export default function createStore(endpoints) {
  return {
    Agents: new AgentStore({ endpoints }),
    Frameworks: new FrameworkStore({ endpoints }),
    Groups: new GroupsStore({ endpoints }),
    Tasks: new TaskStore({ endpoints })
  };
}
