// Central SEO config — used by sitemap, robots, layout metadata, and JSON-LD.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://procareerservices.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Shyam Pro Services";

export const SITE_TAGLINE = "AI Career Tools & Digital Marketing";

export const SITE_DESCRIPTION =
  "AI-powered LinkedIn & Naukri optimization, ATS resume scanning, resume writing, portfolio building, and digital marketing (SEO, social media, Google & Meta ads, email) for professionals and businesses across India.";

export const CONTACT_EMAIL = "info@procareerlaunchpad.com";

// Social profile URLs (used for Organization sameAs). Empty values are filtered out.
export function socialProfiles(): string[] {
  return [
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
  ].filter((u): u is string => !!u && u !== "#");
}
