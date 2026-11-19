import { translate, type MessageKey } from "./dictionary";
import type { Locale } from "./config";

/**
 * Server actions keep returning their original English messages (they are
 * outside the customer-localisation pass). Customer-facing forms map the known
 * messages here so a failed login, request or review never shows English to a
 * French visitor. Unknown messages are left untouched, which keeps French
 * messages produced by already-localised actions intact.
 */
const ACTION_ERROR_KEYS: Record<string, MessageKey> = {
  "Email or password is incorrect.": "errors.invalidCredentials",
  "An account with this email already exists. Try logging in instead.": "errors.accountExists",
  "Enter a valid email address.": "errors.validEmail",
  "Use at least 8 characters.": "auth.passwordShort",
  "Enter your password.": "errors.enterPassword",
  "Tell us your name.": "errors.tellName",
  "Check your details and try again.": "errors.checkDetails",
  "Choose one of the provider’s current services.": "errors.chooseService",
  "Choose a preferred date.": "errors.chooseDate",
  "Choose a date in the future.": "errors.chooseFutureDate",
  "Choose a valid preferred date.": "errors.chooseValidDate",
  "Tell the provider your name.": "errors.tellProviderName",
  "Enter a phone number the provider can reach you on.": "errors.phoneReachable",
  "Check your request and try again.": "errors.checkRequest",
  "This provider is not accepting requests right now.": "errors.providerNotAccepting",
  "Log in to leave a review.": "errors.loginReview",
  "Add a little detail so the review is useful.": "errors.reviewDetail",
  "Check your review and try again.": "errors.checkReview",
  "This provider cannot be reviewed right now.": "errors.providerNotReviewable",
  "You’ve already reviewed this provider.": "errors.alreadyReviewed",
};

const TOO_MANY_REQUESTS = /^Too many requests from this connection\. Try again in (\d+) minute/;
const TOO_MANY_REVIEWS = /^Too many reviews from this connection\. Try again in (\d+) minute/;

export function translateActionError(locale: Locale, message: string): string {
  if (locale === "en") return message;

  const key = ACTION_ERROR_KEYS[message];
  if (key) return translate(locale, key);

  const requests = message.match(TOO_MANY_REQUESTS);
  if (requests) {
    return translate(locale, "errors.tooManyRequests", { minutes: requests[1] });
  }
  const reviews = message.match(TOO_MANY_REVIEWS);
  if (reviews) {
    return translate(locale, "errors.tooManyReviews", { minutes: reviews[1] });
  }

  return message;
}
