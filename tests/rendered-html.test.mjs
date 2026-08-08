import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the NexoCV product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /NexoCV/);
  assert.match(html, /Seu currículo está falando/);
  assert.match(html, /Analisar meu currículo/);
  assert.match(html, /Como funciona/);
  assert.match(html, /Setor da empresa/);
  assert.match(html, /Contexto da empresa/);
  assert.doesNotMatch(html, /Painel administrativo|Administrar/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("starter preview was removed", async () => {
  await assert.rejects(access(new URL("app/_sites-preview", root)));
});

test("secret admin shortcut uses 0, 0, 0, 2, 2", async () => {
  const source = await readFile(new URL("../app/components/NexoCVApp.tsx", import.meta.url), "utf8");
  assert.match(source, /\["0", "0", "0", "2", "2"\]/);
  assert.match(source, /handleAdminSequence\("0"\)\}>0<\/button>/);
});
