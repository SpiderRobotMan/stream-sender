{
	"readonly": true,

	"demo": false,

	"email": {
		"templatePath": "templates/example.ejs",
		"from": "Apex Minecraft Hosting <support@apexminecrafthosting.com>",
		"subject": "This is a test",
		"marketing": false
	},

	"throttle": {
		"interval": 1
	},

	"smtp": {
		"host": "127.0.0.1",
		"port": 587,
		"secure": false,
		"auth": {
			"user": "",
			"pass": ""
		}
	},

	"whmcsDb": {
		"host": "",
		"user": "",
		"password": "",
		"database": "",
		"addQuery": "",
	},

	"multicraftDb": {
		"host": "",
		"user": "",
		"password": "",
		"database": "",
		"addQuery": "",
	},

	"filename": "", // For Static File

	"affectedServers": [], // List of multicraft server ids
	"affectedDaemons": [], // List of multicraft daemons
}
