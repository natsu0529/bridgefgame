# Bridge Game Backend

## 概要
BridgeゲームのPython FastAPIバックエンドです。

## 機能
- 新しいゲームの開始
- ビッドフェーズの管理
- カードプレイの管理
- スコア計算
- ゲーム状態の管理

## API エンドポイント

### POST /api/new-game
新しいゲームを開始します。

### GET /api/game/{game_id}
ゲーム状態を取得します。

### POST /api/bid
ビッドを行います。

### POST /api/play-card
カードをプレイします。

### GET /api/games
アクティブなゲーム一覧を取得します。

### DELETE /api/game/{game_id}
ゲームを削除します。

## 実行方法

```bash
# 仮想環境を有効化
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# サーバーを起動
python main.py
```

サーバーは http://localhost:8000 で起動します。
