import { registerScenarios } from "../../../engine/scenarioLoader.ts";
import { scene01_landing } from "./scene01_landing.ts";
import { scene02_finding_north } from "./scene02_finding_north.ts";
import { scene03_first_contact } from "./scene03_first_contact.ts";
import { scene04_the_sergeant } from "./scene04_the_sergeant.ts";
import { scene05_the_patrol } from "./scene05_the_patrol.ts";
import { scene06_the_farmhouse } from "./scene06_the_farmhouse.ts";

registerScenarios([
  scene01_landing,
  scene02_finding_north,
  scene03_first_contact,
  scene04_the_sergeant,
  scene05_the_patrol,
  scene06_the_farmhouse,
]);
