"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, cb) {
  return db.createTable(
    "orders",
    {
      id: {
        type: "UUID",
        primaryKey: true,
        defaultValue: new String("gen_random_uuid()"),
      },
      customer_id: {
        type: "UUID",
        notNull: true,
      },
      ordered_at: {
        type: "timestamp",
        notNull: true,
        defaultValue: new String("now()"),
      },
      total: {
        type: "decimal",
        notNull: true,
        defaultValue: 0,
      },
    },
    cb
  );
};

exports.down = function (db, cb) {
  return db.dropTable("orders", cb);
};

exports._meta = {
  version: 1,
};
