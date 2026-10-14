import { CANONICAL_SOURCES } from "../data/sources";
import { GUIDES } from "../data/guides";
import { validateContentGraph } from "../lib/content-utils";

console.log("Sources check:", Object.keys(CANONICAL_SOURCES));
console.log("Validation test before GUI-002 update:", validateContentGraph().isValid);
