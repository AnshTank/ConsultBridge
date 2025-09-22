import mongoose from 'mongoose';
import Consultancy from '../models/Consultancy';

export async function createIndexes() {
  try {
    // Create compound index for category and name for faster filtering
    await Consultancy.collection.createIndex({ 
      category: 1, 
      name: 1 
    });
    
    // Create index for category alone for category pages
    await Consultancy.collection.createIndex({ category: 1 });
    
    // Create index for name for search functionality
    await Consultancy.collection.createIndex({ name: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
}