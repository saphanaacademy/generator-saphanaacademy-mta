const express = require('express');
const app = express();
<% if(app2appType === "access"){ -%>
const axios = require('axios');
<% } -%>
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
<% if(authentication || hana){ -%>
const services = xsenv.getServices({
<% if(authentication){ -%>
    uaa: { label: 'xsuaa' }
<% } -%>
<% if(hana){ -%>
<% if(authentication){ -%>
    ,
<% } -%>
    hana: { label: 'hana' }
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
const httpClient = require('@sap-cloud-sdk/http-client');
<% } -%>
<% if(apiS4HC || apiGraph || apiDest){ -%>
const { retrieveJwt } = require('@sap-cloud-sdk/connectivity');
<% } -%>
<% if(apiS4HC){ -%>
const { desc } = require('@sap-cloud-sdk/odata-v2');
const { salesOrderService } = require('@sap/cloud-sdk-vdm-sales-order-service');
const { salesOrderApi, salesOrderItemApi } = salesOrderService();

function getSalesOrders(req) {
    return salesOrderApi.requestBuilder()
        .getAll()
        .filter(salesOrderApi.schema.TOTAL_NET_AMOUNT.greaterThan(2000))
        .top(3)
        .orderBy(desc(salesOrderApi.schema.LAST_CHANGE_DATE_TIME))
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
            let res1 = await httpClient.executeHttpRequest(
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
            let location = req.query.location || '';
            if (location !== '') {
                let res2 = await httpClient.executeHttpRequest(
                    {
                        destinationName: '<%= projectName %>-graph-api'
<% if(authentication){ -%>
                        ,
                        jwt: retrieveJwt(req)
<% } -%>
                    },
                    {
                        method: 'PATCH',
                        url: req.query.path || '<%= apiGraphId %>',
                        headers: {
                            "If-Match": res1.headers.etag
                        },
                        data: {
                            "IncotermsTransferLocation": location,
                            "IncotermsLocation1": location
                        }
                    },
                    {
                        fetchCsrfToken: false
                    }
                );
                res.status(200).json(res2.data);
            } else {
                res.status(200).json(res1.data);
            };
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
            let res1 = await httpClient.executeHttpRequest(
                {
                    destinationName: req.query.destination || ''
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

<% if(app2appType === "access" && app2appMethod.includes("user")){ -%>
app.get('/srv/<%= app2appName %>user', async function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        try {
            options = {
                method: 'GET',
<% if(BTPRuntime === "Kyma"){ -%>
                url: 'https://<%= app2appName %>-srv.<%= clusterDomain %>/srv',
<% }else{ -%>
                url: 'https://<%= cforg %>-<%= cfspace %>-<%= app2appName %>-srv.cfapps.<%= cfregion %>.hana.ondemand.com/srv',
<% } -%>
                headers: {
                    Authorization: 'Bearer ' + req.authInfo.getAppToken()
                }
            };
            let results2 = await axios(options);
            res.send(results2.data);
        } catch (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.message);
        }
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});
<% } -%>

<% if(app2appType === "access" && app2appMethod.includes("machine")){ -%>
app.get('/srv/<%= app2appName %>tech', async function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
<% } -%>
        try {
            let options1 = {
                method: 'POST',
                url: services.uaa.url + '/oauth/token?grant_type=client_credentials',
                headers: {
                    Authorization: 'Basic ' + Buffer.from(services.uaa.clientid + ':' + services.uaa.clientsecret).toString('base64')
                }
            };
            let res1 = await axios(options1);
            let options2 = {
                method: 'GET',
<% if(BTPRuntime === "Kyma"){ -%>
                    url: 'https://<%= app2appName %>-srv.<%= clusterDomain %>/srv',
<% }else{ -%>
                    url: 'https://<%= cforg %>-<%= cfspace %>-<%= app2appName %>-srv.cfapps.<%= cfregion %>.hana.ondemand.com/srv',
<% } -%>
                    headers: {
                    Authorization: 'Bearer ' + res1.data.access_token
                }
            };
            let res2 = await axios(options2);
            res.send(res2.data);
        } catch (err) {
            res.type('text/plain').status(500).send('ERROR: ' + err.message);
        }
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