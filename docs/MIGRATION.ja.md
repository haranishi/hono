# マイグレーションガイド

## v4.3.11 から v4.4.0

### `deno.land/x` から JSR への移行

破壊的変更はありませんが、`deno.land/x` からのモジュール公開は終了しました。DenoでHonoを使用する場合は、代わりにJSRを使用してください。

移行する場合は、`deno.land/x` のインポートパスをJSRのものに置き換えます。

```ts
// 移行前
import { Hono } from 'https://deno.land/x/hono/mod.ts'

// 移行後
import { Hono } from 'jsr:@hono/hono'
```

詳細は公式サイトを参照してください: https://hono.dev/getting-started/deno

## v3.12.x から v4.0.0

いくつかの破壊的変更があります。

### 非推奨（deprecated）機能の削除

- AWS Lambda アダプター - `LambdaFunctionUrlRequestContext` は廃止されました。代わりに `ApiGatewayRequestContextV2` を使用してください。
- Next.js アダプター - `hono/nextjs` は廃止されました。代わりに `hono/vercel` を使用してください。
- Context - `c.jsonT()` は廃止されました。代わりに `c.json()` を使用してください。
- Context - `c.stream()` および `c.streamText()` は廃止されました。代わりに `hono/streaming` の `stream()` および `streamText()` を使用してください。
- Context - `c.env()` は廃止されました。代わりに `hono/adapter` の `getRuntimeKey()` を使用してください。
- Hono - `app.showRoutes()` は廃止されました。代わりに `hono/dev` の `showRoutes()` を使用してください。
- Hono - `app.routerName` は廃止されました。代わりに `hono/dev` の `getRouterName()` を使用してください。
- Hono - `app.head()` は使用されなくなりました。`app.get()` が暗黙的に HEAD メソッドも処理します。
- Hono - `app.handleEvent()` は廃止されました。代わりに `app.fetch()` を使用してください。
- HonoRequest - `req.cookie()` は廃止されました。代わりに `hono/cookie` の `getCookie()` を使用してください。
- HonoRequest - `headers()`、`body()`、`bodyUsed()`、`integrity()`、`keepalive()`、`referrer()`、`signal()` は廃止されました。`req.raw.headers` のように `req.raw` 上の対応するプロパティを使用してください。

### Cloudflare Workers アダプターの `serveStatic` で `manifest` が必須に

Cloudflare Workers アダプターの `serve-static` を使用する場合は、`manifest` オプションを指定する必要があります。

```ts
import manifest from '__STATIC_CONTENT_MANIFEST'

// ...

app.use('/static/*', serveStatic({ root: './assets', manifest }))
```

### その他

- JSX Renderer ミドルウェアの `docType` オプションのデフォルト値が `true` になりました。
- `hono/jsx` の `FC` は `children` を暗黙的に受け取らなくなりました。`PropsWithChildren` を使用してください。
- 一部の MIME タイプが削除されました: https://github.com/honojs/hono/pull/2119
- ミドルウェアを伴うルートチェーンの型定義が改善されました: https://github.com/honojs/hono/pull/2046
- バリデーターの型定義が更新されました: https://github.com/honojs/hono/pull/2130

## v2.7.8 から v3.0.0

いくつかの破壊的変更があります。
以下に加え、型の不一致が発生する場合があります。

### `c.req` が `HonoRequest` に変更

`c.req` は標準の `Request` ではなく `HonoRequest` になりました。
APIはほぼ同じですが、元の `Request` オブジェクトにアクセスしたい場合は `c.req.raw` を使用してください。

```ts
app.post('/', async (c) => {
  const metadata = c.req.raw.cf?.hostMetadata?
  ...
})
```

### `StaticRouter` の廃止

`StaticRouter` は使用できなくなりました。

### バリデーターの変更

従来の Validator ミドルウェアは廃止されました。
引き続き `hono/validator` を使用できますが、APIが変更されています。
詳細は[公式ドキュメント](https://hono.dev)を参照してください。

### `serveStatic` の提供元がアダプターに変更

Serve Static ミドルウェアは廃止されました。代わりに各ランタイムのアダプターからインポートしてください。

```ts
// Cloudflare Workers の場合
import { serveStatic } from 'hono/cloudflare-workers'

// Bun の場合
// import { serveStatic } from 'hono/bun'

// Deno の場合
// import { serveStatic } from 'npm:hono/deno'

// ...

app.get('/static/*', serveStatic({ root: './' }))
```

### Cloudflare Workers「Service Worker モード」向け `serveStatic` の廃止

Cloudflare Workers において、Service Worker モードでの `serveStatic` は廃止されました。

補足: Service Worker モードとは `app.fire()` を使用する方式です。
`export default app` を使用する「Module Worker」モードへの移行を推奨します。

### `new Hono` のジェネリクス定義には `type` を使用

`new Hono` のジェネリクスを定義する際は、`interface` ではなく `type` を使用してください。

```ts
// `type` を使用してください
type Bindings = {
  TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()
```

## v2.7.1 - v2.x.x

### 現行の Validator ミドルウェアの非推奨化

次のメジャーバージョンで、Validator ミドルウェアに破壊的変更が加わります。そのため、現行の Validator ミドルウェアは非推奨となります。[Zod](https://zod.dev) や [TypeBox](https://github.com/sinclairzx81/typebox) などのサードパーティ製バリデーションライブラリを使用してください。

```ts
import * as z from 'zod'

//...

const schema = z.object({
  title: z.string().max(100),
})

app.post('/posts', async (c) => {
  const body = await c.req.parseBody()
  const res = schema.safeParse(body)
  if (!res.success) {
    return c.text('Invalid!', 400)
  }
  return c.text('Valid!')
})
```

## v2.2.5 から v2.3.0

セキュリティアップデートに伴う破壊的変更があります。

### Basic Auth ミドルウェアおよび Bearer Auth ミドルウェア

ハンドラー内で Basic Auth や Bearer Auth をネストして使用している場合は、以下のように変更してください。

```ts
app.use('/auth/*', async (c, next) => {
  const auth = basicAuth({ username: c.env.USERNAME, password: c.env.PASSWORD })
  return auth(c, next) // 以前: `await auth(c, next)`
})
```

## v2.0.9 から v2.1.0

2つの破壊的変更があります。

### `c.req.parseBody` は JSON・テキスト・ArrayBuffer をパースしない

**JSON**、**テキスト**、**ArrayBuffer** のパースに `c.req.parseBody` を**使用しないでください**。

`c.req.parseBody` は Content-Type が `multipart/form` または `application/x-www-form-urlencoded` の FormData のみをパースするようになりました。JSON、テキスト、ArrayBuffer をパースする場合は、それぞれ `c.req.json()`、`c.req.text()`、`c.req.arrayBuffer()` を使用してください。

```ts
// `multipart/form` または `application/x-www-form-urlencoded`
const data = await c.req.parseBody()

const jsonData = await c.req.json() // JSON ボディ用
const text = await c.req.text() // テキストボディ用
const arrayBuffer = await c.req.arrayBuffer() // ArrayBuffer 用
```

### `new Hono` のジェネリクス引数の変更

`Hono` コンストラクターの型引数で `Variables` と `Bindings` を受け取るようになりました。
`Bindings` は Cloudflare Workers の環境変数の型、`Variables` は `c.set` / `c.get` で扱う変数の型を指定します。

```ts
type Bindings = {
  KV: KVNamespace
  Storage: R2Bucket
}

type WebClient = {
  user: string
  pass: string
}

type Variables = {
  client: WebClient
}

const app = new Hono<{ Variables: Variables; Bindings: Bindings }>()

app.get('/foo', (c) => {
  const client = c.get('client') // client は WebClient 型
  const kv = c.env.KV // kv は KVNamespace 型
  //...
})
```

## v1.6.4 から v2.0.0

多数の破壊的変更があります。以下の手順に従って移行してください。

### Deno でのミドルウェアのインポート方法の変更

`hono/mod.ts` からミドルウェアをインポート**しないでください**。

```ts
import { Hono, poweredBy } from 'https://deno.land/x/hono/mod.ts' // <--- NG
```

`hono/mod.ts` はミドルウェアをエクスポートしなくなりました。
ミドルウェアをインポートする場合は `hono/middleware.ts` を使用してください。

```ts
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { poweredBy, basicAuth } from 'https://deno.land/x/hono/middleware.ts'
```

### Cookie ミドルウェアの廃止

`cookie` ミドルウェアは**使用しないでください**。

```ts
import { cookie } from 'hono/cookie' // <--- 廃止されました！
```

Cookieのパースや設定にCookieミドルウェアを使う必要はなくなりました。
標準のメソッドとして組み込まれています。

```ts
// Cookieのパース
app.get('/entry/:id', (c) => {
  const value = c.req.cookie('name')
  ...
})
```

```ts
app.get('/', (c) => {
  c.cookie('delicious_cookie', 'choco')
  return c.text('Do you like cookie?')
})
```

### Body parse ミドルウェアの廃止

`body-parse` ミドルウェアは**使用しないでください**。

```ts
import { bodyParse } from 'hono/body-parse' // <--- 廃止されました！
```

リクエストボディのパースに Body parse ミドルウェアを使う必要はなくなりました。代わりに `c.req.parseBody()` メソッドを使用してください。

```ts
// リクエストボディのパース
app.post('', (c) => {
  const body = c.req.parseBody()
  ...
})
```

### GraphQL Server ミドルウェアの廃止

`graphql-server` ミドルウェアは**使用しないでください**。

```ts
import { graphqlServer } from 'hono/graphql-server' // <--- 廃止されました！
```

サードパーティ製ミドルウェアとして配布される予定です。

### Mustache ミドルウェアの廃止

`mustache` ミドルウェアは**使用しないでください**。

```ts
import { mustache } from 'hono/mustache' // <--- 廃止されました！
```

今後は本体では提供されません。
