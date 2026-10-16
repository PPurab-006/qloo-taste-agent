'use client';

import React, { useState } from 'react';
import { TasteAnchor, RecommendationItem } from '@/types/vellum';
import { ArrowRight, Share2, Layers, Cpu } from 'lucide-react';

interface RelationshipExplorerProps {
  anchors: TasteAnchor[];
  discoveries: RecommendationItem[];
  onInspectRecommendation: (rec: RecommendationItem) => void;
}

export function RelationshipExplorer({
  anchors,
  discoveries,
  onInspectRecommendation,
}: RelationshipExplorerProps) {
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(
    anchors[0]?.id || null
  );

  const activeAnchor = anchors.find((a) => a.id === selectedAnchorId) || anchors[0];

  // Find discoveries connected to this anchor (weight > 0)
  const connectedDiscoveries = discoveries.filter((d) =>
    d.evidence.contributingAnchors.some(
      (c) => c.anchorId === activeAnchor?.id && c.weight > 0.1
    )
  );

  return (
    <div className="explorer-canvas" id="relationship-explorer-panel">
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Share2 size={13} />
            <span>Taste Graph Relationship Explorer</span>
          </div>
          <h2 className="panel-title" id="explorer-headline">
            Anchor-to-Discovery Lineage
          </h2>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Inspect how each cultural anchor propagates influence through the Qloo Taste Graph to surface cross-domain affinities.
          </p>
        </div>
      </div>

      {/* Anchor Selector Pill Row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {anchors.map((anchor) => {
          const isSelected = anchor.id === activeAnchor?.id;
          return (
            <button
              key={anchor.id}
              type="button"
              id={`explorer-select-anchor-${anchor.id}`}
              onClick={() => setSelectedAnchorId(anchor.id)}
              style={{
                background: isSelected ? 'var(--accent)' : 'var(--bg-surface-elevated)',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.95rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: isSelected ? 600 : 400,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{anchor.name}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}
              >
                ({anchor.categoryLabel})
              </span>
            </button>
          );
        })}
      </div>

      {/* Explorer Lineage Graph Layout */}
      {activeAnchor && (
        <div className="explorer-grid">
          {/* Left Column: Active Source Anchor */}
          <div className="explorer-column">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              Taste Anchor (Input Signal)
            </div>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <span className="category-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                {activeAnchor.categoryLabel}
              </span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{activeAnchor.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeAnchor.disambiguation || activeAnchor.description || 'Verified Anchor Entity'}
              </p>
              {activeAnchor.tags && (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {activeAnchor.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: Qloo Matrix Projection */}
          <div className="explorer-center-badge">
            <Layers size={20} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
            <div style={{ fontWeight: 600 }}>QLOO TASTE GRAPH</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>
              feature.explainability
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
              Normalized Vector Weights
            </div>
          </div>

          {/* Right Column: Connected Discoveries */}
          <div className="explorer-column">
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              Surfaced Discoveries ({connectedDiscoveries.length})
            </div>

            {connectedDiscoveries.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)',
                }}
              >
                Run discovery to map cross-domain affinities for this anchor.
              </div>
            ) : (
              connectedDiscoveries.slice(0, 4).map((item) => {
                const contributor = item.evidence.contributingAnchors.find(
                  (c) => c.anchorId === activeAnchor.id
                );
                const weightPercent = Math.round((contributor?.weight || 0.4) * 100);

                return (
                  <div
                    key={item.id}
                    onClick={() => onInspectRecommendation(item)}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    className="sample-profile-card"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="category-badge">{item.categoryLabel}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                        Influence Signal: {weightPercent}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="evidence-pill empirical">Empirical</span>
                      <ArrowRight size={14} color="var(--accent)" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Differentiator note */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Cpu size={16} color="var(--qloo-teal)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Why Qloo Matters Here:</strong> Generic LLMs hallucinate popularity rankings or rely on surface semantic puns. Qloo&apos;s Taste Graph computes mathematically rigorous cross-domain co-occurrences and affinities derived from billions of real cultural behaviors.
        </span>
      </div>
    </div>
  );
}
