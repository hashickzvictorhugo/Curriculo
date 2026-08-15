import assert from "node:assert/strict";
import test from "node:test";

import { analyzeCompatibility } from "../lib/matcher.ts";

const totvsLikeVacancy = [
  "Desenvolvimento Full Stack Júnior com Node.js, TypeScript e React.",
  "Construção de APIs REST, integração com bancos SQL e uso de Git.",
  "Conhecimentos em testes automatizados, JWT, OAuth2 e métodos ágeis.",
].join(" ");

const alignedResume = [
  "Desenvolvedor de software com 2 anos de experiência.",
  "Projetos em TypeScript e React, com APIs REST em Node.js e banco de dados SQL relacional.",
  "Uso de Git, GitHub, testes automatizados, trabalho em equipe e resolução de problemas.",
  "Curso superior de tecnologia em andamento.",
].join(" ");

function analyze(overrides = {}) {
  return analyzeCompatibility({
    resumeText: alignedResume,
    roleId: "software",
    roleTitle: "Desenvolvedor Full Stack Júnior",
    roleProfileId: "software",
    company: "TOTVS",
    jobDescription: totvsLikeVacancy,
    ...overrides,
  });
}

test("produces a deterministic and explainable result", () => {
  const first = analyze();
  const second = analyze();

  assert.deepEqual(first, second);
  assert.equal(first.analysisVersion, 2);
  assert.ok(Number.isInteger(first.score));
  assert.ok(first.score >= 18 && first.score <= 97);
  assert.ok(first.dimensions.length >= 5);
  assert.ok(first.dimensions.every((dimension) => (
    dimension.score >= 0 &&
    dimension.score <= 100 &&
    Number.isInteger(dimension.weight)
  )));

  const displayedWeightTotal = first.dimensions.reduce(
    (total, dimension) => total + (dimension.weight ?? 0),
    0,
  );
  assert.ok(Math.abs(displayedWeightTotal - 100) <= first.dimensions.length / 2);
});

test("finds evidence relevant to a full-stack vacancy", () => {
  const result = analyze({
    roleSkillKeywords: ["TypeScript", "React", "REST", "SQL", "Testes automatizados"],
  });

  assert.deepEqual(result.missingSkills, []);
  assert.deepEqual(result.matchedSkills, [
    "TypeScript",
    "React",
    "REST",
    "SQL",
    "Testes automatizados",
  ]);
  assert.ok(result.keywords.matched.includes("typescript"));
  assert.ok(result.keywords.matched.includes("testes"));
  assert.ok(result.keywords.matched.includes("automatizados"));
});

test("does not change the score based only on the company name", () => {
  const totvs = analyze({ company: "TOTVS" });
  const anotherCompany = analyze({ company: "Outra empresa" });

  assert.equal(totvs.score, anotherCompany.score);
  assert.deepEqual(totvs.dimensions, anotherCompany.dimensions);
  assert.equal(totvs.companyMatch, undefined);
  assert.equal(anotherCompany.companyMatch, undefined);
});

test("falls back to safe defaults when every configured weight is zero", () => {
  const result = analyze({
    weights: {
      skills: 0,
      experience: 0,
      vacancy: 0,
      company: 0,
      softSkills: 0,
      education: 0,
    },
  });

  assert.ok(Number.isFinite(result.score));
  assert.ok(result.dimensions.every((dimension) => (dimension.weight ?? 0) > 0));
});

test("recognizes measurable outcomes as evidence", () => {
  const withoutMetric = analyze({
    resumeText: `${alignedResume} Reduzi o tempo de entrega de uma rotina interna.`,
  });
  const withMetric = analyze({
    resumeText: `${alignedResume} A rotina interna atendeu 350 clientes com menor tempo de entrega.`,
  });

  assert.equal(withoutMetric.signals.hasMetrics, false);
  assert.equal(withMetric.signals.hasMetrics, true);
  assert.equal(withMetric.score, withoutMetric.score + 3);
  assert.ok(withMetric.strengths.some((item) => item.includes("números")));
});
