require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

const {
  getBooks,
  getUsersWithContacts,
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
  return fieldNodes
    .map(node => node.selectionSet.selections)
    .flat()
    .filter(s => s.arguments && s.arguments.length)
    .map(s => s.arguments)
    .flat()
    .filter(a => a.kind === 'Argument');
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

// more to do here to handle all cases
// see https://github.com/stems/graphql-depth-limit for a proper implementation
const getSelectionDepth = (node, currentDepth = 1) => {
  return node.map(n => {
    if (!n.selectionSet) {
      return currentDepth;
    }
    return Math.max(
      ...getSelectionDepth(n.selectionSet.selections, currentDepth + 1)
    );
  });
};

const typeDefs = gql`
  type Book {
    title: String
    author: String
    publishDate: String
  }

  type User {
    firstName: String
    lastName: String
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

  type Post {
    name: String
    author: Author
  }

  type Author {
    name: String
    posts: [Post]
  }

  type Query {
    books: [Book]
    usersWithContacts: [User]
    token(clientId: String): String
    secrets(STARTS_WITH: String): [Secret]
    posts: [Post]
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
    usersWithContacts: async (parent, args, context, info) => {
      try {
        const selections = getQuerySelections(info);
        const subArguments = getQuerySubArguments(info);
        const limit = getLimit(subArguments);
        const sortBy = getSortBy(subArguments);
        return await getUsersWithContacts(selections, limit, sortBy);
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
    },
    posts: async (parent, args, context, info) => {
      try {
        const { fieldNodes } = info;
        const selectionDepth = getSelectionDepth(fieldNodes)[0];

        if (selectionDepth > 5) {
          throw new Error('Max selection depth exceeded');
        }
        return [];
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
