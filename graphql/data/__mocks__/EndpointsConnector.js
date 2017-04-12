import MarathonConnector from '../marathon/MarathonConnector';
import MesosConnector from '../mesos/MesosConnector';

export default function EndpointsConnector(mockResponse) {
  const {marathon = {}, mesos = {}} = mockResponse;

  return {
    marathon: new MarathonConnector(marathon),
    mesos: new MesosConnector(mesos)
  };
}
