flux reprocess \
    --connection-string "mladmin:mlap4ssw0rd@localhost:38010" \
    --read-javascript "cts.uris()" \
    --write-javascript "declareUpdate(); var URI; xdmp.documentAddCollections(URI, [ '/type/' + URI.split('/')[1] ]);"