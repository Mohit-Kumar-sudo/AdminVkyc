/* eslint-disable no-console */
import mongoose from 'mongoose';

import constants from './constants';

// Connecting to mongoDB
try {
  console.log(constants.MONGO_URI);
  mongoose.connect(
    constants.MONGO_URI,
    { useCreateIndex: true,
    useUnifiedTopology: true, 
    useNewUrlParser: true },
  );
} catch (error) {
  console.log(constants.MONGO_URI);
  mongoose.createConnections(constants.MONGO_URI);
}

mongoose.connection
  .once('open', () => console.log('Connected to MongoDB'))
  .on('error', err => {
    throw err;
  });

mongoose.set('useFindAndModify', false);
