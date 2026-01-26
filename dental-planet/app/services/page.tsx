"use client";

import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/services";

export default function Services() {
  return (
    <>
      {/* PAGE HEADER */}
     <section className="py-5 dental-services-section">
  <div className="container text-center">

    <span className="badge dental-badge mb-3 px-4 py-2 rounded-pill">
      🦷 What We Offer
    </span>

    <h1 className="fw-bold mb-3 dental-title">
      Our Dental Services
    </h1>

    <p className="text-muted mb-0 mx-auto dental-description">
      Comprehensive dental care using modern technology, ethical practices,
      and patient-first treatment.
    </p>

  </div>
</section>


      {/* ALL SERVICES GRID */}
      <div className="container py-5">
        <div className="row g-4">
          {services.map((service) => (
            <div key={service.slug} className="col-sm-6 col-md-4 col-lg-3">
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
