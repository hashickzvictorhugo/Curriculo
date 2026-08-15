# Algoritmo, explicabilidade e limitações

## Objetivo

O motor estima a aderência **do texto apresentado** a uma vaga. Ele não mede
potencial, personalidade, senioridade real ou probabilidade de contratação.
Cada resultado deve ser lido como uma lista de evidências que o currículo tornou
visíveis — e não como uma decisão sobre a pessoa.

## Etapas

1. Remove acentos, converte o texto para minúsculas e normaliza espaços.
2. Resolve um perfil de cargo conhecido ou extrai requisitos da descrição para
   um cargo personalizado.
3. Procura requisitos e aliases como termos completos no currículo.
4. Extrai sinais simples: anos mencionados, formação e resultados mensuráveis.
5. Compara palavras relevantes do anúncio, setor e prioridades informadas.
6. Combina as dimensões participantes com pesos normalizados.
7. Gera explicações e recomendações usando apenas as evidências encontradas.

O mesmo conjunto de entradas e configuração produz sempre o mesmo resultado.

## Dimensões e pesos padrão

| Dimensão | Peso base | Quando participa |
| --- | ---: | --- |
| Competências técnicas | 36 | sempre |
| Experiência | 20 | sempre |
| Aderência à vaga | 20 | quando há descrição com termos relevantes |
| Contexto da empresa | 12 | quando setor, prioridades ou descrição são informados |
| Competências comportamentais | 7 | sempre |
| Formação | 5 | sempre |

Quando uma dimensão opcional não participa, os pesos restantes são normalizados
para a média ponderada. A interface arredonda os percentuais exibidos, então a
soma visual pode variar um ponto por arredondamento. Se todos os pesos forem
configurados como zero, o motor recupera os padrões antes de calcular.

## Regras complementares

- currículo com menos de 450 caracteres normalizados: ajuste de `-7` pontos;
- evidência de resultado mensurável: ajuste de `+3` pontos;
- resultado final limitado ao intervalo de 18 a 97;
- o nome da empresa aparece no contexto do relatório, mas **não altera a nota
  sozinho**;
- requisitos de formação só recebem peso adicional quando o anúncio os pede;
- descrições personalizadas usam termos frequentes após remover palavras comuns.

## O que o motor não faz

- não consulta redes sociais, histórico de emprego ou bases externas;
- não deduz características protegidas ou perfil psicológico;
- não usa IA generativa, embeddings ou similaridade semântica;
- não verifica se uma afirmação do currículo é verdadeira;
- não recomenda aprovação ou rejeição de candidatura.

## Limitações conhecidas

- correspondência lexical pode perder flexões, abreviações e sinônimos não
  cadastrados;
- pontuação e formatação extraídas de PDF ou DOCX podem separar termos;
- números mencionados sem contexto podem ser confundidos com tempo de
  experiência;
- repetição de palavras não prova domínio técnico;
- currículos em idiomas ou formatos pouco representados podem ter mais falsos
  negativos;
- o resultado calculado no cliente não é uma credencial verificável.

## Uso responsável

O relatório deve servir para revisão pelo próprio candidato. Ele não foi
projetado para triagem automática de pessoas. Uma evolução do algoritmo precisa
manter exemplos representativos, testes de regressão, documentação dos pesos e
revisão humana dos impactos antes da publicação.
