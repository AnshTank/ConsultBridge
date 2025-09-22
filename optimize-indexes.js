const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://anshtiwari2020:ansh123@cluster0.ixqhd.mongodb.net/consultbridge?retryWrites=true&w=majority';

async function optimizeIndexes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Create indexes for consultancies collection
    const consultanciesCollection = db.collection('consultancies');
    
    // Index for category-based queries
    await consultanciesCollection.createIndex({ category: 1 });
    console.log('Created index on category field');
    
    // Compound index for category and name queries
    await consultanciesCollection.createIndex({ category: 1, name: 1 });
    console.log('Created compound index on category and name fields');
    
    // Index for status queries (for admin filtering)
    await consultanciesCollection.createIndex({ status: 1 });
    console.log('Created index on status field');

    // Create indexes for reviews collection
    const reviewsCollection = db.collection('reviews');
    
    // Index for consultancyId queries
    await reviewsCollection.createIndex({ consultancyId: 1 });
    console.log('Created index on consultancyId field in reviews');
    
    // Compound index for consultancyId and rating (for stats aggregation)
    await reviewsCollection.createIndex({ consultancyId: 1, rating: 1 });
    console.log('Created compound index on consultancyId and rating fields');

    console.log('All indexes created successfully');
    
    // List all indexes to verify
    const consultancyIndexes = await consultanciesCollection.indexes();
    const reviewIndexes = await reviewsCollection.indexes();
    
    console.log('\nConsultancies collection indexes:');
    consultancyIndexes.forEach(index => console.log('- ', JSON.stringify(index.key)));
    
    console.log('\nReviews collection indexes:');
    reviewIndexes.forEach(index => console.log('- ', JSON.stringify(index.key)));

    await mongoose.disconnect();
    console.log('\nOptimization completed');
  } catch (error) {
    console.error('Index optimization failed:', error);
  }
}

optimizeIndexes();