function email_transform(context, params, content) {
    const c = content.toObject();
    c.envelope.headers['date-metas'].dateTime = c.envelope.headers['date-metas'].date;
    c.envelope.headers['date-metas'].date = c.envelope.headers['date-metas'].dateTime.substring(0, 10);
    delete c.envelope.triples;
    return {
        "email": {
            ...c.envelope
        }
    };
}
//export default email_transform;
exports.transform = email_transform;