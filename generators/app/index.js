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
        name: "dockerID",
        message: "What is your Docker ID?",
        validate: (s) => {
          if (/^[a-z0-9]*$/g.test(s) && s.length >= 4 && s.length <= 30 ) {
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
        when: response => response.authentication === true && response.BTPRuntime.includes("Kyma"),
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: "c-0000000.kyma.ondemand.com"
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
        answers.clusterDomain = "";
        answers.apiGraphSameSubaccount = false;
      }
      if (answers.hana === false || answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (!((answers.apiGraph === true || answers.apiDest === true) && answers.BTPRuntime.includes("Kyma") === false)) {
        answers.connectivity = false;
      }
      answers.destinationPath = this.destinationPath();
      this.config.set(answers);
    });
  }

  writing() {
    // scaffold the project
    var answers = this.config;
    this.sourceRoot(path.join(__dirname, "templates"));
    glob
      .sync("**", {
        cwd: this.sourceRoot(),
        nodir: true,
        dot: true
      })
      .forEach((file) => {
        if (!(file.includes('.DS_Store'))) {
          if (!(file.substring(0, 3) === 'db/' && answers.get('hana') === false)) {
            if (!(file.substring(0, 6) === 'srvxs/' && answers.get('xsjs') === false)) {
              if (!((file.substring(0, 5) === 'helm/' || file.includes('Dockerfile') || file === 'Makefile') && answers.get('BTPRuntime').includes('Kyma') === false)) {
                if (!((file.includes('secret-db.yaml') || file.includes('secret-hdi.yaml') || file.includes('job-db.yaml')) && answers.get('hana') === false)) {
                  if (!((file.includes('service-uaa.yaml') || file.includes('binding-uaa.yaml')) && answers.get('authentication') === false && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                    if (!((file.includes('service-dest.yaml') || file.includes('binding-dest.yaml')) && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                      if (!(file.includes('-srvxs.yaml') && answers.get('xsjs') === false)) {
                        if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime').includes('Kyma'))) {
                          if (!(file === 'xs-security.json' && (answers.get('authentication') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false))) {
                            const sOrigin = this.templatePath(file);
                            let fileDest = file;
                            fileDest = fileDest.replace('_PROJECT_NAME_', answers.get('projectName'));
                            if (fileDest === 'dotgitignore') {
                              fileDest = '.gitignore';
                            }
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
      });
  }

  install() {
    // build and deploy if requested
    var answers = this.config;
    if (answers.get("BTPRuntime").includes("Kyma")) {
      // Kyma runtime
      if (answers.get("buildDeploy")) {
        let opt = { "cwd": answers.get("destinationPath") };
        let resBuild = this.spawnCommandSync("make", ["docker-push"], opt);
        if (resBuild.status === 0) {
          this.spawnCommandSync("helm", ["install", answers.get("projectName"), " helm/" + answers.get("projectName")], opt);
        }
      } else {
        this.log("");
        this.log("You need to build and deploy your project as follows:");
        this.log(" cd " + answers.get("projectName"));
        this.log(" make docker-push");
        this.log(" kubectl config set-context --current --namespace=<namespace>");
        this.log(" helm install " + answers.get("projectName") + " helm/" + answers.get("projectName"));
      }
    } else {
      // Cloud Foundry runtime
      var mta = "mta_archives/" + answers.get("projectName") + "_0.0.1.mtar";
      if (answers.get("buildDeploy")) {
        let opt = { "cwd": answers.get("destinationPath") };
        let resBuild = this.spawnCommandSync("mbt", ["build"], opt);
        if (resBuild.status === 0) {
          this.spawnCommandSync("cf", ["deploy", mta], opt);
        }
      } else {
        this.log("");
        this.log("You need to build and deploy your project as follows:");
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
      this.log("Don't forget to set values for API keys & credentials in helm/" + answers.get("projectName") + "/values.yaml!");
    }
    if (answers.get("BTPRuntime").includes("Kyma") && answers.get("hana")) {
      this.log("");
      this.log("Don't forget to set SAP HANA Cloud HDI Container credentials in helm/" + answers.get("projectName") + "/templates/secret-db.yaml & secret-hdi.yaml!");
    }
    this.log("");
  }
};