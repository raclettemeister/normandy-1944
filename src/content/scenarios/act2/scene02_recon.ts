import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const byId = (id: string) => {
  const soldier = PLATOON_ROSTER.find((s) => s.id === id);
  if (!soldier) throw new Error(`Unknown soldier: ${id}`);
  return { ...soldier };
};

export const scene02_recon: Scenario = {
  id: "act2_scene02",
  act: 2,
  timeCost: 20,
  combatScene: false,

  sceneContext:
    "Forward hedgerow at first light. Germans reinforcing crossroads with additional riflemen. Need exact MG placement and command post location before main assault.",

  narrative:
    "From the forward hedge you can see more now: one machine gun definitely north, maybe another behind the stone inn. A runner crosses the intersection carrying a map case. If you assault blind, you'll bleed for every meter. If you spend too long observing, the enemy hardens.",

  narrativeAlt: {
    hasSecondInCommand:
      "Henderson points with two fingers. 'MG up north corner. Maybe another in the inn courtyard. If we don't pin those before we move, this goes bad quick.'",
    solo:
      "You are one silhouette in wet grass watching a crossroads held by organized defenders. A one-man assault is fantasy. Your only leverage is information and timing.",
  },

  secondInCommandComments: {
    recon_observe_crossroads: "Let Park glass that north corner. He's got good eyes and steady hands.",
    recon_send_crawl_team: "We can get close if we use the ditch line and keep discipline.",
    recon_radio_net: "If Davis can raise friendlies, we may get confirmation on enemy sectors.",
    recon_probe_fire: "Every round now means every gun looking for us before the assault.",
  },

  rally: {
    soldiers: [byId("davis"), byId("caruso")],
    ammoGain: 8,
    moraleGain: 5,
    narrative:
      "Davis and Caruso slide in from the east lane, both covered in road dust. Davis still has the SCR-300 strapped to his back. 'Battery's low but she's talking, sir.' Caruso grins despite himself. 'Told him we'd find you.' Radio contact changes your options.",
  },

  decisions: [
    {
      id: "recon_observe_crossroads",
      text: "Hold fire and build a full sketch of fields of fire and entry points",
      tier: "excellent",
      outcome: {
        success: {
          text:
            "You spend ten hard minutes observing movement cycles. MG nest north corner. Rifle team in the inn yard. Blind side behind a collapsed cart on the west ditch. It's enough to plan a real assault.",
          context:
            "Deliberate observation produced complete objective sketch: MG nest, rifle team, west-side blind lane.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1,
          intelGained: "knowsMGPosition",
        },
        partial: {
          text:
            "You map one machine gun and one safe lane, but a truck blocks your view of the inn yard. Useful, not complete.",
          context:
            "Observation yielded partial defensive layout. Confirmed one MG and one safe lane; inn yard uncertain.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2,
          intelGained: "knowsMGPosition",
        },
        failure: {
          text:
            "A German flare pops unexpectedly and washes your hedge in white. You keep still and survive the scan, but your long observation window closes without solid marks.",
          context:
            "Flare interrupted recon window. Team remained concealed but failed to gather reliable position data.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 4,
        },
        wikiUnlocks: "objective_reconnaissance",
        nextScene: "act2_scene03",
      },
    },
    {
      id: "recon_send_crawl_team",
      text: "Send a crawl team to tag wire gaps and fallback routes",
      tier: "sound",
      requiresCapability: "canScout",
      minMen: 2,
      outcome: {
        success: {
          text:
            "The crawl team marks two wire gaps and a protected withdrawal ditch with chalk and cloth strips. They also confirm the machine gun tripod orientation. That's assault-grade intel.",
          context:
            "Crawl team confirmed wire gaps, withdrawal route, and MG orientation. Strong assault prep intel gained.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 2,
          intelGained: "knowsMGPosition",
        },
        partial: {
          text:
            "They find one gap and mark it, but a sentry shift forces an early pullback. You get one good entry lane and not much else.",
          context:
            "Crawl recon cut short by sentry movement. One marked breach lane recovered.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 3,
        },
        failure: {
          text:
            "A canteen taps stone as the team crosses a drainage lip. Germans fire blindly into the hedge. Your scouts return, but the enemy now expects a flank from this direction.",
          context:
            "Crawl team made noise on hard surface. Blind suppressive fire followed. Flank lane compromised.",
          menLost: 0,
          ammoSpent: 3,
          moraleChange: -2,
          readinessChange: 7,
        },
        wikiUnlocks: "objective_reconnaissance",
        nextScene: "act2_scene03",
      },
    },
    {
      id: "recon_radio_net",
      text: "Get Davis on the net and request nearby unit position checks",
      tier: "sound",
      requiresCapability: "hasRadio",
      outcome: {
        success: {
          text:
            "Davis gets a scratchy response from another 506th element north of the objective. They confirm no friendly units in your assault lane and warn of a reserve squad near the inn. You avoid blue-on-blue and gain a cleaner picture.",
          context:
            "Radio contact established with nearby 506th unit. Friendly lanes deconflicted; reserve squad location reported.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1,
          intelGained: "friendlyContact",
        },
        partial: {
          text:
            "Davis gets fragments only — call signs, direction, static. No full picture, but enough to avoid firing north where friendlies may be maneuvering.",
          context:
            "Partial radio contact through heavy static. Limited deconfliction data gained.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2,
          intelGained: "friendlyContact",
        },
        failure: {
          text:
            "Davis keys up too long while troubleshooting static. German listeners start sweeping with binoculars toward your sector. The net never stabilizes.",
          context:
            "Extended radio transmission drew enemy attention; communication attempt failed.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -1,
          readinessChange: 5,
        },
        wikiUnlocks: "objective_reconnaissance",
        nextScene: "act2_scene03",
      },
    },
    {
      id: "recon_probe_fire",
      text: "Fire short bursts into likely positions to force enemy reveals",
      tier: "reckless",
      outcome: {
        success: {
          text:
            "Your probe fire draws immediate return from the north corner and the inn yard. You now know exactly where two guns are — but now they know roughly where you are too.",
          context:
            "Recon-by-fire confirmed two defensive firing points. Mutual location awareness increased.",
          menLost: 0,
          ammoSpent: 7,
          moraleChange: 1,
          readinessChange: 8,
          intelGained: "knowsMGPosition",
        },
        partial: {
          text:
            "You get one clear return burst and a lot of blind fire from unseen positions. Useful, but noisy and expensive.",
          context:
            "Probe fire yielded one confirmed position and broad blind enemy response. High signature cost.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: -2,
          readinessChange: 10,
        },
        failure: {
          text:
            "Probe fire triggers immediate mortar adjustment rounds behind your hedge. No clean position fixes, just fragmentation and confusion.",
          context:
            "Probe fire drew rapid mortar correction fire. No reliable defensive map gained; situation degraded.",
          menLost: 1,
          ammoSpent: 9,
          moraleChange: -6,
          readinessChange: 12,
        },
        wikiUnlocks: "objective_reconnaissance",
        nextScene: "act2_scene03",
      },
    },
  ],
};
