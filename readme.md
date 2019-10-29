# GraphQL AST Demo

This sample project demonstrates how to use a GraphQL Abstract Syntax Tree (AST) to help you make more efficient database queries. It uses a MongoDB database for demonstration purposes but the same principles can be mapped to whichever database you are using.

## Installation

Make sure you have MongoDB installed on your machine. Read the [MongoDB docs](https://docs.mongodb.com/manual/installation/) for more information on how to do that.

Install the dependencies:

```bash
npm install
```

Run in development mode for live reloading:

```bash
npm run dev
```

Or run without live reloading:

```bash
npm start
```

### Database Seeding

The project is set up to use a database called `test`. There is demo data in the `db` directory which is used to seed the database.

The database is cleared and seeded everytime the server is restarted.

### Sample Queries

All types and queries are defined in `server.js`. Each registered query demonstrates a different aspect of how to use the GraphQL AST to make efficient database calls.

## License

MIT
