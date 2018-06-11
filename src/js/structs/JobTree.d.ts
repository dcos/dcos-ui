import Job from "./Job"

export default class JobTree {
  constructor(props: any);
  findItem(fn: (item: JobTree) => boolean): JobTree;
  getId(): number;
  getName(): string;
  getItems(): Array<Job>;
}
