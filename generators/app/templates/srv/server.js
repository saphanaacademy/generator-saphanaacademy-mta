const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
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

<% if(authentication){ -%>
const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));
<% } -%>

<% if(hana){ -%>
const hdbext = require('@sap/hdbext');
app.use(hdbext.middleware(services.hana));
<% } -%>

app.use(bodyParser.json());

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

<% if(cloudsdk){ -%>
const {
    desc
} = require("@sap-cloud-sdk/core");

const {
    SalesOrder,
    SalesOrderItem
} = require("@sap/cloud-sdk-vdm-sales-order-service");

function getSalesOrders() {
    return SalesOrder.requestBuilder()
        .getAll()
        .filter(SalesOrder.TOTAL_NET_AMOUNT.greaterThan(2000))
        .top(3)
        .orderBy(new desc(SalesOrder.LAST_CHANGE_DATE_TIME))
        .select(
            SalesOrder.SALES_ORDER,
            SalesOrder.LAST_CHANGE_DATE_TIME,
            SalesOrder.INCOTERMS_LOCATION_1,
            SalesOrder.TOTAL_NET_AMOUNT,
            SalesOrder.TO_ITEM.select(SalesOrderItem.MATERIAL, SalesOrderItem.NET_AMOUNT)
        )
        .withCustomHeaders({
            'APIKey': '<%= APIKey %>'
        })
        .execute({
            url: 'https://sandbox.api.sap.com/s4hanacloud'
            //destinationName: ''
        });
}

app.get("/srv/salesorders", function (req, res) {
    <% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
    <% } -%>
        getSalesOrders()
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

<% if(hana){ -%>
app.get('/srv/sales', function (req, res) {
    <% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
    <% } -%>
        req.db.exec('SELECT * FROM "<%= projectName %>.db::sales"', function (err, results) {
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
<% } -%>

const port = process.env.PORT || 5001;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});
