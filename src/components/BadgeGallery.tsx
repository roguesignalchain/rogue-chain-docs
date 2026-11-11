import React from 'react';

interface BadgeItem {
  level: number;
  id: string;
  title: string;
  subtitle: string;
  blocks: string;
  targetXp: string;
}

const BADGES: BadgeItem[] = [
  { level: 0, id: 'lvl0', title: 'Unranked Runner', subtitle: 'Target XP: 1', blocks: '0 blocks', targetXp: '1' },
  { level: 1, id: 'lvl1', title: 'Recon Runner', subtitle: 'Target XP: 25', blocks: '1 – 24 blocks', targetXp: '25' },
  { level: 2, id: 'lvl2', title: 'Signal Scraper', subtitle: 'Target XP: 100', blocks: '25 – 99 blocks', targetXp: '100' },
  { level: 3, id: 'lvl3', title: 'Hash Warden', subtitle: 'Target XP: 500', blocks: '100 – 499 blocks', targetXp: '500' },
  { level: 4, id: 'lvl4', title: 'Cipher Architect', subtitle: 'Target XP: 2,500', blocks: '500 – 2,499 blocks', targetXp: '2,500' },
  { level: 5, id: 'lvl5', title: 'Apex Operator', subtitle: 'Target XP: 10,000', blocks: '2,500 – 9,999 blocks', targetXp: '10,000' },
  { level: 6, id: 'lvl6', title: 'Rogue Singularity', subtitle: 'Apex Node Rank', blocks: '10,000+ blocks', targetXp: '10,000 (Max)' },
];

export default function BadgeGallery() {
  return (
    <div className="badge-gallery-container">
      <div className="badge-gallery-grid">
        {BADGES.map((badge) => (
          <div key={badge.id} className="badge-card">
            <div className="badge-card-badge-wrapper">
              <img
                src={`/img/badges/${badge.id}.png`}
                alt={`Level ${badge.level} - ${badge.title}`}
                className="badge-img zoomable"
                loading="lazy"
              />
            </div>
            <div className="badge-card-level">LVL {badge.level}</div>
            <div className="badge-card-title">{badge.title}</div>
            <div className="badge-card-blocks">{badge.blocks}</div>
          </div>
        ))}
      </div>
      <div className="badge-gallery-hint">
        💡 Click on any medal to inspect in ultra-high resolution
      </div>
    </div>
  );
}

