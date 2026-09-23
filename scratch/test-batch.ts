import { pipeline } from "@huggingface/transformers";

async function testBatch() {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    dtype: "fp32",
  });
  const texts = ["Sentence one about technical SEO.", "Sentence two about clinical knowledge graphs."];
  const output = await extractor(texts, {
    pooling: "mean",
    normalize: true,
  });
  console.log("Batch dims:", output.dims); // [2, 384]
  console.log("Batch data length:", output.data.length); // 768
}

testBatch().catch(console.error);
