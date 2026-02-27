import type { Scenario } from '../../../types';
import { PLATOON_ROSTER } from '../../../engine/roster';

const byId = (id: string) => {
  const soldier = PLATOON_ROSTER.find((s) => s.id === id);
  if (!soldier) throw new Error(`Unknown soldier: ${id}`);
  return { ...soldier };
};

export const scene01_approach: Scenario = {
  id: "act2_scene01",
  act: 2,
  timeCost: 15,
  combatScene: false,
  achievesMilestone: "move_to_objective",

  sceneContext:
    "Dawn light over bocage. Platoon reaches tree line south of target crossroads. German movement visible around sandbags and wire. Last concealed approach before assault.",

  narrative:
    "Gray dawn bleeds across the hedgerows. You reach a tree line overlooking the objective crossroads — sandbags at the north corner, wire strung across the road, a truck idling behind a stone wall. German movement is scattered but growing sharper by the minute. If they settle in, this turns into a grinder.",

  narrativeAlt: {
    hasSecondInCommand:
      "Dawn breaks as you reach the tree line above the crossroads. Henderson studies the position through binoculars he picked up in the night. 'They're still shifting, not dug in all the way,' he says. 'We've got a window, sir. Not a big one.'",
    solo:
      "Dawn breaks over the crossroads and you are still effectively alone. Wire, sandbags, and German silhouettes at first light. One man cannot take this position by force. You need information before you need courage.",
  },

  secondInCommandComments: {
    approach_recon_orchard: "We do this right, we hit them once and hard. Let me get eyes on that north corner.",
    approach_follow_patrol_route: "If those patrol notes are accurate, this gets us close without getting seen.",
    approach_fix_bayonets_probe: "Sir, that's noise before position. They'll hear us before they see us.",
    approach_road_march: "Straight road in daylight? That's what their machine gun is waiting for.",
  },

  rally: {
    soldiers: [byId("park"), byId("webb"), byId("ellis")],
    ammoGain: 12,
    moraleGain: 6,
    narrative:
      "Three figures break from a drainage ditch and slide into your line: Park in front, Webb behind him, Ellis white-faced but holding his rifle tight. Park points at the crossroads and speaks quietly. 'We've been watching fifteen minutes. They're still rotating sentries.' Your platoon just got deeper — and sharper.",
  },

  decisions: [
    {
      id: "approach_recon_orchard",
      text: "Send a recon pair through the orchard to mark MG and wire positions",
      tier: "excellent",
      requiresCapability: "canScout",
      minMen: 2,
      outcome: {
        success: {
          text:
            "Two men crawl orchard rows to within thirty meters. They mark one MG nest, one dead ground lane, and a gap in the wire near a burned cart. Clean reconnaissance, no contact.",
          context:
            "Recon pair reached 30m. Confirmed MG nest, dead ground lane, and wire gap. No detection.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 0,
          intelGained: "scoutedObjective",
        },
        partial: {
          text:
            "The recon pair makes the orchard but a sentry turns early. They freeze for a full minute before slipping back. You still get useful marks on the wire and one likely machine gun lane.",
          context:
            "Recon nearly detected by sentry shift. Returned with partial objective sketch and wire mark.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2,
          intelGained: "scoutedObjective",
        },
        failure: {
          text:
            "A branch snaps in the orchard. A German shouts and a burst rips through the trees. Your scouts make it back, but now every head at the crossroads is up and searching.",
          context:
            "Recon detected by noise. German burst fire into orchard. Scouts returned; enemy alertness increased.",
          menLost: 0,
          ammoSpent: 2,
          moraleChange: 0,
          readinessChange: 6,
        },
        wikiUnlocks: "reconnaissance_under_fire",
        nextScene: "act2_scene02",
      },
    },
    {
      id: "approach_follow_patrol_route",
      text: "Use captured patrol route notes to slip along the drainage line",
      tier: "sound",
      benefitsFromIntel: "knowsPatrolRoute",
      outcome: {
        success: {
          text:
            "The patrol notes are right. You move down a drainage line the Germans are not watching and reach a hedgerow fifty meters from the crossroads with your formation intact.",
          context:
            "Used captured patrol route intel correctly. Platoon advanced unseen to 50m covered position.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 4,
          readinessChange: 1,
          intelGained: "scoutedObjective",
        },
        partial: {
          text:
            "The route exists, but it's slower than expected — chest-deep mud in sections. You reach the forward hedgerow late, wet, and breathing hard, but still unseen.",
          context:
            "Patrol route valid but terrain slowed movement significantly. Reached forward line unseen but fatigued.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 2,
          readinessChange: 2,
        },
        failure: {
          text:
            "The patrol notes are stale. A German two-man team appears where your map says empty ground. Both sides freeze, then fire. They break contact, but your approach is blown.",
          context:
            "Outdated patrol intel. Unexpected German team made contact then withdrew. Approach compromised.",
          menLost: 0,
          ammoSpent: 4,
          moraleChange: -2,
          readinessChange: 7,
        },
        wikiUnlocks: "reconnaissance_under_fire",
        nextScene: "act2_scene02",
      },
    },
    {
      id: "approach_fix_bayonets_probe",
      text: "Fix bayonets and push a fast probe to test their line",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "The probe hits hard enough to force the nearest German team off the corner for a minute. You pull back with a clearer picture of their response speed — and you've announced your presence.",
          context:
            "Aggressive probe briefly displaced corner team. Gained enemy reaction timing at cost of surprise.",
          menLost: 0,
          ammoSpent: 6,
          moraleChange: 1,
          readinessChange: 8,
        },
        partial: {
          text:
            "You push to the edge of the road and draw immediate fire from two angles. No one drops, but the probe collapses into a sprint back to cover. Now they know where you are.",
          context:
            "Probe drew intersecting fire. Forced rapid withdrawal without losses; enemy now keyed to approach lane.",
          menLost: 0,
          ammoSpent: 7,
          moraleChange: -3,
          readinessChange: 10,
        },
        failure: {
          text:
            "The probe hits wire you didn't see and bunches up under machine-gun fire. You drag a wounded man back behind the hedgerow and lose the initiative before the assault even starts.",
          context:
            "Probe caught on unseen wire under MG fire. One casualty during withdrawal. Initiative lost.",
          menLost: 1,
          ammoSpent: 8,
          moraleChange: -7,
          readinessChange: 12,
        },
        wikiUnlocks: "reconnaissance_under_fire",
        nextScene: "act2_scene02",
      },
    },
    {
      id: "approach_road_march",
      text: "March straight up the road before they fully wake up",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "Speed gets you close before the first sentry processes what he's seeing. You dive off the road into a ditch near the objective. Fast, exposed, and lucky.",
          context:
            "Direct road movement reached forward ditch before full German reaction. High exposure but no losses.",
          menLost: 0,
          ammoSpent: 1,
          moraleChange: 1,
          readinessChange: 5,
        },
        partial: {
          text:
            "Halfway up the road, a sentry yells and rounds crack over your heads. You scatter into shallow cover and spend precious minutes re-forming by hand signals.",
          context:
            "Road approach detected mid-move. Unit scattered and had to reform under pressure.",
          menLost: 0,
          ammoSpent: 3,
          moraleChange: -2,
          readinessChange: 7,
        },
        failure: {
          text:
            "The road march walks straight into a prepared lane. Sandbags erupt with fire and one of your men goes down in the first burst. You crawl to the ditch and regroup under shouting.",
          context:
            "Road approach entered prepared fire lane. Immediate burst caused one casualty; forced crawl to ditch.",
          menLost: 1,
          ammoSpent: 5,
          moraleChange: -6,
          readinessChange: 10,
        },
        wikiUnlocks: "reconnaissance_under_fire",
        nextScene: "act2_scene02",
      },
    },
  ],
};
