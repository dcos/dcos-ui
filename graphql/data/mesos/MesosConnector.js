import StateConnector from './state/state';

export default function MesosConnector(authToken) {
  return {
    state: new StateConnector({ authToken })
  };
}
