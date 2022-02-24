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

## SAP BTP, Kyma runtime
We assume you have pre-installed [node.js](https://nodejs.org/), Docker [Desktop](https://www.docker.com/products/docker-desktop) and have a [Docker Hub](https://hub.docker.com/) ID. The Kubernetes command-line tool [kubectl](https://kubernetes.io/docs/tasks/tools/) is required with the [kubelogin](https://github.com/int128/kubelogin) extension. In order to build the project ensure that GNU [Make](https://www.gnu.org/software/make) is installed. In order to deploy the project ensure that [Helm](https://helm.sh/docs/intro/install) is installed.

If using SAP HANA Cloud ensure you have created an instance, HDI Container and service key.

Ensure that you are logged in with kubectl and have (optionally created and) set a default namespace into which you want to deploy the project. For example:
```bash
kubectl create ns dev
kubectl config set-context --current --namespace=dev
```

To generate your new project:
```bash
yo saphanaacademy-mta
```
NB: If you prefer a rich user experience when generating your projects consider the [Application Wizard](https://marketplace.visualstudio.com/items?itemName=SAPOS.yeoman-ui).

To build and push your project containers to Docker Hub:
```bash
cd <projectName>
make docker-push
```
If you prefer, you can issue the docker build & push commands individually - see the generated <projectName>/Makefile.

To deploy your new project:
```bash
cd <projectName>
helm install <projectName> helm/<projectName>
```

## Important
Please pay special attention to messages produced by the generator - especially any regarding setting of API keys & credentials in helm/<projectName>/values.yaml, helm/<projectName>/templates/secret-db.yaml or helm/<projectName>/templates/secret-hdi.yaml!

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
