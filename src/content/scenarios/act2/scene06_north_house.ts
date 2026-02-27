import type { Scenario } from '../../../types';

export const scene06_north_house: Scenario = {
  id: "act2_scene06",
  act: 2,
  timeCost: 15,
  combatScene: true,

  sceneContext:
    "North stone house overlooking crossroads still occupied by German holdouts. Upper window firing lane threatens any movement across the intersection.",

  narrative:
    "The crossroads won't hold while the north house is still active. Muzzle flashes punch from the second-floor window every time someone crosses open stone. The building is old Norman masonry, narrow rooms, thick walls. Clearing it is close work.",

  secondInCommandComments: {
    north_house_stack: "Two-man stack, fast corners, no drifting into doorways.",
    north_house_suppress_and_breach: "Keep suppression tight or they recover between our moves.",
    north_house_front_door: "Front door is where they're waiting for us.",
    north_house_bypass: "If we leave that window live, someone pays for it later.",
  },

  prepActions: [
    {
      id: "northhouse_prep_angles",
      text: "Walk the entry angles and assign first two men",
      timeCost: 5,
      responseVeteran:
        "Front room then right stairwell. First man hooks left, second clears deep right. No one crosses muzzles on the stairs.",
      responseGreen:
        "We go in and clear... room by room.",
    },
    {
      id: "northhouse_prep_cover",
      text: "Set an external cover element on the second-floor window",
      timeCost: 5,
      responseVeteran:
        "Window covered. If they lean out during breach, we pin them immediately. Keep the barrel low to avoid friendly fire over the doorway.",
      responseGreen:
        "We'll watch the window while you go in.",
    },
  ],

  decisions: [
    {
      id: "north_house_stack",
      text: "Use a disciplined two-man stack and clear from bottom to top",
      tier: "excellent",
      requiresPhase: "squad",
      minMen: 3,
      outcome: {
        success: {
          text:
            "Stack hits the doorway clean, first room cleared in seconds. Grenade up the stairs, then rapid top-floor sweep. The firing window goes quiet for good.",
          context:
            "Disciplined stack entry and top-floor clearance neutralized window threat quickly.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 6,
          readinessChange: 5,
        },
        partial: {
          text:
            "Entry is clean but the upper room fight goes hand-to-hand at the doorframe. You win it, breathing hard, with shaken hands and ringing ears.",
          context:
            "Structured entry held; upper-level contact became close-quarters struggle before clearance.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 2,
          readinessChange: 7,
        },
        failure: {
          text:
            "Second man hesitates on the stair turn and the defender fires first. You still clear the room, but not before losing one in the stairwell.",
          context:
            "Stair-turn hesitation surrendered initiative in close quarters. One casualty during top-floor fight.",
          menLost: 1,
          ammoSpent: 11,
          moraleChange: -5,
          readinessChange: 9,
        },
        wikiUnlocks: "room_clearing_drills",
        nextScene: "act2_scene07",
      },
    },
    {
      id: "north_house_suppress_and_breach",
      text: "Suppress upper windows, then breach through the side entrance",
      tier: "sound",
      requiresCapability: "canSuppress",
      minMen: 4,
      outcome: {
        success: {
          text:
            "Suppression keeps heads down while your breach team enters from the side utility door. You clear two rooms and force surrender from the top floor.",
          context:
            "External suppression and side breach coordinated effectively; defenders cleared/surrendered.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: 5,
          readinessChange: 6,
        },
        partial: {
          text:
            "The side door sticks and costs you seconds. Suppression still buys enough time to get inside and finish the clear.",
          context:
            "Breach delay from stuck side door reduced timing margin but objective still cleared.",
          menLost: 0,
          ammoSpent: 11,
          moraleChange: 1,
          readinessChange: 8,
        },
        failure: {
          text:
            "Suppression drifts off the upper window during reload and defenders re-engage the doorway. One man is hit before you force entry.",
          context:
            "Suppression lapse during reload reopened upper-window fire; one casualty at breach point.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -4,
          readinessChange: 10,
        },
        wikiUnlocks: "room_clearing_drills",
        nextScene: "act2_scene07",
      },
    },
    {
      id: "north_house_front_door",
      text: "Kick the front door and clear fast before they react",
      tier: "reckless",
      minMen: 2,
      outcome: {
        success: {
          text:
            "Shock works this time. You crash in, overwhelm the first room, and ride momentum to the top floor before defenders can reset.",
          context:
            "High-speed front-door assault succeeded through surprise and momentum.",
          menLost: 0,
          ammoSpent: 10,
          moraleChange: 1,
          readinessChange: 8,
        },
        partial: {
          text:
            "The door crash alerts everyone. You still clear the house, but every room is contested and ugly.",
          context:
            "Noisy front entry forfeited surprise; clearance achieved through costly room-to-room fights.",
          menLost: 0,
          ammoSpent: 12,
          moraleChange: -3,
          readinessChange: 10,
        },
        failure: {
          text:
            "They are waiting on the front angle. First burst catches your lead entry and you lose him at the threshold.",
          context:
            "Front-door angle was pre-covered by defenders. One casualty on initial threshold entry.",
          menLost: 1,
          ammoSpent: 12,
          moraleChange: -8,
          readinessChange: 12,
        },
        wikiUnlocks: "room_clearing_drills",
        nextScene: "act2_scene07",
      },
    },
    {
      id: "north_house_bypass",
      text: "Bypass the house and keep pushing the crossroads center",
      tier: "mediocre",
      outcome: {
        success: {
          text:
            "You bypass and keep pressure centerline. It gains speed, but every crossing is still under threat from the live upper window.",
          context:
            "Bypass preserved momentum but left active window threat over objective lanes.",
          menLost: 0,
          ammoSpent: 8,
          moraleChange: 0,
          readinessChange: 7,
        },
        partial: {
          text:
            "The bypass works for a minute, then upper-window fire forces repeated pauses and broken movement.",
          context:
            "Uncleared overwatch position degraded movement rhythm after temporary gains.",
          menLost: 0,
          ammoSpent: 9,
          moraleChange: -4,
          readinessChange: 9,
        },
        failure: {
          text:
            "A crossing team gets caught by the uncleared window and you lose a man. You now have to clear the house anyway, under worse conditions.",
          context:
            "Bypass failed under persistent overwatch fire. One casualty forced delayed clearance under pressure.",
          menLost: 1,
          ammoSpent: 10,
          moraleChange: -7,
          readinessChange: 11,
        },
        wikiUnlocks: "room_clearing_drills",
        nextScene: "act2_scene07",
      },
    },
  ],
};
