import { JobDocker as MetronomeJobDocker } from "#SRC/js/events/MetronomeClient";
export interface JobDocker {
  forcePullImage: boolean;
  image: string;
}

export const JobDockerSchema = `
type Docker {
  forcePullImage: Boolean!
  image: String!
}
`;

export const JobDockerTypeResolver = (
  docker: MetronomeJobDocker
): JobDocker | null => ({
  forcePullImage: docker.forcePullImage,
  image: docker.image
});
