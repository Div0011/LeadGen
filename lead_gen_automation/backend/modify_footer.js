const fs = require('fs');
let code = fs.readFileSync('/Users/divyansh/Documents/GitHub/automation/lead_gen_automation/frontend/src/components/Footer.tsx', 'utf8');

// Ensure systemApi is imported
if (!code.includes('import { systemApi }')) {
  code = code.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState, useEffect } from 'react';\nimport { systemApi } from '@/services/api';");
}

// Ensure the system status component exists
const systemStatusComponent = `

const SystemStatusBanner = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const sysStats = await systemApi.getStatus();
        setSystemStatus(sysStats.data);
      } catch (err) {
        setSystemStatus({ backend: 'offline', api: 'offline', database: 'offline' });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(184,169,138,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10, position: 'relative' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { name: 'Frontend', status: 'online', dot: 'completed' },
          { name: 'Backend API', status: systemStatus?.backend === 'online' ? 'online' : 'offline', dot: systemStatus?.backend === 'online' ? 'completed' : 'error' },
          { name: 'Database', status: systemStatus?.database === 'connected' ? 'connected' : 'offline', dot: systemStatus?.database === 'connected' ? 'completed' : 'error' },
        ].map((sys, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: sys.dot === 'completed' ? 'var(--sage, #6c8c6c)' : '#e11d48',
              boxShadow: sys.dot === 'completed' ? '0 0 5px var(--sage, #6c8c6c)' : '0 0 5px #e11d48'
            }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--umber, #8a7a58)' }}>{sys.name}: <span style={{ textTransform: 'uppercase', fontWeight: 600, color: sys.dot === 'completed' ? 'var(--sage, #6c8c6c)' : '#e11d48' }}>{sys.status}</span></span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--umber, #8a7a58)', flexWrap: 'wrap', justifyContent: 'center', fontWeight: 500 }}>
        <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms and Conditions</Link>
        <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
      </div>

      <div style={{ fontSize: '0.7rem', color: 'rgba(184,169,138,0.6)', marginTop: '0.5rem', letterSpacing: '0.5px' }}>
        Created by Divyansh Awasthi
      </div>
    </div>
  );
};
`;

if (!code.includes('SystemStatusBanner')) {
  code = code.replace(/export default function Footer\(\) \{/, systemStatusComponent + '\nexport default function Footer() {');
}

// Now replace the old bottom sections
// 1. Landing Minimal
code = code.replace(
  /<div style=\{\{\s*width: '100%',\s*paddingTop: '2rem',\s*borderTop: '1px solid rgba\(184,169,138,0\.1\)',\s*display: 'flex',\s*justifyContent: 'space-between',\s*alignItems: 'center',\s*flexWrap: 'wrap',\s*gap: '1rem'\s*\}\}>\s*<p style=\{\{ margin: 0, fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)' \}\}>&copy; 2026 LeadGenius\. All rights reserved\.<\/p>\s*<div style=\{\{ display: 'flex', gap: '1\.5rem' \}\}>\s*<span style=\{\{ fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)', cursor: 'not-allowed' \}\}>Privacy<\/span>\s*<span style=\{\{ fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)', cursor: 'not-allowed' \}\}>Terms<\/span>\s*<\/div>\s*<\/div>/g, 
  '<SystemStatusBanner />'
);

// 2. Auth Footer
code = code.replace(
  /<div style=\{\{\s*display: 'flex',\s*justifyContent: 'space-between',\s*alignItems: 'center',\s*paddingTop: '2rem',\s*borderTop: '1px solid rgba\(184,169,138,0\.1\)',\s*flexWrap: 'wrap',\s*gap: '1rem',\s*position: 'relative',\s*zIndex: 1\s*\}\}>\s*<p style=\{\{ margin: 0, fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)' \}\}>&copy; 2026 LeadGenius\. All rights reserved\.<\/p>\s*<div style=\{\{ display: 'flex', gap: '2rem' \}\}>\s*<a href=\"#\" style=\{\{ fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)', textDecoration: 'none' \}\}>Privacy<\/a>\s*<a href=\"#\" style=\{\{ fontSize: '0\.7rem', color: 'rgba\(184,169,138,0\.3\)', textDecoration: 'none' \}\}>Terms<\/a>\s*<\/div>\s*<\/div>/g,
  '<SystemStatusBanner />'
);

// 3. Unauth Not Landing Footer
code = code.replace(
  /<div style=\{\{\s*display: 'flex',\s*justifyContent: 'space-between',\s*alignItems: 'center',\s*paddingTop: '2rem',\s*borderTop: '1px solid rgba\(184,169,138,0\.2\)',\s*flexWrap: 'wrap',\s*gap: '1rem'\s*\}\}>\s*<p style=\{\{ margin: 0, fontSize: '0\.8rem', color: 'var\(--umber\)' \}\}>&copy; 2026 LeadGenius\. All rights reserved\.<\/p>\s*<div style=\{\{ display: 'flex', gap: '2rem' \}\}>\s*<a href=\"#\" style=\{\{ fontSize: '0\.8rem', color: 'var\(--umber\)', textDecoration: 'none' \}\}>Privacy<\/a>\s*<a href=\"#\" style=\{\{ fontSize: '0\.8rem', color: 'var\(--umber\)', textDecoration: 'none' \}\}>Terms<\/a>\s*<\/div>\s*<\/div>/g,
  '<SystemStatusBanner />'
);


fs.writeFileSync('/Users/divyansh/Documents/GitHub/automation/lead_gen_automation/frontend/src/components/Footer.tsx', code);
