import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://brieflytics.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://brieflytics.com/signup', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://brieflytics.com/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
