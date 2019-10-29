require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

const {
  getBooks,
  getBooksWithContacts,
  signToken,
  getSecrets
} = require('./db/queries');
const { clearData, seedData } = require('./seed');

const getQuerySelections = ({ fieldNodes }) => {
  return fieldNodes
    .map(node => node.selectionSet.selections)
    .flat()
    .map(s => s.name.value)
    .join(' ');
};

const getQuerySubArguments = ({ fieldNodes }) => {
  const args = fieldNodes
    .map(node => node.selectionSet.selections)
    .flat()
    .filter(s => s.arguments && s.arguments.length)
    .map(s => s.arguments)
    .flat()
    .filter(a => a.kind === 'Argument');
  return args;
};

const getLimit = rawArgs => {
  const limitArg = rawArgs.find(a => a.name.value === 'LIMIT');
  return limitArg && limitArg.value ? parseInt(limitArg.value.value) : null;
};

const getSortBy = rawArgs => {
  const sortByArg = rawArgs.find(a => a.name.value === 'SORT_BY');
  return sortByArg && sortByArg.value ? sortByArg.value.value : '';
};

const makeScopedQuery = (args, clientId) => {
  return Object.assign({}, args, { clientId });
};

const typeDefs = gql`
  type Book {
    title: String
    author: String
    contacts(LIMIT: Int, SORT_BY: String): [Contact]
  }

  type Address {
    street: String
    city: String
    country: String
    zip: String
  }

  type Contact {
    firstName: String
    lastName: String
    address: Address
  }

  type Secret {
    clientId: String
    message: String
  }

  type Query {
    books: [Book]
    booksWithContacts: [Book]
    token(clientId: String): String
    secrets(STARTS_WITH: String): [Secret]
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
    },
    booksWithContacts: async (parent, args, context, info) => {
      try {
        const selections = getQuerySelections(info);
        const subArguments = getQuerySubArguments(info);
        const limit = getLimit(subArguments);
        const sortBy = getSortBy(subArguments);
        return await getBooksWithContacts(selections, limit, sortBy);
      } catch (err) {
        throw new Error(err);
      }
    },
    token: (parent, { clientId }) => signToken(clientId),
    secrets: async (parent, args, context, info) => {
      try {
        const { STARTS_WITH } = args;
        const { clientId } = context;
        return await getSecrets(
          makeScopedQuery({ message: { $regex: STARTS_WITH } }, clientId)
        );
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};

const getClientId = token => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.clientId;
  } catch (err) {
    throw new Error(err);
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    clientId: getClientId(req.headers.authorization)
  })
});

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
