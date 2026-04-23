const mongoose = require('mongoose')
const debug = require('debug')(process.env.DEBUG+'mongodb');

mongoose.set('strictQuery', true);

if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
  console.error('FATAL: MONGODB_URI or DB_NAME env variable is missing');
  process.exit(1);
}

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    })
    .then(() => debug('mongodb connected.'))
    .catch((err) => debug(err.message));
};

connectDB();

mongoose.connection.on('connected', () => {
    debug(`Mongoose connecting to ${process.env.DB_NAME}`)
})

mongoose.connection.on('error', (err) => {
    debug(err.message)
})

mongoose.connection.on('disconnected', () => {
    debug('Mongoose connection is disconnected. Reconnecting...');
    setTimeout(connectDB, 5000);
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})