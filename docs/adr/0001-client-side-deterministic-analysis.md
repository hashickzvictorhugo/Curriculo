# ADR 0001 — Motor lexical determinístico no navegador

- **Status:** aceito
- **Data:** 2026-08-15

## Contexto

O produto precisa responder rapidamente, explicar por que cada evidência entrou
na nota e minimizar o envio de conteúdo sensível durante uma análise sem login.
Um modelo remoto ou generativo tornaria custo, latência, repetibilidade e
explicação mais difíceis de controlar nesta fase.

## Decisão

Extrair o texto do arquivo e executar um motor lexical determinístico no
navegador. O motor recebe texto do currículo, perfil do cargo, descrição da vaga,
contexto da empresa e pesos; devolve dimensões, sinais e recomendações
estruturadas. Persistência é uma responsabilidade separada e só é acionada para
uma conta autenticada.

## Consequências positivas

- mesma entrada e configuração produzem o mesmo resultado;
- cada dimensão pode ser explicada e testada sem rede;
- visitantes não autenticados não precisam enviar o currículo ao backend;
- o custo operacional da análise é previsível;
- o motor pode ser exercitado com o Node Test Runner.

## Consequências negativas

- comparação lexical entende pouco contexto e depende de aliases mantidos;
- o bundle do cliente inclui regras e catálogos;
- um resultado enviado pelo navegador não é prova inviolável;
- parsing local varia conforme qualidade e estrutura do documento;
- mudanças relevantes exigem versionar regras e testes de regressão.

## Alternativas consideradas

### Modelo generativo remoto

Rejeitado nesta fase por elevar exposição de dados, custo e variabilidade, além
de dificultar uma explicação reproduzível da nota.

### Processamento totalmente no servidor

Adiado. Facilitaria centralizar regras e verificar resultados persistidos, mas
faria todo currículo atravessar a fronteira de rede, inclusive sem login.

### Embeddings ou busca semântica local

Adiado até existir um conjunto de avaliação representativo que permita medir o
ganho real e os impactos entre áreas profissionais e idiomas.
