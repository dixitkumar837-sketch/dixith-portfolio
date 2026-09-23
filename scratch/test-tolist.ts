import { pipeline } from "@huggingface/transformers";

async function testToList() {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    dtype: "fp32",
  });
  const texts = ["Sentence one", "Sentence two"];
  const output = await extractor(texts, {
    pooling: "mean",
    normalize: true,
  });
  const list = output.tolist();
  console.log("List length:", list.length);
  console.log("Item 0 length:", list[0].length);
  console.log("Item 1 length:", list[1].length);
}

testToList().catch(console.error);
