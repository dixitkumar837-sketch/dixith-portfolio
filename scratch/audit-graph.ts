import { getAllResearch } from "../data/research";
import { getAllExperiments } from "../data/experiments";
import { getAllArticles } from "../data/articles";
import { getAllGuides } from "../data/guides";
import { getAllProfessionalExperiences } from "../data/professional-experience";
import { getAllSources } from "../data/sources";
import { getAllTopics } from "../data/topics";
import { getCanonicalAuthor } from "../data/authors";

const allEntities = [
  ...getAllResearch().map((e) => ({
    id: e.id,
    type: "research",
    title: e.title,
    status: e.status,
    refs: e.entityReferences || [],
    sources: e.sourceIds || [],
    topics: e.topics || [],
    authorId: e.authorId,
  })),
  ...getAllExperiments().map((e) => ({
    id: e.id,
    type: "experiment",
    title: e.title,
    status: e.status,
    refs: e.entityReferences || [],
    sources: e.sourceIds || [],
    topics: e.topics || [],
    authorId: e.authorId,
  })),
  ...getAllArticles().map((e) => ({
    id: e.id,
    type: "article",
    title: e.title,
    status: e.status,
    refs: e.entityReferences || [],
    sources: e.sourceIds || [],
    topics: e.topics || [],
    authorId: e.authorId,
  })),
  ...getAllGuides().map((e) => ({
    id: e.id,
    type: "guide",
    title: e.title,
    status: e.status,
    refs: e.entityReferences || [],
    sources: e.sourceIds || [],
    topics: e.topics || [],
    authorId: e.authorId,
  })),
  ...getAllProfessionalExperiences().map((e) => ({
    id: e.id,
    type: "professional-experience",
    title: e.title,
    status: e.status,
    refs: e.entityReferences || [],
    sources: [],
    topics: e.topics || [],
    authorId: undefined,
  })),
  ...getAllSources().map((e) => ({
    id: e.id,
    type: "source",
    title: e.title,
    status: "PUBLISHED",
    refs: [],
    sources: [],
    topics: [],
    authorId: undefined,
  })),
  ...getAllTopics().map((e) => ({
    id: e.id,
    type: "topic",
    title: e.name,
    status: "PUBLISHED",
    refs: [],
    sources: [],
    topics: [],
    authorId: undefined,
  })),
  {
    id: getCanonicalAuthor().id,
    type: "author",
    title: getCanonicalAuthor().name,
    status: "PUBLISHED",
    refs: [],
    sources: [],
    topics: [],
    authorId: undefined,
  },
];

console.log(`Total Entities: ${allEntities.length}`);

const inDegree = new Map<string, number>();
const outDegree = new Map<string, number>();
allEntities.forEach((e) => {
  inDegree.set(e.id, 0);
  outDegree.set(e.id, 0);
});

allEntities.forEach((e) => {
  const out =
    e.refs.length +
    e.sources.length +
    e.topics.length +
    (e.authorId ? 1 : 0);
  outDegree.set(e.id, out);
  e.refs.forEach((r) => inDegree.set(r.id, (inDegree.get(r.id) || 0) + 1));
  e.sources.forEach((s) => inDegree.set(s, (inDegree.get(s) || 0) + 1));
  e.topics.forEach((t) => inDegree.set(t, (inDegree.get(t) || 0) + 1));
  if (e.authorId) inDegree.set(e.authorId, (inDegree.get(e.authorId) || 0) + 1);
});

console.log("\nEntity In-Degrees and Out-Degrees:");
console.log("------------------------------------------------------------------");
allEntities.forEach((e) => {
  console.log(
    `${e.type.padEnd(24)} | ${e.id.padEnd(8)} | In: ${String(
      inDegree.get(e.id)
    ).padStart(2)} | Out: ${String(outDegree.get(e.id)).padStart(2)} | ${e.status}`
  );
});

// Check forward references validity
console.log("\nForward Reference Resolution Check:");
console.log("------------------------------------------------------------------");
let brokenRefs = 0;
let duplicates = 0;
allEntities.forEach((e) => {
  const seenRefs = new Set<string>();
  e.refs.forEach((r) => {
    const key = `${r.type}:${r.id}:${r.relation}`;
    if (seenRefs.has(key)) {
      console.log(`DUPLICATE REF: ${e.id} -> ${key}`);
      duplicates++;
    }
    seenRefs.add(key);

    const target = allEntities.find((t) => t.id === r.id && t.type === r.type);
    if (!target) {
      console.log(`BROKEN REF: ${e.id} -> ${r.type}:${r.id}`);
      brokenRefs++;
    }
  });

  e.sources.forEach((s) => {
    const target = allEntities.find((t) => t.id === s && t.type === "source");
    if (!target) {
      console.log(`BROKEN SOURCE REF: ${e.id} -> source:${s}`);
      brokenRefs++;
    }
  });
});
console.log(`Total Broken References: ${brokenRefs}`);
console.log(`Total Duplicate References: ${duplicates}`);
