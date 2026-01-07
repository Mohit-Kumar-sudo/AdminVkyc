require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/patients', require('./Routes/patient'));
app.use('/api/clients', require('./Routes/client'));
app.use('/api/users', require('./Routes/users'));
app.use('/api/appointments', require('./Routes/appointment'));
app.use('/api/dashboard', require('./Routes/dashboard'));

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
	res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal server error' });
});

const { connectDB } = require('./Helpers/mongoose');

const PORT = process.env.PORT || 5000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Backend running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to start server due to DB error:', err.message);
		process.exit(1);
	});
