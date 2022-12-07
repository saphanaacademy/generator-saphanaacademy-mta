"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");

module.exports = class extends Generator {
  initializing() {
    this.log('Destination Root:', this.destinationRoot());
    process.chdir(this.destinationRoot());
  }

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
        choices: [{ name: "SAP BTP, Cloud Foundry runtime", value: "CF" }, { name: "SAP BTP, Kyma runtime", value: "Kyma" }],
        default: "CF"
      },
      {
        when: response => response.BTPRuntime === "Kyma",
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
        when: response => response.BTPRuntime === "Kyma",
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
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "dockerRepositoryName",
        message: "What is your Docker repository name? Leave blank to create a separate repository for each microservice.",
        validate: (s) => {
          if ((/^[a-z0-9-_]*$/g.test(s) && s.length >= 2 && s.length <= 225) || s === "") {
            return true;
          }
          return "Your Docker repository name must be between 2 and 255 characters long and can only contain numbers, lowercase letters, hyphens (-), and underscores (_).";
        },
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "dockerRepositoryVisibility",
        message: "What is your Docker repository visibility?",
        choices: [{ name: "Public (Appears in Docker Hub search results)", value: "public" }, { name: "Private (Only visible to you)", value: "private" }],
        default: "public"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerRegistrySecretName",
        message: "What is the name of your Docker Registry Secret? It will be created in the namespace if you specify your Docker Email Address and Docker Personal Access Token or Password.",
        default: "docker-registry-config"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerServerURL",
        message: "What is your Docker Server URL?",
        default: "https://index.docker.io/v1/"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerEmailAddress",
        message: "What is your Docker Email Address? Leave empty if your Docker Registry Secret already exists in the namespace.",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "password",
        name: "dockerPassword",
        message: "What is your Docker Personal Access Token or Password? Leave empty if your Docker Registry Secret already exists in the namespace.",
        mask: "*",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "kubeconfig",
        message: "What is the path of your Kubeconfig file? Leave blank to use the KUBECONFIG environment variable instead.",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "buildCmd",
        message: "How would you like to build container images?",
        choices: [{ name: "Paketo (Cloud Native Buildpacks)", value: "pack" }, { name: "Docker", value: "docker" }, { name: "Podman", value: "podman" }],
        default: "pack"
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
        when: response => response.apiDest === true,
        type: "confirm",
        name: "apiSACTenant",
        message: "Would you like to configure the SAP Analytics Cloud Tenant API?",
        default: false
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACHost",
        message: "What is your SAP Analytics Cloud Host?",
        default: "https://<tenant>.<region>.hcs.cloud.sap"
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACTokenURL",
        message: "What is your SAP Analytics Cloud OAuth2SAML Token URL?",
        default: "https://<tenant>.authentication.<region>.hana.ondemand.com/oauth/token/alias/<alias>"
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACAudience",
        message: "What is your SAP Analytics Cloud OAuth2SAML Audience?",
        default: "https://<tenant>.authentication.<region>.hana.ondemand.com"
      },
      {
        when: response => (response.apiGraph === true || response.apiDest === true) && response.BTPRuntime !== "Kyma",
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
        message: "Would you like to use role attributes?",
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
        type: "input",
        name: "customDomain",
        message: "Will you be using a wildcard custom domain (eg: apps.domain.com)? If so please enter the custom domain name here. Leave blank to use the platform default.",
        validate: (s) => {
          if (s === "") {
            return true;
          }
          if (/^[a-zA-Z0-9.-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the custom domain.";
        },
        default: "",
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.customDomain === "",
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: "0000000.kyma.ondemand.com"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.customDomain !== "",
        type: "input",
        name: "gateway",
        message: "What is the gateway for the custom domain in your SAP BTP, Kyma runtime?",
        default: "gateway-name.namespace.svc.cluster.local"
      },
      {
        when: response => response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "app2app",
        message: "Would you like to configure an App2App authorization scenario?",
        default: false
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "list",
        name: "app2appType",
        message: "Which App2App authorization scenario would you like to configure?",
        choices: [{ name: "Authorize another app to use this app", value: "authorize" }, { name: "Access another app from this app", value: "access" }],
        default: "authorize"
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "input",
        name: "app2appName",
        message: "What is the name of the other app (deployed to same BTP subaccount)?",
        default: ""
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "checkbox",
        name: "app2appMethod",
        message: "What type of App2App authentication would you like?",
        choices: [{ name: "Principal Propagation of Business User", value: "user", checked: true }, { name: "Technical Communication", value: "machine" }],
        default: ["user"]
      },
      {
        type: "confirm",
        name: "ui",
        message: "Would you like a UI?",
        default: true
      },
      {
        when: response => response.ui === true && response.BTPRuntime === "Kyma",
        type: "confirm",
        name: "externalSessionManagement",
        message: "Would you like to configure external session management (using Redis)?",
        default: false
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
      if (answers.BTPRuntime !== "Kyma") {
        answers.clusterDomain = "";
        answers.gateway = "";
        answers.namespace = "";
        answers.dockerID = "";
        answers.dockerRepositoryName = "";
        answers.dockerRepositoryVisibility = "";
        answers.kubeconfig = "";
        answers.buildCmd = "";
        answers.externalSessionManagement = false;
      } else {
        if (answers.customDomain !== "") {
          answers.clusterDomain = answers.customDomain;
        } else {
          answers.gateway = "kyma-gateway.kyma-system.svc.cluster.local";
        }
      }
      if (answers.dockerRepositoryVisibility !== "private") {
        answers.dockerServerURL = "";
        answers.dockerEmailAddress = "";
        answers.dockerPassword = "";
        answers.dockerRegistrySecretName = "";
      }
      if (answers.apiGraph === false) {
        answers.apiGraphURL = "";
        answers.apiGraphId = "";
        answers.apiGraphTokenURL = "";
        answers.apiGraphSameSubaccount = false;
      }
      if (answers.apiDest === false) {
        answers.apiSACTenant = false;
      }
      if (answers.apiSACTenant === false) {
        answers.apiSACHost = "";
        answers.apiSACTokenURL = "";
        answers.apiSACAudience = "";
      }
      if (answers.hana === false) {
        answers.xsjs = false;
      }
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.app2app = false;
        answers.apiGraphSameSubaccount = false;
      }
      if (answers.hana === false || answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (answers.authorization === false) {
        answers.app2app = false;
      }
      if (answers.app2app === false) {
        answers.app2appType = "";
        answers.app2appName = "";
        answers.app2appMethod = "";
      }
      if (answers.apiSACTenant === true) {
        answers.authentication = true;
      }
      if (!((answers.apiGraph === true || answers.apiDest === true) && answers.BTPRuntime !== "Kyma")) {
        answers.connectivity = false;
      }
      if (answers.ui === false) {
        answers.externalSessionManagement = false;
      }
      answers.destinationPath = this.destinationPath();
      this.config.set(answers);
    });
  }

  writing() {
    var answers = this.config;

    if (answers.get('cicd') === true || answers.get('app2appType') === "access") {
      answers.set('cforg', 'org');
      answers.set('cfspace', 'space');
      answers.set('cfapi', 'https://api.cf.<region>.hana.ondemand.com');
      answers.set('cfregion', '<region>');
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
            answers.set('cfregion', keyvalue[2].split('.')[2]);
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
            if (!((file.substring(0, 5) === 'helm/' || file.includes('/Dockerfile') || file === 'dotdockerignore' || file === 'Makefile' || file.includes('-cicd.')) && answers.get('BTPRuntime') !== 'Kyma')) {
              if (!((file.substring(0, 4) === 'app/' || file.includes('helm/_PROJECT_NAME_-app')) && answers.get('ui') === false)) {
                if (!((file.substring(0, 3) === 'db/' || file.includes('helm/_PROJECT_NAME_-db')) && answers.get('hana') === false)) {
                  if (!((file.substring(0, 6) === 'srvxs/' || file.includes('helm/_PROJECT_NAME_-srvxs')) && answers.get('xsjs') === false)) {
                    if (!((file.includes('service-hdi.yaml') || file.includes('binding-hdi.yaml')) && answers.get('hana') === false)) {
                      if (!((file.includes('service-uaa.yaml') || file.includes('binding-uaa.yaml')) && answers.get('authentication') === false && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                        if (!((file.includes('service-dest.yaml') || file.includes('binding-dest.yaml')) && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false)) {
                          if (!((file.includes('-redis.yaml') || file.includes('destinationrule.yaml')) && answers.get('externalSessionManagement') === false)) {
                            if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime') !== 'CF')) {
                              if (!(file === 'xs-security.json' && (answers.get('authentication') === false && answers.get('apiS4HC') === false && answers.get('apiGraph') === false && answers.get('apiDest') === false))) {
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

  async install() {
    var answers = this.config;
    var opt = { "cwd": answers.get("destinationPath") };
    if (answers.get('BTPRuntime') === "Kyma") {
      // Kyma runtime
      const yaml = require('js-yaml');
      const fs2 = require('fs');
      let cmd;
      if (answers.get("dockerRepositoryVisibility") === "private" && !(answers.get("dockerEmailAddress") === "" && answers.get("dockerPassword") === "")) {
        cmd = ["create", "secret", "docker-registry", answers.get("dockerRegistrySecretName"), "--docker-server", answers.get("dockerServerURL"), "--docker-username", answers.get("dockerID"), "--docker-email", answers.get("dockerEmailAddress"), "--docker-password", answers.get("dockerPassword"), "-n", answers.get("namespace")];
        if (answers.get("kubeconfig") !== "") {
          cmd.push("--kubeconfig", answers.get("kubeconfig"));
        }
        this.spawnCommandSync("kubectl", cmd, opt);
      }
      if (answers.get("externalSessionManagement") === true) {
        // generate secret
        const k8s = require('@kubernetes/client-node');
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        let k8sApi = kc.makeApiClient(k8s.CoreV1Api);
        this.log('Creating the external session management secret...');
        let pwdgen = require('generate-password');
        let redisPassword = pwdgen.generate({
          length: 64,
          numbers: true
        });
        let sessionSecret = pwdgen.generate({
          length: 64,
          numbers: true
        });
        let k8sSecret = {
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: {
            name: answers.get('projectName') + '-redis-binding-secret',
            labels: {
              'app.kubernetes.io/managed-by': answers.get('projectName') + '-app'
            }
          },
          type: 'Opaque',
          data: {
            EXT_SESSION_MGT: Buffer.from('{"instanceName":"' + answers.get("projectName") + '-redis", "storageType":"redis", "sessionSecret": "' + sessionSecret + '"}', 'utf-8').toString('base64'),
            REDIS_PASSWORD: Buffer.from('"' + redisPassword + '"', 'utf-8').toString('base64'),
            ".metadata": Buffer.from('{"credentialProperties":[{"name":"hostname","format":"text"},{"name":"port","format":"text"},{"name":"password","format":"text"},{"name":"cluster_mode","format":"text"},{"name":"tls","format":"text"}],"metaDataProperties":[{"name":"instance_name","format":"text"},{"name":"type","format":"text"},{"name":"label","format":"text"}]}', 'utf-8').toString('base64'),
            instance_name: Buffer.from(answers.get('projectName') + '-db-' + answers.get('schemaName'), 'utf-8').toString('base64'),
            type: Buffer.from("redis", 'utf-8').toString('base64'),
            name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
            instance_name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
            hostname: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
            port: Buffer.from("6379", 'utf-8').toString('base64'),
            password: Buffer.from(redisPassword, 'utf-8').toString('base64'),
            cluster_mode: Buffer.from("false", 'utf-8').toString('base64'),
            tls: Buffer.from("false", 'utf-8').toString('base64')
          }
        };
        await k8sApi.createNamespacedSecret(
          answers.get('namespace'),
          k8sSecret
        ).catch(e => this.log("createNamespacedSecret:", e.response.body));
      }
      if (answers.get("cicd") === true) {
        // generate service account & kubeconfig
        let fileDest = path.join(this.destinationRoot(), "sa-cicd.yaml");
        cmd = ["apply", "-f", fileDest, "-n", answers.get("namespace")];
        if (answers.get("kubeconfig") !== "") {
          cmd.push("--kubeconfig", answers.get("kubeconfig"));
        }
        let resApply = this.spawnCommandSync("kubectl", cmd, opt);
        if (resApply.exitCode === 0) {
          opt.stdio = [process.stdout];
          cmd = ["get", "sa", answers.get("projectName") + "-cicd", "-n", answers.get("namespace"), "-o", "jsonpath='{.secrets[0].name}'"];
          if (answers.get("kubeconfig") !== "") {
            cmd.push("--kubeconfig", answers.get("kubeconfig"));
          }
          let resSecret = this.spawnCommandSync("kubectl", cmd, opt);
          if (resSecret.exitCode === 0) {
            cmd = ["get", "secret/" + resSecret.stdout.toString().replace(/'/g, ''), "-n", answers.get("namespace"), "-o", "jsonpath='{.data}'"];
            if (answers.get("kubeconfig") !== "") {
              cmd.push("--kubeconfig", answers.get("kubeconfig"));
            }
            let resSecretDetail = this.spawnCommandSync("kubectl", cmd, opt);
            let secretDetail = resSecretDetail.stdout.toString();
            secretDetail = JSON.parse(secretDetail.substring(1).substring(0, secretDetail.length - 2));
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
            fileDest = path.join(this.destinationRoot(), "sa-kubeconfig-cicd.yaml");
            fs2.writeFile(fileDest, yaml.dump(fileText), 'utf-8', function (err) {
              if (err) {
                console.log(err.message);
                return;
              }
            });
          }
        }
      }
      if (answers.get("buildDeploy")) {
        let resPush = this.spawnCommandSync("make", ["docker-push"], opt);
        if (resPush.exitCode === 0) {
          this.spawnCommandSync("make", ["helm-deploy"], opt);
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
        if (resBuild.exitCode === 0) {
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
      this.log("");
    }
    if (answers.get('BTPRuntime') === "Kyma" && (answers.get("apiS4HC") || answers.get("apiGraph") || answers.get("apiSACTenant"))) {
      this.log("Before deploying, consider setting values for API keys & credentials in helm/" + answers.get("projectName") + "-srv/values.yaml or set directly using the destination service REST API immediately after deployment.");
    }
    this.log("");
  }
}