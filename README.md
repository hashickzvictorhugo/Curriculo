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

## Desenvolvimento

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

O banco estruturado usa D1 e os currículos usam R2. As declarações lógicas ficam
em `.openai/hosting.json` e a migração do histórico está em `drizzle/`.
