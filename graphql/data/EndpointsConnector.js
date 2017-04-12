import MarathonConnector from './marathon/MarathonConnector';
import MesosConnector from './mesos/MesosConnector';

export default function EndpointsConnector(authToken) {
  return {
    marathon: new MarathonConnector(authToken),
    mesos: new MesosConnector(authToken)
  };
}
