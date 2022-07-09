## タイムシフト登録

```http
POST https://live2.nicovideo.jp/api/v2/programs/lv337433206/timeshift/reservation

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: application/json
Accept-Language: ja,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate, br
Referer: https://live.nicovideo.jp/

{"meta":{"status":403,"errorCode":"OVER_USE"},"data":{"expiryTime":"2022-07-27T00:00:00+09:00"}}

{"meta":{"status":200},"data":{"expiryTime":"2022-07-27T00:00:00+09:00"}}
```

## タイムシフト削除

```http
DELETE https://live2.nicovideo.jp/api/v2/timeshift/reservations?programIds=lv305570896

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0
Accept: application/json
Accept-Language: ja,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate, br
Referer: https://live.nicovideo.jp/
Origin: https://live.nicovideo.jp

{"meta":{"status":200}}
```
