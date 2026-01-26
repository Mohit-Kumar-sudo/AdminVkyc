import { services } from "@/data/services";
import Link from "next/link";

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="container py-5">
        <h2>Service not found</h2>
      </div>
    );
  }

  // 🔥 UPDATED RELATED SERVICES LOGIC
  const relatedServices = services.filter((s) => s.slug !== slug).slice(0, 4);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link
          href="/services"
          className="btn btn-sm fs-6 px-5 py-3 rounded-pill shadow-lg btn-outline-info fw-semibold"
        >
          ← Back to Services
        </Link>
      </div>

      <div className="row g-5">
        {/* LEFT CONTENT */}
        <div className="col-lg-8">
          <article className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h1 className="mb-3">{service.title}</h1>

            <p className="text-muted mb-4">{service.longDescription}</p>

            <img
              src={service.image}
              alt={service.title}
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "cover",
                borderRadius: "16px",
                marginBottom: "30px",
              }}
            />

            <h3 className="mb-3">What’s Included</h3>
            <ul className="ps-3">
              {service.features.map((feature, index) => (
                <li key={index} className="mb-2">
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-lg-4">
          <div className="sticky-lg-top" style={{ top: "120px" }}>
            <aside className="bg-white rounded-4 shadow-sm p-4">
              <h5 className="fw-semibold mb-4">Related Services</h5>

              <ul className="list-unstyled d-flex flex-column gap-4 mb-0">
                {relatedServices.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="d-flex gap-3 text-decoration-none align-items-start"
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />

                      <div>
                        <div className="fw-medium" style={{ color: "#2563eb" }}>
                          {s.title}
                        </div>
                        <div className="small text-muted">View details →</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
