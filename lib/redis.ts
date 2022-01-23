import { createClient } from 'redis';

const redis = createClient({
    url: process.env.REDIS_URL
})

export const TTL = 15 * 60;

export default redis
