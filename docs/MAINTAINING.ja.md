# メンテナンスガイド

このリポジトリのメンテナー向けメモです。

## アダプター

ランタイムアダプターは `adapters/*` に配置され、個別のパッケージ（`@hono/bun` など）として公開されます。各ディレクトリは pnpm ワークスペースのパッケージであり、ルートパッケージは `hono` 本体です。

### ディレクトリ構成

```
adapters/bun/
  src/            # ワークスペースリンク経由で `hono`, `hono/ws` などをインポート
  src/*.test.ts   # `bun test` で実行
  package.json    # peerDependencies: hono >=x.y.z
  vite.config.ts  # `vp pack` 設定（ESMのみ）
```

### コマンド

リポジトリのルートから実行します。

```sh
pnpm run build:adapters   # すべてのアダプターをビルド
pnpm run test:adapters    # すべてのアダプターで tsc + bun test を実行
pnpm --filter @hono/bun run test
```

CIでは、`adapters/**`（およびアダプターが依存する `src/**`）の変更に対して `ci-adapters.yml` が実行されます。メインの `ci.yml` は `adapters/**` のみの変更をスキップします。

### バージョニング

- アダプターのバージョンは `hono` 本体とは独立しています。`hono` のリリース時にアダプターのバージョンを上げないでください。
- 互換性は各アダプターの `peerDependencies.hono` で表します。アダプターが `hono` の新しい機能を使い始めたときに下限バージョンを引き上げてください。
- Gitタグは `@hono/<name>@<version>` 形式です。`v<version>` 形式を使うのは `hono` 本体のみです。

### リリース手順

```sh
pnpm run release:adapter bun patch   # または minor, major, あるいは明示的な x.y.z
```

このコマンドは `adapters/bun/package.json` のバージョンを更新してコミットし、注釈付きタグ `@hono/bun@<version>` を作成してプッシュします。その後、`release.yml` ワークフローがアダプターをパッケージ化して `npm stage publish` を実行します。npm上でステージングされたバージョンを承認（2FA）すると公開されます。

スクリプトの最後には、前回のタグ以降に `adapters/bun` を変更したコミットから生成されたリリースノートの下書きと、入力済みのGitHub「新規リリース」リンクが出力されます。GitHub Releaseの作成は任意です。

### JSR

`@hono/deno` と `@hono/netlify` はJSRにも公開されます。それぞれJSRパッケージ設定となる `deno.json` を持っており、`imports` で `hono` を `jsr:@hono/hono` にマッピングし、`version` はルートの `jsr.json` と同様に `0.0.0` のままにします。
タグ付けされたアダプターに `deno.json` がある場合、`release.yml` ワークフローがタグからバージョンを `deno.json` に書き込み、`deno publish` を実行します。
初回リリースの前に、jsr.io の `@hono` スコープ下にパッケージを作成し、ワークフローがOIDCで公開できるように `honojs/hono` リポジトリをリンクしてください。アダプターのディレクトリで `deno publish --dry-run --set-version 0.0.1` を実行すると、ローカルでパッケージを検証できます（ドライランでは `--set-version` で問題ありませんが、実際の公開時は `deno.json` にバージョンが書き込まれている必要があります）。

`adapters/deno/test` 配下のテストは、`hono` をワーキングツリーにマッピングする `test/deno.json` を使って Deno 上で実行されます（`pnpm --filter @hono/deno run test:deno`）。

### 新しいアダプターの追加手順

1. `adapters/bun` を `adapters/<name>` としてコピーし、`package.json`（`name`、`description`）とソースコードを調整します。
2. ワークスペースに自動認識されます（`pnpm-workspace.yaml` に `adapters/*` が指定されています）。
3. 対応する `src/adapter/<name>` の各エクスポートに、新しいパッケージを案内する `@deprecated` を追加します。
4. **初回公開は手動で行います。** 下記の手順を参照してください。
5. 2回目以降のリリースでは `pnpm run release:adapter <name> <bump>` を使用します。

#### 新しいアダプターの初回公開

npmでは既存のパッケージに対してのみ Trusted Publisher を設定できるため、最初のバージョンはメンテナーの手元から公開します。

1. `adapters/<name>/package.json` にバージョンを設定してマージします。
2. `pnpm --filter @hono/<name> run build` でビルドします（`pnpm publish` は自動でビルドを行いません）。
3. `adapters/<name>` ディレクトリで、npmの2FAを使って `pnpm publish --access public` を実行します。
4. npmjs.com でパッケージの設定画面を開き、Trusted Publisher（リポジトリ: `honojs/hono`、ワークフロー: `release.yml`）を追加します。
