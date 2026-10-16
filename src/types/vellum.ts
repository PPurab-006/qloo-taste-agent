/**
 * Vellum Domain Types
 */

import { QlooEntityType, QlooEntity } from './qloo';

export interface TasteAnchor {
  id: string; // Canonical Qloo Entity UUID
  name: string;
  category: QlooEntityType;
  categoryLabel: string;
  disambiguation?: string;
  image?: string;
  description?: string;
  tags?: string[];
  popularity?: number;
}

export type ExperienceMood =
  | 'contemplative'
  | 'avant_garde'
  | 'nocturnal'
  | 'high_energy'
  | 'refined'
  | 'nostalgic';

export type DiscoveryDial = 'familiar' | 'balanced' | 'adventurous';

export interface TasteProfile {
  anchors: TasteAnchor[];
  mood?: ExperienceMood;
  location?: string;
  discoveryDial?: DiscoveryDial;
}

export interface RecommendationEvidence {
  contributingAnchors: Array<{
    anchorId: string;
    anchorName: string;
    anchorCategory: string;
    weight: number; // 0.0 to 1.0 from query.explainability
  }>;
  qlooAffinityScore?: number; // Raw Qloo affinity score from query.affinity
  qlooPopularity?: number;
  sharedTags: string[];
  apiDerived: boolean;
  aiGroundedExplanation: string;
  reasoningSnippet: string;
}

export interface RecommendationItem {
  id: string;
  name: string;
  category: QlooEntityType;
  categoryLabel: string;
  description?: string;
  image?: string;
  location?: string;
  properties?: Record<string, unknown>;
  evidence: RecommendationEvidence;
  rawQlooEntity?: QlooEntity;
}

export interface ExperienceStop {
  timeSlot: string; // e.g. "Morning Exploration", "Afternoon Salon", "Twilight Dining", "Late Night Vinyl"
  title: string;
  recommendation: RecommendationItem;
  curatorNote: string;
  connectionToProfile: string;
}

export interface CuratedExperience {
  id: string;
  themeTitle: string;
  curatorPreface: string;
  location: string;
  mood: ExperienceMood;
  discoveryDial: DiscoveryDial;
  stops: ExperienceStop[];
  crossDomainDiscoveries: RecommendationItem[];
  overallAffinitiesSummary: {
    strongestCorrelation: string;
    culturalClusteringNote: string;
    empiricalCoveragePercent: number;
  };
}

export interface SampleProfile {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  mood: ExperienceMood;
  discoveryDial: DiscoveryDial;
  anchors: TasteAnchor[];
}
