# InitialProject

## Sobre o Projeto

Este repositório serve como um template para a criação de novos projetos. Ele vem pré-configurado com Husky para padronizar commits semânticos, garantindo consistência e facilitando a manutenção do código.

## Como Usar

Basta clicar no botão `Use this template` para criar um novo projeto baseado neste template. Em seguida, leia as regras abaixo para entender como configurar e utilizar corretamente o projeto.

## Configuração do Husky

Para instalar o Husky e todas as dependências necessárias:

```bash
npm i
```

## Padrão de Commits

Os commits devem seguir o formato:

```
tipo(escopo): "descrição"
```

Onde:

- **tipo**: feat, fix, docs, style, refactor, test, chore, etc.
- **escopo**: pasta ou arquivo modificado
- **descrição**: explicação clara das mudanças

Exemplo:

```
feat(users): "criei o sistema de login do user"
```

## Regras do Projeto

### Tecnologias e Implementação

- A equipe tem liberdade para escolher a stack tecnológica que melhor se adeque ao projeto
- Todas as tecnologias utilizadas (backend e frontend) devem ser documentadas no README
  - Inclua instruções claras de instalação, configuração e execução
  - Documente dependências e requisitos do sistema

### Infraestrutura

- **Recomendado**: Utilizar Docker para containerização do banco de dados e serviços
  - Facilita a configuração do ambiente de desenvolvimento
  - Garante consistência entre ambientes diferentes

### Gerenciamento de Projeto

- É obrigatória a criação de um quadro no Trello para gerenciamento de tarefas
- Entre em contato com um administrador da Hublast para:
  - Solicitar a criação do quadro Trello na organização
  - Obter acesso para todos os membros da equipe

### Processo de Pull Request

- Cada membro do grupo deve:
  - Criar uma nova branch para desenvolver suas funcionalidades
  - Abrir uma pull request para enviar seu código para a branch principal
  - Recomenda-se solicitar review de pelo menos um membro do grupo antes do merge
  - A revisão e aprovação por outro membro não é obrigatória, mas é fortemente recomendada para garantir qualidade do código
