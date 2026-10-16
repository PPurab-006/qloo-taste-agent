'use client';

import React from 'react';
import { RecommendationItem } from '@/types/vellum';
import { ArrowUpRight, BarChart2, Tag } from 'lucide-react';

interface DiscoveryDeckProps {
  discoveries: RecommendationItem[];
  onInspectRecommendation: (rec: RecommendationItem) => void;
}

export function DiscoveryDeck({
  discoveries,
  onInspectRecommendation,
}: DiscoveryDeckProps) {
  if (discoveries.length === 0) {
    return null;
  }

  return (
    <div className="panel" id="discovery-deck-section">
      <div className="panel-header">
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '0.25rem',
            }}
          >
            Empirical Cross-Domain Matrix
          </div>
          <h2 className="panel-title" id="discovery-deck-title">
            Cultural Discovery Deck
          </h2>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Empirically discovered cultural entities sharing high affinity with your taste anchors across Cinema, Literature, Sound, Dining, and Brands.
          </p>
        </div>
        <span className="panel-counter">{discoveries.length} Entities</span>
      </div>

      <div className="discoveries-grid" id="discoveries-cards-grid">
        {discoveries.map((item) => {
          const affinityScore = item.evidence.qlooAffinityScore;
          const topAnchor = item.evidence.contributingAnchors[0];

          return (
            <div
              key={item.id}
              className="discovery-card"
              id={`discovery-card-${item.id}`}
            >
              <div className="discovery-card-header">
                <div>
                  <span className="category-badge" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                    {item.categoryLabel}
                  </span>
                  <h3 className="discovery-card-title">{item.name}</h3>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  id={`inspect-btn-${item.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.6rem',
                  }}
                  onClick={() => onInspectRecommendation(item)}
                  title="Inspect Qloo evidence and explainability"
                >
                  <BarChart2 size={13} />
                  <span>Inspect</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div className="discovery-card-body">
                {item.location && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    📍 {item.location}
                  </div>
                )}

                <p className="discovery-card-desc">
                  {item.description || item.evidence.aiGroundedExplanation}
                </p>

                {/* Evidence attribution summary */}
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      Anchor Attribution
                    </span>
                    <span className="evidence-pill empirical">API Signal</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {topAnchor ? `${topAnchor.anchorName} (${Math.round(topAnchor.weight * 100)}%)` : 'Joint Cluster'}
                  </div>
                </div>

                {/* Tags */}
                {item.evidence.sharedTags.length > 0 && (
                  <div className="discovery-card-tags">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginRight: '0.25rem' }}>
                      <Tag size={11} />
                      Shared:
                    </span>
                    {item.evidence.sharedTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="discovery-card-footer">
                <div className="affinity-badge" id={`affinity-${item.id}`}>
                  <span>Affinity:</span>
                  <span className="affinity-score">
                    {affinityScore !== undefined ? `${Math.round(affinityScore * 100)}%` : 'Strong Match'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onInspectRecommendation(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  View Evidence &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
