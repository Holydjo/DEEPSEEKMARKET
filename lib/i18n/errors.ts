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
  "Only customers with a completed appointment can review this provider.": "errors.completedOnly",
  "You’ve already reviewed this provider.": "errors.alreadyReviewed",

  // Provider application, onboarding and provider studio forms.
  "Add a public display name.": "errors.providerDisplayName",
  "Choose a main category.": "errors.providerCategory",
  "Write at least 80 characters about you and your work.": "errors.providerAbout",
  "Choose a neighbourhood.": "errors.providerHood",
  "Check your profile details.": "errors.providerProfileDetails",
  "Choose at least one place where you welcome clients.": "errors.providerPlaces",
  "Choose a valid category.": "errors.providerValidCategory",
  "Choose a neighbourhood from the list.": "errors.providerHoodList",
  "Give the service a name.": "errors.providerServiceName",
  "Set a price of at least $1.": "errors.providerServicePrice",
  "Check the service details.": "errors.providerServiceDetails",
  "That service could not be found.": "errors.providerServiceMissing",
  "Choose a photo to upload.": "errors.providerChoosePhoto",
  "Use a JPG, PNG or WebP image.": "errors.providerPhotoType",
  "Photos must be smaller than 6 MB.": "errors.providerPhotoSize",
  "You can upload up to 8 photos. Remove one before adding another.": "errors.providerPhotoLimit",
  "Add the private street address for verification.": "errors.providerAddress",
  "Check your location details.": "errors.providerLocationDetails",
  "Each open day needs a valid opening and closing time.": "errors.providerHoursValid",
  "Closing time must be later than opening time.": "errors.providerHoursOrder",
  "Add at least one open day.": "errors.providerHoursOpenDay",
  "This application has already been submitted.": "errors.providerAlreadySubmitted",
  "Add a display name.": "errors.providerDisplayNameShort",
  "Keep the about section at least 80 characters.": "errors.providerAboutShort",
  "Add a reachable phone number.": "errors.providerPhone",
  "Add a valid email address.": "errors.providerEmail",
  "Add at least one language.": "errors.providerLanguage",
  "Add a phone number customers can reach you on.": "errors.providerJoinPhone",
  "Choose your main category.": "errors.providerJoinCategory",
  "An account with this email already exists. Log in to continue your application.": "errors.providerJoinExisting",
  "Log in first to start a provider application.": "errors.providerJoinLogin",
  "Choose a category.": "errors.providerCategoryFallback",
};

const MISSING_ITEMS = /^Before submitting, add (.+)\.$/;
const MISSING_ITEM_KEYS: Record<string, MessageKey> = {
  "a longer about section": "errors.providerMissingAbout",
  "at least one service setting": "errors.providerMissingPlace",
  "a private street address": "errors.providerMissingAddress",
  "at least one service": "errors.providerMissingService",
  "at least one photo": "errors.providerMissingPhoto",
  "at least one open day": "errors.providerMissingDay",
  "at least one service area": "errors.providerMissingArea",
};

const TOO_MANY_LOGIN = /^Too many login attempts\. Try again in (\d+) minute/;
const TOO_MANY_SIGNUP = /^Too many sign-up attempts\. Try again in (\d+) minute/;
const TOO_MANY_REQUESTS = /^Too many requests from this connection\. Try again in (\d+) minute/;
const TOO_MANY_REVIEWS = /^Too many reviews from this connection\. Try again in (\d+) minute/;

/**
 * The submit action builds its message from a list of missing sections. Map
 * each known phrase and re-join them so the whole sentence reads in French.
 */
function joinMissingItems(items: string[], locale: Locale): string {
  if (locale !== "fr" || items.length < 2) return items.join(", ");
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

export function translateActionError(locale: Locale, message: string): string {
  if (locale === "en") return message;

  const key = ACTION_ERROR_KEYS[message];
  if (key) return translate(locale, key);

  const missing = message.match(MISSING_ITEMS);
  if (missing) {
    const items = missing[1].split(", ").map((item) => {
      const itemKey = MISSING_ITEM_KEYS[item];
      return itemKey ? translate(locale, itemKey) : item;
    });
    return translate(locale, "errors.providerMissing", {
      items: joinMissingItems(items, locale),
    });
  }

  const login = message.match(TOO_MANY_LOGIN);
  if (login) {
    return translate(locale, "errors.tooManyLogin", { minutes: login[1] });
  }
  const signup = message.match(TOO_MANY_SIGNUP);
  if (signup) {
    return translate(locale, "errors.tooManySignup", { minutes: signup[1] });
  }
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
