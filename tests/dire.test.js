const fs = require('fs').promises;
const path = require('path');
const Dire = require('../dire');

jest.useFakeTimers(); // Use fake timers to control the passage of time

describe('DireDB', () => {
  let db;

  beforeEach(async() => {
    // Create a new instance before each test
    db = new Dire("./tests/db", 5000);
    await db.load();
    jest.clearAllTimers(); // Clear any existing timers
  });

  afterEach(() => {
    // Optionally, perform cleanup after each test

  });

  test('should load and search collections from the directory', async () => {

    // Assertions
    expect(db.data.users).toHaveLength(2);

    const users = await db.find('users');
    expect(users).toHaveLength(2);

    const user = await db.findOne('users', (user) => user.name === 'Jane');
    expect(typeof user).toBe('object');
    expect(user.name).toBe('Jane');
    expect(user.surname).toBe('Doe');
    expect(user.age).toBe(29);
  });

  test('should add the "pets" collection', async () => {
    // Add "pets" collection
    const petsData = [
      { name: 'Oreo', species: 'Cat', chonky: true },
      { name: 'Siria', species: 'Dog', chonky: false },
    ];
  
    // Add "pets" collection
    await db.add('pets', petsData);
  
    // Assertions for the added "pets" collection
    expect(db.data.pets).toHaveLength(2);
  
    const pets = await db.find('pets');
    expect(pets).toHaveLength(2);
  
    const pet = await db.findOne('pets', (pet) => pet.name === 'Oreo');
    expect(typeof pet).toBe('object');
    expect(pet.name).toBe('Oreo');
    expect(pet.species).toBe('Cat');
    expect(pet.chonky).toBe(true);

    await db.save()
  
    // Check if "pets.json" file has been created
    const virtualDirectoryContentsAfterAdd = await fs.readdir(db.directoryPath);
    expect(virtualDirectoryContentsAfterAdd).toContain('pets.json');
  });
  
  test('should drop the "pets" collection', async () => {
    // Drop the "pets" collection
    await db.drop('pets');
  
    // Assertions after dropping "pets" collection
    expect(db.data.pets).toBeUndefined();
  
    await db.save()

    // Check if "pets.json" file has been deleted
    const virtualDirectoryContentsAfterDrop = await fs.readdir(db.directoryPath);
    expect(virtualDirectoryContentsAfterDrop).not.toContain('pets.json');
  });  

  test('should insert a new user into the "users" collection', async () => {
    // Insert a new user into the "users" collection
    const newUser = { name: 'Eve', surname: 'Johnson', age: 25 };
    await db.insert('users', newUser);
  
    // Assertions after inserting the new user
    const users = await db.find('users');
    expect(users).toHaveLength(3);
  
    // Check that the new user exists in the collection
    const insertedUser = await db.findOne('users', (user) => user.name === 'Eve');
    expect(insertedUser).toEqual(newUser);
  });

  test('should update items in the "users" collection', async () => {
    // Define the update function
    const updateFunction = (user) => {
      user.age += 1; // Increment age by 1
    };

    // Update items in the "users" collection where name is 'Jane'
    await db.update('users', (user) => user.name === 'Jane', updateFunction);

    // Check if the update has been applied
    const updatedUser = await db.findOne('users', (user) => user.name === 'Jane');
    expect(updatedUser.age).toBe(30); // Expect the age to be incremented by 1
  });

  test('should delete the user "Jane" from the "users" collection', async () => {
    // Delete the user "Jane" from the "users" collection
    await db.delete('users', (user) => user.name === 'Jane');
  
    // Assertions after deleting the user
    const users = await db.find('users');
    expect(users).toHaveLength(1);
  
    // Check that the user "John" is not in the collection
    const janeInCollection = await db.findOne('users', (user) => user.name === 'Jane');
    expect(janeInCollection).toBeNull();
  });
  
});
