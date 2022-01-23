import { createClient } from 'redis';

const redis = createClient({
    url: process.env.REDIS_URL
})

export const PACKAGE_TTL = 15 * 60;
export const RELEASE_TTL = 15 * 60;

export default redis
