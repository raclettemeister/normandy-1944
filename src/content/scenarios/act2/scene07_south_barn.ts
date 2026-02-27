import type { Scenario } from '../../../types';

export const scene07_south_barn: Scenario = {
  id: "act2_scene07",
  act: 2,
  timeCost: 15,
  combatScene: true,

  sceneContext:
    "South barn and adjacent outbuilding still contested. German runners attempting to break contact and report crossroads status. Opportunity for radio deconfliction with friendlies.",

  narrative:
    "Gunfire shifts south. The barn and a low outbuilding are still active, and two German runners are trying to break east. If they get through, you'll face a stronger counter-move sooner. If you overcommit to pursuit, you may lose control of the objective you've nearly taken.",

  secondInCommandComments: {
    south_barn_clear_and_capture: "Clear the barn first. Dead ground inside can hide a whole fire team.",
    south_use_radio_net: "If Davis gets the net, we can block their escape lanes with friendlies.",
    south_pursue_runners: "Chasing is a good way to lose the crossroads you just paid for.",
    south_mark_clear_without_check: "Uncleared buildings bite you later, usually when you're not looking.",
  },

  decisions: [
    {
      id: "south_barn_clear_and_capture",
      text: "Clear the barn, then block the eastern runner lane",
      tier: "excellent",
      minMen: 4,
      outcome: {
        success: {
          text:
            "Barn teams clear lower stalls and loft in one pass, then swing east and cut off both runners at the hedgerow gap. The southern pocket collapses.",
          context:
            "Barn cleared thoroughly before lane denial. Both enemy runners intercepted; south pocket neutralized.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 6,
          readinessChange: 5,
        },
        partial: {
          text:
            "You clear the barn and catch one runner. The second slips east under smoke and broken walls, likely heading for a rear command post.",
          context:
            "Barn secured and one runner captured/killed; second runner escaped east.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 2,
          readinessChange: 8,
        },
        failure: {
          text:
            "The barn clear drags and both runners escape while you're still sorting loft fire. You secure the structure but lose the information race.",
          context:
            "Slow barn clearance allowed both enemy runners to escape with contact report potential.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -4,
          readinessChange: 11,
        },
        wikiUnlocks: "command_net_discipline",
        nextScene: "act2_scene08",
      },
    },
    {
      id: "south_use_radio_net",
      text: "Use Davis on radio to coordinate blocks with nearby friendlies",
      tier: "sound",
      requiresCapability: "hasRadio",
      outcome: {
        success: {
          text:
            "Davis gets through. Another American element confirms they're covering the east track. You clear the barn without chasing ghosts, and no runner gets cleanly out.",
          context:
            "Radio coordination achieved with nearby friendlies. East escape lane blocked while barn cleared.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 5,
          readinessChange: 4,
          intelGained: "friendlyContact",
        },
        partial: {
          text:
            "The net is noisy, but you get enough to avoid crossing fires and conflicting movement. The barn clear is slower but controlled.",
          context:
            "Partial radio coordination prevented friendly interference; slower controlled barn operation.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 2,
          readinessChange: 6,
          intelGained: "friendlyContact",
        },
        failure: {
          text:
            "Static and overlapping calls burn critical minutes. By the time you commit, one runner is already gone and barn defenders are repositioned.",
          context:
            "Radio attempt failed to produce timely coordination. Delay enabled runner escape and defender reset.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -2,
          readinessChange: 9,
        },
        wikiUnlocks: "command_net_discipline",
        nextScene: "act2_scene08",
      },
    },
    {
      id: "south_pursue_runners",
      text: "Ignore the barn and pursue runners immediately",
      tier: "reckless",
      minMen: 3,
      outcome: {
        success: {
          text:
            "You catch one runner in the open and turn him before he clears the hedgerow. Fast action, but the barn keeps firing while you're extended.",
          context:
            "Rapid pursuit neutralized one runner but left active barn threat during extension.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 1,
          readinessChange: 8,
        },
        partial: {
          text:
            "The pursuit stretches your line. You miss both runners and take sporadic fire from the uncleared barn trying to break back.",
          context:
            "Pursuit overextended force, failed interception, and exposed team to barn fire.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: -4,
          readinessChange: 11,
        },
        failure: {
          text:
            "You chase too far, lose visual, and walk into a short-range burst from a barn-side firing slit on the return. One man doesn't make it back.",
          context:
            "Over-pursuit caused disorientation and return through uncleared fire lane; one casualty.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -8,
          readinessChange: 12,
        },
        wikiUnlocks: "command_net_discipline",
        nextScene: "act2_scene08",
      },
    },
    {
      id: "south_mark_clear_without_check",
      text: "Mark the south sector clear and shift everyone north now",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "You gain immediate manpower north and keep momentum. The gamble holds for now, but no one actually confirmed the barn interior.",
          context:
            "Unverified clear call preserved tempo but left latent south-sector risk.",
          menLost: 0,
          ammoSpent: 7,
          moraleChange: 0,
          readinessChange: 7,
        },
        partial: {
          text:
            "Minutes later, fire erupts from the loft you never checked. You scramble a team back to contain it.",
          context:
            "False-clear call triggered delayed contact from unchecked loft; forced reaction redeployment.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -5,
          readinessChange: 10,
        },
        failure: {
          text:
            "The un-cleared loft catches your rear movement lane. A short burst takes one man before you can turn and suppress.",
          context:
            "Unchecked loft engaged rear movement lane; one casualty before suppression restored control.",
          menLost: 1,
          ammoSpent: 10,
          moraleChange: -8,
          readinessChange: 12,
        },
        wikiUnlocks: "command_net_discipline",
        nextScene: "act2_scene08",
      },
    },
  ],
};
