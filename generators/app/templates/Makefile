dockerID=<%= dockerID %>

<% if(hana){ -%>
build-db:
	docker build -t $(dockerID)/<%= projectName %>-db:latest -f ./srv/Dockerfile ./db
<% } -%>

<% if(xsjs){ -%>
build-srvxs:
	docker build -t $(dockerID)/<%= projectName %>-srvxs:latest -f ./srvxs/Dockerfile ./srvxs
<% } -%>

build-srv:
	docker build -t $(dockerID)/<%= projectName %>-srv:latest -f ./srv/Dockerfile ./srv

build-app:
	docker build -t $(dockerID)/<%= projectName %>:latest -f ./app/Dockerfile ./app

docker-push: <% if(hana){ -%>build-db<% } -%> <% if(xsjs){ -%>build-srvxs<% } -%> build-srv build-app
<% if(hana){ -%>
	docker push $(dockerID)/<%= projectName %>-db:latest
<% } -%>
<% if(xsjs){ -%>
	docker push $(dockerID)/<%= projectName %>-srvxs:latest
<% } -%>
	docker push $(dockerID)/<%= projectName %>-srv:latest
	docker push $(dockerID)/<%= projectName %>:latest