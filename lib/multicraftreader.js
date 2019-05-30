var mysql = require('mysql');
var crypto = require('crypto');

function MulticraftReader(config) {
    this.whmcsDb = {
        host:       config.whmcsDb.host,
        user:       config.whmcsDb.user,
        password:   config.whmcsDb.password,
        database:   config.whmcsDb.database,
    }

    this.multicraftDb = {
        host:       config.multicraftDb.host,
        user:       config.multicraftDb.user,
        password:   config.multicraftDb.password,
        database:   config.multicraftDb.database,
    }

    this.config = {
        demo:               config.demo,
        marketing:          config.email.marketing,
        affected_servers:   config.affectedServers.join(','),
        affected_daemons:   config.affectedDaemons.join(','),
        cc_encryption_hash: config.cc_encryption_hash,
        add_query:          config.addQuery,
    }
}

MulticraftReader.prototype.initWhmcs = function() {
    var whmcsConnection = mysql.createConnection(this.whmcsDb);
    this.whmcsConnection = whmcsConnection;

    whmcsConnection.connect();
    return whmcsConnection;
}

MulticraftReader.prototype.initMulticraft = function() {
    var multicraftConnection = mysql.createConnection(this.multicraftDb);
    this.multicraftConnection = multicraftConnection;

    multicraftConnection.connect();
    return multicraftConnection;
}

MulticraftReader.prototype.readEmailList = function(cb) {
    var multicraftConnection = this.initMulticraft();
    var multicraftQuery = 'SELECT id FROM server WHERE daemon_id IN(' + this.config.affected_daemons + ')';

    var self = this;

    this.multicraftConnection.query(multicraftQuery, function(err, multicraftResult) {
        if (!err) {

          var server_result = multicraftResult.map(function(r) {
            return r.id;
          });

          var affected_servers = this.config.affected_servers.concat(server_result);

          var whmcsConnection = this.initWhmcs();
          var whmcsQuery = 'SELECT \
              tblclients.id AS id, tblclients.firstname AS firstname, tblclients.lastname AS lastname, tblclients.email AS email, \
              tblhosting.id as service_id, \
              multicraft.server_id as server_id \
              FROM tblclients \
              LEFT JOIN tblhosting ON tblhosting.userid = tblclients.id \
              LEFT JOIN mod_multicraft AS multicraft ON tblhosting.id = multicraft.whmcs_service_id \
              WHERE tblhosting.domainstatus = "Active" AND multicraft.server_id IN(' + affected_servers + ') \
              GROUP BY tblclients.id';

          if(this.config.whmcsDb.addQuery) {
             whmcsQuery += this.config.whmcsDb.addQuery;
          }

          if (this.config.marketing) {
              whmcsQuery += ' AND tblclients.emailoptout=0';
          }

          this.whmcsConnection.query(whmcsQuery, function(err, whmcsResult) {
              if (!err) {
                  for(var i in results) {
                      var result = whmcsResult[i];
                      whmcsResult[i].unsublink = 'https://billing.apexminecrafthosting.com/unsubscribe.php?email='+encodeURIComponent(result.email)+'&key='+crypto.createHash('sha1').update(result.email).update(''+result.id).update(self.config.cc_encryption_hash).digest('hex');
                      if(self.config.demo) {
                          whmcsResult[i].email = 'dev@apexminecrafthosting.com';
                          return cb([whmcsResult[i]]);
                      }
                  }
                  cb(whmcsResult);
              } else {
                  console.error(err);
              }
          });

          whmcsConnection.end();

        } else {
            console.error(err);
        }
    });
}

module.exports = MulticraftReader;
