import GroupsConnector from '../groups/group';

export default function MarathonConnector(mockResponse) {
  const {groups = {}} = mockResponse;

  return {
    groups: new GroupsConnector(groups)
  };
}
