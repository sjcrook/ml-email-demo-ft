mlusn=$1
mlpwd=$2
port=$3
./gradlew addDictionary
flux import-aggregate-json-files \
    --json-lines \
    --path ./data/emails.json \
    --connection-string "$mlusn:$mlpwd@localhost:$port" \
    --collections /type/emails \
    --permissions  rest-reader,read,rest-writer,update \
    --uri-template "/emails/{/envelope/headers/id}.json" \
    --transform "email_transform"
flux import-aggregate-json-files \
    --json-lines \
    --path ./data/transcripts.json \
    --connection-string "$mlusn:$mlpwd@localhost:$port" \
    --collections /type/transcripts \
    --permissions  rest-reader,read,rest-reader,update \
    --transform "transcript_transform"
flux import-aggregate-json-files \
    --json-lines \
    --path ./data/trades.json \
    --connection-string "$mlusn:$mlpwd@localhost:$port" \
    --collections /type/trades \
    --permissions  rest-reader,read,rest-reader,update \
    --uri-template "/trades/{/TradeID}.json" \
    --transform "trade_transform"