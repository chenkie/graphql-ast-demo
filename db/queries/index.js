const Book = require('./../model/Book');

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

module.exports = { getBooks };
