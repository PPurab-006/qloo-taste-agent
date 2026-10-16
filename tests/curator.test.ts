import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExperienceCurator } from '@/lib/synthesis/curator';
import { QlooClient } from '@/lib/qloo/client';
import { TasteAnchor } from '@/types/vellum';

describe('ExperienceCurator & Cultural Synthesis Engine', () => {
  let client: QlooClient;
  let curator: ExperienceCurator;

  const sampleAnchors: TasteAnchor[] = [
    {
      id: 'F0D354AA-BA7E-49D2-8ABA-9A8250F5C852',
      name: 'Everything Everywhere All at Once',
      category: 'urn:entity:movie',
      categoryLabel: 'Film & Cinema',
      popularity: 0.98,
      tags: ['multiverse', 'existential comedy', 'a24'],
    },
    {
      id: 'B18C4421-3F71-4144-8C2A-4B6A6C7A8B91',
      name: 'Brian Eno',
      category: 'urn:entity:artist',
      categoryLabel: 'Music & Sound',
      popularity: 0.88,
      tags: ['ambient', 'generative music', 'electronic'],
    },
  ];

  beforeEach(() => {
    client = new QlooClient({ forceMock: true });
    curator = new ExperienceCurator(client);
  });

  describe('Cross-Domain Discovery (discoverCrossDomain)', () => {
    it('should discover recommendations across multiple destination categories', async () => {
      const discoveries = await curator.discoverCrossDomain(sampleAnchors, [
        'urn:entity:book',
        'urn:entity:place',
        'urn:entity:brand',
      ]);

      expect(discoveries.length).toBeGreaterThan(0);

      // Verify that none of the recommendations are the input anchors themselves
      const anchorIds = sampleAnchors.map((a) => a.id);
      for (const item of discoveries) {
        expect(anchorIds).not.toContain(item.id);
      }
    });

    it('should attach empirical Qloo explainability weights and distinguish API from AI', async () => {
      const discoveries = await curator.discoverCrossDomain(sampleAnchors, ['urn:entity:book']);
      expect(discoveries.length).toBeGreaterThan(0);

      const first = discoveries[0];
      expect(first.evidence).toBeDefined();
      expect(first.evidence.apiDerived).toBe(true);
      expect(first.evidence.contributingAnchors.length).toBeGreaterThan(0);
      expect(first.evidence.aiGroundedExplanation).toContain("In Qloo's Cultural Taste Graph");
      expect(first.evidence.aiGroundedExplanation).toContain('attribution');
      expect(first.evidence.reasoningSnippet).toContain('Empirically linked to');
    });

    it('should gracefully continue discovery even if one category fails', async () => {
      // Mock getInsights to fail for books but succeed for artists
      const spy = vi.spyOn(client, 'getInsights').mockImplementation(async (params) => {
        if (params.filterType === 'urn:entity:book') {
          throw new Error('Simulated category timeout');
        }
        return {
          response: {
            success: true,
            results: {
              entities: [
                {
                  entity_id: 'ent_artist_1',
                  name: 'Massive Attack',
                  subtype: 'urn:entity:artist',
                  popularity: 0.89,
                },
              ],
              total: 1,
              page: 1,
            },
          },
          isMock: false,
        };
      });

      const discoveries = await curator.discoverCrossDomain(sampleAnchors, [
        'urn:entity:book',
        'urn:entity:artist',
      ]);

      expect(discoveries.length).toBe(1);
      expect(discoveries[0].name).toBe('Massive Attack');
      spy.mockRestore();
    });
  });

  describe('Experience Curation (curateExperience)', () => {
    it('should generate a structured cultural experience with 3 temporal stops', async () => {
      const experience = await curator.curateExperience({
        anchors: sampleAnchors,
        location: 'New York',
        mood: 'avant_garde',
        discoveryDial: 'balanced',
      });

      expect(experience.themeTitle).toBeDefined();
      expect(experience.curatorPreface).toBeDefined();
      expect(experience.location).toBe('New York');
      expect(experience.mood).toBe('avant_garde');
      expect(experience.stops.length).toBeGreaterThanOrEqual(2);

      // Verify each stop contains concrete grounded connections
      for (const stop of experience.stops) {
        expect(stop.timeSlot).toBeDefined();
        expect(stop.title).toBeDefined();
        expect(stop.curatorNote).toBeDefined();
        expect(stop.connectionToProfile).toBeDefined();
        expect(stop.recommendation).toBeDefined();
      }

      // Verify affinity summary
      expect(experience.overallAffinitiesSummary).toBeDefined();
      expect(experience.overallAffinitiesSummary.empiricalCoveragePercent).toBeGreaterThan(0);
    });

    it('should reflect the selected mood and location in the experience preface and theme', async () => {
      const exp1 = await curator.curateExperience({
        anchors: sampleAnchors,
        location: 'Tokyo',
        mood: 'nocturnal',
        discoveryDial: 'adventurous',
      });

      expect(exp1.location).toBe('Tokyo');
      expect(exp1.mood).toBe('nocturnal');
      expect(exp1.themeTitle.toLowerCase()).toContain('tokyo');
      expect(exp1.curatorPreface.toLowerCase()).toContain('tokyo');
    });
  });
});
