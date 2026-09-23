import { pipeline } from "@huggingface/transformers";

async function test() {
  console.log("Loading feature-extraction pipeline...");
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    dtype: "fp32",
  });
  console.log("Pipeline loaded successfully.");
  const output = await extractor("This is a test sentence for semantic search.", {
    pooling: "mean",
    normalize: true,
  });
  console.log("Output shape / dims:", output.dims);
  console.log("Vector length:", output.data.length);
  console.log("Sample values:", Array.from(output.data.slice(0, 5)));
}

test().catch(console.error);
