<% if(hana){ -%>
build-db:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-db:latest -f <%= destinationPath %>/k8s/db/Dockerfile <%= destinationPath %>
<% } -%>
<% if(xsjs){ -%>
build-srvxs:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-srvxs:latest -f <%= destinationPath %>/k8s/srvxs/Dockerfile <%= destinationPath %>
<% } -%>
build-srv:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>-srv:latest -f <%= destinationPath %>/k8s/srv/Dockerfile <%= destinationPath %>
<% if(ui){ -%>
build-app:
	<%= dockerCmd %> build -t <%= dockerID %>/<%= projectName %>:latest -f <%= destinationPath %>/k8s/app/Dockerfile <%= destinationPath %>
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
	<%= dockerCmd %> push <%= dockerID %>/<%= projectName %>:latest
<% } -%>

helm-deploy:
<% if(hana){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-db <%= destinationPath %>/k8s/db/helm/<%= projectName %>-db
<% } -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv <%= destinationPath %>/k8s/srv/helm/<%= projectName %>-srv
<% if(xsjs){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srvxs <%= destinationPath %>/k8s/srvxs/helm/<%= projectName %>-srvxs
<% } -%>
<% if(ui){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %> <%= destinationPath %>/k8s/app/helm/<%= projectName %>
<% } -%>

helm-undeploy:
<% if(ui){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>
<% } -%>
<% if(xsjs){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srvxs
<% } -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srv
<% if(hana){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-db
<% } -%>