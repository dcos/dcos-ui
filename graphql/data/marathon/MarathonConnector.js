import GroupsConnector from './groups/group';

export default function MarathonConnector(authToken) {
  return {
    groups: new GroupsConnector({ authToken })
  };
}
