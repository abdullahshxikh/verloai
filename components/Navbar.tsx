"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="nav" id="main-nav">
                <div className="nav-inner">
                    <Link href="/" className="nav-logo" id="nav-logo">
                        <span className="nav-logo-icon">V</span>
                        Conversable
                    </Link>

                    <div className="nav-links" id="nav-links">
                        <Link
                            href="/"
                            className={`nav-link ${pathname === "/" ? "active" : ""}`}
                            id="nav-home"
                        >
                            Home
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className={`nav-link ${pathname === "/privacy-policy" ? "active" : ""
                                }`}
                            id="nav-privacy"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className={`nav-link ${pathname === "/terms" ? "active" : ""
                                }`}
                            id="nav-terms"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/contact"
                            className={`nav-link ${pathname === "/contact" ? "active" : ""}`}
                            id="nav-contact"
                        >
                            Contact
                        </Link>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle navigation menu"
                        id="mobile-menu-toggle"
                    >
                        {menuOpen ? (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            <div className={`mobile-menu ${menuOpen ? "open" : ""}`} id="mobile-menu">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                    Home
                </Link>
                <Link href="/privacy-policy" onClick={() => setMenuOpen(false)}>
                    Privacy Policy
                </Link>
                <Link href="/terms" onClick={() => setMenuOpen(false)}>
                    Terms
                </Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>
                    Contact
                </Link>
            </div>
        </>
    );
}
