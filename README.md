<p>I'm creating this program to enhance my programming skills and pursue my hobbies.
Furthermore, this program is incomplete, and I am still uncertain about my programming skills.</p>
<p>このプログラムは個人の趣味で自分のプログラムの勉強のために書いています。
また、未完成ですし、自分のプログラミングスキルにもまだ自信が持てない状態です。</p>

<p>I have not assigned a license to this program.
Therefore, refrain from using it, including uploading, distributing, and other actions.</p>
<p>ライセンスは指定しておりません。
どこかにアップロードしたり、配布することなどはご遠慮いただけますと幸いです。</p>

<p>I am currently studying English and aiming to enhance both my English skills and my programming skills.
Could you please let me know if there are any errors in my English or code?</p>
<p>また、現在、英語とプログラミングの両方を勉強しています。
おかしなところがありましたら、ご指摘いただけますと幸いです。</p>

# goalManagement
> 目標管理アプリ

<p>目標を管理したい自分のためのアプリ。</p>

## 基本機能
<ul>
<li>目標を設定・編集・削除することができる</li>
<li>毎日のtodoを表示し、管理することができる</li>
<li>過去の達成率を確認することができる</li>
<li>ご褒美の設定ができる</li>
</ul>

## 大まかなイメージ

| 設定　新規登録・目標一覧 |  |  |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/50fff464-5931-41af-a892-cc713eb38f6c" width="200"> |  |  |

| 設定　年間目標 | 設定　月間目標 | 設定　週間目標 |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/76f26ebc-914f-4dd0-b2ee-54be04e24e06" width="200"> | <img src="https://github.com/user-attachments/assets/ad860986-f72f-4412-b8da-255123475b15" width="200"> | <img src="https://github.com/user-attachments/assets/f9f63469-3ca6-485e-bad8-1fe2bd6c3eb5" width="200"> |

| 設定　todo |  |  |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/5cd3824b-4478-433f-ab5d-ce8d40ba7c80" width="200"> |  |  |

| 設定　ご褒美１ | 設定　ご褒美２ |  |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/2887d706-b26f-4a36-aa49-8ccc3d4dc5c1" width="200"> | <img src="https://github.com/user-attachments/assets/836fc552-19d4-4408-8e66-10f1753f4c2d" width="200"> |  |

| 設定　編集１ | 設定　編集２ | 設定　モーダル |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/5e485c72-f01c-44a3-ac35-f8e3c637d646" width="200"> | <img src="https://github.com/user-attachments/assets/c1bcf036-b914-4d2a-9fd8-8e13ab0bff87" width="200"> | <img src="https://github.com/user-attachments/assets/fe40f685-1cdf-43a4-a71f-e5245489fe53" width="200"> |

| 設定後home |  |  |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/a9b598d4-3b61-4ddb-b8f7-c02701976f8c" width="200"> |  |  |

| 結果 |  |  |
| ---- | ---- | ---- |
| <img src="https://github.com/user-attachments/assets/48233321-2d05-4026-87e1-b02532d69731" width="200"> |  |  |

## データベース（検討中）
| テーブル | 主キー | 外部キー | フィールド | 備考 |
| ---- | ---- | ---- | ---- | ---- |
| 設定 | key | 目標名id | 目標名、期間目標名（年、月、週）、期間（開始、終了日、期間なし）、期間（年、月、週）、todo（todo名、期間、曜日、オプション）、ステータス | 目標とtodo設定の新規追加、編集、削除 |
| ご褒美設定 | key | 目標名id | ご褒美（内容、期間（年、月、週）、todo達成率）、目標名、期間（年、月、週） | ご褒美の新規追加、編集。 設定の編集、削除の際と、ご褒美のページ表示の際に取得し直す |
| 今週のtodo | key | 目標名id | 目標名、todo名、期間（週）、曜日、オプション、todo成否（日付、成否）、週ごとの達成率 | todo成否の編集。週の達成率が計算できる、日付が変わった時点で履歴・検索結果に当日分をコピー（あるいは週が変わった時点で移動）、週ごとに刷新 |
| 履歴・検索結果 | key | 目標名id | 目標名、todo名、期間（開始、終了日、期間なし）、曜日、オプション、todo成否（日付、成否）、週ごとの達成率 | 表示のみ。データをストックしていく |
| 目標名 | key | 目標名id | 目標名、todo達成率 | 目標名や期間目標名、todo名は全てそれぞれのidで管理し、参照する形にするか検討 |

※主キーはそれぞれ連番

## 関連リンク
<ul>
<li>https://getbootstrap.jp/</li>
</ul>

### 参考
<ul>
<li>https://getbootstrap.jp/docs/5.3/components/collapse/</li>
<li>https://home.ryotafull.com/articles/AKnM43GGZgH</li>
<li>https://zenn.dev/no4_dev/articles/878f4afbff6668d4e28a-2</li>
<li>https://qiita.com/lhankor_mhy/items/9ad1d16fef0b4ecf6e5e</li>
</ul>