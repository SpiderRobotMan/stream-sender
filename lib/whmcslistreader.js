var mysql = require('mysql');
var crypto = require('crypto');

function WHMCSListReader(config) {
    this.whmcsDb = {
        host:       config.whmcsDb.host,
        user:       config.whmcsDb.user,
        password:   config.whmcsDb.password,
        database:   config.whmcsDb.database,
    }

    this.config = {
        marketing:          config.email.marketing,
        demo:               config.demo,
        cc_encryption_hash: config.cc_encryption_hash,
        addquery:           config.addquery,
    }
}

WHMCSListReader.prototype.initWhmcs = function() {
    var whmcsConnection = mysql.createConnection(this.whmcsDb);
    this.whmcsConnection = whmcsConnection;

    whmcsConnection.connect();
    return whmcsConnection;
}

WHMCSListReader.prototype.readEmailList = function(cb) {
    var whmcsConnection = this.initWhmcs();
    var whmcsQuery = 'SELECT id,firstname,lastname,email FROM tblclients WHERE 1=1 ';

    var self = this;

    if(this.config.demo) {
        query += 'AND id = 38335 ';
    } else if (this.config.marketing) {
        query += 'AND emailoptout=0 ';
    }

    if(this.config.whmcsDb.addQuery) {
        query += 'AND (' + this.config.whmcsDb.addQuery + ')';
    }


    this.whmcsConnection.query(whmcsQuery, function(err, whmcsResult) {
        if (!err) {
            for(var i in results) {
                var result = whmcsResult[i];
                whmcsResult[i].unsublink = 'https://billing.apexminecrafthosting.com/unsubscribe.php?email='+encodeURIComponent(result.email)+'&key='+crypto.createHash('sha1').update(result.email).update(''+result.id).update(self.config.cc_encryption_hash).digest('hex');
            }
            cb(results);
        } else {
            console.error(err);
        }
    });

    whmcsConnection.end();
}

module.exports = WHMCSListReader;
