# Dental Backend

This backend adds patient management, image upload & processing, and role-based access (admin, subadmin, doctor).

## Roles
- admin: full access across all clients/doctors
- subadmin: access limited to their client (clinic)
- doctor: access limited to their own patients (and client if set)

## Models
- User: { name, email, password, phone, role, client }
- Client: { name, email, contact, notes }
- Patient: { name, dob, email, contact, disease, history, prescription, images[], doctor, client }

## Auth
- POST /api/auth/register
- POST /api/auth/login

Use Bearer token from login for protected routes.

## Patients
- GET /api/patients
- GET /api/patients/:id
- POST /api/patients (multipart form with `images` files)
- PUT /api/patients/:id (multipart form with `images` files to append)
- DELETE /api/patients/:id
- POST /api/patients/:id/images (multipart `images` to append)

### Multipart fields
- images: Array of files (jpg/png), processed to JPEG at width 1280.
- Body fields: name, dob (ISO string), email, contact, disease, history, prescription, doctorId, clientId

## Quick Run

```bash
cd backend
npm install
npm run dev
```

Set env:
- MONGODB_URI (optional)
- MONGODB_DB (optional)
- JWT_SECRET
- JWT_EXPIRES_IN

Uploads served under `/uploads/patients/:id/:filename` via static `/public`.

## Appointments
- GET /api/appointments?type=upcoming|past&patientId=...&status=...
- GET /api/appointments/:id
- POST /api/appointments { patientId, startAt, endAt?, status?, notes?, doctorId?, clientId? }
- PUT /api/appointments/:id
- DELETE /api/appointments/:id

## Dashboard
- GET /api/dashboard/doctor → summary for current user
	- patientsCount
	- upcomingAppointmentsCount
	- recentPatients (last 10)
	- upcomingAppointments (next 10)
