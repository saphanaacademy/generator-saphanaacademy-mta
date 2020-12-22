<% if(authorization){ -%>
if ($.session.hasAppPrivilege("User")) {
<% } -%>
    var conn = $.hdb.getConnection();
<% if(attributes){ -%>
    var sql = `SELECT * FROM "<%= projectName %>.db::sales" WHERE "region" IN (SELECT * FROM JSON_TABLE((('{"values":' || SESSION_CONTEXT('XS_REGION')) || '}'), '$.values[*]' COLUMNS("VALUE" VARCHAR(5000) PATH '$')))`;
<% } else { -%>
    var sql = 'SELECT * FROM "<%= projectName %>.db::sales"';
<% } -%>
    var results = conn.executeQuery(sql);
    conn.close();
    $.response.contentType = "text/json";
    $.response.setBody(results);
    $.response.status = $.net.http.OK;
<% if(authorization){ -%>
} else {
    $.response.setBody("Forbidden");
    $.response.status = $.net.http.FORBIDDEN;
}
<% } -%>
