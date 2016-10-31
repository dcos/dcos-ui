import GroupsConnector from './groups';

export default function MarathonConnector(authToken) {
  return {
    groups: new GroupsConnector({ authToken })
  };
}
