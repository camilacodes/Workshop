# Como enviar para o GitHub

## Passo 1: Inicializar repositório Git

```bash
cd /Workshop/aws-cost-calculator
git init
git add .
git commit -m "Initial commit: AWS Cost Calculator with MCP server and Terraform IaC"
```

## Passo 2: Criar repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome: `aws-cost-calculator`
4. Descrição: `Calculadora web simples para estimar custos dos serviços AWS - TDC 2025 Q Developer Quest`
5. Marque como **Público**
6. **NÃO** inicialize com README (já temos um)
7. Clique em "Create repository"

## Passo 3: Conectar repositório local ao GitHub

```bash
# Substitua SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/aws-cost-calculator.git
git branch -M main
git push -u origin main
```

## Passo 4: Adicionar tags necessárias

```bash
# Adicionar tag obrigatória para o evento
git tag -a v1.0.0 -m "AWS Cost Calculator v1.0.0 - TDC 2025 Q Developer Quest"
git push origin v1.0.0
```

## Passo 5: Configurar GitHub Pages (opcional)

1. No repositório GitHub, vá em **Settings**
2. Role até **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Escolha **main** branch e **/ (root)**
5. Clique em **Save**
6. Seu site estará disponível em: `https://SEU_USUARIO.github.io/aws-cost-calculator`

## Passo 6: Adicionar tópicos/tags no GitHub

1. Na página principal do repositório
2. Clique na engrenagem ⚙️ ao lado de "About"
3. Adicione os tópicos:
   - `q-developer-quest-tdc-2025`
   - `aws`
   - `cost-calculator`
   - `javascript`
   - `terraform`
   - `mcp-server`
   - `amazon-q-developer`

## Verificação dos Requisitos

### ✅ Etapa 1: Bolsinha cabos exclusiva AWS
- [x] Projeto gerado com Amazon Q Developer
- [x] Projeto público no GitHub
- [x] Tag `q-developer-quest-tdc-2025`
- [x] README.md com screenshot
- [x] Lista dos prompts utilizados

### ✅ Etapa 2: Mochilinha exclusiva AWS
- [x] Tudo da Etapa 1
- [x] Diagrama de arquitetura (Mermaid)
- [x] Testes automatizados (`npm test`)

### ✅ Etapa 3: Garrafa + Toalha exclusiva AWS
- [x] Tudo das Etapas 1 & 2
- [x] Servidor MCP (`mcp-server/`)
- [x] Configuração Amazon Q Developer (`.amazonq/`)
- [x] IaC Terraform (`infrastructure/`)

### ✅ Etapa 4: Camiseta da capivara AWS
- [x] Tudo das Etapas 1, 2 & 3
- [x] README.md com estimativa de custo

## Comandos úteis

```bash
# Ver status do repositório
git status

# Adicionar mudanças
git add .
git commit -m "Descrição das mudanças"
git push

# Ver histórico
git log --oneline

# Criar nova branch para features
git checkout -b feature/nova-funcionalidade
```

## Estrutura final do projeto

```
aws-cost-calculator/
├── .amazonq/
│   └── mcp-config.json
├── infrastructure/
│   └── main.tf
├── mcp-server/
│   ├── package.json
│   ├── server.js
│   └── README.md
├── index.html
├── style.css
├── script.js
├── test.js
├── package.json
├── README.md
├── screenshot.png
├── deploy.sh
├── .gitignore
└── GITHUB_SETUP.md
```

🎉 **Projeto pronto para o TDC 2025 Q Developer Quest!**