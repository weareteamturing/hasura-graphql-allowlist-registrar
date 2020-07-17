const core = require('@actions/core');
const util = require('util');
const path = require('path');
const axios = require('axios').default;
const DateTime = require('luxon').DateTime;

const readFile = util.promisify(require('fs').readFile);
const glob = util.promisify(require('glob'));


class HasuraAllowlistClient {
  constructor(host, adminKey) {
    this.host = host;
    this.adminKey = adminKey;
  }

  get authData() {
    return {
      headers: {
        'X-Hasura-Role': 'admin',
        'X-Hasura-Admin-Secret': this.adminKey,
      },
    };
  }

  async createQueryCollection(name) {
    const payload = {
      "type" : "create_query_collection",
      "args": {
          "name": name,
          "comment": "",
          "definition": {
              "queries": [],
          }
      }
    };
    return axios.post(`${this.host}/v1/query`, payload, this.authData);
  }

  async addQueryToCollection(name, queryName, query) {
    const payload = {
      "type" : "add_query_to_collection",
      "args": {
          "collection_name": name,
          "query_name": queryName,
          "query": query,
      }
    };
    return axios.post(`${this.host}/v1/query`, payload, this.authData);
  }

  async addCollectionToAllowlist(name) {
    const payload = {
      "type" : "add_collection_to_allowlist",
      "args": {
          "collection": name,
      }
    };
    return axios.post(`${this.host}/v1/query`, payload, this.authData);
  }
}

/** @returns {Array<{ name: string, query: string }>} */
async function getGQLFiles(filesPath = '**/*.gql') {
  const files = await glob(filesPath);

  const filesReader = files.map(async file => {
    return {
      name: path.basename(file),
      query: await readFile(file, 'utf8'),
    };
  });

  return Promise.all(filesReader);
}


async function run() {
  try {
    if (!process.env.GITHUB_WORKSPACE) {
      throw new Error('process.env.GITHUB_WORKSPACE is null');
    }

    const HASURA_URL = core.getInput('host');
    const HASURA_KEY = core.getInput('key');
    const client = new HasuraAllowlistClient(HASURA_URL, HASURA_KEY);

    const gqls = await getGQLFiles(`${process.env.GITHUB_WORKSPACE}/**/*.gql`);

    const collectionName = `QueryCollection_${DateTime.local().toFormat('yyyyMMdd')}`;
    await client.createQueryCollection(collectionName);
    for (const { name, query } of gqls) {
      await client.addQueryToCollection(collectionName, name, query);
    }
    await client.addCollectionToAllowlist(collectionName);

  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
