const Book = require('./db/model/Book');

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling'
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton'
  }
];

const clearData = async () => {
  try {
    await Book.deleteMany();
  } catch (err) {
    throw new Error(err);
  }
};

const seedData = async () => {
  try {
    await Book.insertMany(books);
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { clearData, seedData };
