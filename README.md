# generator-saphanaacademy-mta [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Yeoman Generator to jump-start Multitarget Applications

## Installation

First, install [Yeoman](http://yeoman.io) and generator-saphanaacademy-mta using [npm](https://www.npmjs.com/)

```bash
npm install -g yo
npm install -g generator-saphanaacademy-mta
```
We assume you have pre-installed [node.js](https://nodejs.org/) and the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) with the [multiapps](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin) plugin. In order to build the project ensure the [Cloud MTA Build Tool (MBT)](https://sap.github.io/cloud-mta-build-tool/) is installed. This is already the case for SAP Business Application Studio.

If using SAP HANA Cloud ensure you have an instance in the space where you'll be deploying the app.

Also ensure that you are logged in to the Cloud Foundry CLI and are targeting the org and space into which you want to deploy the project.

To generate your new project:

```bash
yo saphanaacademy-mta
```

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.

[npm-image]: https://badge.fury.io/js/generator-saphanaacademy-mta.svg
[npm-url]: https://npmjs.org/package/generator-saphanaacademy-mta
[travis-image]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-mta.svg?branch=master
[travis-url]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-mta
[daviddm-image]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-mta.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-mta
