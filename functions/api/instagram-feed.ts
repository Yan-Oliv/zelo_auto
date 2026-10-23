import { handleInstagramFeed, type InstagramFeedEnv } from './_instagram-feed'

export const onRequestGet: PagesFunction<InstagramFeedEnv> = async ({ env, request }) =>
  handleInstagramFeed(env, request.signal)
