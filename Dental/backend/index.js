require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
	origin: '*',
	credentials: true,
	exposedHeaders: ['Content-Type', 'Content-Length']
}));
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();
	
	// Log the incoming request
	console.log(`[${timestamp}] ${req.method} ${req.url}`);
	
	// Capture the original res.json and res.send methods
	const originalJson = res.json.bind(res);
	const originalSend = res.send.bind(res);
	
	// Override res.json to log response
	res.json = function(body) {
		const duration = Date.now() - startTime;
		console.log(`[${timestamp}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
		return originalJson(body);
	};
	
	// Override res.send to log response
	res.send = function(body) {
		const duration = Date.now() - startTime;
		console.log(`[${timestamp}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
		return originalSend(body);
	};
	
	// Handle response finish event for cases where json/send aren't called
	res.on('finish', () => {
		if (!res.headersSent) return;
		const duration = Date.now() - startTime;
		// Only log if not already logged by json/send
		if (res.statusCode !== 304) {
			console.log(`[${timestamp}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
		}
	});
	
	next();
});

// Serve static files from public directory with proper headers
app.use(express.static('public', {
	maxAge: '1d',
	setHeaders: (res, filePath) => {
		if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
			res.setHeader('Content-Type', 'image/jpeg');
			res.setHeader('Cache-Control', 'public, max-age=86400');
			res.setHeader('Access-Control-Allow-Origin', '*');
		}
	}
}));

// Additional route to explicitly serve images from uploads
app.use('/uploads', express.static('public/uploads', {
	maxAge: '1d',
	setHeaders: (res, filePath) => {
		if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
			res.setHeader('Content-Type', 'image/jpeg');
			res.setHeader('Cache-Control', 'public, max-age=86400');
			res.setHeader('Access-Control-Allow-Origin', '*');
		}
	}
}));

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

// Debug endpoint to check if files exist
app.get('/api/debug/image/:patientId/:type/:filename', (req, res) => {
	const { patientId, type, filename } = req.params;
	const fullPath = path.join(process.cwd(), 'public', 'uploads', 'patients', patientId, type, filename);
	const exists = fs.existsSync(fullPath);
	
	res.json({
		requestedPath: `/uploads/patients/${patientId}/${type}/${filename}`,
		fullPath,
		exists,
		cwd: process.cwd(),
		filesInDir: exists ? null : (fs.existsSync(path.dirname(fullPath)) ? fs.readdirSync(path.dirname(fullPath)) : 'Directory does not exist')
	});
});

// Serve images through API endpoint (for reverse proxy compatibility)
app.get('/api/uploads/*', (req, res) => {
	const imagePath = req.params[0]; // Everything after /api/uploads/
	const fullPath = path.join(process.cwd(), 'public', 'uploads', imagePath);
	
	console.log(`[Image Request] ${req.url} -> ${fullPath}`);
	
	if (!fs.existsSync(fullPath)) {
		console.error(`[Image 404] File not found: ${fullPath}`);
		return res.status(404).json({ error: 'Image not found', path: imagePath });
	}
	
	// Set proper content type and headers
	res.setHeader('Content-Type', 'image/jpeg');
	res.setHeader('Cache-Control', 'public, max-age=86400');
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	// Stream the file
	const fileStream = fs.createReadStream(fullPath);
	fileStream.pipe(res);
	
	fileStream.on('error', (err) => {
		console.error(`[Image Stream Error] ${err.message}`);
		if (!res.headersSent) {
			res.status(500).json({ error: 'Failed to stream image' });
		}
	});
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
