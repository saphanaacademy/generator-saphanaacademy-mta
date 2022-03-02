"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the project name.";
        },
        default: "app",
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: true
      },
      {
        type: "list",
        name: "BTPRuntime",
        message: "Which runtime will you be deploying the project to?",
        choices: ["SAP BTP, Cloud Foundry runtime", "SAP BTP, Kyma runtime"],
        default: ["SAP BTP, Cloud Foundry runtime"]
      },
      {
        when: response => response.BTPRuntime.includes("Kyma"),
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: "c-0000000.kyma.ondemand.com"
      },
      {
        when: response => response.BTPRuntime.includes("Kyma"),
        type: "input",
        name: "namespace",
        message: "What SAP BTP, Kyma runtime namespace will you be deploying to?",
        validate: (s) => {
          if (/^[a-z0-9-]*$/g.test(s) && s.length > 0 && s.substring(0, 1) !== '-' && s.substring(s.length - 1) !== '-') {
            return true;
          }
          return "Your SAP BTP, Kyma runtime namespace can only contain lowercase alphanumeric characters or -.";
        },
        default: "default"
      },
      {
        when: response => response.BTPRuntime.includes("Kyma"),
        type: "input",
        name: "dockerID",
        message: "What is your Docker ID?",
        validate: (s) => {
          if (/^[a-z0-9]*$/g.test(s) && s.length >= 4 && s.length <= 30) {
            return true;
          }
          return "Your Docker ID must be between 4 and 30 characters long and can only contain numbers and lowercase letters.";
        },
        default: ""
      },
      {
        type: "confirm",
        name: "apiS4HC",
        message: "Would you like to access the SAP S/4HANA Cloud Sales Orders API?",
        default: false
      },
      {
        type: "confirm",
        name: "apiGraph",
        message: "Would you like to use SAP Graph?",
        default: false
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphURL",
        message: "What is your SAP Graph URL?",
        default: "https://<region>.graph.sap/api"
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphId",
        message: "What is your SAP Graph Business Data Graph Identifier?",
        default: "v1"
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphTokenURL",
        message: "What is your SAP Graph Token URL?",
        default: "https://<subdomain>.authentication.<region>.hana.ondemand.com"
      },
      {
        type: "confirm",
        name: "apiDest",
        message: "Would you like to test the Destination service with SAP Cloud SDK?",
        default: false
      },
      {
        when: response => (response.apiGraph === true || response.apiDest === true) && response.BTPRuntime.includes("Kyma") === false,
        type: "confirm",
        name: "connectivity",
        message: "Will you be accessing on-premise systems via the Cloud Connector?",
        default: false
      },
      {
        type: "confirm",
        name: "hana",
        message: "Would you like to use SAP HANA Cloud?",
        default: false
      },
      {
        when: response => response.hana === true,
        type: "confirm",
        name: "xsjs",
        message: "Would you like to use the XSJS Compatibility Layer?",
        default: false
      },
      {
        type: "confirm",
        name: "authentication",
        message: "Would you like authentication?",
        default: true
      },
      {
        when: response => response.authentication === true,
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: true
      },
      {
        when: response => response.hana === true && response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "attributes",
        message: "Would you like role attributes?",
        default: false
      },
      {
        when: response => response.authentication === true && response.apiGraph === true,
        type: "confirm",
        name: "apiGraphSameSubaccount",
        message: "Will you be deploying to the subaccount of the SAP Graph service instance?",
        default: true
      },
      {
        type: "confirm",
        name: "ui",
        message: "Would you like a UI?",
        default: true
      },
      {
        type: "confirm",
        name: "cicd",
        message: "Would you like to enable Continuous Integration and Delivery (CI/CD)?",
        default: false
      },
      {
        type: "confirm",
        name: "buildDeploy",
        message: "Would you like to build and deploy the project?",
        default: false
      },
    ]).then((answers) => {
      if (answers.newDir) {
        this.destinationRoot(`${answers.projectName}`);
      }
      if (answers.BTPRuntime.includes("Kyma") === false) {
        answers.dockerID = "";
        answers.namespace = "";
        answers.clusterDomain = "";
      }
      if (answers.apiGraph === false) {
        answers.apiGraphURL = "";
        answers.apiGraphId = "";
        answers.apiGraphTokenURL = "";
        answers.apiGraphSameSubaccount = false;
      }
      if (answers.hana === false) {
        answers.xsjs = false;
      }
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.apiGraphSameSubaccount = false;
      }
      if (answers.hana === false || answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (!((answers.apiGraph === true || answers.apiDest === true) && answers.BTPRuntime.includes("Kyma") === false)) {
        answers.connectivity = false;
      }
      answers.destinationPath = this.destinationPath();
      if (answers.BTPRuntime.includes("Kyma")) {
        let opt = {};
        let resPodman = this.spawnCommandSync("podman", ["-v"], opt);
        if ((resPodman.status === 0)) {
          answers.dockerCmd = "podman";
        } else {
          answers.dockerCmd = "docker";
        }
      } else {
        answers.dockerCmd = "";
      }
      this.config.set(answers);
    });
  }

  writing() {
    var answers = this.config;

    if (answers.get('cicd') === true) {
      answers.set('cforg', 'org');
      answers.set('cfspace', 'space');
      answers.set('cfapi', 'https://api.cf.region.hana.ondemand.com');
      // try to identify the targeted api, org & space
      const resTarget = this.spawnCommandSync('cf', ['target'], { stdio: 'pipe' });
      const stdoutTarget = resTarget.stdout.toString('utf8');
      var field_strings = stdoutTarget.split(/[\r\n]*---[\r\n]*/);
      for (var i = 0; i < field_strings.length; i++) {
        if (field_strings[i] == '') {
          continue;
        }
        var props_strings = field_strings[i].split('\n');
        for (var j = 0; j < props_strings.length; j++) {
          var keyvalue = props_strings[j].split(':');
          if (keyvalue[0].toUpperCase() === 'API ENDPOINT') {
            answers.set('cfapi', keyvalue[1].trim() + ':' + keyvalue[2].trim());
          } else if (keyvalue[0] === 'org') {
            answers.set('cforg', keyvalue[1].trim());
          } else if (keyvalue[0] === 'space') {
            answers.set('cfspace', keyvalue[1].trim());
          }
        }
      }
    }

    // scaffold the project
    this.sourceRoot(path.join(__dirname, "templates"));
    glob
      .sync("**", {
        cwd: this.sourceRoot(),
        nodir: true,
        dot: true
      })
      .forEach((file) => {
        if (!(file.includes('.DS_Store'))) {
          if (!((file === 'Jenkinsfile' || file.includes('.pipeline') || file.includes('-cicd.')) && answers.get('cicd') === false)) {
            if (!((file.substring(0, 5) === 'helm/' || file.includes('/Dockerfile') || file === 'dotdockerignore' || file === 'Makefile') && answers.get('BTPRuntime').includes('Kyma') === false)) {
              if (!((file.includes('-cicd.') || file.substring(0, 5) === 'helm/') && answers.get('BTPRuntime').includes('Kyma') === false)) {
                if (!((file.substring(0, 4) === 'app/' || file.includes('helm/_PROJECT_NAME_-app')) && answers.get('ui') === false)) {
                  if (!((file.substring(0, 3) === 'db/' || file.includes('helm/_PROJECT_NAME_-db')) && answers.get('hana') === false)) {
                    if (!((file.substring(0, 6) === 'srvxs/' || file.includes('helm/_PROJECT_NAME_-srvxs')) && answers.get('xsjs') === false)) {
                      if (!(file.includes('secret-hdi.yaml') && answers.get('hana') === false)) {
                        if (!((file.includes('service-uaa.yaml') || file.includes('binding-uaa.yaml')) && answers.get('authentication') === false && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                          if (!((file.includes('service-dest.yaml') || file.includes('binding-dest.yaml')) && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                            if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime').includes('Kyma'))) {
                              if (!(file === 'xs-security.json' && (answers.get('authentication') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false))) {
                                const sOrigin = this.templatePath(file);
                                let fileDest = file;
                                fileDest = fileDest.replace('_PROJECT_NAME_', answers.get('projectName'));
                                fileDest = fileDest.replace('dotgitignore', '.gitignore');
                                fileDest = fileDest.replace('dotdockerignore', '.dockerignore');
                                const sTarget = this.destinationPath(fileDest);
                                this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
  }

  install() {
    // build and deploy if requested
    var answers = this.config;
    var opt = { "cwd": answers.get("destinationPath") };
    if (answers.get("BTPRuntime").includes("Kyma")) {
      // Kyma runtime
      if (answers.get("cicd") === true) {
        // generate service account & kubeconfig
        let resApply = this.spawnCommandSync("kubectl", ["apply", "-f", "sa-cicd.yaml", "-n", answers.get("namespace")], opt);
        if (resApply.status === 0) {
          opt.stdio = [process.stdout];
          let resSecret = this.spawnCommandSync("kubectl", ["get", "sa", answers.get("projectName") + "-cicd", "-n", answers.get("namespace"), "-o", "jsonpath='{.secrets[0].name}'"], opt);
          if (resSecret.status === 0) {
            let resSecretDetail = this.spawnCommandSync("kubectl", ["get", "secret/" + resSecret.stdout.toString().replace(/'/g, ''), "-n", answers.get("namespace"), "-o", "jsonpath='{.data}'"], opt);
            let secretDetail = resSecretDetail.stdout.toString();
            secretDetail = JSON.parse(secretDetail.substring(1).substring(0, secretDetail.length - 2));
            //console.log("ca.crt:", secretDetail["ca.crt"]);
            //console.log("token:", Buffer.from(secretDetail.token, "base64").toString("utf-8"));
            let fileText = {
              "apiVersion": "v1",
              "kind": "Config",
              "clusters": [
                {
                  "name": "cicd-cluster",
                  "cluster": {
                    "certificate-authority-data": secretDetail["ca.crt"],
                    "server": "https://api." + answers.get("clusterDomain")
                  }
                }
              ],
              "users": [
                {
                  "name": "cicd-user",
                  "user": {
                    "token": Buffer.from(secretDetail.token, "base64").toString("utf-8")
                  }
                }
              ],
              "contexts": [
                {
                  "name": "cicd-context",
                  "context": {
                    "cluster": "cicd-cluster",
                    "namespace": answers.get("namespace"),
                    "user": "cicd-user"
                  }
                }
              ],
              "current-context": "cicd-context"
            };
            const yaml = require('js-yaml');
            const fs2 = require('fs');
            let fileDest = this.destinationRoot() + "/sa-kubeconfig-cicd.yaml";
            fs2.writeFile(fileDest, yaml.dump(fileText), 'utf-8', function (err) {
              if (err) {
                this.log(err.message);
                return;
              }
            });
          }
        }
      }
      if (answers.get("buildDeploy")) {
        let resPush = this.spawnCommandSync("make", ["docker-push"], opt);
        if (resPush.status === 0) {
          // HANA needs credentials setting in secrets YAML files prior to deploy
          if (answers.get("hana") === false) {
            this.spawnCommandSync("make", ["helm-deploy"], opt);
          }
        }
      } else {
        this.log("");
        this.log("You can build and deploy your project as follows or use a CI/CD pipeline:");
        this.log(" cd " + answers.get("projectName"));
        this.log(" make docker-push");
        this.log(" make helm-deploy");
      }
    } else {
      // Cloud Foundry runtime
      var mta = "mta_archives/" + answers.get("projectName") + "_0.0.1.mtar";
      if (answers.get("buildDeploy")) {
        let resBuild = this.spawnCommandSync("mbt", ["build"], opt);
        if (resBuild.status === 0) {
          this.spawnCommandSync("cf", ["deploy", mta], opt);
        }
      } else {
        this.log("");
        this.log("You can build and deploy your project as follows or use a CI/CD pipeline:");
        this.log(" cd " + answers.get("projectName"));
        this.log(" mbt build");
        this.log(" cf deploy " + mta);
      }
    }
  }

  end() {
    var answers = this.config;
    this.log("");
    if (answers.get("authentication") && answers.get("apiGraph") && answers.get("apiGraphSameSubaccount") === false) {
      this.log("Important: Trust needs to be configured when not deploying to the subaccount of the SAP Graph service instance!");
    }
    if (answers.get("BTPRuntime").includes("Kyma") && (answers.get("apiS4HC") || answers.get("apiGraph"))) {
      this.log("");
      this.log("Before deploying, consider setting values for API keys & credentials in helm/" + answers.get("projectName") + "-srv/values.yaml or set directly using the destination service REST API immediately after deployment.");
    }
    if (answers.get("BTPRuntime").includes("Kyma") && answers.get("hana")) {
      this.log("");
      this.log("Before deploying, set the SAP HANA Cloud HDI Container credentials in helm/" + answers.get("projectName") + "-db/templates/secret-db.yaml and helm/" + answers.get("projectName") + "-srv/templates/secret-hdi.yaml.");
      this.log("");
    }
  }
}