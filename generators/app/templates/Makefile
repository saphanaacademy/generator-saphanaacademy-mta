<% if(hana){ -%>
build-db:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%> -p db -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%> -f db/Dockerfile .
<% } -%>
<% } -%>
build-srv:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -p srv -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -f srv/Dockerfile .
<% } -%>
<% if(xsjs){ -%>
build-srvxs:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvxs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvxs:latest<% } -%> -p srvxs -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvxs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvxs:latest<% } -%> -f srvxs/Dockerfile .
<% } -%>
<% } -%>
<% if(ui){ -%>
build-app:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -p app -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -f app/Dockerfile .
<% } -%>
<% } -%>

docker-push:<% if(hana){ -%> build-db<% } -%> build-srv<% if(xsjs){ -%> build-srvxs<% } -%><% if(ui){ -%> build-app<% } -%>

<% if(hana){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%>

<% } -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%>

<% if(xsjs){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvxs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvxs:latest<% } -%>

<% } -%>
<% if(ui){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%>

<% } -%>

helm-deploy:
<% if(hana){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-db helm/<%= projectName %>-db --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv helm/<%= projectName %>-srv --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% if(xsjs){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srvxs helm/<%= projectName %>-srvxs --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(ui){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-app helm/<%= projectName %>-app --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>

helm-undeploy:
<% if(ui){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-app<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(xsjs){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srvxs<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srv<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% if(hana){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-db<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>