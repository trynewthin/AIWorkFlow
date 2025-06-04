const { KnowledgeDb, getKnowledgeDb } = require('./knowledge-db');
const { HNSWDb, getHNSWDb } = require('./hnsw-db');

module.exports = {
  KnowledgeDb,
  getKnowledgeDb,
  HNSWDb,
  getHNSWDb
};