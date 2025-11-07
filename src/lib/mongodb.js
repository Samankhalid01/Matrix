import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_LOCAL_URI = process.env.MONGODB_LOCAL_URI;

if (!MONGODB_URI && !MONGODB_LOCAL_URI) {
  throw new Error('Please define either MONGODB_URI or MONGODB_LOCAL_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Try Atlas first, then fallback to local
    const connectWithFallback = async () => {
      if (MONGODB_URI) {
        try {
          console.log('Attempting to connect to MongoDB Atlas...');
          const connection = await mongoose.connect(MONGODB_URI, opts);
          console.log('Connected to MongoDB Atlas successfully');
          return connection;
        } catch (error) {
          console.warn('MongoDB Atlas connection failed:', error.message);
          
          if (MONGODB_LOCAL_URI) {
            console.log('Attempting fallback to local MongoDB...');
            try {
              const connection = await mongoose.connect(MONGODB_LOCAL_URI, opts);
              console.log('Connected to local MongoDB successfully');
              return connection;
            } catch (localError) {
              console.error('Local MongoDB connection also failed:', localError.message);
              throw new Error('Both Atlas and local MongoDB connections failed');
            }
          } else {
            throw error;
          }
        }
      } else if (MONGODB_LOCAL_URI) {
        console.log('Connecting to local MongoDB...');
        const connection = await mongoose.connect(MONGODB_LOCAL_URI, opts);
        console.log('Connected to local MongoDB successfully');
        return connection;
      }
    };

    cached.promise = connectWithFallback();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;