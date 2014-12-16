var r = Meteor.npmRequire('rethinkdb');
RethinkDB = {};
RethinkDB.rql = function() {
  return r;
};

RethinkDB.connect = function(config) {
  RethinkDB.conn = Meteor.wrapAsync(r.connect, r)(config);
};

RethinkDB.Cursor = function RethinkDBCursor (collName, rql, triggers) {
  this.collName = collName;
  this.rql = rql;
  this.triggers = triggers;
  this.docs = {};
  this.sub = null;
};

RethinkDB.Cursor.prototype._fetch = function() {
  var cursor = Meteor.wrapAsync(this.rql.run, this.rql)(RethinkDB.conn);
  return Meteor.wrapAsync(cursor.toArray, cursor)();
};

RethinkDB.Cursor.prototype._refetch = function() {
  var self = this;
  var newDocs = {};
  var newDataSet = this._fetch();

  newDataSet.forEach(function(doc) {
    newDocs[doc.id] = doc;
    if(self.docs[doc.id]) {
      self.sub.changed(self.collName, doc.id, doc);
    } else {
      sub.sub.added(self.collName, doc.id, doc);
    }
  });

  _.each(self.docs, function(value, id) {
    if(!newDocs[id]) {
      self.sub.removed(self.collName, id);
    }
  });

  self.docs = newDocs;
};

RethinkDB.Cursor.prototype._publishCursor = function(sub) {
  var self = this;
  self.sub = sub;
  
  self._refetch();

  var prefetchHandler = Meteor.setInterval(function() {
    self._refetch();
  }, 1000 * 2);

  sub.onStop(function() {
    Meteor.clearTimeout(prefetchHandler);
    self.sub = null;
  });
};