const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../Helpers/auth');
const {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  addPatientImages,
  addBeforeAfterImages,
  generateImage,
  deleteSavedImage,
  addMonthlyTreatment,
  updateMonthlyTreatment,
  deleteMonthlyTreatment,
  analyzePhoto,
  generateProgressImages,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonials,
} = require('../Controllers/patientController');

// store uploads in memory for sharp processing
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

router.use(requireAuth);

router.get('/', listPatients);
router.get('/:id', getPatient);
router.post('/', upload.array('images', 10), createPatient);
router.put('/:id', upload.array('images', 10), updatePatient);
router.delete('/:id', deletePatient);
router.post('/:id/images', upload.array('images', 10), addPatientImages);
router.post('/:id/before-after', upload.array('images', 10), addBeforeAfterImages);
router.post('/:id/generate-image', generateImage);
router.post('/:id/analyze-photo', analyzePhoto);
router.post('/:id/generate-progress', generateProgressImages);
router.delete('/:id/delete-image', deleteSavedImage);
router.post('/:id/monthly-treatment', addMonthlyTreatment);
router.put('/:id/monthly-treatment/:recordId', updateMonthlyTreatment);
router.delete('/:id/monthly-treatment/:recordId', deleteMonthlyTreatment);
router.post('/:id/testimonial', addTestimonial);
router.put('/:id/testimonial/:testimonialId', updateTestimonial);
router.delete('/:id/testimonial/:testimonialId', deleteTestimonial);
router.get('/testimonials/all', getTestimonials);

module.exports = router;
