import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer" id="footer">
            <div className="footer-inner">
                <Link href="/" className="footer-brand" id="footer-brand">
                    <span className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: '0.8rem', borderRadius: 8 }}>V</span>
                    Conversable
                </Link>

                <div className="footer-links" id="footer-links">
                    <Link href="/" className="footer-link">
                        Home
                    </Link>
                    <Link href="/privacy-policy" className="footer-link">
                        Privacy Policy
                    </Link>
                    <Link href="/contact" className="footer-link">
                        Contact
                    </Link>
                </div>

                <p className="footer-copy">
                    &copy; {currentYear} Conversable. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
