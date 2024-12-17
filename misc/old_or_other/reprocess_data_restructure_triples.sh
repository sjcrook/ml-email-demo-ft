flux reprocess \
    --connection-string "mladmin:mlap4ssw0rd@localhost:38010" \
    --read-javascript "cts.uris(null, null, cts.collectionQuery([ '/type/emails', '/type/employee' ]))" \
    --write-javascript-file "./reprocess_data_restructure_triples_write_file.js"