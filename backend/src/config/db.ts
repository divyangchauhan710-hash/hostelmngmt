import mongoose from 'mongoose';

export async function connectDB(): Promise<typeof mongoose | null> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelhub';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${mongoUri}. Error: ${err.message}`);
    console.warn(`[Database] Operating in Standalone/Demo mode where needed.`);
    return null;
  }
}
