const faker = require('faker');

const Book = require('./db/model/Book');
const Contact = require('./db/model/Contact');
const Secret = require('./db/model/Secret');

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

const makeContacts = num => {
  const contacts = [];
  for (let i = 0; i < num; i++) {
    contacts.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        country: faker.address.country(),
        zip: faker.address.zipCode()
      }
    });
  }
  return contacts;
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const makeSecrets = num => {
  const secrets = [];
  for (let i = 0; i < num; i++) {
    secrets.push({
      clientId: getRandomNumber(1030, 1050),
      message: faker.lorem.sentence()
    });
  }
  return secrets;
};

const clearData = async () => {
  try {
    return await Promise.all([
      Book.deleteMany(),
      Contact.deleteMany(),
      Secret.deleteMany()
    ]);
  } catch (err) {
    throw new Error(err);
  }
};

const seedData = async () => {
  try {
    return await Promise.all([
      Book.insertMany(books),
      Contact.insertMany(makeContacts(100)),
      Secret.insertMany(makeSecrets(100))
    ]);
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { clearData, seedData };
