const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

const { getBooks } = require('./db/queries');
const { clearData, seedData } = require('./seed');

const getQuerySelections = ({ fieldNodes }) => {
  return fieldNodes
    .map(node => node.selectionSet.selections)
    .flat()
    .map(s => s.name.value)
    .join(' ');
};

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: async (parent, args, context, info) => {
      try {
        const selections = getQuerySelections(info);
        return await getBooks(selections);
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  try {
    // clear existing data
    await clearData();
    // seed data
    await seedData();

    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  } catch (err) {
    throw new Error(err);
  }
});
