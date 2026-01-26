import Image from "next/image";
import Link from "next/link";

export default function DoctorSection({ doctor, reverse = false }: any) {
  return (
    <section className="py-2">
      <div className="container">
        <div
          className={`row align-items-center gy-4 gy-lg-5 ${
            reverse ? "flex-lg-row-reverse" : ""
          }`}
        >
          {/* IMAGE */}
          <div className="col-12 col-lg-5 text-center">
            <div className="mx-auto" style={{ maxWidth: 380 }}>
              <div className="rounded-4 overflow-hidden p-3">
                <div
                  className="position-relative"
                  style={{ width: "100%", height: "420px" }}
                >
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-12 col-lg-7 text-center text-lg-start">
            <h2 className="fw-bold display-6 mb-1">{doctor.name}</h2>

            {/* ✅ NEW TITLE */}
            <p className="text-muted fw-medium mb-2">{doctor.title}</p>

            <h5 className="text-primary fw-semibold mb-3">
              {doctor.specialization}
            </h5>

            <p
              className="text-muted fs-6 lh-lg mb-4"
              style={{ textAlign: "justify" }}
            >
              {doctor.description}
            </p>

            {/* CTA BOX */}
            <div className="mt-4">
              <div
                className={`d-flex gap-3 p-3 rounded-4 bg-light border
      ${
        doctor.isChildSpecialist
          ? "flex-column align-items-center"
          : "flex-column align-items-center"
      }
    `}
              >
                {/* BADGE – ONLY FOR CHILD SPECIALIST */}
                {doctor.isChildSpecialist && (
                  <span className="badge bg-warning text-dark rounded-pill px-4 py-2 fs-6 shadow-sm">
                    Pediatric / Child Dental Specialist
                  </span>
                )}

                {/* BUTTON */}
                <Link
                  href={`/doctors/${doctor.slug}`}
                  className={`btn btn-outline-info rounded-pill w-100 px-4 py-2 fw-semibold
        ${doctor.isChildSpecialist ? "" : "w-100"}
      `}
                >
                  Know more about {doctor.name} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
