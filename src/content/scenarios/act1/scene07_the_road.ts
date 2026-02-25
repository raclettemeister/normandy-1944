import type { Scenario } from '../../../types';

export const scene07_the_road: Scenario = {
  id: "act1_scene07",
  act: 1,
  timeCost: 20,
  combatScene: false,
  achievesMilestone: "rally_complete",

  narrative: "A sunken lane between high hedgerows, the kind the Normans have been walking for a thousand years. The rally point should be less than a kilometer north — you can hear scattered small arms fire in that direction, Americans by the sound of it. But the lane opens onto a crossroads ahead, and someone has strung wire across it. Fresh tire tracks in the mud. The Germans have been here recently.",

  narrativeAlt: {
    "hasSecondInCommand": "A sunken lane heading north. Henderson studies the crossroads ahead through the hedge gap — wire strung across it, tire tracks fresh in the mud. 'Germans set this up in the last hour,' he whispers. 'Rally point's close, Captain. How do we get through?'",
    "solo": "A sunken lane heading north. The rally point is close — you can hear American weapons in the distance. But the crossroads ahead has wire strung across it and fresh tire tracks. You're still alone, and this is the last stretch."
  },

  secondInCommandComments: {
    "road_scouts_forward": "Good call, sir. I'll keep the rest quiet until they signal.",
    "road_hedgerow_route": "Slow but safe. I'll put Malone on rear security.",
    "road_straight_through": "Captain, those tire tracks are fresh. I wouldn't walk into that.",
    "road_open_field": "Sir, there's no cover out there. If there's a patrol..."
  },

  decisions: [
    {
      id: "road_scouts_forward",
      text: "Send two men ahead to scout the crossroads before moving",
      tier: "excellent",
      requiresPhase: "squad",
      requiresCapability: "canScout",
      outcome: {
        success: {
          text: "Two men slip forward through the hedge. Five minutes of silence. Then one appears at the gap, thumbs up — the wire is unmanned, the patrol has moved on. You cross the road in pairs, fast and low. The rally point is two hundred meters ahead. You can see American paratroopers digging in.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 8,
          readinessChange: 0
        },
        partial: {
          text: "The scouts reach the crossroads and signal — movement east, a German patrol moving away. You wait ten minutes until they're gone, then cross. Slow, tense, but clean. The rally point appears through the mist ahead.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 2
        },
        failure: {
          text: "The scouts get spotted — a German sentry fires one shot before bolting east. Your men scatter, regroup, push through the crossroads at a run. Nobody hit, but the shot will bring attention. You reach the rally point breathing hard.",
          menLost: 0,
          ammoSpent: -2,
          moraleChange: 2,
          readinessChange: 5
        },
        lessonUnlocked: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_hedgerow_route",
      text: "Follow the hedgerow north — avoid the crossroads entirely",
      tier: "sound",
      outcome: {
        success: {
          text: "You push through the bocage parallel to the road, fighting branches and mud. Twenty minutes of crawling, but the crossroads stays behind you. The hedgerow opens onto a pasture and there they are — American paratroopers, foxholes, a radio antenna. The rally point.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 5,
          readinessChange: 1
        },
        partial: {
          text: "The hedgerow route is longer than it looks. Thick brambles, a drainage ditch waist-deep in cold water. Half an hour of miserable progress before you stumble into the rally point perimeter from the east. A sentry nearly shoots you before you get the password out.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 2
        },
        failure: {
          text: "You get turned around in the bocage. The hedgerows all look the same in the dark. Forty minutes wasted before you find the road again and have to cross the exposed intersection anyway. The rally point is there, but you've burned time you didn't have.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 3
        },
        lessonUnlocked: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_straight_through",
      text: "Move straight through the crossroads — speed over caution",
      tier: "mediocre",
      outcome: {
        success: {
          text: "You push through the wire and cross at a jog. The crossroads is empty — the patrol that set the wire is long gone. Quick and clean. The rally point materializes in the gray light ahead. You've made it.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 3,
          readinessChange: 3
        },
        partial: {
          text: "Halfway across the intersection, headlights appear on the east road — a German vehicle, moving fast. You flatten into the ditch. It passes without stopping, but you're face-down in Norman mud with your heart in your throat. The rally point is close. You scramble the last hundred meters.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 0,
          readinessChange: 5
        },
        failure: {
          text: "The wire catches your lead man's boot. He goes down hard, canteen clattering on the road. A rifle shot from the tree line — a German sentry, hasty and wild, but close. You return fire and run. The rally point is there, but the Germans know exactly where you crossed.",
          menLost: 0,
          ammoSpent: -3,
          moraleChange: -3,
          readinessChange: 8
        },
        lessonUnlocked: "route_selection",
        nextScene: "act2_scene01"
      }
    },
    {
      id: "road_open_field",
      text: "Cut through the open pasture to bypass everything",
      tier: "reckless",
      outcome: {
        success: {
          text: "You leave the lane and cross the pasture at a low run. Open ground, exposed, but fast. Nothing fires. The rally point sentries challenge you from the far tree line. 'Flash.' 'Thunder.' You're in. It worked, but Henderson gives you a look that says don't ever do that again.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: 1,
          readinessChange: 4
        },
        partial: {
          text: "Halfway across the field, a flare goes up from somewhere east — the whole pasture lit up white. You drop flat, press your face into wet grass. The flare fades. Nobody fires. You belly-crawl the last two hundred meters. The rally point sentries find you covered in mud and shaking.",
          menLost: 0,
          ammoSpent: 0,
          moraleChange: -3,
          readinessChange: 6
        },
        failure: {
          text: "The pasture is mined. The first explosion throws dirt twenty feet into the air. Everyone scatters. The second blast catches someone's leg — they go down screaming. You drag him the last hundred meters into the rally point perimeter while the rest of the platoon provides covering fire at shadows.",
          menLost: 1,
          ammoSpent: -5,
          moraleChange: -8,
          readinessChange: 10
        },
        lessonUnlocked: "route_selection",
        nextScene: "act2_scene01"
      }
    }
  ]
};
