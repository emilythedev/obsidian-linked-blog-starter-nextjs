export const CMS_NAME = 'Markdown'
export const HOME_OG_IMAGE_URL =
  'https://og-image.vercel.app/Next.js%20Blog%20Starter%20Example.png?theme=light&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg'

// From Quartz:
// (?:^| )              -> non-capturing group, tag should start be separated by a space or be the start of the line
// #(...)               -> capturing group, tag itself must start with #
// (?:[-_\p{L}\d\p{Z}])+       -> non-capturing group, non-empty string of (Unicode-aware) alpha-numeric characters and symbols, hyphens and/or underscores
// (?:\/[-_\p{L}\d\p{Z}]+)*)   -> non-capturing group, matches an arbitrary number of tag strings separated by "/"
const TAG_CONTENT_REGEX_STRING = '((?:[-_\\p{L}\\p{Emoji}\\p{M}\\d])+(?:\/[-_\\p{L}\\p{Emoji}\\p{M}\\d]+)*)';

export const TAG_IN_CONTENT_REGEX = new RegExp(
  `(?:(?:^| )\\\\)#${TAG_CONTENT_REGEX_STRING}`,
  'gum'
);

export const TAG_IN_NODE_REGEX = new RegExp(
  `(?:^| )#${TAG_CONTENT_REGEX_STRING}`,
  'gum'
);
