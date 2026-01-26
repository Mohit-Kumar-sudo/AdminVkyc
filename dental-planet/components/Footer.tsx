"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row g-4">
          {/* BRAND */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-3">Dental Planet</h5>
            <p className="opacity-75 mb-3">
              Modern, gentle and trusted dental care for the whole family.
            </p>
            <div className="mb-3">
              <h6 className="fw-semibold mb-2">Founders</h6>
              <p className="small opacity-75 mb-1">Dr. Ankur Vatsal</p>
              <p className="small opacity-75">Dr. Khushboo Barjatya Vatsal</p>
            </div>
            {/* SOCIAL MEDIA */}
            <div>
              <h6 className="fw-semibold mb-2">Follow Us</h6>
              <a
                href="https://www.instagram.com/dental_____planet/"
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 40, height: 40, background: "#fff" }}
              >
                <img
                  src="/images/instagram2.png"
                  alt="Instagram"
                  width="40"
                  height="40"
                />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-lg-2 col-md-4">
            <h6 className="fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#about" className="text-white-50 text-decoration-none">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#services"
                  className="text-white-50 text-decoration-none"
                >
                  Services
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#gallery"
                  className="text-white-50 text-decoration-none"
                >
                  Gallery
                </a>
              </li>
              <li className="mb-2">
                <a href="#blog" className="text-white-50 text-decoration-none">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="col-lg-3 col-md-4">
            <h6 className="fw-semibold mb-3">Contact</h6>
            <p className="small opacity-75 mb-2">
              📍 17 A Baktawar Ram Nagar, Tilak Nagar, Indore
            </p>
            <p className="small opacity-75 mb-2">📞 9301665066, 74006 30334</p>
            <p className="small opacity-75 mb-2">✉️ kbdentalplanet@gmail.com</p>
            <p className="small opacity-75 mb-0">
              🕒 Weekdays: 10am–2pm, 5pm–8:30pm
              <br />
              Sundays: Appointment only (10am–12pm)
            </p>
          </div>

          {/* MAP */}
          <div className="col-lg-3 col-md-4">
            <h6 className="fw-semibold mb-3">Our Location</h6>
            <div className="mb-3">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.8!2d75.8!3d22.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQyJzAwLjAiTiA3NcKwNDgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="150"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Dental+planet+Tilak+Nagar+Indore"
              target="_blank"
              rel="noopener noreferrer"
              className="small fw-semibold text-success text-decoration-none"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        className="text-center py-3 mt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        <small className="fw-semibold opacity-75 d-block">
          © {new Date().getFullYear()} Dental Planet — All Rights Reserved
        </small>
        <small className="opacity-50">
          Designed & Developed by{" "}
          <span className="fw-semibold">Kiwi Connect Digital</span>
        </small>
      </div>
    </footer>
  );
}
