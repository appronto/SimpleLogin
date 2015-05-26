dojo.registerModulePath("SimpleLogin", "../../widgets/SimpleLogin");
dojo.require("dijit._Templated");
var globalLoginRef;
mendix.widget.declare("SimpleLogin.SimpleLogin", {
    addons         : [dijit._Templated],
    
    templateString : '<div class="mobileLogin"><div class="loginContainer"><div id="errormessages" style="display: none;"></div><div id="fulllogin" style="display: none;"><label id="usernamelabel" autocapitalize="off" autocorrect="off" style="display:block;"></label><input id="username" type="text" style="width:100%" /><label id="passwordlabel" autocapitalize="off" autocorrect="off" style="display:block;"></label><input id="password" type="password" style="width:100%" /><label id="chooseshortcode" style="display:block;"></label><div class="shortcode"><input id="inlog1" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'inlog2\').focus() };" onfocus="this.value = \'\'" /> 						<input id="inlog2" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'inlog3\').focus() };" onfocus="this.value = \'\'" /> 						<input id="inlog3" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'inlog4\').focus() };" onfocus="this.value = \'\'" /> 						<input id="inlog4" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'inlog5\').focus() };" onfocus="this.value = \'\'" /> 						<input id="inlog5" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.hitch(globalLoginRef, globalLoginRef.submitFullLogin)(); };" onfocus="this.value = \'\'" /></div></div><div id="quicklogin" style="display: none"><label id="givelogincode" style="display:block;"></label><div class="shortcode"><input id="qinlog1" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'qinlog2\').focus() };" onfocus="this.value = \'\'" /> 					<input id="qinlog2" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'qinlog3\').focus() };" onfocus="this.value = \'\'" /> 					<input id="qinlog3" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'qinlog4\').focus() };" onfocus="this.value = \'\'" /> 					<input id="qinlog4" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.byId(\'qinlog5\').focus() };" onfocus="this.value = \'\'" /> 					<input id="qinlog5" type="number" pattern="[0-9]*" maxlength="1" onkeyup="if(this.value.length >= 1) { dojo.hitch(globalLoginRef, globalLoginRef.submitQuickLogin)(); };" onfocus="this.value = \'\'" /> 				</div><input type="button" onclick="dojo.hitch(globalLoginRef, globalLoginRef.reset)();" id="rechoose" class="button" /></div></div></div>',

    inputargs: {
		urlMf		: '',
		usernameLabel : '',
		passwordLabel : '',
		chooseShortCodeHelpText : '',
		giveLoginCodeText : '',
		rechooseCodeText : '',
		progressBarText : '',
		loginFailed : ''
    },
	
	// references to DOM elements
    guid:null,
	hostname:null,
	
    postCreate : function(){
    	globalLoginRef = this;
    	this.indicator = mx.ui.getProgressIndicator("modal", this.ProgressBarText);
    	
    	// set texts
    	dojo.byId("usernamelabel").innerHTML = this.usernameLabel;
    	dojo.byId("passwordlabel").innerHTML = this.passwordLabel;
    	dojo.byId("chooseshortcode").innerHTML = this.chooseShortCodeHelpText;
    	dojo.byId("givelogincode").innerHTML = this.giveLoginCodeText;
    	dojo.byId("rechoose").value = this.rechooseCodeText;
    	
    	var mf = this.urlMf;
		if (mf != '') {
			var args = {
				actionname	: mf,
				callback	: dojo.hitch(this, this.initForm),
				error		: dojo.hitch(this, this.errorHandler),
				applyto: 'none'
			};
			mx.xas.action(args);
		}		
		
        this.loaded();
        this.actRendered();
        
    },
    initForm : function (response){
		this.hostname = response;
		
    	this.guid = window.localStorage.getItem("devicecode");
		
		this.resetFieldValues();
		
		if(this.guid != null){
			// show quick login
			dojo.byId("quicklogin").style.display = "block";
			setTimeout(function() {dojo.byId("qinlog1").focus();}, 50);
		}
		else {
			// show default login
			dojo.byId("fulllogin").style.display = "block";
			setTimeout(function() {dojo.byId("username").focus();}, 50);

		}    
    },
    
    blocker : function(){
		this.indicator.start();
	},
	submitFullLogin : function(){
		this.blocker();
		
		this.removeError();
		
		var username = dojo.byId("username").value;
		var password = dojo.byId("password").value;
		var shortcode = dojo.byId("inlog1").value + dojo.byId("inlog2").value + dojo.byId("inlog3").value + dojo.byId("inlog4").value + dojo.byId("inlog5").value;
						
		var xhrArgs = {
		  url: this.hostname+"/registerAppDevice/",
		  postData: "username=" + username + "&password=" + password + "&shortcode=" + shortcode,
		  handleAs: "text",
		  load: dojo.hitch(this, this.succesHandler),
		  error: dojo.hitch(this, this.errorHandler)
		};
		
		dojo.xhrPost(xhrArgs);
		this.resetFieldValues();
	},
	
	 submitQuickLogin : function(){
		this.blocker();
		
		this.removeError();
		var shortcode = dojo.byId("qinlog1").value + dojo.byId("qinlog2").value + dojo.byId("qinlog3").value + dojo.byId("qinlog4").value + dojo.byId("qinlog5").value;
		
		var xhrArgs = {
		  url: this.hostname+"/loginAppDevice/",
		  postData: "device=" + this.guid + "&shortcode=" + shortcode,
		  handleAs: "text",
		  load: dojo.hitch(this, this.succesHandlerQuickLogin),
		  error: dojo.hitch(this, this.errorHandler)
		};
		
		dojo.xhrPost(xhrArgs);
		this.resetFieldValues();
	},


	 succesHandler : function(response){
		 window.localStorage.setItem("devicecode", response);
		window.location = "index.html?profile=phone";
	},
	  succesHandlerQuickLogin:  function(){
		window.location = "index.html?profile=phone";
	},

	 resetFieldValues : function(){
		dojo.byId("inlog1").value = "";
		dojo.byId("inlog2").value = "";
		dojo.byId("inlog3").value = "";
		dojo.byId("inlog4").value = "";
		dojo.byId("inlog5").value = "";
		dojo.byId("qinlog1").value = "";
		dojo.byId("qinlog2").value = "";
		dojo.byId("qinlog3").value = "";
		dojo.byId("qinlog4").value = "";
		dojo.byId("qinlog5").value = "";
		
	},
	 errorHandler : function(){
		dojo.byId("errormessages").innerHTML = this.loginFailed;
		dojo.byId("errormessages").style.display = "block";
		this.indicator.stop();
	},
	 removeError: function(){
		dojo.byId("errormessages").innerHTML = "";
		dojo.byId("errormessages").style.display = "none";
	},
	 reset : function(){		 
		window.localStorage.removeItem("devicecode");
		window.location = "index.html?profile=phone";
	}
});