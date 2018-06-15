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

export function JobDockerTypeResolver(
  docker: MetronomeJobDocker
): JobDocker | null {
  return {
    forcePullImage: JobDockerFieldResolvers.forcePullImage(docker),
    image: JobDockerFieldResolvers.image(docker)
  };
}

export const JobDockerFieldResolvers = {
  forcePullImage(docker: MetronomeJobDocker): boolean {
    return docker.forcePullImage;
  },
  image(docker: MetronomeJobDocker): string {
    return docker.image;
  }
};
