/* eslint-disable @typescript-eslint/no-explicit-any */
await fetch("https://cdn.jsdelivr.net/gh/bipproduction/sh/minimist/v5.js").then(
  async (res) => new Function("window", await res.text())(globalThis)
);
const minimist = (globalThis as any).minimist;
console.log(minimist(process.argv.slice(2)));

export {};


// v2

const comot = async (url: string) => (
  new Function("window", await (await fetch(url)).text())(globalThis),
  globalThis as any
);
