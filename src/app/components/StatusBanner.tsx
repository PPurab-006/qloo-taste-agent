'use client';

import React from 'react';
import { Info, ShieldCheck, Key } from 'lucide-react';

interface StatusBannerProps {
  isMockMode: boolean;
  onApplyApiKey?: (key: string) => void;
}

export function StatusBanner({ isMockMode }: StatusBannerProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.65rem 0',
        fontSize: '0.8rem',
      }}
      id="vellum-transparency-banner"
    >
      <div className="vellum-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} color="var(--qloo-teal)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>Anti-Fabrication Guarantee:</strong> Powered by Qloo&apos;s 250M+ entity Cultural Taste Graph. Every affinity score and anchor attribution reflects empirical data.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-tertiary)' }}>
            {isMockMode ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Info size={13} color="var(--accent)" />
                <span>Running on Canonical Qloo Fixtures (Set <code>QLOO_API_KEY</code> for live upstream)</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Key size={13} color="var(--qloo-teal)" />
                <span style={{ color: 'var(--qloo-teal)' }}>Live Qloo API Key Connected</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
