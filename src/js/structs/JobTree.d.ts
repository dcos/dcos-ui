export = JobTree;
declare class JobTree {
  constructor(props: any);
  findItem(fn: (item: JobTree) => boolean): JobTree;
  getId(): number;
  getName(): string;
}
