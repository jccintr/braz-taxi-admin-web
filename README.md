# Braz Taxi · Central (admin web)

Novo painel administrativo do Braz Taxi, sucessor do `brazdriver-admin`. Usa **a mesma API**
(`api-taxi-braz-node-mongo`) sem nenhuma rota nova.

Stack no padrão dos projetos recentes (Delivroo v2 backoffice): React 19 + Vite 8, Tailwind 4,
flowbite-react 0.12, react-icons, React Router 7, Leaflet; tema Claro / Escuro / Sistema; oxlint.

## Rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_PROXY (API local ou produção)
npm run dev            # http://localhost:5176
```

Em dev, as chamadas vão para `/api/...` e o Vite repassa para `VITE_API_PROXY` removendo o `/api`
(a API não tem prefixo). Em produção, `VITE_API_URL` aponta direto para a API (ver `.env.production`).
Mapas: OpenStreetMap, sem chave (no tema escuro, escurecido por CSS). Opcional: `VITE_CARTO_KEY` para o Dark Matter da CARTO.
Deploy na Vercel: `vercel.json` já tem o rewrite de SPA.

## Telas

| Rota | O que faz | Rotas da API |
|---|---|---|
| `/dashboard` | KPIs ao vivo, faturamento dia/semana/mês, **relatório mensal** com ranking de motoristas e exportação CSV, "agora na rua" | `/admin/dashboard`, `/admin/rides/report` |
| `/mapa` | Mapa ao vivo (atualiza a cada 20 s), camadas, lista lateral, linha motorista → embarque nas corridas aceitas, mapa escuro no tema escuro | `/admin/map` |
| `/corridas` | Abas por situação (pendentes, aceitas, em andamento, concluídas, canceladas), paginação na URL | `/admin/rides*` |
| `/corridas/:id` | Mapa A→B, linha do tempo com o tempo entre etapas, conversa do app, notas, repasse, excluir | `/admin/rides/:id` |
| `/motoristas` | Busca, filtros (online/offline/sem push), ordenação | `/admin/drivers` |
| `/motoristas/:id` | Estatísticas e gráfico de 6 meses, histórico, colocar online/offline, notificar, copiar Pix | `/admin/drivers/:id`, `/:id/rides`, `/:id/status`, `sendPushMessage` |
| `/motoristas/novo`, `/:id/editar` | Cadastro e edição (veículo, Pix, bloqueio) | `/admin/drivers/register`, `PUT /admin/drivers/:id` |
| `/passageiros`, `/passageiros/:id` | Busca por nome/email/telefone, histórico, estatísticas, edição/bloqueio | `/admin/passengers*` |
| `/mensagens` | Caixa de entrada do fale conosco (abrir marca como lida), filtro por assunto | `/admin/passengers/messages*` |
| `/notificacoes` | Push para todos ou para um motorista, modelos prontos, prévia no celular | `sendPushMessageToAll`, `sendPushMessage` |
| `/logs` | Atividade de motoristas e passageiros agrupada por dia | `/admin/logs/*` |

## Extras

- **Ctrl+K**: paleta de comandos para ir a qualquer tela, motorista ou passageiro.
- **Alerta de corrida nova**: o painel consulta `/admin/map` a cada 20 s; quando surge uma corrida pendente
  mostra um aviso, e opcionalmente toca um som e dispara notificação do navegador (sino no topo).
- **Aviso de servidor acordando**: se a API (Render, plano gratuito) demorar mais de 4 s, aparece uma faixa explicando.

## Observações sobre a API (para a conversa futura)

Coisas que o painel contorna hoje e que valeria ajustar na API:

1. Não existe rota "quem sou eu" para validar o token: a sessão fica no navegador e só cai num 401.
2. `GET /admin/drivers/:id` não devolve `online` (o painel usa o `/admin/map` para saber).
3. Listas de motoristas/passageiros vêm sem paginação nem busca no servidor (o filtro é feito no navegador).
4. `PUT /admin/passengers/messages/:id` é usado para marcar lida; erros às vezes vêm em `message` e não em `error`.
5. O relatório mensal não tem série diária; daria para mostrar um gráfico por dia.
6. A tela de Bairros/Localidades do admin antigo estava desativada no menu, por isso não foi trazida.
