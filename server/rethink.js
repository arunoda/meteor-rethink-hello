RethinkDB.connect();
var r = RethinkDB.rql();
var rql = r.table("posts").filter(r.row("name").ne("meteor"));

Meteor.publish("posts", function() {
  var cursor = new RethinkDB.Cursor("rdata", rql);
  return cursor;
});

// console.log(cursor._fetch());
// var cursor = Meteor.wrapAsync(rql.run, rql)(conn);
// cursor.each(function(err, doc) {
//   console.log(doc);
// }, function() {
//   console.log("finished!");
// });