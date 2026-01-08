const mongoose = require('mongoose');

const DEFAULT_DB_NAME = 'dentals';

const MONGODB_URI =
	process.env.MONGODB_URI ||
	process.env.MONGO_URI ||
	`mongodb://127.0.0.1:27017/${DEFAULT_DB_NAME}`;

let isConnected = false;

async function connectDB() {
	if (isConnected) return mongoose.connection;

	mongoose.set('strictQuery', true);
	const dbName = process.env.MONGODB_DB || DEFAULT_DB_NAME;

	try {
		const conn = await mongoose.connect(MONGODB_URI, { dbName });
		isConnected = conn.connections[0].readyState === 1;
		console.log(
			`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
		);
		return conn;
	} catch (err) {
		console.error('MongoDB connection error:', err.message);
		throw err;
	}
}

function getDb() {
	return mongoose.connection;
}

async function disconnectDB() {
	if (!isConnected) return;
	await mongoose.disconnect();
	isConnected = false;
}

process.on('SIGINT', async () => {
	try {
		await disconnectDB();
	} finally {
		process.exit(0);
	}
});

module.exports = { connectDB, getDb, disconnectDB, mongoose };

