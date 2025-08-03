const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://anshtiwari2020:ansh123@cluster0.ixqhd.mongodb.net/consultbridge?retryWrites=true&w=majority';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('consultancies');

    // Update all documents to add missing fields
    const result = await collection.updateMany(
      {},
      {
        $set: {
          status: { $ifNull: ['$status', 'pending'] },
          verification: {
            $ifNull: [
              '$verification',
              {
                emailVerified: false,
                phoneVerified: false
              }
            ]
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} consultancies`);

    // Verify the update
    const count = await collection.countDocuments({ status: { $exists: true } });
    console.log(`Total consultancies with status field: ${count}`);

    await mongoose.disconnect();
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();