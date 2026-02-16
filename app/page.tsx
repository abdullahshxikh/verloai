import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Communication Coach</div>
          <h1 className="hero-title">
            Master Your
            <br />
            <span className="highlight">Communication</span>
          </h1>
          <p className="hero-description">
            Verlo AI is your personal AI coach that helps you build real-world
            charisma. Practice voice conversations, get instant feedback, and
            track your growth — all from your phone.
          </p>
          <div className="hero-cta-group">
            <a href="#features" className="btn-primary" id="hero-cta-primary">
              See Features
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </a>
            <Link href="/contact" className="btn-secondary" id="hero-cta-secondary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="page-badge">Features</div>
          <h2>Everything You Need to Level Up</h2>
          <p>
            Built for anyone who wants to become a more confident, charismatic
            communicator.
          </p>
        </div>

        {/* Feature 1: AI Conversations */}
        <div className="feature-block" id="feature-ai-convos">
          <div className="feature-image-wrap">
            <Image
              src="/ai convos.png"
              alt="Verlo AI voice conversation interface"
              width={600}
              height={1067}
              style={{ borderRadius: "var(--radius-xl)" }}
              priority
            />
          </div>
          <div className="feature-text">
            <div className="feature-tag">🎙️ Core Feature</div>
            <h3>AI Voice Conversations</h3>
            <p>
              Have real-time voice conversations with an AI that listens,
              responds naturally, and gives you honest, personalized feedback on
              how you communicate. It&apos;s like having a private coach in your
              pocket.
            </p>
            <ul className="feature-bullets">
              <li>
                <span className="bullet-icon">✓</span>
                Real-time voice interaction with natural AI responses
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Instant feedback on tone, confidence, and clarity
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Practice anytime, anywhere — completely private
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 2: Charisma Score */}
        <div className="feature-block reverse" id="feature-charisma-score">
          <div className="feature-image-wrap">
            <Image
              src="/Charisma score.png"
              alt="Verlo AI charisma score breakdown"
              width={600}
              height={1067}
              style={{ borderRadius: "var(--radius-xl)" }}
            />
          </div>
          <div className="feature-text">
            <div className="feature-tag">📊 Assessment</div>
            <h3>Your Charisma Score</h3>
            <p>
              Get a detailed breakdown of your communication skills across
              multiple categories — confidence, clarity, engagement, and
              emotional intelligence. Watch your score grow as you practice and
              improve.
            </p>
            <ul className="feature-bullets">
              <li>
                <span className="bullet-icon">✓</span>
                Multi-category scoring with detailed analysis
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Baseline assessment to track your starting point
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Data-driven insights that show real progress over time
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Learning Track */}
        <div className="feature-block" id="feature-learning-track">
          <div className="feature-image-wrap">
            <Image
              src="/Home page with learning track and scenarios.png"
              alt="Verlo AI home screen with structured learning levels"
              width={600}
              height={1067}
              style={{ borderRadius: "var(--radius-xl)" }}
            />
          </div>
          <div className="feature-text">
            <div className="feature-tag">🏆 Structured</div>
            <h3>Learning Track &amp; Scenarios</h3>
            <p>
              Follow a curated path through progressively challenging
              conversation scenarios. Each level builds on the last, developing
              well-rounded social skills you can use in real life — from small
              talk to deep conversations.
            </p>
            <ul className="feature-bullets">
              <li>
                <span className="bullet-icon">✓</span>
                Sequential levels that unlock as you progress
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Real-world scenarios covering social, dating, and professional settings
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                XP rewards and streak tracking to keep you motivated
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 4: Freestyle Mode */}
        <div className="feature-block reverse" id="feature-freestyle">
          <div className="feature-image-wrap">
            <Image
              src="/freestyle mode.png"
              alt="Verlo AI freestyle conversation mode"
              width={600}
              height={1067}
              style={{ borderRadius: "var(--radius-xl)" }}
            />
          </div>
          <div className="feature-text">
            <div className="feature-tag">⚡ Open Practice</div>
            <h3>Freestyle Mode</h3>
            <p>
              No scripts. No structure. Just you and the AI in an open-ended
              conversation. Freestyle mode lets you practice whatever you want —
              whether it&apos;s storytelling, flirting, debating, or just getting
              comfortable speaking your mind out loud.
            </p>
            <ul className="feature-bullets">
              <li>
                <span className="bullet-icon">✓</span>
                Unlimited open-ended conversations with AI
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Choose your own topic or let the AI lead
              </li>
              <li>
                <span className="bullet-icon">✓</span>
                Full feedback and scoring after every session
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
