import React from "react";

interface StaticPageProps {
  view: "about" | "privacy" | "terms" | "contact";
}

export default function StaticPage({ view }: StaticPageProps) {
  let content = null;

  switch (view) {
    case "about":
      content = (
        <>
          <h1 className="page-title">About Us</h1>
          <p className="page-desc">Nepal Local Government Manpower Platform</p>
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <h3>Our Mission</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              The Shram Sewa (श्रम सेवा) platform is designed specifically to formalize the unorganized labor
              market across Nepal's 753 local units. Our goal is to connect dedicated physical workers—from 
              gardeners to agricultural laborers—with households and employers reliably and respectfully.
            </p>
            <h3 style={{ marginTop: 24 }}>Why This Platform?</h3>
            <ul style={{ marginTop: 12, marginLeft: 20, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              <li>Direct verification by local wards ensures safety and trust.</li>
              <li>Designed for low-end devices and 2G/3G connectivity.</li>
              <li>Ensures local workers find jobs close to their home district.</li>
            </ul>
          </div>
        </>
      );
      break;
    case "privacy":
      content = (
        <>
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-desc">How we handle your data.</p>
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <h3>1. Data Collection</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              We collect minimal information necessary to facilitate hirer-to-worker connections. This includes phone numbers, localized geo-points (wards), and IP fingerprints to ensure community guidelines are followed.
            </p>
            <h3 style={{ marginTop: 24 }}>2. Usage Review</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Under Nepal Government privacy framework protocols, your data is never sold to third-party advertisers. Activity logs are maintained purely for resolving disputes and audit history.
            </p>
          </div>
        </>
      );
      break;
    case "terms":
      content = (
        <>
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-desc">Agreements for all participants.</p>
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <h3>Fair Wage Agreement</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              By participating on this platform, employers agree to pay standard rates negotiated clearly before work commences. Wage theft will result in a permanent ban.
            </p>
            <h3 style={{ marginTop: 24 }}>Work Condition Policy</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Safe working environments are mandatory. Neither the platform nor local municipalities hold liability for private disputes, though structured mediation mechanisms exist.
            </p>
          </div>
        </>
      );
      break;
    case "contact":
      content = (
        <>
          <h1 className="page-title">Contact Support</h1>
          <p className="page-desc">We are here to help.</p>
          <div className="card" style={{ padding: 24, marginTop: 16 }}>
            <h3>General Inquiries</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              For issues regarding pending payments, reporting accounts, or technical problems with the application, you can reach out via local municipality help desks.
            </p>
            <h3 style={{ marginTop: 24 }}>Technical Support Email</h3>
            <p style={{ marginTop: 12, lineHeight: 1.6, color: "var(--text-secondary)" }}>
              <strong>support@shram-sewa.gov.np</strong>
            </p>
          </div>
        </>
      );
      break;
  }

  return <div className="section">{content}</div>;
}
