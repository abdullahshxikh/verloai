import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us – Conversable",
    description:
        "Get in touch with the Conversable team. Reach out for questions, feedback, or support.",
};

export default function ContactPage() {
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
                        <a href="mailto:conversable456@gmail.com">
                            conversable456@gmail.com
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
                        <a href="mailto:conversable456@gmail.com">
                            conversable456@gmail.com
                        </a>
                    </p>
                    <div className="contact-response-badge">
                        <span className="pulse-dot"></span>
                        Responses within 24 hours
                    </div>
                </div>
            </div>
        </div>
    );
}
