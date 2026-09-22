const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const cssToInject = `
    /* ====== RESPONSIVE LAYOUT ====== */
    @media (max-width: 768px) {
      nav { padding: 0 16px; gap: 16px; }
      .nav-links { display: none; }
      .nav-brand span { display: none; }
      .hero-section { grid-template-columns: 1fr; padding: 40px 16px; text-align: center; gap: 40px; }
      .hero-buttons { justify-content: center; }
      .hero-title { font-size: 36px; }
      .features-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
      .footer-socials { justify-content: center; }
      .laptop-mockup { max-width: 100%; }
      .section { padding: 40px 16px; }
    }
  </style>`;

if (!html.includes('/* ====== RESPONSIVE LAYOUT ======')) {
    html = html.replace(/  <\/style>/, cssToInject);
    fs.writeFileSync('public/index.html', html);
    console.log('Successfully made index.html responsive!');
} else {
    console.log('Already responsive.');
}
