import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy – Verlo AI",
    description:
        "Read the Verlo AI Privacy Policy. Learn how we collect, use, and protect your personal information when using our AI communication coaching app.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="page-container" id="privacy-policy-page">
            <div className="page-header">
                <div className="page-badge">🔒 Legal</div>
                <h1 className="page-title">Privacy Policy</h1>
                <p className="page-subtitle">
                    Your privacy matters to us. This policy explains how Verlo AI collects,
                    uses, stores, and protects your personal information.
                </p>
                <p className="page-last-updated">Last updated: February 16, 2026</p>
            </div>

            {/* Table of Contents */}
            <div className="toc" id="privacy-toc">
                <h3>Table of Contents</h3>
                <ol className="toc-list">
                    <li>
                        <a href="#section-1">
                            <span className="toc-number">01</span> Introduction
                        </a>
                    </li>
                    <li>
                        <a href="#section-2">
                            <span className="toc-number">02</span> Information We Collect
                        </a>
                    </li>
                    <li>
                        <a href="#section-3">
                            <span className="toc-number">03</span> How We Use Your Information
                        </a>
                    </li>
                    <li>
                        <a href="#section-4">
                            <span className="toc-number">04</span> Data Storage &amp; Security
                        </a>
                    </li>
                    <li>
                        <a href="#section-5">
                            <span className="toc-number">05</span> Third-Party Services
                        </a>
                    </li>
                    <li>
                        <a href="#section-6">
                            <span className="toc-number">06</span> Your Rights &amp; Choices
                        </a>
                    </li>
                    <li>
                        <a href="#section-7">
                            <span className="toc-number">07</span> Data Retention
                        </a>
                    </li>
                    <li>
                        <a href="#section-8">
                            <span className="toc-number">08</span> Children&apos;s Privacy
                        </a>
                    </li>
                    <li>
                        <a href="#section-9">
                            <span className="toc-number">09</span> International Transfers
                        </a>
                    </li>
                    <li>
                        <a href="#section-10">
                            <span className="toc-number">10</span> Cookies &amp; Tracking
                        </a>
                    </li>
                    <li>
                        <a href="#section-11">
                            <span className="toc-number">11</span> Changes to This Policy
                        </a>
                    </li>
                    <li>
                        <a href="#section-12">
                            <span className="toc-number">12</span> Contact Us
                        </a>
                    </li>
                </ol>
            </div>

            <div className="policy-content">
                {/* 1. Introduction */}
                <section className="policy-section" id="section-1">
                    <div className="policy-section-number">1</div>
                    <h2>Introduction</h2>
                    <p>
                        Welcome to Verlo AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Verlo AI is an
                        AI-powered communication coaching application designed to help you
                        improve your social and conversational skills through interactive voice
                        practice, assessments, and personalized feedback.
                    </p>
                    <p>
                        This Privacy Policy describes how we collect, use, disclose, and
                        safeguard your information when you use our mobile application
                        (&quot;App&quot;), website, and related services (collectively, the
                        &quot;Services&quot;). By accessing or using our Services, you agree to the
                        collection and use of information in accordance with this policy.
                    </p>
                    <div className="policy-highlight">
                        <p>
                            If you do not agree with the terms of this Privacy Policy, please do
                            not access or use our Services. We encourage you to read this
                            document in full.
                        </p>
                    </div>
                </section>

                {/* 2. Information We Collect */}
                <section className="policy-section" id="section-2">
                    <div className="policy-section-number">2</div>
                    <h2>Information We Collect</h2>

                    <h3>2.1 Information You Provide Directly</h3>
                    <p>
                        When you create an account, interact with our Services, or contact us,
                        we may collect the following information:
                    </p>
                    <ul>
                        <li>
                            <strong>Account Information:</strong> Your name, email address, and
                            password when you sign up via email or Apple Sign-In.
                        </li>
                        <li>
                            <strong>Profile Data:</strong> Gender, dating preferences, personal
                            goals, identified obstacles, and daily time investment preferences
                            you provide during onboarding.
                        </li>
                        <li>
                            <strong>Voice &amp; Audio Data:</strong> Audio recordings of your
                            voice during practice conversations and assessments. These are
                            processed in real-time and are not permanently stored on our servers
                            unless explicitly stated.
                        </li>
                        <li>
                            <strong>Assessment Results:</strong> Your baseline charisma scores,
                            category breakdowns (confidence, clarity, engagement, emotional
                            intelligence), and progress data.
                        </li>
                        <li>
                            <strong>Communication Content:</strong> Messages, feedback, or
                            inquiries you send to us via our contact channels.
                        </li>
                    </ul>

                    <h3>2.2 Information Collected Automatically</h3>
                    <p>
                        When you use our Services, certain information is collected
                        automatically:
                    </p>
                    <ul>
                        <li>
                            <strong>Device Information:</strong> Device type, operating system,
                            unique device identifiers, and mobile network information.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Features accessed, time spent in the
                            App, levels completed, XP earned, streak data, session timestamps,
                            and interaction patterns.
                        </li>
                        <li>
                            <strong>Log Data:</strong> IP address, browser type (for web access),
                            access times, pages viewed, and crash or error logs.
                        </li>
                        <li>
                            <strong>Performance Data:</strong> App performance metrics to help us
                            diagnose issues and improve the user experience.
                        </li>
                    </ul>

                    <h3>2.3 Information from Third Parties</h3>
                    <ul>
                        <li>
                            <strong>Authentication Providers:</strong> If you sign in using Apple
                            Sign-In, we may receive your name, email address, and a unique
                            identifier from Apple.
                        </li>
                        <li>
                            <strong>Payment Processors:</strong> Subscription and purchase
                            information processed through RevenueCat and the Apple App Store or
                            Google Play Store. We do not directly receive or store your full
                            payment card details.
                        </li>
                        <li>
                            <strong>Analytics Providers:</strong> Aggregated and anonymized usage
                            data from analytics services we integrate.
                        </li>
                    </ul>
                </section>

                {/* 3. How We Use Your Information */}
                <section className="policy-section" id="section-3">
                    <div className="policy-section-number">3</div>
                    <h2>How We Use Your Information</h2>
                    <p>We use the collected information for the following purposes:</p>
                    <ul>
                        <li>
                            <strong>Provide &amp; Improve Services:</strong> To deliver our
                            AI-powered coaching experience, generate personalized feedback,
                            calculate your charisma scores, and improve our AI models and
                            features.
                        </li>
                        <li>
                            <strong>Account Management:</strong> To create and manage your
                            account, authenticate your identity, and maintain your user profile.
                        </li>
                        <li>
                            <strong>Personalization:</strong> To tailor content, level
                            recommendations, and coaching insights based on your goals,
                            performance, and usage patterns.
                        </li>
                        <li>
                            <strong>Progress Tracking:</strong> To manage your XP, streaks,
                            level progression, and display your growth metrics within the App.
                        </li>
                        <li>
                            <strong>Subscription Management:</strong> To process and manage your
                            subscription, entitlements, and purchases through our payment
                            partners.
                        </li>
                        <li>
                            <strong>Communication:</strong> To respond to your inquiries,
                            provide customer support, and send service-related notifications
                            (e.g., account verification, security alerts).
                        </li>
                        <li>
                            <strong>Analytics &amp; Research:</strong> To analyze usage trends,
                            monitor app performance, and conduct internal research to improve
                            our product and user experience.
                        </li>
                        <li>
                            <strong>Safety &amp; Security:</strong> To detect, prevent, and
                            address fraud, abuse, security issues, and technical problems.
                        </li>
                        <li>
                            <strong>Legal Compliance:</strong> To comply with applicable laws,
                            regulations, legal processes, or governmental requests.
                        </li>
                    </ul>
                    <div className="policy-highlight">
                        <p>
                            We do <strong>not</strong> sell your personal information to third
                            parties. We do <strong>not</strong> use your voice recordings for
                            advertising purposes.
                        </p>
                    </div>
                </section>

                {/* 4. Data Storage & Security */}
                <section className="policy-section" id="section-4">
                    <div className="policy-section-number">4</div>
                    <h2>Data Storage &amp; Security</h2>
                    <p>
                        We take the security of your personal information seriously and
                        implement industry-standard measures to protect it:
                    </p>
                    <ul>
                        <li>
                            <strong>Encryption:</strong> Data is encrypted in transit using TLS
                            (Transport Layer Security) and at rest using AES-256 encryption.
                        </li>
                        <li>
                            <strong>Secure Infrastructure:</strong> Our data is hosted on
                            Supabase, which provides enterprise-grade security, including
                            row-level security (RLS), encrypted backups, and SOC 2 compliance.
                        </li>
                        <li>
                            <strong>Access Controls:</strong> Access to personal data is
                            restricted to authorized personnel only, on a need-to-know basis.
                        </li>
                        <li>
                            <strong>Authentication Security:</strong> We support secure
                            authentication methods including email/password with hashed
                            credentials and Apple Sign-In.
                        </li>
                        <li>
                            <strong>Regular Audits:</strong> We periodically review our security
                            practices and update them to address new threats and
                            vulnerabilities.
                        </li>
                    </ul>
                    <p>
                        While we strive to use commercially acceptable means to protect your
                        information, no method of transmission over the Internet or electronic
                        storage is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                {/* 5. Third-Party Services */}
                <section className="policy-section" id="section-5">
                    <div className="policy-section-number">5</div>
                    <h2>Third-Party Services</h2>
                    <p>
                        Our Services integrate with the following third-party providers, each
                        with their own privacy policies:
                    </p>
                    <ul>
                        <li>
                            <strong>Supabase:</strong> Backend infrastructure, database hosting,
                            and user authentication. Visit{" "}
                            <a
                                href="https://supabase.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-accent)" }}
                            >
                                Supabase Privacy Policy
                            </a>
                            .
                        </li>
                        <li>
                            <strong>RevenueCat:</strong> Subscription management and in-app
                            purchase processing. Visit{" "}
                            <a
                                href="https://www.revenuecat.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-accent)" }}
                            >
                                RevenueCat Privacy Policy
                            </a>
                            .
                        </li>
                        <li>
                            <strong>Groq:</strong> AI inference and natural language processing
                            for coaching conversations. Visit{" "}
                            <a
                                href="https://groq.com/privacy-policy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-accent)" }}
                            >
                                Groq Privacy Policy
                            </a>
                            .
                        </li>
                        <li>
                            <strong>Inworld:</strong> AI-powered character engine for
                            interactive voice conversations and real-time dialogue. Visit{" "}
                            <a
                                href="https://inworld.ai/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--text-accent)" }}
                            >
                                Inworld Privacy Policy
                            </a>
                            .
                        </li>
                        <li>
                            <strong>Apple App Store / Google Play Store:</strong> App
                            distribution and payment processing. See their respective privacy
                            policies.
                        </li>
                        <li>
                            <strong>Expo / React Native:</strong> Application framework and
                            development tools. No user data is shared with Expo.
                        </li>
                    </ul>
                    <p>
                        We recommend reviewing the privacy policies of these third-party
                        services to understand their data practices.
                    </p>
                </section>

                {/* 6. Your Rights & Choices */}
                <section className="policy-section" id="section-6">
                    <div className="policy-section-number">6</div>
                    <h2>Your Rights &amp; Choices</h2>
                    <p>
                        Depending on your jurisdiction, you may have the following rights
                        regarding your personal data:
                    </p>
                    <ul>
                        <li>
                            <strong>Access:</strong> Request a copy of the personal data we hold
                            about you.
                        </li>
                        <li>
                            <strong>Rectification:</strong> Request correction of any inaccurate
                            or incomplete personal data.
                        </li>
                        <li>
                            <strong>Deletion:</strong> Request deletion of your personal data,
                            subject to certain legal exceptions. You can also delete your
                            account directly within the App settings.
                        </li>
                        <li>
                            <strong>Portability:</strong> Request a portable copy of your data
                            in a commonly used, machine-readable format.
                        </li>
                        <li>
                            <strong>Restriction:</strong> Request restriction of processing of
                            your personal data under certain circumstances.
                        </li>
                        <li>
                            <strong>Objection:</strong> Object to the processing of your
                            personal data for direct marketing or where we rely on legitimate
                            interests.
                        </li>
                        <li>
                            <strong>Withdraw Consent:</strong> Where we rely on consent for
                            processing, you may withdraw your consent at any time without
                            affecting the lawfulness of prior processing.
                        </li>
                    </ul>
                    <p>
                        To exercise any of these rights, please contact us at{" "}
                        <a
                            href="mailto:verloai456@gmail.com"
                            style={{ color: "var(--text-accent)", fontWeight: 600 }}
                        >
                            verloai456@gmail.com
                        </a>
                        . We will respond to your request within 30 days.
                    </p>

                    <h3>California Residents (CCPA)</h3>
                    <p>
                        If you are a California resident, you have additional rights under the
                        California Consumer Privacy Act (CCPA), including the right to know
                        what personal information we collect, the right to delete your data,
                        and the right to opt-out of the sale of your personal information. As
                        noted above, we do not sell personal information.
                    </p>

                    <h3>European Economic Area (GDPR)</h3>
                    <p>
                        If you are located in the EEA, the General Data Protection Regulation
                        (GDPR) provides you with additional rights. The legal bases for our
                        processing include: consent, performance of a contract (providing our
                        Services), legitimate interests (improving our product), and legal
                        obligations. You also have the right to lodge a complaint with your
                        local data protection authority.
                    </p>
                </section>

                {/* 7. Data Retention */}
                <section className="policy-section" id="section-7">
                    <div className="policy-section-number">7</div>
                    <h2>Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to
                        provide our Services and fulfill the purposes described in this
                        Privacy Policy, unless a longer retention period is required or
                        permitted by law.
                    </p>
                    <ul>
                        <li>
                            <strong>Account Data:</strong> Retained for as long as your account
                            is active. Upon account deletion, we will delete or anonymize your
                            data within 30 days, except where we are legally required to retain
                            it.
                        </li>
                        <li>
                            <strong>Voice Recordings:</strong> Processed in real-time for AI
                            coaching and are not permanently stored. Transcripts may be retained
                            temporarily to generate session feedback, after which they are
                            deleted.
                        </li>
                        <li>
                            <strong>Usage &amp; Analytics Data:</strong> May be retained in
                            aggregated, anonymized form for product improvement and research
                            purposes.
                        </li>
                        <li>
                            <strong>Transaction Data:</strong> Retained as required by
                            applicable tax and financial regulations.
                        </li>
                    </ul>
                </section>

                {/* 8. Children's Privacy */}
                <section className="policy-section" id="section-8">
                    <div className="policy-section-number">8</div>
                    <h2>Children&apos;s Privacy</h2>
                    <p>
                        Our Services are not directed to individuals under the age of 13 (or
                        16 in certain jurisdictions). We do not knowingly collect personal
                        information from children under these ages. If we learn that we have
                        collected personal information from a child under the applicable age,
                        we will take steps to delete that information as soon as possible.
                    </p>
                    <p>
                        If you are a parent or guardian and believe your child has provided us
                        with personal information, please contact us at{" "}
                        <a
                            href="mailto:verloai456@gmail.com"
                            style={{ color: "var(--text-accent)", fontWeight: 600 }}
                        >
                            verloai456@gmail.com
                        </a>{" "}
                        so we can take appropriate action.
                    </p>
                </section>

                {/* 9. International Data Transfers */}
                <section className="policy-section" id="section-9">
                    <div className="policy-section-number">9</div>
                    <h2>International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries
                        other than your country of residence. These countries may have data
                        protection laws that differ from those in your jurisdiction.
                    </p>
                    <p>
                        When we transfer data internationally, we implement appropriate
                        safeguards, such as Standard Contractual Clauses (SCCs) approved by
                        relevant authorities, to ensure your data remains protected in
                        accordance with this Privacy Policy and applicable laws.
                    </p>
                </section>

                {/* 10. Cookies & Tracking */}
                <section className="policy-section" id="section-10">
                    <div className="policy-section-number">10</div>
                    <h2>Cookies &amp; Tracking Technologies</h2>
                    <p>
                        Our website may use cookies and similar tracking technologies to
                        enhance your browsing experience, analyze website traffic, and
                        understand user behavior.
                    </p>
                    <ul>
                        <li>
                            <strong>Essential Cookies:</strong> Necessary for the website to
                            function properly (e.g., session management).
                        </li>
                        <li>
                            <strong>Analytics Cookies:</strong> Help us understand how visitors
                            interact with our website by collecting and reporting information
                            anonymously.
                        </li>
                        <li>
                            <strong>Preference Cookies:</strong> Allow our website to remember
                            your settings and preferences.
                        </li>
                    </ul>
                    <p>
                        You can control or disable cookies through your browser settings. Note
                        that disabling certain cookies may affect the functionality of our
                        website. Our mobile App does not use cookies but may use local storage
                        (AsyncStorage) to persist your preferences and progress data on your
                        device.
                    </p>
                </section>

                {/* 11. Changes to This Policy */}
                <section className="policy-section" id="section-11">
                    <div className="policy-section-number">11</div>
                    <h2>Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes
                        in our practices, technology, legal requirements, or other factors. We
                        will notify you of any material changes by:
                    </p>
                    <ul>
                        <li>
                            Posting the updated Privacy Policy on this page with a revised
                            &quot;Last updated&quot; date.
                        </li>
                        <li>
                            Sending you a notification through the App or via email (for
                            significant changes).
                        </li>
                    </ul>
                    <p>
                        We encourage you to review this Privacy Policy periodically. Your
                        continued use of our Services after any changes constitutes your
                        acceptance of the updated Privacy Policy.
                    </p>
                </section>

                {/* 12. Contact Us */}
                <section className="policy-section" id="section-12">
                    <div className="policy-section-number">12</div>
                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions, concerns, or requests regarding this
                        Privacy Policy or our data practices, please contact us:
                    </p>
                    <ul>
                        <li>
                            <strong>Email:</strong>{" "}
                            <a
                                href="mailto:verloai456@gmail.com"
                                style={{ color: "var(--text-accent)", fontWeight: 600 }}
                            >
                                verloai456@gmail.com
                            </a>
                        </li>
                        <li>
                            <strong>Response Time:</strong> We aim to respond to all inquiries
                            within 24 hours.
                        </li>
                    </ul>
                    <div className="policy-highlight">
                        <p>
                            We are committed to working with you to resolve any privacy concerns
                            you may have. If you are not satisfied with our response, you may
                            have the right to lodge a complaint with your local data protection
                            authority.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
