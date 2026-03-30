import React from 'react';

function Footer() {
  const styles = {
    footer: {
      background: '#023047',
      color: 'white',
      padding: '40px 20px 20px',
      marginTop: '60px',
      width: '100%',        // full width
      boxSizing: 'border-box',
    },
    footerContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
      marginBottom: '20px',
      maxWidth: '1200px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    footerHeading: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' },
    footerText: { color: '#ddd', fontSize: '14px' },
    copyright: {
      textAlign: 'center',
      color: '#ddd',
      fontSize: '14px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    },
  };

  return (
    <div style={styles.footer}>
      <div style={styles.footerContent}>
        <div>
          <div style={styles.footerHeading}>🍔 Gift Bites</div>
          <p style={styles.footerText}>GIFT University's cafeteria system</p>
        </div>
        <div>
          <div style={styles.footerHeading}>Contact</div>
          <p style={styles.footerText}>📞 0300-1234567<br />📧 info@gift.edu.pk</p>
        </div>
        <div>
          <div style={styles.footerHeading}>Quick Links</div>
          <p style={styles.footerText}>Home | Menu | Orders | Profile</p>
        </div>
      </div>
      <div style={styles.copyright}>© 2025 Gift Bites - GIFT University</div>
    </div>
  );
}

export default Footer;
