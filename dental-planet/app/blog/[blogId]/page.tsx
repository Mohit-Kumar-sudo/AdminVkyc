import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BLOG_API!;

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;

  // 1️⃣ Fetch current blog
  const blogRes = await fetch(`${API}/api/blogs/get-single-blog/${blogId}`, {
    cache: "no-store",
  });

  if (!blogRes.ok) {
    return (
      <div className="container py-5 text-center">
        <h2>Blog not found</h2>
      </div>
    );
  }

  const { blog } = await blogRes.json();

  // 2️⃣ Fetch all blogs for "Recent Posts"
  const allRes = await fetch(`${API}/api/blogs/get-all-blogs`, {
    cache: "no-store",
  });

  const allData = await allRes.json();

  const recentBlogs = allData.blogs
    .filter((b: any) => b._id !== blog._id)
    .slice(0, 5);

  return (
    <div className="container py-5">
      {/* BACK */}
      <div className="mb-4">
        <Link
          href="/blog"
          className="btn btn-sm fs-6 px-5 py-3 rounded-pill shadow-lg btn-outline-info fw-semibold"
        >
          ← Back to Blogs
        </Link>
      </div>

      <div className="row g-5">
        {/* ================= LEFT : BLOG CONTENT ================= */}
        <div className="col-lg-8">
          <article className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h1 className="mb-3">{blog.title}</h1>

            <p className="text-muted mb-4">
              Posted on{" "}
              {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              • {blog.author}
            </p>

            <div className="d-flex justify-content-center mb-4">
              <img
                src={`${API}/api/blogs/get-blog-photo/${blog._id}`}
                alt={blog.title}
                style={{
                  maxWidth: "100%",
                  width: "520px",
                  height: "auto",
                  borderRadius: "16px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                }}
              />
            </div>

            <div style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {blog.content}
            </div>
          </article>
        </div>

        {/* ================= RIGHT : RECENT POSTS ================= */}
        <div className="col-12 col-lg-4">
          <div className="sticky-lg-top" style={{ top: "120px" }}>
            <aside className="bg-white rounded-4 shadow-sm p-4">
              <h5 className="fw-semibold mb-3">Recent Posts</h5>

              <ul className="list-unstyled d-flex flex-column gap-4 mb-0">
                {recentBlogs.map((b: any) => (
                  <li key={b._id}>
                    <Link
                      href={`/blog/${b._id}`}
                      className="d-flex gap-3 text-decoration-none align-items-start"
                    >
                      <img
                        src={`${API}/api/blogs/get-blog-photo/${b._id}`}
                        alt={b.title}
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          flexShrink: 0,
                        }}
                      />

                      <div>
                        <div
                          className="fw-medium"
                          style={{
                            color: "#2563eb",
                            lineHeight: 1.4,
                          }}
                        >
                          {b.title}
                        </div>

                        <div className="small text-muted">
                          Posted on{" "}
                          {new Date(b.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          {/* at{" "}
                          {new Date(b.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} */}
                        </div>
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
