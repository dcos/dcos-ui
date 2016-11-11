import StateConnector from './state';

export default function MesosConnector(authToken) {
  return {
    state: new StateConnector({ authToken })
  };
}
