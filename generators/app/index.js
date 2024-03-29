"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
const types = require("@sap-devx/yeoman-ui-types");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.setPromptsCallback = (fn) => {
      if (this.prompts) {
        this.prompts.setCallback(fn);
      }
    };
    const virtualPrompts = [
      {
        name: "Project Attributes",
        description: "Configure the main project attributes."
      },
      {
        name: "Runtime Selection",
        description: "Choose and configure your runtime."
      },
      {
        name: "API Selection",
        description: "Choose and configure APIs."
      },
      {
        name: "Additional Attributes",
        description: "Configure additional attributes."
      },
      {
        name: "Further Attributes",
        description: "Configure further attributes."
      }
    ];
    this.prompts = new types.Prompts(virtualPrompts);
  }

  initializing() {
    process.chdir(this.destinationRoot());
  }

  async prompting() {
    // defaults
    const answers = {};
    answers.projectName = "app";
    answers.newDir = true;
    answers.BTPRuntime = "CF";
    answers.namespace = "default";
    answers.dockerID = "";
    answers.dockerRepositoryName = "";
    answers.dockerRepositoryVisibility = "public";
    answers.dockerRegistrySecretName = "docker-registry-config";
    answers.dockerServerURL = "https://index.docker.io/v1/";
    answers.dockerEmailAddress = "";
    answers.dockerPassword = "";
    answers.kubeconfig = "";
    answers.buildCmd = "pack";
    answers.apiS4HC = false;
    answers.apiGraph = false;
    answers.apiGraphURL = "https://<region>.graph.sap/api";
    answers.apiGraphId = "v1";
    answers.apiGraphTokenURL = "https://<subdomain>.authentication.<region>.hana.ondemand.com";
    answers.apiDest = false;
    answers.apiSACTenant = false;
    answers.apiSACHost = "https://<tenant>.<region>.hcs.cloud.sap";
    answers.apiSACTokenURL = "https://<tenant>.authentication.<region>.hana.ondemand.com/oauth/token/alias/<alias>";
    answers.apiSACAudience = "https://<tenant>.authentication.<region>.hana.ondemand.com";
    answers.connectivity = false;
    answers.hana = false;
    answers.authentication = true;
    answers.authorization = true;
    answers.attributes = false;
    answers.apiGraphSameSubaccount = true;
    answers.customDomain = "";
    answers.clusterDomain = "0000000.kyma.ondemand.com";
    answers.gateway = "kyma-gateway.kyma-system.svc.cluster.local";
    answers.app2app = false;
    answers.app2appType = "authorize";
    answers.app2appName = "";
    answers.app2appMethod = ["user"];
    answers.ui = true;
    answers.externalSessionManagement = false;
    answers.cicd = false;
    answers.buildDeploy = false;
    // prompts
    const answersProject = await this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
            return true;
          }
          return "Please start with a letter and only use alphanumeric characters for the project name.";
        },
        default: answers.projectName
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: answers.newDir
      }
    ]);
    const answersRuntime = await this.prompt([
      {
        type: "list",
        name: "BTPRuntime",
        message: "Which runtime will you be deploying the project to?",
        choices: [{ name: "SAP BTP, Cloud Foundry runtime", value: "CF" }, { name: "SAP BTP, Kyma runtime", value: "Kyma" }],
        store: true,
        default: answers.BTPRuntime
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
        store: true,
        default: answers.namespace
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
        store: true,
        default: answers.dockerID
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
        default: answers.dockerRepositoryName
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "dockerRepositoryVisibility",
        message: "What is your Docker repository visibility?",
        choices: [{ name: "Public (Appears in Docker Hub search results)", value: "public" }, { name: "Private (Only visible to you)", value: "private" }],
        store: true,
        default: answers.dockerRepositoryVisibility
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerRegistrySecretName",
        message: "What is the name of your Docker Registry Secret? It will be created in the namespace if you specify your Docker Email Address and Docker Personal Access Token or Password.",
        store: true,
        default: answers.dockerRegistrySecretName
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerServerURL",
        message: "What is your Docker Server URL?",
        store: true,
        default: answers.dockerServerURL
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerEmailAddress",
        message: "What is your Docker Email Address? Leave blank if your Docker Registry Secret already exists in the namespace.",
        default: answers.dockerEmailAddress
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "password",
        name: "dockerPassword",
        message: "What is your Docker Personal Access Token or Password? Leave blank if your Docker Registry Secret already exists in the namespace.",
        mask: "*",
        default: answers.dockerPassword
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "kubeconfig",
        message: "What is the path of your Kubeconfig file? Leave blank to use the KUBECONFIG environment variable instead.",
        default: answers.kubeconfig
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "buildCmd",
        message: "How would you like to build container images?",
        choices: [{ name: "Paketo (Cloud Native Buildpacks)", value: "pack" }, { name: "Docker", value: "docker" }, { name: "Podman", value: "podman" }],
        store: true,
        default: answers.buildCmd
      }
    ]);
    const answersAPI = await this.prompt([
      {
        type: "confirm",
        name: "apiS4HC",
        message: "Would you like to access the SAP S/4HANA Cloud Sales Orders API?",
        default: answers.apiS4HC
      },
      {
        type: "confirm",
        name: "apiGraph",
        message: "Would you like to use SAP Graph?",
        default: answers.apiGraph
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphURL",
        message: "What is your SAP Graph URL?",
        default: answers.apiGraphURL
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphId",
        message: "What is your SAP Graph Business Data Graph Identifier?",
        default: answers.apiGraphId
      },
      {
        when: response => response.apiGraph === true,
        type: "input",
        name: "apiGraphTokenURL",
        message: "What is your SAP Graph Token URL?",
        default: answers.apiGraphTokenURL
      },
      {
        type: "confirm",
        name: "apiDest",
        message: "Would you like to test the SAP Destination service?",
        default: answers.apiDest
      },
      {
        when: response => response.apiDest === true,
        type: "confirm",
        name: "apiSACTenant",
        message: "Would you like to configure the SAP Analytics Cloud Tenant API?",
        default: answers.apiSACTenant
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACHost",
        message: "What is your SAP Analytics Cloud Host?",
        default: answers.apiSACHost
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACTokenURL",
        message: "What is your SAP Analytics Cloud OAuth2SAML Token URL?",
        default: answers.apiSACTokenURL
      },
      {
        when: response => response.apiSACTenant === true,
        type: "input",
        name: "apiSACAudience",
        message: "What is your SAP Analytics Cloud OAuth2SAML Audience?",
        default: answers.apiSACAudience
      },
      {
        when: response => (response.apiGraph === true || response.apiDest === true) && answersRuntime.BTPRuntime !== "Kyma",
        type: "confirm",
        name: "connectivity",
        message: "Will you be accessing on-premise systems via the Cloud Connector?",
        default: answers.connectivity
      }
    ]);
    const answersAdditional = await this.prompt([
      {
        type: "confirm",
        name: "hana",
        message: "Would you like to use SAP HANA Cloud?",
        default: answers.hana
      },
      {
        type: "confirm",
        name: "authentication",
        message: "Would you like authentication?",
        default: answers.authentication
      },
      {
        when: response => response.authentication === true,
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: answers.authorization
      },
      {
        when: response => response.hana === true && response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "attributes",
        message: "Would you like to use role attributes?",
        default: answers.attributes
      },
      {
        when: response => response.authentication === true && answersAPI.apiGraph === true,
        type: "confirm",
        name: "apiGraphSameSubaccount",
        message: "Will you be deploying to the subaccount of the SAP Graph service instance?",
        default: answers.apiGraphSameSubaccount
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
        default: answers.customDomain
      }
    ]);
    if (answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain === "") {
      let cmd = ["get", "cm", "shoot-info", "-n", "kube-system", "-o", "jsonpath='{.data.domain}'"];
      if (answersRuntime.kubeconfig !== "") {
        cmd.push("--kubeconfig", answersRuntime.kubeconfig);
      }
      let opt = { "stdio": [process.stdout] };
      try {
        let resGet = this.spawnCommandSync("kubectl", cmd, opt);
        if (resGet.exitCode === 0) {
          answers.clusterDomain = resGet.stdout.toString().replace(/'/g, '');
        }
      } catch (error) {
        this.log("kubectl error:", error);
      }
    } else {
      answers.clusterDomain = answersAdditional.customDomain;
    }
    const answersFurther = await this.prompt([
      {
        when: answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain === "",
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: answers.clusterDomain
      },
      {
        when: answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain !== "",
        type: "input",
        name: "gateway",
        message: "What is the gateway for the custom domain in your SAP BTP, Kyma runtime?",
        default: answers.gateway
      },
      {
        when: answersAdditional.authentication === true && answersAdditional.authorization === true,
        type: "confirm",
        name: "app2app",
        message: "Would you like to configure an App2App authorization scenario?",
        default: answers.app2app
      },
      {
        when: response => answersAdditional.authentication === true && answersAdditional.authorization === true && response.app2app === true,
        type: "list",
        name: "app2appType",
        message: "Which App2App authorization scenario would you like to configure?",
        choices: [{ name: "Authorize another app to use this app", value: "authorize" }, { name: "Access another app from this app", value: "access" }],
        default: answers.app2appType
      },
      {
        when: response => answersAdditional.authentication === true && answersAdditional.authorization === true && response.app2app === true,
        type: "input",
        name: "app2appName",
        message: "What is the name of the other app (deployed to same BTP subaccount)?",
        default: answers.app2appName
      },
      {
        when: response => answersAdditional.authentication === true && answersAdditional.authorization === true && response.app2app === true,
        type: "checkbox",
        name: "app2appMethod",
        message: "What type of App2App authentication would you like?",
        choices: [{ name: "Principal Propagation of Business User", value: "user", checked: true }, { name: "Technical Communication", value: "machine" }],
        default: answers.app2appMethod
      },
      {
        type: "confirm",
        name: "ui",
        message: "Would you like a UI?",
        default: answers.ui
      },
      {
        when: response => response.ui === true && answersRuntime.BTPRuntime === "Kyma",
        type: "confirm",
        name: "externalSessionManagement",
        message: "Would you like to configure external session management (using Redis)?",
        default: answers.externalSessionManagement
      },
      {
        type: "confirm",
        name: "cicd",
        message: "Would you like to enable Continuous Integration and Delivery (CI/CD)?",
        default: answers.cicd
      },
      {
        type: "confirm",
        name: "buildDeploy",
        message: "Would you like to build and deploy the project?",
        default: answers.buildDeploy
      }
    ]);
    if (answersProject.newDir) {
      this.destinationRoot(`${answersProject.projectName}`);
    }
    answers.destinationPath = this.destinationPath();
    if (answersAdditional.authentication === false) {
      answersAdditional.authorization = false;
    }
    this.config.set(answers);
    this.config.set(answersProject);
    this.config.set(answersRuntime);
    this.config.set(answersAPI);
    this.config.set(answersAdditional);
    this.config.set(answersFurther);
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
              if (!(file.includes('/Dockerfile') && answers.get('buildCmd') === 'pack')) {
                if (!((file.substring(0, 4) === 'app/' || file.includes('helm/_PROJECT_NAME_-app')) && answers.get('ui') === false)) {
                  if (!((file.substring(0, 3) === 'db/' || file.includes('helm/_PROJECT_NAME_-db')) && answers.get('hana') === false)) {
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
        try {
          const k8s = require('@kubernetes/client-node');
          const kc = new k8s.KubeConfig();
          if (answers.get("kubeconfig") !== "") {
            kc.loadFromFile(answers.get('kubeconfig'));
          } else {
            kc.loadFromDefault();
          }
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
        } catch (error) {
          this.log("kubeconfig error:", error);
        }
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
          cmd = ["get", "secret/" + answers.get("projectName") + "-cicd", "-n", answers.get("namespace"), "-o", "jsonpath='{.data}'"];
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
    answers.delete('dockerEmailAddress');
    answers.delete('dockerPassword');
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