import axios from "axios";
import { env } from "../env";
import { toE164 } from "../utils/phone";

const http = axios.create({
  baseURL: env.EMESSAGE_BASE_URL,
  timeout: 5000,
  // Exact header name per eMessage docs — NOT "Authorization".
  headers: { "X-EMESSAGE-Auth": env.EMESSAGE_TOKEN },
});

/**
 * Fire-and-forget SMS: failures are logged and never block or fail the
 * parent request. Callers pass the raw mobile number (any format);
 * invalid/missing numbers skip the send with a warning.
 */
export function sendSms(rawNumber: string | null | undefined, message: string): void {
  const number = toE164(rawNumber);
  if (!number) {
    console.warn("[sms] skipped — no valid PH mobile number on profile");
    return;
  }
  if (env.SMS_MOCK) {
    console.log(`[sms:mock] to ${number}: ${message}`);
    return;
  }
  http
    .post("/messaging/v1/sms/push", { number, message })
    .then(() => console.log(`[sms] sent to ${number}`))
    .catch((err: unknown) => {
      console.error(
        "[sms] send failed:",
        axios.isAxiosError(err) ? `${err.response?.status ?? err.code}` : String(err)
      );
    });
}
