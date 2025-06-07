import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connessione a MongoDB Atlas riuscita');
  } catch (error) {
    console.error('❌ Errore connessione MongoDB:', error);
  }
}
