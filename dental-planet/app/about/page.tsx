"use client";

import Image from "next/image";
import DoctorSection from "@/components/DoctorCard";
import { doctors } from "@/data/doctors";

export default function About() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center gy-4 about-dental-section">
  {/* TEXT */}
  <div className="col-lg-6">

    <span className="badge about-badge mb-3 px-4 py-2 rounded-pill">
      🦷 About Dental Planet
    </span>

    <h1 className="fw-bold mt-2 about-title">
      Caring for Smiles
      <br className="d-none d-md-block" />
      With Compassion & Expertise
    </h1>

    <p className="text-muted fs-5 mt-3 about-text">
      We combine modern dental technology with gentle, patient-first
      care to help you smile with confidence.
    </p>

    <div className="mt-4">
      <a
        href="/services"
        className="btn about-btn px-5 py-3 rounded-pill fw-semibold"
      >
        Explore Our Services →
      </a>
    </div>

  </div>

  {/* IMAGE */}
  <div className="col-lg-6 text-center">
    <div className="about-image-wrapper">
      <Image
        src="/images/bg1.jpeg"
        alt="Dental Planet Team"
        width={800}
        height={500}
        className="img-fluid"
        priority
      />
    </div>
  </div>
</div>

        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center mb-4">
            <div className="col-lg-9 text-center">
              <h2 className="fw-bold text-primary mb-3">Our Story</h2>
              <p className="text-muted fs-6">
                Founded with a mission to make dental care comfortable and
                accessible, Dental Planet focuses on honesty, precision, and
                empathy.
              </p>
            </div>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "🎯",
                title: "Our Mission",
                text: "High-quality dental care in a calm, friendly environment.",
              },
              {
                icon: "👁",
                title: "Our Vision",
                text: "To be a trusted clinic known for ethical and long-term care.",
              },
              {
                icon: "🤝",
                title: "Our Values",
                text: "Compassion, transparency, safety, and excellence.",
              },
            ].map((item, i) => (
              <div className="col-md-4" key={i}>
                <div className="p-4 bg-light border rounded-4 h-100 text-center">
                  <span className="fs-1">{item.icon}</span>
                  <h5 className="mt-3 fw-semibold">{item.title}</h5>
                  <p className="text-muted mb-0">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR DOCTORS ===== */}
      <section style={{ background: "#f8fafc" }}>
        <DoctorSection doctor={doctors[0]} />
      </section>

      <section style={{ background: "#ffffff" }}>
        <DoctorSection doctor={doctors[1]} reverse />
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-primary">Why Choose Dental Planet?</h2>
            <p className="text-muted mt-2">
              Trusted care, advanced technology, and patient comfort.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "🧑‍⚕️",
                title: "Experienced Dentists",
                text: "Highly trained dental professionals.",
              },
              {
                icon: "🦷",
                title: "Modern Equipment",
                text: "Advanced tools for precision treatments.",
              },
              {
                icon: "😊",
                title: "Pain-Free Care",
                text: "Comfort-focused dental procedures.",
              },
              {
                icon: "⏱",
                title: "Flexible Appointments",
                text: "Convenient scheduling options.",
              },
            ].map((item, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="p-4 bg-white border border-primary-subtle rounded-4 text-center h-100 shadow-sm">
                  <span className="fs-2">{item.icon}</span>
                  <h6 className="mt-3 fw-semibold">{item.title}</h6>
                  <p className="text-muted small">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
