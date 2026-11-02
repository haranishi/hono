<div align="center">
  <a href="https://hono.dev">
    <img src="https://raw.githubusercontent.com/honojs/hono/main/docs/images/hono-title.png" width="500" height="auto" alt="Hono"/>
  </a>
</div>

<hr />

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/honojs/hono/ci.yml?branch=main)](https://github.com/honojs/hono/actions)
[![GitHub](https://img.shields.io/github/license/honojs/hono)](https://github.com/honojs/hono/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/hono)](https://www.npmjs.com/package/hono)
[![npm](https://img.shields.io/npm/dm/hono)](https://www.npmjs.com/package/hono)
[![JSR](https://jsr.io/badges/@hono/hono)](https://jsr.io/@hono/hono)
[![Bundle Size](https://img.shields.io/bundlephobia/min/hono)](https://bundlephobia.com/result?p=hono)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/hono)](https://bundlephobia.com/result?p=hono)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/honojs/hono)](https://github.com/honojs/hono/pulse)
[![GitHub last commit](https://img.shields.io/github/last-commit/honojs/hono)](https://github.com/honojs/hono/commits/main)
[![codecov](https://codecov.io/github/honojs/hono/graph/badge.svg)](https://codecov.io/github/honojs/hono)
[![Discord badge](https://img.shields.io/discord/1011308539819597844?label=Discord&logo=Discord)](https://discord.gg/KMh2eNSdxV)

[English](README.md) | 日本語

Hono（日本語の「**炎🔥**」に由来）は、Web標準の上に構築された、小さくシンプルで超高速なWebフレームワークです。Cloudflare Workers、Fastly Compute、Deno、Bun、Vercel、AWS Lambda、Lambda@Edge、Node.jsなど、あらゆるJavaScriptランタイムで動作します。

速いだけでなく、開発体験にも優れています。

```ts
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.text('Hono!'))

export default app
```

## クイックスタート

```bash
npm create hono@latest
```

## 特徴

- **超高速** 🚀 - ルーター `RegExpRouter` は線形ループを使わず、きわめて高速に動作します。
- **軽量** 🪶 - `hono/tiny` プリセットは12kB未満です。外部依存はゼロで、Web標準APIのみを使用しています。
- **マルチランタイム** 🌍 - Cloudflare Workers、Fastly Compute、Deno、Bun、AWS Lambda、Lambda@Edge、Node.jsで動作し、すべてのプラットフォームで同じコードが動きます。
- **豊富な組み込み機能** 🔋 - 組み込みミドルウェア、カスタムミドルウェア、サードパーティ製ミドルウェアが揃っています。
- **快適な開発体験（DX）** 😃 - すっきりしたAPIと充実したTypeScriptの型サポートを備えています。

## ドキュメント

公式ドキュメントは [hono.dev](https://hono.dev) で公開しています。

## マイグレーション

マイグレーションガイドは [docs/MIGRATION.ja.md](docs/MIGRATION.ja.md)（英語版: [docs/MIGRATION.md](docs/MIGRATION.md)）を参照してください。

## コミュニティ

[X](https://x.com/honojs) および [Discordチャンネル](https://discord.gg/KMh2eNSdxV) で最新情報の共有や交流を行っています。

## コントリビューション

コントリビューションを歓迎します。以下の方法で参加できます。

- Issueの作成 - 新機能の提案やバグ報告。
- ミドルウェア・ライブラリの開発 - Honoのエコシステムを広げる。
- 発信・共有 - ブログやXなどで知見や感想を共有する。
- スポンサー - GitHub Sponsors（[@yusukebe](https://github.com/sponsors/yusukebe) および [@usualoma](https://github.com/sponsors/usualoma)）を通じてメンテナーを支援する。
- アプリケーションの開発 - Honoを使ってアプリケーションを作る。

詳細は [docs/CONTRIBUTING.ja.md](docs/CONTRIBUTING.ja.md)（英語版: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)）を参照してください。

## コントリビューター

[すべてのコントリビューター](https://github.com/honojs/hono/graphs/contributors)に感謝します！

## 作者

Yusuke Wada <https://github.com/yusukebe>

_RegExpRouter_、_SmartRouter_、_LinearRouter_、_PatternRouter_ の作者: Taku Amano <https://github.com/usualoma>

## ライセンス

MITライセンスのもとで配布されています。詳細は [LICENSE](LICENSE) を参照してください。
