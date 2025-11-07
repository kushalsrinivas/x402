import { createFacilitatorConfig } from "@0xgasless/x402";
import axios from "axios";
import { config } from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { decodeXPaymentResponse, withPaymentInterceptor } from "x402-axios";

config();

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather
const gaslessFacilitatorUrl = process.env.GASLESS_FACILITATOR_URL as string; // e.g. http://localhost:3402

if (!baseURL || !privateKey || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Create account from private key
const account = privateKeyToAccount(privateKey);
console.log("Using account:", account.address);

// Create facilitator config for 0xgasless
const facilitator = createFacilitatorConfig(gaslessFacilitatorUrl);
console.log("Using 0xgasless facilitator:", facilitator.url);

// Create Axios instance with payment interceptor and 0xgasless facilitator
const api = withPaymentInterceptor(
  axios.create({
    baseURL,
  }),
  account,
  facilitator,
);

// Make request to paid endpoint
api
  .get(endpointPath)
  .then(response => {
    console.log("\n✅ Request successful!");
    console.log("\nResponse data:");
    console.log(response.data);

    // Decode and display payment information
    const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
    if (paymentResponse) {
      console.log("\n💰 Payment details:");
      console.log(paymentResponse);
    }
  })
  .catch(error => {
    console.error("\n❌ Request failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data);
    } else {
      console.error(error.message);
    }
  });

