import Image from "next/image";
import Link from "next/link";

export default function DrAnkurPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      {/* BACK */}
      <div className="mb-4">
        <Link
          href="/"
          className="btn btn-outline-info rounded-pill px-4 py-2 fw-semibold"
        >
          ← Back to Home
        </Link>
      </div>

      {/* HERO */}
      <div className="row g-5 align-items-center mb-5">
        <div className="col-12 col-lg-4 text-center">
          <div className="bg-white rounded-4 p-4">
            <div className="position-relative" style={{ height: 420 }}>
              <Image
                src="/images/ankur.jpeg"
                alt="Dr. Ankur Vatsal"
                fill
                className="rounded-3"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <h1 className="fw-bold mb-1 text-dark">Dr. Ankur Vatsal</h1>

          <p className="text-primary fw-semibold fs-5 mb-2">
            Founder & Chief Dental Surgeon
          </p>

          <p className="text-muted fw-medium mb-3">
            Master of Dental Surgery, Cosmetic Dentist & Founder – Dental Planet
          </p>

          <p className="text-muted lh-lg">
            With over 15 years of clinical experience, Dr. Ankur Vatsal is a
            trusted name in cosmetic and restorative dentistry. He is known for
            his precision, ethical approach, and patient-centric care.
          </p>

          <p className="text-muted lh-lg">
            His expertise includes dental implants, root canal treatments,
            crowns & bridges, smile designing, braces, and advanced digital
            dentistry using 3D scanning technology.
          </p>
        </div>
      </div>

      {/* SERVICES */}
      <section className="bg-light rounded-4 p-4 p-md-5 mb-5">
        <h3 className="fw-bold text-center mb-4 text-dark">Services Offered</h3>

        <div className="row g-4">
          {[
            "Dental Check-ups & Cleaning",
            "Dental Implants",
            "Root Canal Treatments (RCT)",
            "Crowns, Bridges & Dentures",
            "Smile Designing",
            "Braces & Invisible Aligners",
            "Advanced Digital Dentistry (3D Scan)",
            "Tooth Extraction",
            "Laser-Assisted Gum Treatments",
            "Teeth Whitening",
          ].map((item, index) => (
            <div key={index} className="col-md-6">
              <div className="bg-white rounded-3 shadow-sm p-3 h-100 border-start border-success border-4">
                <span className="text-success fw-bold">✔</span> {item}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLINIC INFO */}
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
                  <strong>Sunday:</strong> Appointment Only
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
