// Hardcoded args for example
const start = Date.now();
console.log("start", start);

const seed = 999999;
const isUpdate = false;

const url = "<GCP-FUNCTION-URL>";
const GCPRequest = Functions.makeHttpRequest({
  url: url,
  method: "POST",
  timeout: 30000,
  headers: {
    "content-type": "application/json",
  },
  data: {
    tokenId: 0,
    seed: seed,
    isUpdate: isUpdate,
  },
});
// Execute the API request (Promise)
const GCPResponse = GCPRequest;
await new Promise((r) => setTimeout(r, 2000));
console.log("end", Date.now());
console.log("time", Date.now() - start);
if (GCPResponse.error) {
  console.log(GCPResponse);
  console.error(GCPResponse.error);
  throw Error("Request failed");
}
// const GCPdata = GCPResponse["data"];
// console.log("response", GCPdata);
// Use JSON.stringify() to convert from JSON object to JSON string
// Finally, use the helper Functions.encodeString() to encode from string to bytes
return Functions.encodeString("complete");
