# React DevTools セットアップガイド

React DevToolsを使用することで、Reactアプリケーションのデバッグが大幅に改善されます。

## ブラウザ拡張機能のインストール

### Chrome/Edge
1. Chrome Web Store にアクセス
2. "React Developer Tools" を検索
3. 拡張機能をインストール
4. ブラウザを再起動

### Firefox
1. Firefox Add-ons にアクセス
2. "React Developer Tools" を検索
3. 拡張機能をインストール
4. ブラウザを再起動

### Safari
1. Mac App Store にアクセス
2. "React Developer Tools" を検索
3. 拡張機能をインストール
4. Safari の設定で拡張機能を有効化

## 使用方法

1. 開発サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:5173` を開く
3. 開発者ツールを開く (F12)
4. "Components" と "Profiler" タブが表示されます

## 主な機能

- **Components タブ**: コンポーネントツリーの確認、propsとstateの監視
- **Profiler タブ**: レンダリングパフォーマンスの分析
- **Console**: Reactのwarningとerrorメッセージでのスタックトレース改善

## 現在の設定

このプロジェクトは既にReact DevToolsに対応しています：
- 開発モード (`npm run dev`) でのみ動作
- 本番ビルドでは無効化される

## 推奨リンク

- [React DevTools公式ガイド](https://react.dev/link/react-devtools)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
