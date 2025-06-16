"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, cb) {
  return db.createTable(
    "customers",
    {
      id: {
        type: "UUID",
        primaryKey: true,
        defaultValue: new String("gen_random_uuid()"),
      },
      name: "string",
      email: "string",
      phone_number: { type: "string", unique: true },
    },
    cb
  );
};
exports.down = function (db, cb) {
  return db.dropTable("customers", cb);
};

exports._meta = {
  version: 1,
};
