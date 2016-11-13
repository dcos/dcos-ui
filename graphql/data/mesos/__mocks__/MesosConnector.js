import StateConnector from './state/state';

export default function MesosConnector(mockResponse) {
  const {state = {}} = mockResponse;

  return {
    state: new StateConnector(state)
  };
}
