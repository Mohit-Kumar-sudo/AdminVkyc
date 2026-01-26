"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-glass sticky-top p-0">
      <div className="container p-0">
        {/* BRAND */}
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <Image
            src="/images/logo3.png"
            alt="Dental Planet Logo"
            width={180}
            height={80}
            priority
            className="navbar-logo"
          />
        </Link>
        {/* TOGGLER */}
        <button
          className="navbar-toggler border-0"
          type="button"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon-custom">
            {open ? "✖" : "☰"}
          </span>
        </button>

        {/* DESKTOP NAV */}
        <div className="d-none d-lg-flex ms-auto">
          <ul className="navbar-nav align-items-center gap-4">
            <li className="nav-item">
              <Link href="/about" className="nav-link nav-link-modern">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/services" className="nav-link nav-link-modern">
                Services
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/gallery" className="nav-link nav-link-modern">
                Gallery
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/blog" className="nav-link nav-link-modern">
                Blog
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/book-appointment"
                className="nav-link nav-link-modern"
              >
                Book Appointment
              </Link>
            </li>
            <a
              href="https://www.instagram.com/dental_____planet/"
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 40, height: 40, background: "#fff" }}
            >
              <img
                src="/images/instagram.png"
                alt="Instagram"
                width="30"
                height="30"
              />
            </a>
          </ul>
        </div>
      </div>
      {/* MOBILE NAV */}
      {/* MOBILE NAV */}
      {open && (
        <div
          className="d-lg-none navbar-mobile border-top w-100 text-center bg-white"
          style={{
            maxHeight: "calc(100vh - 80px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ul className="navbar-nav px-4 py-4 gap-3">
            {/* NAV LINKS */}
            {["about", "services", "gallery", "blog"].map((item) => (
              <li className="nav-item" key={item}>
                <Link
                  href={`/${item}`}
                  className="nav-link nav-link-modern"
                  onClick={() => setOpen(false)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              </li>
            ))}

            {/* BOOK APPOINTMENT CTA */}
            <li className="nav-item">
              <Link
                className="nav-link nav-link-modern"
                href="/book-appointment"
                onClick={() => setOpen(false)}
              >
                Book Appointment
              </Link>
            </li>

            {/* INSTAGRAM ICON (IMAGE) */}
            <li className="nav-item  d-flex justify-content-center">
              <a
                href="https://www.instagram.com/dental_____planet/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 44,
                  height: 44,
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                aria-label="Instagram"
              >
                <img
                  src="/images/instagram.png"
                  alt="Instagram"
                  width="24"
                  height="24"
                />
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
