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
  db.createTable(
    "order_line_items",
    {
      id: {
        type: "UUID",
        primaryKey: true,
        defaultValue: new String("gen_random_uuid()"),
      },
      order_id: {
        type: "UUID",
        notNull: true,
      },
      product_id: {
        type: "UUID",
        notNull: true,
      },
      quantity: {
        type: "int",
        notNull: true,
      },
      subtotal: {
        type: "decimal",
        notNull: true,
      },
    },
    cb
  );
};

exports.down = function (db, cb) {
  return db.dropTable("order_line_items", cb);
};

exports._meta = {
  version: 1,
};
