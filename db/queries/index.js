const Book = require('./../model/Book');
const Contact = require('./../model/Contact');
const Secret = require('./../model/Secret');
const jwt = require('jsonwebtoken');

const getBooks = async selections => {
  try {
    const queryResult = await Book.find().select(selections);

    // The results coming from the database will
    // be scoped to whatever selection was made
    // from the GraphQL query itself
    console.log(queryResult);
    return queryResult;
  } catch (err) {
    throw new Error(err);
  }
};

const getBooksWithContacts = async (selections, limit, sortBy) => {
  try {
    const books = await Book.find().select(selections);
    for (let book of books) {
      book.contacts = await Contact.find()
        .limit(limit)
        .sort(sortBy);
    }

    // The results coming from the database will
    // be scoped to whatever selection was made
    // from the GraphQL query itself
    console.log(books);
    return books;
  } catch (err) {
    throw new Error(err);
  }
};

const signToken = clientId => jwt.sign({ clientId }, process.env.JWT_SECRET);

const getSecrets = async scopedQuery => {
  try {
    return await Secret.find(scopedQuery);
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { getBooks, getBooksWithContacts, signToken, getSecrets };
