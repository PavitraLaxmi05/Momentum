require('dotenv').config();
     const mongoose = require('mongoose');

     async function testMongoDBConnection() {
       try {
         // Log MONGODB_URI to verify it's loaded
         console.log('MONGODB_URI:', process.env.MONGODB_URI);

         // Check if MONGODB_URI is defined
         if (!process.env.MONGODB_URI) {
           throw new Error('MONGODB_URI is not defined in .env file');
         }

         // Connect to MongoDB
         await mongoose.connect(process.env.MONGODB_URI);
         console.log('MongoDB connected successfully');

         // Test a simple query
         const testSchema = new mongoose.Schema({ name: String });
         const TestModel = mongoose.model('Test', testSchema, 'tests');
         const testDoc = new TestModel({ name: 'Test Document' });
         await testDoc.save();
         console.log('Test document saved:', testDoc);

         // Clean up
         await TestModel.deleteOne({ _id: testDoc._id });
         console.log('Test document deleted');

         // Close the connection
         await mongoose.connection.close();
         console.log('MongoDB connection closed');
       } catch (error) {
         console.error('MongoDB connection error:', error.message, error.stack);
       }
     }

     testMongoDBConnection();