/**
 * Qloo Cultural Intelligence API TypeScript Definitions
 * Aligned with official Qloo API v2 documentation (https://docs.qloo.com)
 */

export type QlooEntityType =
  | 'urn:entity:artist'
  | 'urn:entity:book'
  | 'urn:entity:brand'
  | 'urn:entity:destination'
  | 'urn:entity:movie'
  | 'urn:entity:person'
  | 'urn:entity:place'
  | 'urn:entity:podcast'
  | 'urn:entity:tv_show'
  | 'urn:entity:video_game';

export interface QlooTag {
  id: string;
  name: string;
  type: string;
}

export interface QlooImage {
  url: string;
  width?: number;
  height?: number;
}

export interface QlooEntityProperties {
  description?: string;
  release_year?: number;
  release_date?: string;
  content_rating?: string;
  duration?: number;
  image?: QlooImage;
  images?: QlooImage[];
  address?: string;
  city?: string;
  country?: string;
  filming_location?: string;
  production_companies?: string[];
  websites?: string[];
  akas?: Array<{ value: string; languages?: string[] }>;
  genres?: string[];
  cuisine?: string[];
  price_level?: number;
  hotel_class?: number;
  rating?: number;
  [key: string]: unknown;
}

export interface QlooEntityQueryData {
  affinity?: number;
  affinity_rank?: number;
  audience_growth?: number;
  explainability?: Record<string, number>;
  [key: string]: unknown;
}

export interface QlooEntity {
  entity_id: string;
  name: string;
  type: string;
  subtype: QlooEntityType | string;
  properties?: QlooEntityProperties;
  popularity?: number;
  tags?: QlooTag[];
  query?: QlooEntityQueryData;
  disambiguation?: string;
  external?: Record<string, unknown>;
}

export interface QlooAggregateExplainability {
  influence_by_entity?: Record<string, number>;
  top_n_subsets?: Record<string, Record<string, number>>;
  warning?: string;
}

export interface QlooSearchResponse {
  success: boolean;
  results?: {
    entities: QlooEntity[];
    total?: number;
    page?: number;
  };
  entities?: QlooEntity[]; // Fallback for direct array formats
  error?: string;
  message?: string;
}

export interface QlooInsightsResponse {
  success: boolean;
  results?: {
    entities: QlooEntity[];
    total?: number;
    page?: number;
  };
  entities?: QlooEntity[]; // Fallback for direct array formats
  query?: {
    explainability?: QlooAggregateExplainability;
    [key: string]: unknown;
  };
  error?: string;
  message?: string;
}

export interface QlooSearchParams {
  query: string;
  types?: QlooEntityType[];
  take?: number;
  page?: number;
  filterLocation?: string;
  filterRadius?: number;
}

export interface QlooInsightsParams {
  filterType: QlooEntityType;
  signalEntities: string[]; // List of canonical Qloo entity UUIDs
  featureExplainability?: boolean;
  take?: number;
  page?: number;
  sortBy?: 'affinity' | 'distance' | 'rating' | 'quality';
  signalLocationQuery?: string;
  filterLocation?: string;
}
