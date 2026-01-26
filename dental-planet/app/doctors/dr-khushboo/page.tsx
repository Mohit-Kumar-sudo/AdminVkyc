import Image from "next/image";
import Link from "next/link";

export default function DrKhushbooPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      {/* BACK */}
      <div className="mb-4">
        <Link
          href="/"
          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
        >
          ← Back to Home
        </Link>
      </div>

      {/* ================= HERO ================= */}
      <div className="row g-5 align-items-center mb-5">
        {/* IMAGE */}
        <div className="col-12 col-lg-4 text-center">
          <div className="bg-white rounded-4 p-4">
            <div className="position-relative" style={{ height: 420 }}>
              <Image
                src="/images/khusboo.jpeg"
                alt="Dr. Khushboo Barjatya Vatsal"
                fill
                className="rounded-3"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="col-12 col-lg-8">
          <h1 className="fw-bold mb-1 text-dark">
            Dr. Khushboo Barjatya Vatsal
          </h1>

          <p className="text-primary fw-semibold fs-5 mb-3">
            Founder & Pediatric / Child Dental Specialist
          </p>

          <p className="text-muted lh-lg">
            Dr. Khushboo Barjatya Vatsal is a compassionate pediatric dentist
            dedicated to the oral health of infants, children, adolescents, and
            children with special healthcare needs. She believes in early
            intervention, preventive care, and gentle behavior management.
          </p>

          <p className="text-muted lh-lg">
            Known for her calm approach and child-friendly environment, she
            focuses on building trust with young patients while educating
            parents on long-term oral health.
          </p>

          {/* CTA ROW */}
          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <span className="badge bg-warning text-dark rounded-pill px-4 py-2 fs-6 shadow-sm">
              Pediatric / Child Dental Specialist
            </span>
          </div>
        </div>
      </div>

      {/* ================= SERVICES ================= */}
      <section className="bg-light rounded-4 p-4 p-md-5 mb-5">
        <h3 className="fw-bold text-center mb-4 text-dark">
          Pediatric Dental Services
        </h3>

        <div className="row g-4">
          {[
            "Regular Check-Ups & Cleaning",
            "Infant & Expecting Mother Dental Care",
            "Cavity Prevention (Fluoride & Sealants)",
            "Pulp Therapy & Tooth-Colored Crowns",
            "Early Braces & Orthodontic Care",
            "Habit Correction Therapy",
            "Emergency Pediatric Dental Care",
            "Care for Children with Special Needs",
            "Sedation Dentistry",
            "Nitrous Oxide & General Anesthesia",
          ].map((item, index) => (
            <div key={index} className="col-md-6">
              <div className="bg-white rounded-3 shadow-sm p-3 h-100 border-start border-success border-4">
                <span className="text-success fw-bold">✔</span> {item}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CLINIC INFO ================= */}
      <section>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="bg-white shadow-lg rounded-4 p-4 h-100 border">
              <h5 className="fw-semibold mb-3 text-primary">Clinic Timings</h5>
              <ul className="lh-lg mb-0 list-unstyled">
                <li>
                  <strong>Weekdays:</strong> 10:00 AM – 2:00 PM
                </li>
                <li>
                  <strong>Evening:</strong> 5:00 PM – 8:30 PM
                </li>
                <li>
                  <strong>Sunday:</strong> Appointment Only (10:00 AM – 12:00
                  PM)
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-white shadow-lg rounded-4 p-4 h-100 border">
              <h5 className="fw-semibold mb-3 text-primary">Clinic Address</h5>
              <p className="mb-1">
                17 A Baktawar Ram Nagar,
                <br />
                Tilak Nagar, Indore
              </p>
              <p className="mb-1">📞 9893523334, 7400630334</p>
              <p className="mb-0">✉️ dentalplanet@gmail.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
