const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
<% if(authentication || hana){ -%>
const services = xsenv.getServices({
<% if(authentication){ -%>
    uaa: { tag: 'xsuaa' }
<% } -%>
<% if(hana){ -%>
<% if(authentication){ -%>
    ,
<% } -%>
    hana: { tag: 'hana' }
<% } -%>
});
<% } -%>

<% if(hana && !attributes){ -%>
// placed before authentication - business user info from the JWT will not be set as HANA session variables (XS_)
const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));
<% } -%>

<% if(authentication){ -%>
const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));
<% } -%>

<% if(hana && attributes){ -%>
// placed after authentication - business user info from the JWT will be set as HANA session variables (XS_)
const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));
<% } -%>

app.use(bodyParser.json());

app.get('/srv', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        res.status(200).send('<%= projectName %>');
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

<% if(authentication){ -%>
app.get('/srv/user', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        res.status(200).json(req.user);
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

<% if(apiGraph || apiDest){ -%>
const core = require('@sap-cloud-sdk/core');
<% } -%>
<% if(apiS4HC || apiGraph || apiDest){ -%>
const { retrieveJwt } = require('@sap-cloud-sdk/core');
<% } -%>
<% if(apiS4HC){ -%>
const { desc } = require('@sap-cloud-sdk/core');
const { salesOrderService } = require('@sap/cloud-sdk-vdm-sales-order-service');
const { salesOrderApi, salesOrderItemApi } = salesOrderService();

function getSalesOrders(req) {
    return salesOrderApi.requestBuilder()
        .getAll()
        .filter(salesOrderApi.schema.TOTAL_NET_AMOUNT.greaterThan(2000))
        .top(3)
        .orderBy(new desc(salesOrderApi.schema.LAST_CHANGE_DATE_TIME))
        .select(
            salesOrderApi.schema.SALES_ORDER,
            salesOrderApi.schema.LAST_CHANGE_DATE_TIME,
            salesOrderApi.schema.INCOTERMS_LOCATION_1,
            salesOrderApi.schema.TOTAL_NET_AMOUNT,
            salesOrderApi.schema.TO_ITEM.select(salesOrderItemApi.schema.MATERIAL, salesOrderItemApi.schema.NET_AMOUNT)
        )
        .execute({
            destinationName: '<%= projectName %>-s4hc-api'
<% if(authentication){ -%>
            ,
            jwt: retrieveJwt(req)
<% } -%>
        });
}

app.get('/srv/salesorders', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        getSalesOrders(req)
        .then(salesOrders => {
            res.status(200).json(salesOrders);
        });
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

<% if(apiGraph){ -%>
app.get('/srv/graph', async function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        try {
            let res1 = await core.executeHttpRequest(
                {
                    destinationName: '<%= projectName %>-graph-api'
<% if(authentication){ -%>
                    ,
                    jwt: retrieveJwt(req)
<% } -%>
                },
                {
                    method: 'GET',
                    url: req.query.path || '<%= apiGraphId %>'
                }
            );
            res.status(200).json(res1.data);
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err.message);
        }
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

<% if(apiDest){ -%>
app.get('/srv/dest', async function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        try {
            let res1 = await core.executeHttpRequest(
                {
                    destinationName: req.query.destination || '<%= projectName %>-nw'
<% if(authentication){ -%>
                    ,
                    jwt: retrieveJwt(req)
<% } -%>
                },
                {
                    method: 'GET',
                    url: req.query.path || ''
                }
            );
            res.status(200).json(res1.data);
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err.message);
        }
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

<% if(hana){ -%>
app.get('/srv/sales', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
<% if(attributes){ -%>
        let sql = `SELECT * FROM "<%= projectName %>.db::sales" WHERE "region" IN (SELECT * FROM JSON_TABLE((('{"values":' || SESSION_CONTEXT('XS_REGION')) || '}'), '$.values[*]' COLUMNS("VALUE" VARCHAR(5000) PATH '$')))`;
<% } else { -%>
        let sql = 'SELECT * FROM "<%= projectName %>.db::sales"';
<% } -%>
        req.db.exec(sql, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

app.get('/srv/session', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
<% } -%>
        req.db.exec('SELECT * FROM M_SESSION_CONTEXT', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

app.get('/srv/db', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
<% } -%>
        req.db.exec('SELECT SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE FROM M_DATABASE', function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

app.get('/srv/connections', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
<% } -%>
        req.db.exec(`SELECT TOP 10 USER_NAME, CLIENT_IP, CLIENT_HOST, START_TIME FROM M_CONNECTIONS WHERE OWN='TRUE' ORDER BY START_TIME DESC`, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});