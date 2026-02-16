"use client";

import { useState, FormEvent } from "react";
import type { Metadata } from "next";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // Open mailto with form data
        const form = e.currentTarget;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const subject = (form.elements.namedItem("subject") as HTMLInputElement).value;
        const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

        const mailtoLink = `mailto:verloai456@gmail.com?subject=${encodeURIComponent(
            subject || "Verlo AI Contact"
        )}&body=${encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\n${message}`
        )}`;

        window.open(mailtoLink, "_blank");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    }

    return (
        <div className="page-container-wide" id="contact-page">
            <div className="page-header">
                <div className="page-badge">💬 Get in Touch</div>
                <h1 className="page-title">Contact Us</h1>
                <p className="page-subtitle">
                    Have a question, feedback, or need help? We&apos;d love to hear from
                    you. Reach out and we&apos;ll get back to you as soon as possible.
                </p>
            </div>

            {/* Contact Cards */}
            <div className="contact-grid" id="contact-info">
                <div className="contact-card" id="contact-email-card">
                    <div className="contact-card-icon">📧</div>
                    <h3>Email Us</h3>
                    <p>
                        Send us an email directly and we&apos;ll respond within 24 hours.
                    </p>
                    <p>
                        <a href="mailto:verloai456@gmail.com">
                            verloai456@gmail.com
                        </a>
                    </p>
                    <div className="contact-response-badge">
                        <span className="pulse-dot"></span>
                        Responses within 24 hours
                    </div>
                </div>

                <div className="contact-card" id="contact-support-card">
                    <div className="contact-card-icon">🛡️</div>
                    <h3>Privacy &amp; Data</h3>
                    <p>
                        Questions about your data, privacy rights, or want to request
                        account deletion? We take your privacy seriously.
                    </p>
                    <p>
                        <a href="mailto:verloai456@gmail.com">
                            verloai456@gmail.com
                        </a>
                    </p>
                    <div className="contact-response-badge">
                        <span className="pulse-dot"></span>
                        Responses within 24 hours
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section" id="contact-form-section">
                <h2>Send Us a Message</h2>
                <p>
                    Fill out the form below and we&apos;ll get back to you within 24
                    hours.
                </p>

                <form onSubmit={handleSubmit} id="contact-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject" className="form-label">
                            Subject
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            className="form-input"
                            placeholder="What's this about?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message" className="form-label">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            className="form-textarea"
                            placeholder="Tell us what you need help with..."
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="form-submit" id="contact-submit-btn">
                        Send Message
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Toast */}
            <div className={`success-toast ${submitted ? "show" : ""}`} id="success-toast">
                ✅ Email client opened — send your message!
            </div>
        </div>
    );
}
