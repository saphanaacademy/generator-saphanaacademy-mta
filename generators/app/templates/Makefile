<% if(hana){ -%>
build-db:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-db:latest -f db .
<% } -%>
<% if(xsjs){ -%>
build-srvxs:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-srvxs:latest -f srvxs .
<% } -%>
build-srv:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-srv:latest -f srv .
<% if(ui){ -%>
build-app:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-app:latest -f app .
<% } -%>

docker-push: <% if(hana){ -%>build-db<% } -%> <% if(xsjs){ -%>build-srvxs<% } -%> build-srv <% if(ui){ -%>build-app<% } -%>

<% if(hana){ -%>
	<%= dockerCmd %> push <%= dockerID %>/<%= projectName %>-db:latest
<% } -%>
<% if(xsjs){ -%>
	<%= dockerCmd %> push <%= dockerID %>/<%= projectName %>-srvxs:latest
<% } -%>
	<%= dockerCmd %> push <%= dockerID %>/<%= projectName %>-srv:latest
<% if(ui){ -%>
	<%= dockerCmd %> push <%= dockerID %>/<%= projectName %>-app:latest
<% } -%>

helm-deploy:
<% if(hana){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-db helm/<%= projectName %>-db
<% } -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv helm/<%= projectName %>-srv
<% if(xsjs){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srvxs helm/<%= projectName %>-srvxs
<% } -%>
<% if(ui){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-app helm/<%= projectName %>-app
<% } -%>

helm-undeploy:
<% if(ui){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-app
<% } -%>
<% if(xsjs){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srvxs
<% } -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srv
<% if(hana){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-db
<% } -%>