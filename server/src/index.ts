import Koa from "koa";
import redis from "./redis";

const app = new Koa();

// logger

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
});

// response

app.use(async (ctx) => {
  await redis.set("name", "tina");
  await redis.lock("name");
  setInterval(() => {
    redis.unlock("name");
  }, 10000);
  const result = await redis.get("name");
  console.log(result);
  ctx.body = "Hello World";
});

app.listen(3000);
