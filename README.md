# NexoCV

Aplicação para comparar currículos com vagas e gerar um diagnóstico explicável
de compatibilidade. A análise considera competências técnicas, experiência,
aderência ao anúncio, contexto profissional da empresa, habilidades
comportamentais e formação.

## Produto

- leitura de currículos em PDF, DOCX e TXT;
- catálogo com centenas de cargos, busca e profissão digitada livremente;
- contexto da empresa por setor, prioridades e texto institucional;
- descrição opcional da vaga para comparação específica;
- nota detalhada, pontos fortes, lacunas e recomendações;
- histórico privado associado à conta;
- arquivos protegidos em armazenamento próprio;
- compartilhamento do resultado pelo WhatsApp.

## Administração

O painel administrativo permite editar os textos públicos, a composição da
nota, o catálogo de cargos e o contexto das empresas. Ele só é disponibilizado
para contas autenticadas cujo e-mail esteja na variável `ADMIN_EMAILS` (lista
separada por vírgulas). O atalho visual no rodapé é apenas uma forma de revelar
o painel; a API revalida a autorização em toda leitura e gravação.

As configurações salvas são versionadas no D1 pela migração
`drizzle/0001_glorious_magus.sql` e entram no ar imediatamente.

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

O banco estruturado usa D1 e os currículos usam R2. As declarações lógicas ficam
em `.openai/hosting.json` e as migrações ficam em `drizzle/`.
