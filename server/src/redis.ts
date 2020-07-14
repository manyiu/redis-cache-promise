import redis from "redis";

const config = { host: "redis" };

class RedisService {
  private client = redis.createClient(config);

  get = (key: string) => {
    return new Promise((resolve) => {
      this.client.exists(`LOCKED::${key}`, (err, ok) => {
        if (ok) {
          console.log("exist");
          const subscriber = redis.createClient(config);
          subscriber.on("message", (channel, message) => {
            if (channel === "UNLOCKED" && message === key) {
              this.client.get(key, (err, value) => {
                resolve(value);
              });
            }
          });
          subscriber.subscribe("UNLOCKED");
        } else {
          this.client.get(key, (err, value) => {
            resolve(value);
          });
        }
      });
    });
  };

  set = (key: string, value: string) => {
    return new Promise((resolve) => {
      this.client.set(key, value, () => {
        resolve();
      });
    });
  };

  lock = (key: string) => {
    return new Promise((resolve) => {
      this.client.set(`LOCKED::${key}`, "TRUE", () => {
        resolve();
      });
    });
  };

  unlock = (key: string) => {
    return new Promise((resolve) => {
      this.client.del(`LOCKED::${key}`, () => {
        this.client.publish("UNLOCKED", key, () => {
          resolve();
        });
      });
    });
  };
}

export default new RedisService();
