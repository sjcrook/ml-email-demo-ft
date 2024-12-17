function trade_transform(context, params, content) {
    const c = content.toObject();
    c.TradeDateTime = xdmp.parseDateTime("[Y001]-[M01]-[D01] [h01]:[m01] [PN] [ZN,*-3]", c.TradeDate + ' ' + c.TradeTime);
    return {
        "trade": c
    };
}

exports.transform = trade_transform;