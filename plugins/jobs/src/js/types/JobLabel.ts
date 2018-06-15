export interface JobLabel {
  key: string;
  value: string;
}

export const LabelSchema = `
type Label {
  key: String!
  value: String!
}
`;
