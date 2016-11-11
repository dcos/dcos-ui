import MarathonConnector from './marathon';
import MesosConnector from './mesos';

export default function EndpointsConnector(authToken) {
  return {
    marathon: new MarathonConnector(authToken),
    mesos: new MesosConnector(authToken)
  };
}
