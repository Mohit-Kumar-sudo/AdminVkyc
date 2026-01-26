"use client";

import { useState } from "react";

export default function GalleryPage() {
  const images = ["1", "2", "3", "4", "5", "6", "7"];

  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <main className="py-5 bg-light">
        <div className="container">
          {/* HEADER */}
           <div className="text-center mb-5 gallery-header">

    <span className="badge gallery-badge mb-3 px-4 py-2 rounded-pill">
      🏥 Our Clinic
    </span>

    <h1 className="fw-bold gallery-title mb-2">
      Clinic Gallery
    </h1>

    <p className="text-muted gallery-description mx-auto">
      Explore our modern infrastructure, equipment & patient-friendly spaces
    </p>
          </div>

          {/* GALLERY GRID */}
          <div className="row g-4">
            {/* FEATURED IMAGE */}

            <div className="col-md-6">
              <div
                className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden"
                onClick={() => setPreview("/images/gallary1.jpeg")}
              >
                <div className="ratio ratio-1x1 h-100">
                  <img
                    src="/images/gallary1.jpeg"
                    alt="Dental Clinic Exterior"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT STACK */}
            <div className="col-lg-6">
              <div className="row g-4 h-100">
                {[2, 3].map((n) => (
                  <div key={n} className="col-6">
                    <div
                      className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                      onClick={() => setPreview(`/images/gallary${n}.jpeg`)}
                    >
                      <div className="ratio ratio-1x1">
                        <img
                          src={`/images/gallary${n}.jpeg`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="col-12">
                  <div
                    className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                    onClick={() => setPreview("/images/gallary4.jpeg")}
                  >
                    <div className="ratio ratio-16x9">
                      <img
                        src="/images/gallary4.jpeg"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REST IMAGES */}
            {images.slice(4).map((num) => (
              <div key={num} className="col-md-4 col-sm-6">
                <div
                  className="card border-0 shadow-sm rounded-4 overflow-hidden cursor-pointer"
                  onClick={() => setPreview(`/images/gallary${num}.jpeg`)}
                >
                  <div className="ratio ratio-4x3">
                    <img
                      src={`/images/gallary${num}.jpeg`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ===== IMAGE PREVIEW MODAL ===== */}
      {preview && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
          }}
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "12px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}
    </>
  );
}
