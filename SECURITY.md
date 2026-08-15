# Política de segurança

## Versões suportadas

O branch `main` representa a única versão atualmente suportada.

## Como reportar

Não abra uma issue pública com dados pessoais, currículos, credenciais ou
instruções de exploração. Use **Report a vulnerability**, na aba Security do
GitHub, e inclua:

- impacto e cenário afetado;
- passos mínimos para reproduzir;
- versão, commit ou ambiente observado;
- sugestão de correção, quando houver.

Não inclua dados reais de terceiros no relato. Use arquivos e contas de teste.

## Escopo prioritário

- quebra do isolamento entre históricos de usuários;
- leitura ou gravação indevida de objetos no R2;
- contorno da autorização administrativa;
- falsificação de identidade ou de cabeçalhos de autenticação;
- exposição de segredos, currículos ou resultados privados;
- injeção, execução de código ou abuso das rotas de upload.

## Modelo resumido

- a identidade é fornecida pelo ambiente de hospedagem e revalidada no servidor;
- consultas de histórico são filtradas pelo identificador estável do usuário;
- rotas administrativas exigem um ID estável presente na allowlist do ambiente;
- arquivos e dados estruturados ficam em armazenamentos privados separados;
- segredos pertencem ao ambiente de execução, nunca ao repositório.

O tratamento de dados e as limitações atuais estão detalhados em
[`docs/privacy.md`](docs/privacy.md) e [`docs/architecture.md`](docs/architecture.md).
