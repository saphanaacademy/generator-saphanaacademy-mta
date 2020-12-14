<% if(authorization){ -%>
if ($.session.hasAppPrivilege('User')) {
<% } -%>
    var conn = $.hdb.getConnection();
    var query = 'SELECT * FROM "<%= projectName %>.db::sales"';
    var results = conn.executeQuery(query);
    conn.close();
    $.response.contentType = "text/json";
    $.response.setBody(results);
    $.response.status = $.net.http.OK;
<% if(authorization){ -%>
} else {
    $.response.setBody('Forbidden');
    $.response.status = $.net.http.FORBIDDEN;
}
<% } -%>
