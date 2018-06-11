export interface JobFilterTypes {
  [state: string]: string;
}

const states: JobFilterTypes = {
  TEXT: "searchString"
};

export default states;
