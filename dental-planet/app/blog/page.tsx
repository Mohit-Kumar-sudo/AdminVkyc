"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_BLOG_API!;

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await fetch(`${API}/api/blogs/get-all-blogs`);
      const data = await res.json();
      setBlogs(data.blogs || []);
    };
    fetchBlogs();
  }, []);

  return (
    <main>
      {/* PAGE HEADER */}
      <section className="py-5 blogs-section-blue">
        <div className="container text-center">
          <span className="badge blogs-badge-blue mb-3 px-4 py-2 rounded-pill">
            📘 Knowledge Hub
          </span>

          <h1 className="fw-bold mb-2 blogs-title-blue">Dental Blogs</h1>

          <p className="text-muted mb-0 mx-auto blogs-description-blue">
            Expert tips, guides & insights to help you maintain a healthy,
            confident smile.
          </p>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="col-sm-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  {/* IMAGE */}
                  <div className="ratio ratio-16x9">
                    <Image
                      src={`${API}/api/blogs/get-blog-photo/${blog._id}`}
                      alt={blog.title}
                      fill
                      unoptimized
                      className="object-fit-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-semibold mb-2">{blog.title}</h5>
                    <div className="small text-muted">
                      Posted on{" "}
                      {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {/* at{" "}
                                  {new Date(blog.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })} */}
                    </div>

                    <p className="text-muted small flex-grow-1 lh-lg">
                      {blog.excerpt}
                    </p>
                    <Link
                      href={`/blog/${blog._id}`}
                      className="btn btn-sm fs-6 px-5 py-3 rounded-pill shadow-lg btn-outline-info fw-semibold mt-auto"
                    >
                      Read Blog →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
