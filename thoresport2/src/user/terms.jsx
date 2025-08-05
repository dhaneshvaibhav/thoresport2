import React from "react";

function Terms() {
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Terms and Conditions</h1>
          <p style={subtitleStyle}>THOR ESPORTS</p>
          <div style={dateStyle}>
            <strong>Effective Date:</strong> August 7, 2025
          </div>
        </div>

        {/* Introduction */}
        <div style={sectionStyle}>
          <p style={introStyle}>
            Welcome to <strong style={brandStyle}>THOR ESPORTS</strong>! By registering and participating in any tournament hosted on our platform, you agree to comply with the following Terms and Conditions. Please read them carefully.
          </p>
        </div>

        {/* Terms Sections */}
        <div style={termsContentStyle}>
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>1. Eligibility</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>Participants must be 13 years or older. Minors must have parental or guardian permission.</li>
              <li style={listItemStyle}>All participants must provide accurate and up-to-date in-game information and contact details.</li>
              <li style={listItemStyle}>Participants must reside in a region where Free Fire tournaments are legally allowed.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>2. Registration</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>Tournament slots are filled on a first-come, first-served basis.</li>
              <li style={listItemStyle}>A team/player is considered registered only after confirmation via email or website dashboard.</li>
              <li style={listItemStyle}>Any incomplete or false registration may result in disqualification.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>3. Code of Conduct</h2>
            <p style={paragraphStyle}><strong>Players must:</strong></p>
            <ul style={listStyle}>
              <li style={listItemStyle}>Respect all participants, admins, and spectators.</li>
              <li style={listItemStyle}>Avoid any form of cheating, hacking, bug abuse, or use of unauthorized software.</li>
              <li style={listItemStyle}>Refrain from toxic behavior, including threats, offensive language, or spamming.</li>
            </ul>
            <p style={warningStyle}>
              <strong>⚠️ Warning:</strong> Violation of these rules may result in immediate disqualification and ban.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>4. Match Rules</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>Matches must be played in accordance with the format posted on the website (e.g., Solo, Duo, Squad, Custom Room).</li>
              <li style={listItemStyle}>All players must join the lobby within the given time. Late entries are not allowed.</li>
              <li style={listItemStyle}>In case of a tie, ranking will be determined based on: <strong>kills → survival time → placement</strong>.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>5. Cheating and Fair Play</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>The use of third-party tools or scripts is strictly prohibited.</li>
              <li style={listItemStyle}>All suspicious behavior will be reviewed, and admins have full authority to disqualify any player/team.</li>
              <li style={listItemStyle}>Players may be asked to record their gameplay or share screen during key matches for verification.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>6. Prizes</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>Prizes will be distributed as mentioned on the tournament page.</li>
              <li style={listItemStyle}>Winners must provide correct payment details (e.g., UPI, Paytm, PayPal).</li>
              <li style={listItemStyle}>Payouts are processed within 7–14 business days after tournament completion.</li>
              <li style={listItemStyle}>We reserve the right to withhold prizes if there is any violation of rules or suspicious activity.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>7. Technical Issues</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>We are not responsible for individual player network issues, lag, or device failures.</li>
              <li style={listItemStyle}>In case of server issues or game crashes affecting multiple players, the match may be restarted at the admin's discretion.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>8. Disputes and Decisions</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>All decisions made by tournament admins are final and binding.</li>
              <li style={listItemStyle}>Players can contact support within 24 hours of match completion for any disputes or issues.</li>
              <li style={listItemStyle}>Any form of harassment towards admins will result in a ban.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>9. Changes and Cancellation</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>We reserve the right to modify, postpone, or cancel the tournament at any time.</li>
              <li style={listItemStyle}>Changes will be communicated via the website or email in advance where possible.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>10. Limitation of Liability</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>We are not affiliated with or endorsed by Garena Free Fire or its partners.</li>
              <li style={listItemStyle}>We are not liable for any personal, technical, or financial damages incurred through participation.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>11. Privacy Policy</h2>
            <ul style={listStyle}>
              <li style={listItemStyle}>Participant data is collected solely for tournament purposes.</li>
              <li style={listItemStyle}>We will not share your personal information with third parties without your consent, except as required by law.</li>
            </ul>
          </section>
        </div>

        {/* Agreement Notice */}
        <div style={agreementStyle}>
          <h3 style={agreementTitleStyle}>Agreement</h3>
          <p style={agreementTextStyle}>
            By participating in our tournament, you agree to these Terms and Conditions. If you do not agree, please do not register or participate.
          </p>
        </div>

        {/* Contact Information */}
        <div style={contactStyle}>
          <h3 style={contactTitleStyle}>Contact Us</h3>
          <p style={contactTextStyle}>
            For any queries, reach out to us at:{' '}
            <a href="mailto:thoresportsoffical@gmail.com" style={emailStyle}>
              thoresportsoffical@gmail.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            © 2025 THOR ESPORTS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  backgroundColor: '#0a0a0a',
  minHeight: '100vh',
  padding: '2rem 1rem',
  fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
  color: '#ffffff',
  lineHeight: '1.6',
};

const contentStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  border: '1px solid #0DCAF0',
  boxShadow: '0 0 30px rgba(13, 202, 240, 0.1)',
  overflow: 'hidden',
};

const headerStyle = {
  background: 'linear-gradient(135deg, #0DCAF0 0%, #0891b2 100%)',
  padding: '3rem 2rem',
  textAlign: 'center',
  color: '#000',
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  margin: '0 0 0.5rem 0',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const subtitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '500',
  margin: '0 0 1rem 0',
  opacity: '0.9',
};

const dateStyle = {
  fontSize: '1rem',
  backgroundColor: 'rgba(0,0,0,0.1)',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
  display: 'inline-block',
};

const introStyle = {
  fontSize: '1.1rem',
  textAlign: 'center',
  color: '#e0e0e0',
  margin: '0',
};

const brandStyle = {
  color: '#0DCAF0',
  fontWeight: '700',
};

const termsContentStyle = {
  padding: '0 2rem 1rem 2rem',
};

const sectionStyle = {
  marginBottom: '2rem',
  padding: '1.5rem 2rem',
};

const sectionTitleStyle = {
  color: '#0DCAF0',
  fontSize: '1.4rem',
  fontWeight: '600',
  marginBottom: '1rem',
  borderBottom: '2px solid #0DCAF0',
  paddingBottom: '0.5rem',
};

const paragraphStyle = {
  color: '#e0e0e0',
  marginBottom: '1rem',
  fontSize: '1rem',
};

const listStyle = {
  paddingLeft: '1.5rem',
  margin: '0',
};

const listItemStyle = {
  color: '#d0d0d0',
  marginBottom: '0.8rem',
  fontSize: '1rem',
};

const warningStyle = {
  backgroundColor: 'rgba(255, 193, 7, 0.1)',
  border: '1px solid #ffc107',
  borderRadius: '8px',
  padding: '1rem',
  color: '#ffc107',
  marginTop: '1rem',
};

const agreementStyle = {
  backgroundColor: 'rgba(13, 202, 240, 0.05)',
  border: '1px solid rgba(13, 202, 240, 0.3)',
  borderRadius: '8px',
  padding: '2rem',
  margin: '2rem',
  textAlign: 'center',
};

const agreementTitleStyle = {
  color: '#0DCAF0',
  fontSize: '1.3rem',
  fontWeight: '600',
  marginBottom: '1rem',
};

const agreementTextStyle = {
  color: '#e0e0e0',
  fontSize: '1.1rem',
  margin: '0',
};

const contactStyle = {
  backgroundColor: '#222',
  padding: '2rem',
  borderTop: '1px solid #333',
  textAlign: 'center',
};

const contactTitleStyle = {
  color: '#0DCAF0',
  fontSize: '1.3rem',
  fontWeight: '600',
  marginBottom: '1rem',
};

const contactTextStyle = {
  color: '#e0e0e0',
  fontSize: '1rem',
  margin: '0',
};

const emailStyle = {
  color: '#0DCAF0',
  textDecoration: 'none',
  fontWeight: '500',
  transition: 'color 0.3s ease',
};

const footerStyle = {
  backgroundColor: '#111',
  padding: '1.5rem',
  textAlign: 'center',
  borderTop: '1px solid #333',
};

const footerTextStyle = {
  color: '#888',
  fontSize: '0.9rem',
  margin: '0',
};

export default Terms;