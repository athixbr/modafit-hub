# Deploy na Vercel - Modafit Hub

## Configuração Automática

O projeto já está configurado para deploy na Vercel com suporte a todas as rotas do React Router.

### Rotas Disponíveis

#### Área Administrativa
- `/login` - Login de administrador
- `/admin` - Dashboard (requer autenticação)
- `/admin/perfil` - Perfil do usuário
- `/admin/estoque` - Gerenciamento de estoque
- `/admin/clientes` - Gerenciamento de clientes
- `/admin/fornecedores` - Gerenciamento de fornecedores
- `/admin/pedidos` - Pedidos de venda
- `/admin/caixa` - Caixa e registros
- `/admin/financeiro` - Gestão financeira
- `/admin/relatorios` - Relatórios

#### Loja Virtual
- `/` - Redirecionamento para `/loja`
- `/loja` - Página principal da loja
- `/loja/produto/:id` - Detalhes do produto
- `/loja/carrinho` - Carrinho de compras
- `/loja/cadastro` - Cadastro de cliente
- `/loja/login` - Login de cliente

## Passo a Passo para Deploy

### 1. Configurar Variáveis de Ambiente na Vercel

No painel da Vercel, adicione as seguintes variáveis:

```
VITE_API_URL=https://api-loja.vidativa.site/api
VITE_API_BASE_URL=https://api-loja.vidativa.site
VITE_ENV=production
```

### 2. Deploy via Git

```bash
# Na raiz do projeto modafit-hub
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

### 3. Deploy via CLI (opcional)

```bash
npm install -g vercel
cd modafit-hub
vercel --prod
```

## Configurações

### vercel.json

O arquivo `vercel.json` está configurado para:
- **Rewrites**: Redireciona todas as rotas para `index.html` (necessário para SPA)
- **Headers**: Cache otimizado para assets estáticos (1 ano)

### Build

O Vercel detecta automaticamente:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Verificação

Após o deploy, teste as rotas:
- ✅ https://seu-dominio.vercel.app/
- ✅ https://seu-dominio.vercel.app/loja
- ✅ https://seu-dominio.vercel.app/admin
- ✅ https://seu-dominio.vercel.app/login

## Troubleshooting

### Erro 404 nas rotas
Se aparecer erro 404 ao acessar rotas diretamente:
- Verifique se `vercel.json` existe na raiz
- Confirme que os rewrites estão corretos

### API não responde
- Verifique as variáveis de ambiente no painel da Vercel
- Confirme que `VITE_API_URL` está correto
- Verifique se o backend está rodando na porta 3029

### Build falha
```bash
# Teste o build localmente
npm run build
npm run preview
```

## CORS no Backend

Certifique-se que o backend está configurado para aceitar requisições do domínio da Vercel:

```env
CORS_ORIGIN=*
# ou
CORS_ORIGIN=https://seu-dominio.vercel.app
```
