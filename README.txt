■保存する内容
key					value(型)							meaning
title					string								サイトのタイトル
URL					string								サイトURL
created_at		timestamp						登録日時
deleted_at		timestamp						削除予定日時
state				int									とりあえず、ちょっと気になる、長期保存
comment			string								コメント

■favicon画像の取得はGoogle APIで（参考）
http://9ensan.com/blog/webservice/favicon-google-api/
http://favicon.qfor.info/f/

■より使いやすく
スワイプで削除　OK
サムネ画像API OK
 （or スクレイピングで画像撮ってこれない？）
時間経過で削除
Stateによって削除するか決める