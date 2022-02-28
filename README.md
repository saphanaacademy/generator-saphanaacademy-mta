# generator-saphanaacademy-mta [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Yeoman Generator to jump-start Multitarget Applications

## Installation

First, install [Yeoman](http://yeoman.io) and generator-saphanaacademy-mta using [npm](https://www.npmjs.com/)

```bash
npm install -g yo
npm install -g generator-saphanaacademy-mta
```

## SAP BTP, Cloud Foundry runtime
We assume you have pre-installed [node.js](https://nodejs.org/) and the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) with the [multiapps](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin) plugin. In order to build the project ensure the [Cloud MTA Build Tool (MBT)](https://sap.github.io/cloud-mta-build-tool/) is installed. This is already the case for SAP Business Application Studio.

If using SAP HANA Cloud ensure you have an instance in the space where you'll be deploying the app.

Ensure that you are logged in to the Cloud Foundry CLI and are targeting the org and space into which you want to deploy the project.

To generate your new project:
```bash
yo saphanaacademy-mta
```
NB: If you prefer a rich user experience when generating your projects consider the [Application Wizard](https://marketplace.visualstudio.com/items?itemName=SAPOS.yeoman-ui).

## SAP BTP, Kyma runtime
We assume you have pre-installed [node.js](https://nodejs.org/), the ability to build and push containers either via Docker [Desktop](https://www.docker.com/products/docker-desktop) or an alternative such as [podman](https://podman.io) and have a [Docker Hub](https://hub.docker.com/) ID. The Kubernetes command-line tool [kubectl](https://kubernetes.io/docs/tasks/tools/) is required with the [kubelogin](https://github.com/int128/kubelogin) extension. In order to build the project ensure that GNU [Make](https://www.gnu.org/software/make) is installed. In order to deploy the project ensure that [Helm](https://helm.sh/docs/intro/install) is installed.

If using SAP HANA Cloud ensure you have created an instance with an HDI Container and service key.

Ensure that you are logged in to Docker Hub, have set the KUBECONFIG environment variable and have optionally created a namespace into which you woud like to deploy the project. For example:
```bash
docker login
export KUBECONFIG=~/Downloads/kubeconfig.yaml
kubectl create ns dev
```

To generate your new project:
```bash
yo saphanaacademy-mta
```
NB: If you prefer a rich user experience when generating your projects consider the [Application Wizard](https://marketplace.visualstudio.com/items?itemName=SAPOS.yeoman-ui).

To build and push your project containers to Docker Hub:
```bash
cd <projectName>/k8s
make docker-push
```
If you prefer, you can issue the build & push commands manually (see the generated <projectName>/k8s/Makefile) or create a CI/CD pipeline.

To deploy your new project to SAP BTP, Kyma runtime:
```bash
cd <projectName>/k8s
make helm-deploy
```
If you prefer, you can issue the helm commands manually (see the generated <projectName>/k8s/Makefile) or create a CI/CD pipeline.

To undeploy your new project from SAP BTP, Kyma runtime:
```bash
cd <projectName>/k8s
make helm-undeploy
```

## Important
Please pay special attention to messages produced by the generator - especially those regarding setting of API keys & credentials!

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.

[npm-image]: https://badge.fury.io/js/generator-saphanaacademy-mta.svg
[npm-url]: https://npmjs.org/package/generator-saphanaacademy-mta
[travis-image]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-mta.svg?branch=master
[travis-url]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-mta
[daviddm-image]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-mta.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-mta
