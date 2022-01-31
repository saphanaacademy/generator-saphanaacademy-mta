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
        type: "confirm",
        name: "apiS4HC",
        message: "Would you like to access SAP S/4HANA Cloud Sales Orders?",
        default: true
      },
      {
        when: response => response.apiS4HC === true,
        type: "input",
        name: "APIKey",
        message: "What is your API Key for SAP API Business Hub?",
        default: "",
      },
      {
        type: "confirm",
        name: "apiGraph",
        message: "Would you like to use SAP Graph?",
        default: true
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
        name: "hana",
        message: "Would you like to use SAP HANA Cloud?",
        default: true
      },
      {
        when: response => response.hana === true,
        type: "confirm",
        name: "xsjs",
        message: "Would you like to use the XSJS Compatibility Layer?",
        default: true
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
        type: "confirm",
        name: "buildDeploy",
        message: "Would you like to build and deploy the project?",
        default: false
      },
    ]).then((answers) => {
      if (answers.newDir) {
        this.destinationRoot(`${answers.projectName}`);
      }
      if (answers.apiS4HC === false) {
        answers.APIKey = "";
      }
      if (answers.apiGraph === false) {
        answers.apiGraphURL = "";
        answers.apiGraphId = "";
        answers.apiGraphTokenURL = "";
      }
      if (answers.hana === false) {
        answers.xsjs = false;
      }
      if (answers.authentication === false) {
        answers.authorization = false;
      }
      if (answers.hana === false || answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
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
              if (!(file === 'xs-security.json' && (answers.get('authentication') === false && answers.get('apiGraph') === false))) {
                const sOrigin = this.templatePath(file);
                const sTarget = this.destinationPath(file);
                this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
              }
            }
          }
        }
      });
  }

  install() {
    // build and deploy if requested
    var answers = this.config;
    var mta = "mta_archives/" + answers.get("projectName") + "_0.0.1.mtar";
    if (answers.get("buildDeploy")) {
      let opt = { "cwd": this.destinationPath() };
      let resBuild = this.spawnCommandSync("mbt", ["build"], opt);
      if (resBuild.status === 0) {
        this.spawnCommandSync("cf", ["deploy", mta], opt);
      }
    } else {
      this.log("You need to build and deploy your project as follows:");
      this.log(" cd " + answers.get("projectName"));
      this.log(" mbt build");
      this.log(" cf deploy " + mta);
    }
  }

  end() {
    this.log("");
  }
};
