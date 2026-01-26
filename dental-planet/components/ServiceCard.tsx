"use client";

import Link from "next/link";

export default function ServiceCard({
  title,
  slug,
  description,
  image,
}: {
  title: string;
  slug: string;
  description: string;
  image: string;
}) {
  return (
    <div className="card h-100 shadow-sm border-0 card-hover">
      <div className="card-body d-flex flex-column gap-3">
        {/* IMAGE + TITLE (COLUMN) */}
        <div className="d-flex flex-column align-items-start gap-3">
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              borderRadius: "16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            }}
          />

          <h5 className="card-title mb-0">{title}</h5>
        </div>

        {/* DESCRIPTION */}
        <p className="text-muted flex-grow-1">{description}</p>

        {/* CTA */}
        <Link
          href={`/services/${slug}`}
          className="btn btn-sm fs-6 px-5 py-3 rounded-pill shadow-lg btn-outline-info fw-semibold mt-auto"
        >
          Know More →
        </Link>
      </div>
    </div>
  );
}
