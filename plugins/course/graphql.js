import { makeExecutableSchema } from "graphql-tools";
import { addTask, removeTask, getTasks } from "./support";

const processTasks = tasks => {
  const result = Object.entries(tasks).map(task => ({
    id: task[0],
    value: task[1]
  }));

  return result;
};

const typeDefs = `
  type Task {
    id: Int!
    value: String!
  }

  type Query {
    getTasks: [Task]!
  }

  type Mutation {
    addTask(value: String!): [Task]!
    removeTask(id: Int!): [Task]!
  }
`;

const resolvers = {
  Query: {
    getTasks: () => {
      return getTasks()
        .map(store => store.data)
        .map(tasks => processTasks(tasks));
    }
  },
  Mutation: {
    addTask: (parent, args) => {
      return addTask(args.value);
    },
    removeTask: (parent, args) => {
      return removeTask(args.id);
    }
  }
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
