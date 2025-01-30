function transcript_transform(context, params, content) {
    const c = content.toObject();
    c.metadata.dateTime = c.metadata.date;
    c.metadata.date = c.metadata.dateTime.substring(0, 10);
    c.transcriptText = c.transcript;
    delete c.transcript;
    context.uri = '/transcripts/' + xdmp.hash64(c.metadata.dateTime + c.metadata.caller1.name + c.metadata.caller2.name) + '.json';
    return {
        "transcript": c
    };
}

exports.transform = transcript_transform;