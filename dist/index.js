"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  readReplicas: () => readReplicas
});
module.exports = __toCommonJS(src_exports);

// src/extension.ts
var import_extension = require("@prisma/client/extension.js");

// src/ReplicaManager.ts
var ReplicaManager = class {
  constructor(options) {
    if ("replicas" in options) {
      this._replicaClients = options.replicas;
      return;
    }
    const { replicaUrls, clientConstructor, configureCallback } = options;
    this._replicaClients = replicaUrls.map((datasourceUrl) => {
      const client = new clientConstructor({
        datasourceUrl
      });
      if (configureCallback) {
        return configureCallback(client);
      }
      return client;
    });
  }
  async connectAll() {
    await Promise.all(this._replicaClients.map((client) => client.$connect()));
  }
  async disconnectAll() {
    await Promise.all(this._replicaClients.map((client) => client.$disconnect()));
  }
  pickReplica() {
    return this._replicaClients[Math.floor(Math.random() * this._replicaClients.length)];
  }
};

// src/extension.ts
var readOperations = [
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "groupBy",
  "aggregate",
  "count",
  "findRaw",
  "aggregateRaw"
];
var readReplicas = (options, configureReplicaClient) => import_extension.Prisma.defineExtension((client) => {
  const PrismaClient2 = Object.getPrototypeOf(client).constructor;
  const datasourceName = Object.keys(options).find((key) => !key.startsWith("$"));
  if (!datasourceName) {
    throw new Error(`Read replicas options must specify a datasource`);
  }
  if ("url" in options && "replicas" in options) {
    throw new Error(`Only one of 'url' or 'replicas' can be specified`);
  }
  let replicaManagerOptions;
  if (options.url) {
    let replicaUrls = options.url;
    if (typeof replicaUrls === "string") {
      replicaUrls = [replicaUrls];
    } else if (replicaUrls && !Array.isArray(replicaUrls)) {
      throw new Error(`Replica URLs must be a string or list of strings`);
    }
    if (replicaUrls?.length === 0) {
      throw new Error(`At least one replica URL must be specified`);
    }
    replicaManagerOptions = {
      replicaUrls,
      clientConstructor: PrismaClient2,
      configureCallback: configureReplicaClient
    };
  } else if (options.replicas) {
    if (options.replicas.length === 0) {
      throw new Error(`At least one replica must be specified`);
    }
    replicaManagerOptions = {
      replicas: options.replicas
    };
  } else {
    throw new Error(`Invalid read replicas options`);
  }
  const replicaManager = new ReplicaManager(replicaManagerOptions);
  return client.$extends({
    client: {
      $primary() {
        const context = import_extension.Prisma.getExtensionContext(this);
        if (!("$transaction" in context && typeof context.$transaction === "function")) {
          return context;
        }
        return client;
      },
      $replica() {
        const context = import_extension.Prisma.getExtensionContext(this);
        if (!("$transaction" in context && typeof context.$transaction === "function")) {
          throw new Error(`Cannot use $replica inside of a transaction`);
        }
        return replicaManager.pickReplica();
      },
      $listen(event, listener) {
        ;
        client.$on(event, listener);
      },
      async $connect() {
        await Promise.all([client.$connect(), replicaManager.connectAll()]);
      },
      async $disconnect() {
        await Promise.all([client.$disconnect(), replicaManager.disconnectAll()]);
      }
    },
    query: {
      $allOperations({
        args,
        model,
        operation,
        query,
        // @ts-expect-error
        __internalParams: { transaction }
      }) {
        if (transaction) {
          return query(args);
        }
        if (readOperations.includes(operation)) {
          const replica = replicaManager.pickReplica();
          if (model) {
            return replica[model][operation](args);
          }
          return replica[operation](args);
        }
        return query(args);
      }
    }
  });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readReplicas
});
