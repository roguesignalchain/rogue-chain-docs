import React, { useState, useEffect } from 'react';

interface ActiveBadge {
  src: string;
  title: string;
  subtitle?: string;
  blocks?: string;
}

const BADGE_METADATA: Record<string, { title: string; subtitle: string; blocks: string }> = {
  'lvl0.png': { title: 'LEVEL 0 // UNRANKED RUNNER', subtitle: 'Fresh Node Operator · Zero Blocks Mined', blocks: '0 Blocks' },
  'lvl1.png': { title: 'LEVEL 1 // RECON RUNNER', subtitle: 'Initial Signal Sync · Proof of Work Contributor', blocks: '1 – 24 Blocks' },
  'lvl2.png': { title: 'LEVEL 2 // SIGNAL SCRAPER', subtitle: 'Active Network Validator · Consensus Builder', blocks: '25 – 99 Blocks' },
  'lvl3.png': { title: 'LEVEL 3 // HASH WARDEN', subtitle: 'Security Anchor · Veteran Solo-Miner', blocks: '100 – 499 Blocks' },
  'lvl4.png': { title: 'LEVEL 4 // CIPHER ARCHITECT', subtitle: 'Elite Hash Provider · Protocol Guardian', blocks: '500 – 2,499 Blocks' },
  'lvl5.png': { title: 'LEVEL 5 // APEX OPERATOR', subtitle: 'Cluster Titan · Deep Network Core Anchor', blocks: '2,500 – 9,999 Blocks' },
  'lvl6.png': { title: 'LEVEL 6 // ROGUE SINGULARITY', subtitle: 'Legendary Node Titan · Pinnacle Protocol Rank', blocks: '10,000+ Blocks (Max)' },
};

export default function Root({ children }: { children: React.ReactNode }) {
  const [activeBadge, setActiveBadge] = useState<ActiveBadge | null>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const isBadge = img.src.includes('/badges/') || img.classList.contains('badge-img') || img.classList.contains('zoomable');
        
        if (isBadge) {
          e.preventDefault();
          e.stopPropagation();

          // Extract filename to check metadata
          const fileName = img.src.split('/').pop()?.split('?')[0] || '';
          const meta = BADGE_METADATA[fileName];

          setActiveBadge({
            src: img.src,
            title: meta ? meta.title : (img.alt || 'Badge Preview'),
            subtitle: meta?.subtitle,
            blocks: meta?.blocks,
          });
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveBadge(null);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {children}

      {/* Cyberpunk Lightbox Modal */}
      {activeBadge && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveBadge(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'rogueFadeIn 0.2s ease-out',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#0a0a0c',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'default',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveBadge(null)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '0.8rem',
                right: '0.8rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                lineHeight: 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              ×
            </button>

            {/* Badge Image Large Preview */}
            <div
              style={{
                width: '240px',
                height: '240px',
                margin: '0.5rem 0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '10px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
                  filter: 'blur(16px)',
                  zIndex: 0,
                }}
              />
              <img
                src={activeBadge.src}
                alt={activeBadge.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8))',
                }}
              />
            </div>

            {/* Title & Metadata */}
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.06em',
                margin: '0 0 0.4rem',
                textTransform: 'uppercase',
              }}
            >
              {activeBadge.title}
            </h3>

            {activeBadge.subtitle && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#a1a1aa',
                  margin: '0 0 1rem',
                  lineHeight: 1.4,
                }}
              >
                {activeBadge.subtitle}
              </p>
            )}

            {activeBadge.blocks && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.8rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '3px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  color: '#e4e4e7',
                }}
              >
                <span style={{ color: '#a1a1aa' }}>Required Blocks:</span>
                <strong style={{ color: '#ffffff' }}>{activeBadge.blocks}</strong>
              </div>
            )}

            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                color: '#71717a',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Click outside or press [ESC] to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

