import { Queue } from "bullmq";
import { ENV } from "./env.js";

const redisConfig = {
  host: ENV.REDIS_HOST,
  port: parseInt(ENV.REDIS_PORT)
};

export const codeQueue = new Queue("code-exec", {
  connection: redisConfig
});
