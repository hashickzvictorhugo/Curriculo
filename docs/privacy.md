# Privacidade e ciclo dos dados

Este documento descreve o comportamento técnico atual do NexoCV. Ele não
substitui uma política jurídica de privacidade para operação comercial.

## Dados tratados

| Dado | Finalidade | Onde é tratado |
| --- | --- | --- |
| Texto do currículo | calcular evidências e recomendações | navegador |
| Arquivo PDF, DOCX ou texto | extração e, com login, histórico | navegador e R2 |
| Empresa, cargo e descrição da vaga | contextualizar a análise | navegador e D1 com login |
| Resultado da análise | exibir e recuperar o histórico | navegador e D1 com login |
| ID, nome e e-mail da conta | autenticação, isolamento e exibição | servidor e D1 |
| ID e e-mail do administrador | autorização pelo ID e auditoria das versões de configuração | ambiente e D1 |

## Sem login

A leitura do arquivo e o cálculo acontecem no navegador. O NexoCV não chama a
API de histórico e não persiste o currículo ou o resultado em D1/R2. O estado
permanece sujeito ao ciclo da página e do navegador.

## Com login

Depois de uma análise, a aplicação salva automaticamente:

- o diagnóstico, a empresa, o cargo, a nota e metadados no D1;
- o arquivo original no R2, quando a entrada foi um upload;
- o identificador e o e-mail fornecidos pelo ambiente de autenticação.

A consulta de histórico usa o identificador estável da conta e retorna as 20
análises mais recentes. O arquivo original não é exposto por uma URL pública na
interface atual.

## Compartilhamento

O botão de WhatsApp é uma ação explícita do usuário e envia para o serviço
externo apenas o texto preparado para compartilhamento. A política e o ambiente
do WhatsApp passam a valer depois dessa ação.

## Terceiros e IA

O cálculo da nota não envia o currículo a um modelo generativo nem a uma API de
IA. A hospedagem e os armazenamentos são executados na infraestrutura declarada
do Cloudflare/Sites, e a autenticação depende do provedor disponibilizado pelo
ambiente.

## Retenção e controles atuais

A versão atual ainda não oferece exclusão ou exportação self-service. Dados
persistidos podem permanecer até remoção operacional. Antes de uso comercial,
o produto deve definir prazo de retenção, canal de solicitação do titular,
rotina de exclusão coordenada entre D1 e R2 e base legal aplicável.

## Princípios para evolução

- coletar apenas o necessário para a função solicitada;
- nunca registrar conteúdo de currículo em logs;
- manter objetos privados e autorizar toda operação pelo ID do proprietário;
- tornar retenção, exportação e exclusão visíveis para o usuário;
- revisar dependências de parsing e limitar tamanho e tipo de upload;
- comunicar mudanças de tratamento antes de aplicá-las a dados existentes.
