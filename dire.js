const fs = require('fs').promises;
const path = require('path');

class Dire {
  /**
   * Creates an instance of Dire.
   * @param {string} [directoryPath] - The path to the directory where JSON files are stored.
   * @param {number} [saveInterval] - The interval (in milliseconds) at which the database is saved to JSON files.
   */
  constructor(directoryPath = __dirname, saveInterval = 60000) {
    this.directoryPath = directoryPath;
    this.saveInterval = saveInterval;
    this.data = {};
    this.isLoaded = false;

    // Check if saveInterval is greater than 0 before starting the timer
    if (this.saveInterval > 0) {
      this.timer = setInterval(() => this.save(), this.saveInterval);
    }

    this.modifiedCollections = new Set();
    this.load();
  }

  // Add a method to mark a collection as modified
  markCollectionAsModified(collectionName) {
    this.modifiedCollections.add(collectionName);
  }

  /**
   * Asynchronously loads collections from JSON files in the directory.
   */
  async load() {
    try {
      const files = await fs.readdir(this.directoryPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const collectionName = path.basename(file, '.json');
          const filePath = path.join(this.directoryPath, file);
          const fileData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
          this.data[collectionName] = fileData[collectionName];
          // console.log(`Loaded collection ${collectionName} from file: ${filePath}`);
        }
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading collections:', error.message);
    }
  }

  /**
   * Asynchronously saves modified collections to their respective JSON files.
   */
  async save() {
    try {
      // Iterate through the modified collections
      for (const collectionName of this.modifiedCollections) {
        const filePath = path.join(this.directoryPath, `${collectionName}.json`);
        // Write the modified collection to its JSON file
        await fs.writeFile(filePath, JSON.stringify({ [collectionName]: this.data[collectionName] }, null, 0));
      }

      // Clear the set of modified collections after saving
      this.modifiedCollections.clear();
    } catch (error) {
      console.error('Error saving modified collections:', error.message);
    }
  }

  /**
   * Asynchronously adds a new collection with the provided data.
   * @param {string} collectionName - The name of the collection.
   * @param {Array} items - The data to be added to the collection.
   */
  async add(collectionName, items = []) {
    this.data[collectionName] = items;
    this.markCollectionAsModified(collectionName);
  }

  /**
   * Asynchronously drops a collection and its associated file.
   * @param {string} collectionName - The name of the collection to be dropped.
   */
  async drop(collectionName) {
    delete this.data[collectionName];
    const filePath = path.join(this.directoryPath, `${collectionName}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  }

  /**
   * Asynchronously inserts one or more items into the collection with unique IDs.
   * @param {string} collectionName - The name of the collection.
   * @param {object|object[]} items - The item or items to insert into the collection.
   */
  async insert(collectionName, items) {
    const collection = this.data[collectionName];
    if (!Array.isArray(items)) {
      items = [items];
    }
    items.forEach((item) => {
      collection.push(item);
    });
    this.markCollectionAsModified(collectionName);
  }

  /**
   * Asynchronously updates items in the collection based on a filter and update function.
   * @param {string} collectionName - The name of the collection.
   * @param {function} filterFunction - The filter function to match items for updating.
   * @param {function} updateFunction - The function to update matched items.
   */
  async update(collectionName, filterFunction = () => true, updateFunction) {
    const collection = this.data[collectionName];
    collection.forEach((item) => {
      if (filterFunction(item)) {
        updateFunction(item);
      }
    });
    this.markCollectionAsModified(collectionName);
  }

  /**
   * Asynchronously finds items in the collection based on a filter function.
   * @param {string} collectionName - The name of the collection.
   * @param {function} filterFunction - The filter function to match items.
   * @returns {object[]} - An array of matched items.
   */
  async find(collectionName, filterFunction = () => true) {
    const collection = this.data[collectionName];
    return collection.filter(filterFunction);
  }

  /**
   * Asynchronously finds one item in the collection based on a filter function.
   * @param {string} collectionName - The name of the collection.
   * @param {function} filterFunction - The filter function to match an item.
   * @returns {object|null} - The matched item or null if not found.
   */
  async findOne(collectionName, filterFunction) {
    const collection = this.data[collectionName];
    return collection.find(filterFunction) || null;
  }

  /**
   * Asynchronously deletes items from the collection based on a filter.
   * @param {string} collectionName - The name of the collection.
   * @param {function} filterFunction - The filter function to match items for deletion.
   */
  async delete(collectionName, filterFunction = () => true) {
    const collection = this.data[collectionName];
    this.data[collectionName] = collection.filter((item) => !filterFunction(item));
    this.markCollectionAsModified(collectionName);
  }
  
}

module.exports = Dire;
