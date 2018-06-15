import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
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
  docker: MetronomeClient.JobDocker
): JobDocker | null {
  return {
    forcePullImage: JobDockerFieldResolvers.forcePullImage(docker),
    image: JobDockerFieldResolvers.image(docker)
  };
}

export const JobDockerFieldResolvers = {
  forcePullImage(docker: MetronomeClient.JobDocker): boolean {
    return docker.forcePullImage;
  },
  image(docker: MetronomeClient.JobDocker): string {
    return docker.image;
  }
};
