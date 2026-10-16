'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { AnchorSelector } from './components/AnchorSelector';
import { RelationshipExplorer } from './components/RelationshipExplorer';
import { DiscoveryDeck } from './components/DiscoveryDeck';
import { ExperienceCuratorView } from './components/ExperienceCuratorView';
import { EvidenceModal } from './components/EvidenceModal';
import {
  CuratedExperience,
  DiscoveryDial,
  ExperienceMood,
  RecommendationItem,
  SampleProfile,
  TasteAnchor,
  TasteProfile,
} from '@/types/vellum';
import { SAMPLE_PROFILES } from '@/lib/constants/sample-profiles';
import { Sparkles, MapPin, Sliders, AlertCircle, Compass, Layers, CheckCircle2 } from 'lucide-react';

export default function VellumHomePage() {
  // Application State
  const [isMockMode, setIsMockMode] = useState(true);
  const [systemReachable, setSystemReachable] = useState(true);
  const [latencyMs, setLatencyMs] = useState(15);

  // Profile Inputs
  const [selectedAnchors, setSelectedAnchors] = useState<TasteAnchor[]>(
    SAMPLE_PROFILES[0].anchors
  );
  const [selectedLocation, setSelectedLocation] = useState('New York');
  const [selectedMood, setSelectedMood] = useState<ExperienceMood>('avant_garde');
  const [selectedDial, setSelectedDial] = useState<DiscoveryDial>('balanced');

  // Outputs
  const [isCurating, setIsCurating] = useState(false);
  const [curationError, setCurationError] = useState<string | null>(null);
  const [experience, setExperience] = useState<CuratedExperience | null>(null);
  const [discoveries, setDiscoveries] = useState<RecommendationItem[]>([]);
  const [inspectingItem, setInspectingItem] = useState<RecommendationItem | null>(null);

  // Health check on load
  useEffect(() => {
    async function checkSystemHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (data.qloo) {
          setIsMockMode(data.qloo.mode === 'mock');
          setSystemReachable(data.qloo.reachable);
          setLatencyMs(data.qloo.latencyMs || 20);
        }
      } catch (e) {
        console.warn('System health probe degraded:', e);
        setIsMockMode(true);
      }
    }
    checkSystemHealth();
  }, []);

  // Initial curation for the default sample profile
  useEffect(() => {
    if (selectedAnchors.length >= 2) {
      handleCurate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddAnchor = (anchor: TasteAnchor) => {
    if (selectedAnchors.length >= 5) return;
    if (selectedAnchors.some((a) => a.id === anchor.id)) return;
    setSelectedAnchors([...selectedAnchors, anchor]);
  };

  const handleRemoveAnchor = (anchorId: string) => {
    setSelectedAnchors(selectedAnchors.filter((a) => a.id !== anchorId));
  };

  const handleLoadSample = (sample: SampleProfile) => {
    setSelectedAnchors(sample.anchors);
    setSelectedLocation(sample.location);
    setSelectedMood(sample.mood);
    setSelectedDial(sample.discoveryDial);
    setCurationError(null);

    // Trigger immediate curation for instant judge review
    setTimeout(() => {
      executeCuration(sample.anchors, sample.location, sample.mood, sample.discoveryDial);
    }, 50);
  };

  const handleCurate = () => {
    if (selectedAnchors.length < 2) {
      setCurationError('Please select at least 2 cultural anchors to calculate cross-domain affinities.');
      return;
    }
    executeCuration(selectedAnchors, selectedLocation, selectedMood, selectedDial);
  };

  const executeCuration = async (
    anchors: TasteAnchor[],
    location: string,
    mood: ExperienceMood,
    dial: DiscoveryDial
  ) => {
    setIsCurating(true);
    setCurationError(null);

    try {
      const payload: TasteProfile = {
        anchors,
        location,
        mood,
        discoveryDial: dial,
      };

      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to curate cultural experience');
      }

      setExperience(data.experience);
      setDiscoveries(data.experience.crossDomainDiscoveries || []);
    } catch (err) {
      setCurationError(
        err instanceof Error ? err.message : 'An error occurred while synthesizing the experience.'
      );
    } finally {
      setIsCurating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        isMockMode={isMockMode}
        systemReachable={systemReachable}
        latencyMs={latencyMs}
      />
      <StatusBanner isMockMode={isMockMode} />

      <main style={{ flex: 1 }}>
        {/* Editorial Hero */}
        <section className="hero-section" id="hero">
          <div className="vellum-container">
            <div className="hero-pretitle">Qloo Agentic Hackathon 2026 &bull; Cultural Intelligence</div>
            <h1 className="hero-headline">
              Cross-domain cultural discovery, grounded in empirical taste data.
            </h1>
            <p className="hero-description">
              Generic LLMs predict what text sounds plausible. Vellum connects what you love across cinema, literature, sound, dining, and design using Qloo’s 250M+ entity Taste Graph with mathematical explainability.
            </p>

            {/* Quick-Start Sample Profiles for Judges */}
            <div className="sample-profiles-bar" id="sample-profiles-section">
              <div className="sample-profiles-label">
                <Compass size={14} color="var(--accent)" />
                <span>Explore Pre-Configured Cultural Dossiers (Click to Load)</span>
              </div>

              <div className="sample-profiles-grid">
                {SAMPLE_PROFILES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="sample-profile-card"
                    id={`sample-profile-${sample.id}`}
                    onClick={() => handleLoadSample(sample)}
                  >
                    <div className="sample-profile-title">{sample.title}</div>
                    <div className="sample-profile-meta">
                      📍 {sample.location} &bull; {sample.anchors.length} Anchors &bull; {sample.mood.replace('_', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Workbench Section */}
        <section className="workbench-section" id="workbench">
          <div className="vellum-container">
            {/* Step 1: Anchor Selector */}
            <AnchorSelector
              selectedAnchors={selectedAnchors}
              onAddAnchor={handleAddAnchor}
              onRemoveAnchor={handleRemoveAnchor}
            />

            {/* Step 2: Experience Curator Controls */}
            <div className="panel" id="curator-controls-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title" id="curator-controls-title">
                    2. Contextual Experience Tuning
                  </h2>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Select target geography, experiential disposition, and exploration dial to synthesize your curated cultural itinerary.
                  </p>
                </div>
              </div>

              <div className="controls-bar">
                {/* Location Input */}
                <div className="control-group">
                  <label htmlFor="curator-location-input" className="control-label">
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Geography / City
                  </label>
                  <input
                    type="text"
                    id="curator-location-input"
                    className="control-input"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="New York, London, Tokyo..."
                  />
                </div>

                {/* Mood Selector */}
                <div className="control-group">
                  <label htmlFor="curator-mood-select" className="control-label">
                    <Sliders size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Experiential Disposition
                  </label>
                  <select
                    id="curator-mood-select"
                    className="control-select"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value as ExperienceMood)}
                  >
                    <option value="avant_garde">Avant-Garde &amp; Experimental</option>
                    <option value="contemplative">Contemplative &amp; Meditative</option>
                    <option value="nocturnal">Nocturnal &amp; Atmospheric</option>
                    <option value="refined">Refined &amp; Classical</option>
                    <option value="high_energy">High-Energy &amp; Kinetic</option>
                    <option value="nostalgic">Analog &amp; Nostalgic</option>
                  </select>
                </div>

                {/* Discovery Dial */}
                <div className="control-group">
                  <label htmlFor="curator-dial-select" className="control-label">
                    <Layers size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Exploration Dial
                  </label>
                  <select
                    id="curator-dial-select"
                    className="control-select"
                    value={selectedDial}
                    onChange={(e) => setSelectedDial(e.target.value as DiscoveryDial)}
                  >
                    <option value="familiar">Harmonic &amp; Familiar (High direct tag overlap)</option>
                    <option value="balanced">Balanced (Optimal cross-domain discovery)</option>
                    <option value="adventurous">Adventurous (Surprising boundary crossings)</option>
                  </select>
                </div>
              </div>

              {/* Error banner if validation fails */}
              {curationError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    marginTop: '1.25rem',
                  }}
                  id="curation-error-banner"
                >
                  <AlertCircle size={16} />
                  <span>{curationError}</span>
                </div>
              )}

              {/* Action Button */}
              <div style={{ marginTop: '1.75rem' }}>
                <button
                  type="button"
                  id="curate-experience-submit-btn"
                  className="btn-primary"
                  onClick={handleCurate}
                  disabled={isCurating || selectedAnchors.length < 2}
                >
                  <Sparkles size={16} />
                  <span>
                    {isCurating
                      ? 'Consulting Qloo Taste Graph...'
                      : `Curate Cultural Experience (${selectedAnchors.length} Anchors)`}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Curated Experience / Itinerary View */}
            <ExperienceCuratorView
              experience={experience}
              isLoading={isCurating}
              onInspectRecommendation={(rec) => setInspectingItem(rec)}
            />

            {/* Step 4: Visual Relationship Explorer */}
            {selectedAnchors.length >= 2 && discoveries.length > 0 && (
              <RelationshipExplorer
                anchors={selectedAnchors}
                discoveries={discoveries}
                onInspectRecommendation={(rec) => setInspectingItem(rec)}
              />
            )}

            {/* Step 5: Multi-Domain Cultural Discovery Deck */}
            {discoveries.length > 0 && (
              <DiscoveryDeck
                discoveries={discoveries}
                onInspectRecommendation={(rec) => setInspectingItem(rec)}
              />
            )}
          </div>
        </section>
      </main>

      {/* Evidence Inspector Modal */}
      <EvidenceModal
        recommendation={inspectingItem}
        onClose={() => setInspectingItem(null)}
      />

      {/* Editorial Footer */}
      <footer className="vellum-footer" id="vellum-footer">
        <div className="vellum-container">
          <div className="footer-content">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                VELLUM &bull; Qloo Agentic Hackathon 2026
              </div>
              <div style={{ maxWidth: '540px', lineHeight: '1.5' }}>
                Developed for the Qloo Agentic Hackathon. Grounded in the Qloo API v2 (Insights &amp; Search endpoints) with <code>feature.explainability</code> and multi-domain cultural signals.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={13} color="var(--qloo-teal)" />
                <span>Apache-2.0 Open Source License</span>
              </div>
              <div>Base Gateway: <code>https://hackathon.api.qloo.com</code></div>
              <div>Endpoints: <code>/search</code>, <code>/v2/insights</code></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
