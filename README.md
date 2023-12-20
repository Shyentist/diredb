# DireDB, The Directory Data Base

DireDB is a simple file-based, NoSQL database for Node.js that stores collections of data in JSON files. It provides a lightweight and easy-to-use solution for persisting data between sessions.

## Features

- **File-Based Storage:** Data is stored in JSON files, making it easy to inspect and manage. 
- **Atomic Collections:** Each file stores a single collection, providing efficient and atomic operations for reading, updating, and writing affected collections only.
- **Persistence:** Data modifications are (optionally) persisted to disk at specified intervals, ensuring data durability.
- **NoSQL Data Model:** Schema-less data storage to provide flexibility in data representation.
- **Asynchronous Operations:** All operations are asynchronous to avoid blocking the event loop.
- **Collection Manipulation:** Add, drop, insert, update, find, findOne, and delete operations for managing collections.
- **Vanilla JS:** Manage collections with callback functions, without any need to learn keywords from other environments.

## Installation

You can install DireDB via npm using the following command:

```bash
npm i diredb
```

## Getting Started

```js
// db.js

const Dire = require('diredb');
const path = require('path');

/* Create an instance of Dire with the desired directory path. 
The path below assumes a directory named 'db' in the same 
directory as 'db.js', the current file */

const saveInterval = 10000 // 10k milliseconds, 10 seconds

const directoryPath = path.join(__dirname, 'db')

const db = new Dire(directoryPath, saveInterval);

/* Omitting saveInterval defaults to 1 minute, while setting 
it to 0 removes persistence of changes in the collections */

// Export the Dire instance
module.exports = db;

```

Now you can import and use `db` in any other module like so, ensuring that all operations are run **after** the database is initialised.

```js
// server.js

db.load().then(() => {
    // Your server logic here.
})
```

## Usage
Remember to async/await the operations as needed.

### Creating a collection
You can create a collection and add data to it using the `add` method:

```js
const usersData = [
  { id: 1, name: 'John Doe', age: 30 },
  { id: 2, name: 'Jane Doe', age: 25 },
];

db.add('users', usersData);
```

### Dropping a collection
Erasing a collection using the `drop` method is as simple as:

```js
db.drop('users');
```

### Inserting data into an existing collection
Adding documents/elements/items to a collection is just as straightforward:

```js
const newUsersData = [
  { id: 3, name: 'Bob Smith', age: 28 },
  { id: 4, name: 'Alice Johnson', age: 35 },
];

db.insert('users', newUsersData);
```

### Querying Data
Perform various queries on your collections using methods like `find`, `findOne`, and `update`:

```js
// Find all users over the age of 25
const matureUsers = await db.find('users', user => user.age > 25);

// Find a user by name
const janeDoe = await db.findOne('users', user => user.name === 'Jane Doe');

// Update users whose name is John Doe so that their ages increase by 1
db.update('users', user => user.name === 'John Doe', user => (user.age += 1));
```

### Deleting Data
Remove data from your collections with the `delete` method:

```js
// Delete users under the age of 25
db.delete('users', user => user.age < 25);
```

### Retrieving Collections
You can retrieve entire collections in many ways:
```js
// By querying
const someUsers = await db.find('users')

// By accessing the property the JS object that is db
const sameUsers = db.data.users

// By destructuring
const { users } = db.data

// Changes to these values will not be reflected in the db
// Only changes made via the methods of the db object will affect the db
```

## License
DireDB is released under the MIT License.
