"use client";

import { useState } from "react";

export default function BookAppointment() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });
    }
  };

  return (
    <section className="py-5 bg-gradient" style={{ background: "#f4f9ff" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10">
            <div className="card border-0 shadow-lg rounded-5">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 70,
                      height: 70,
                      background: "#0d6efd",
                      color: "white",
                      fontSize: 30,
                    }}
                  >
                    🦷
                  </div>
                  <h2 className="fw-bold">Book Appointment</h2>
                  <p className="text-muted mb-0">
                    Quick & easy dental consultation booking
                  </p>
                </div>

                {success && (
                  <div className="alert alert-success text-center rounded-pill">
                    ✅ Appointment booked! Confirmation email sent.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text">👤</span>
                      <input
                        className="form-control form-control-lg"
                        name="name"
                        placeholder="Your name"
                        required
                        onChange={handleChange}
                        value={form.name}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text">📧</span>
                      <input
                        className="form-control form-control-lg"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        onChange={handleChange}
                        value={form.email}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <div className="input-group">
                      <span className="input-group-text">📞</span>
                      <input
                        className="form-control form-control-lg"
                        name="phone"
                        placeholder="Phone number"
                        required
                        onChange={handleChange}
                        value={form.phone}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input
                      className="form-control form-control-lg"
                      type="date"
                      name="date"
                      required
                      onChange={handleChange}
                      value={form.date}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Time</label>
                    <input
                      className="form-control form-control-lg"
                      type="time"
                      name="time"
                      required
                      onChange={handleChange}
                      value={form.time}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Message (Optional)</label>
                    <textarea
                      className="form-control"
                      name="message"
                      rows={4}
                      placeholder="Describe your concern"
                      onChange={handleChange}
                      value={form.message}
                    />
                  </div>

                  <div className="col-12 text-center mt-3">
                    <button
                      className="btn btn-primary btn-lg px-5 rounded-pill"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Booking...
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
