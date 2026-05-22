# count-sleeps (あとなんねる) 仕様書 v1_0
## ゴール
楽しみな日まで「あと何回ねる(何日)」かを大きく表示するChrome拡張。見通しが立ちにくい子の不安軽減・予定理解支援。
## 絶対制約
外部API・通信なし/chrome.storage.localのみ/権限storageのみ/MV3・TS・Vite/UIはpopup内で完結。医療・診断をうたわない。
## 機能
イベント(名前/絵文字/日付)CRUD/今日からの残り日数=ねる回数を大きく表示/当日「きょうだよ!」演出・過去日は完了表示/複数イベントを近い順に一覧/起動時復元/i18n ja-en/無料はイベント3つ、Premium($3買い切り7日トライアル)で無制限+背景テーマ。
## 完了条件
npm run build成功・dist生成・_locales ja/en・icons16/48/128・release/count-sleeps.zip生成。
