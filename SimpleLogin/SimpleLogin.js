dojo.registerModulePath("SimpleLogin", "../../widgets/SimpleLogin");
dojo.require("dijit._Templated");
var globalLoginRef;
mendix.widget.declare("SimpleLogin.SimpleLogin", {
    addons         : [dijit._Templated],
    
    templateString : '<div class="mobileLogin"><div class="loginContainer"><div id="errormessages" class="alert alert-danger" style="display: none;">.</div><div id="fulllogin" style="display: none;"><label id="usernamelabel" style="display:block;">.</label><input id="username" class="textinput form-control" autocapitalize="off" autocorrect="off" type="text" style="width:100%" /><label id="passwordlabel" style="display:block;">.</label><input id="password" class="textinput form-control" autocapitalize="off" autocorrect="off"  type="password" style="width:100%" /><label id="chooseshortcode" style="display:block;">.</label><div class="shortcode" style="width:100%;position:relative;"><div class="position" id="position1">.</div><div class="position" id="position2">.</div><div class="position" id="position3">.</div><div class="position" id="position4">.</div><div class="position" id="position5">.</div><input id="inlog5" type="number" class="shortcodeinput" pattern="[0-9]*" maxlength="5" style="background-color:transparent; border:0px;" onkeyup="dojo.hitch(globalLoginRef, globalLoginRef.submitFullLogin)();" onfocus="this.value = \'\'; dojo.hitch(globalLoginRef, globalLoginRef.inputChecker)(\'\');  this.style.marginLeft=\'-10000px\';" onblur="this.value = \'\';this.style.marginLeft=\'0px\'"/><div style="clear:both;visibility:hidden;height:0px;">.</div></div></div><div id="quicklogin" style="display: none"><label id="givelogincode" style="display:block;">.</label><div class="shortcode" style="width:100%;position:relative;"><div class="position" id="qposition1">.</div><div class="position" id="qposition2">.</div><div class="position" id="qposition3">.</div><div class="position" id="qposition4">.</div><div class="position" id="qposition5">.</div><input id="qinlog5" type="number" class="shortcodeinput" pattern="[0-9]*" maxlength="5" style="background-color:transparent; border:0px;" onkeyup="dojo.hitch(globalLoginRef, globalLoginRef.submitQuickLogin)();" onfocus="this.value = \'\'; dojo.hitch(globalLoginRef, globalLoginRef.inputChecker)(\'q\');  this.style.marginLeft=\'-10000px\';" onblur="this.value = \'\';this.style.marginLeft=\'0px\'"/><div style="clear:both;visibility:hidden;height:0px;">.</div></div><input type="button" style="display:block; clear:both;" onclick="dojo.hitch(globalLoginRef, globalLoginRef.reset)();" id="rechoose" class="btn btn-primary loginButton" /></div></div></div>',

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
		
		if(this.guid != null){
			// show quick login
			dojo.byId("quicklogin").style.display = "block";
			setTimeout(function() {dojo.byId("qinlog5").focus();}, 50);
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
	inputChecker: function(q){
		if(typeof q == 'undefined'){
			q= "";
		}
		var shortcode = dojo.byId(q + "inlog5").value;
		var position = shortcode.length + 1;
		
		for(var i=1;i<=5; i++){
			var el = dojo.byId(q + "position" + i);
			if(position==i){
				dojo.removeClass(el, "positionfilled");
				dojo.addClass(el, "positionselected");
			}
			else if(position < i){
				dojo.removeClass(el,"positionfilled");
				dojo.removeClass(el,"positionselected");
			}
			else {
				dojo.addClass(el,"positionfilled");
				dojo.addClass(el, "positionselected");
			}
			
		}
		return position==6;
	},
	
	submitFullLogin : function(){
		if(this.inputChecker("")){
			this.blocker();
			
			this.removeError();
			
			var username = dojo.byId("username").value;
			var password = dojo.byId("password").value;
			var shortcode = dojo.byId("inlog5").value;
							
			var xhrArgs = {
			  url: this.hostname+"/registerAppDevice/",
			  postData: "username=" + username + "&password=" + password + "&shortcode=" + shortcode,
			  handleAs: "text",
			  load: dojo.hitch(this, this.succesHandler),
			  error: dojo.hitch(this, this.errorHandler)
			};
			
			dojo.xhrPost(xhrArgs);
		}
	},
	
	 submitQuickLogin : function(){
		if(this.inputChecker("q")){
			this.blocker();
			
			this.removeError();
			var shortcode = dojo.byId("qinlog5").value;
			
			var xhrArgs = {
			  url: this.hostname+"/loginAppDevice/",
			  postData: "device=" + this.guid + "&shortcode=" + shortcode,
			  handleAs: "text",
			  load: dojo.hitch(this, this.succesHandlerQuickLogin),
			  error: dojo.hitch(this, this.errorHandler)
			};
			
			dojo.xhrPost(xhrArgs);
		}
	},


	 succesHandler : function(response){
		 window.localStorage.setItem("devicecode", response);
		window.location = "index.html?profile=phone";
	},
	  succesHandlerQuickLogin:  function(){
		window.location = "index.html?profile=phone";
	},

	 resetFieldValues : function(){
		dojo.byId("inlog5").value = "";
		dojo.byId("qinlog5").value = "";
		this.inputChecker();
		
	},
	 errorHandler : function(){
		dojo.byId("errormessages").innerHTML = this.loginFailed;
		dojo.byId("errormessages").style.display = "block";
		
		this.resetFieldValues();
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