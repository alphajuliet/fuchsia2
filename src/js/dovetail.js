// dovetail.js
// A DovetailDB client library.
//
// Version 1.0
//
// Sample Usage:
//
// <script type="text/javascript" src="dovetail.js"></script>
// 
// <script type="text/javascript">
// dovetail.defaults.accesskey  = <<your access key here>>;
// dovetail.defaults.db         = 'DemoDB';
// dovetail.defaults.errorfn    = function(msg){ alert("Hit an error: "+msg); };
//
// dovetail.insert('people', { name:'Bob', age:24 });
// dovetail.query('people', {name_is:'Bob'}, 
//                function(folks) { alert("Bob is "+folks[0].age+" years old."); }
//                );
// </script>
//


var dovetail = function() {
	var lScriptCounter = 1;
	var lCallbacks = {};
	var lDefaults = {
		server:'http://dovetaildb.millstonecw.com',
		errorcb:function(detail) { 
			alert("Encountered an error processing your request.  ("+detail['message']+")");
		},
		callback:function(results) { },
		dynamicScriptContainer : document.getElementsByTagName("head").item(0),
		dovetailHandlerFunctionName : 'dovetail.handler',
		standingParams : {}
	};
	if (typeof JSON == 'object') {
		lDefaults.jsonEncodeFn = JSON['stringify'];
		lDefaults.jsonDecodeFn = JSON['parse'];
	}
	var lApplyDefaultParameters = function(values) {
		if (lDefaults['accesskey']) values['accesskey'] = lDefaults['accesskey'];
		values['db'] = lDefaults['db'];
		for (var key in lDefaults.standingParams) {
			values[key] = lDefaults.standingParams[key];
		}
	};
	var lClone = function(obj) {
	    var ret={};
	    for(var k in obj) ret[k] = obj[k];
	    return ret;
	}
	var lRequest = function(method, values) {
		var url = lDefaults['server'] + '/' + method + '?';
		
		lApplyDefaultParameters(values);
		//console.log(lDefaults.jsonEncodeFn(values));
		
		var callback = lDefaults.callback;
		if ('callback' in values) callback = values.callback;
		var errorcb = lDefaults.errorcb;
		if ('errorcb' in values) callback = values.errorcb;
	
		for (var key in values)	{
			if (key in {'accesskey':1,'db':1,'bag':1,'fnname':1}) continue;
			values[key] = lDefaults.jsonEncodeFn(values[key]);
		}
	
		values.noCacheIE = (new Date()).getTime();
		values.callback = lDefaults.dovetailHandlerFunctionName;
		values.reqid = lScriptCounter++;
	
		var param_strings = []
		for (var key in values) {
			param_strings.push(key + '=' + encodeURIComponent(values[key]));
		}
		url += param_strings.join('&');
		//console.log(url);
	
		var handlerRecord = {
			callback: callback,
			errorcb: errorcb
		};

	    // Create the script tag
	    var scriptObj = document.createElement("script");
	    // Add script object attributes
	    scriptObj.setAttribute("type", "text/javascript");
	    scriptObj.setAttribute("charset", "utf-8");
	    scriptObj.setAttribute("src", url);
	    scriptObj.setAttribute("reqid", "dovetail_dynscript_"+values.reqid);
	    var dsc = lDefaults.dynamicScriptContainer;
    	dsc.appendChild(scriptObj);
		handlerRecord.headLoc = dsc;
		handlerRecord.scriptObj = scriptObj;

		lCallbacks[values.reqid] = handlerRecord;
		
	}
	return {
		defaults : lDefaults,
		handler : function(message) {
			var txnId = message.id;
			var info = lCallbacks[txnId];
			if ("error" in message) {
				info.errorcb(message.error);
			} else {
				info.callback(message.result);
			}
		    info.headLoc.removeChild(info.scriptObj);
			delete lCallbacks[txnId];
		},
		insert : function(bag, entry, options, callback) {
			// the "options" or "callback" arguments may be omitted:
			if (!callback) { 
				if (typeof options == 'function') {
					callback = options;
					options = {}
				}
			}
			var values = {};
			if (options) { values = lClone(options); }
			values['bag']=bag;
			values['entry']=entry;
			values['callback']=function(id){
				entry.id=id;
				if (callback) callback(id);
			};
			lRequest('insert',values);
		},
		update : function(bag, id, entry, options, callback) {
			// the "options" or "callback" arguments may be omitted:
			if (!callback) { 
				if (typeof options === 'function') {
					callback = options;
					options = {}
				}
			}
			var values = {};
			if (options) { values = lClone(options); }
			values['bag']=bag;
			values['id']=id;
			values['entry']=entry;
			if (callback) values['callback']=callback;
			lRequest('update',values);
		},
		'remove' : function(bag, id, options, callback) {
			// the "options" or "callback" arguments may be omitted:
			if (!callback) { 
				if (typeof options == 'function') {
					callback = options;
					options = {}
				}
			}
			var values = {};
			if (options) { values = lClone(options); }
			values['bag']=bag;
			values['id']=id;
			if (callback) values['callback']=callback;
			lRequest('remove',values);
		},
		query : function(bag, query, options, callback) {
			var values = {};
			// the "options" argument can be omitted:
			if (!callback) { 
				callback = options;
			} else {
				values=lClone(options);
			}
			values['bag']=bag;
			values['query']=query;
			values['callback']=callback;
			lRequest('query',values);
		},
		call : function(fnname, arguments, options, callback) {
			var values = {};
			// the "options" argument can be omitted:
			if (!callback) { 
				callback = options;
			} else {
				values=lClone(options);
			}
			values['function']=fnname;
			values['arguments']=arguments;
			if (callback) values['callback']=callback;
			lRequest('call',values);
		}
	};
}();
