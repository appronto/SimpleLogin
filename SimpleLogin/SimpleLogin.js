dojo.registerModulePath("SimpleLogin", "../../widgets/SimpleLogin");
dojo.require("dijit._Templated");
mendix.widget.declare("SimpleLogin.SimpleLogin", {
    globalLoginRef : null,
	addons         : [dijit._Templated],
    
    templateString : '<div class="mobileLogin"><div class="loginContainer"><div id="errormessages" class="alert alert-danger" style="display: none;">.</div><div id="fulllogin" style="display: none;"><div><label id="usernamelabel">.</label></div><div><input id="username" class="textinput form-control" autocapitalize="off" autocorrect="off" type="text" style="width:100%" /></div><div><label id="passwordlabel" style="display:block;">.</label></div><div><input id="password" class="textinput form-control" autocapitalize="off" autocorrect="off"  type="password" style="width:100%" /></div><div><label id="chooseshortcode" style="display:block;">.</label></div><div class="shortcode" style="width:100%;position:relative;"><div class="position" id="position1">.</div><div class="position" id="position2">.</div><div class="position" id="position3">.</div><div class="position" id="position4">.</div><div class="position" id="position5">.</div><input id="inlog5" type="number" class="shortcodeinput" pattern="[0-9]*" maxlength="5" style="background-color:transparent; border:0px;" onkeyup="dojo.hitch(globalLoginRef, globalLoginRef.submitFullLogin)();" onfocus="this.value = \'\'; dojo.hitch(globalLoginRef, globalLoginRef.inputChecker)(\'\');  this.style.marginLeft=\'-10000px\';" onblur="this.value = \'\';this.style.marginLeft=\'0px\'"/><div style="clear:both;visibility:hidden;height:0px;">.</div></div></div><div id="quicklogin" style="display: none"><label id="givelogincode" style="display:block;">.</label><div><input id="doubletabandroidfixer" tabindex="2" autocapitalize="off" autocorrect="off" type="text" style="position:absolute; margin-left:-10000px;width:100px;" /></div><div class="shortcode" style="width:100%;position:relative;"><div class="position" id="qposition1">.</div><div class="position" id="qposition2">.</div><div class="position" id="qposition3">.</div><div class="position" id="qposition4">.</div><div class="position" id="qposition5">.</div><input id="qinlog5" type="number" tabindex="1" class="shortcodeinput" pattern="[0-9]*" maxlength="5" style="background-color:transparent; border:0px;" onkeyup="dojo.hitch(globalLoginRef, globalLoginRef.submitQuickLogin)();" onfocus="this.value = \'\'; dojo.hitch(globalLoginRef, globalLoginRef.inputChecker)(\'q\');  this.style.marginLeft=\'-10000px\';" onblur="this.value = \'\';this.style.marginLeft=\'0px\'"/><div style="clear:both;visibility:hidden;height:0px;">.</div></div><input type="button" style="display:block; clear:both;" onclick="dojo.hitch(globalLoginRef, globalLoginRef.reset)();" id="rechoose" class="btn btn-primary loginButton" /></div></div></div>',

    inputargs: {
		urlMf		: '',
		homeMf		: '',
		alternativeLoginMf : '',
		usernameLabel : '',
		passwordLabel : '',
		lowerCaseInput : false,
		chooseShortCodeHelpText : '',
		giveLoginCodeText : '',
		rechooseCodeText : '',
		progressBarText : '',
		loginFailed : ''
    },
	
	// references to DOM elements
    guid:null,
	hostname:null,
	isCordova: (typeof cordova !== 'undefined'),
	
    postCreate : function(){
 
		if (!this.isCordova && this.alternativeLoginMf != '') {
			
			// dirty timeout because form have to be loaded... Because onAfterShow event doesn't work	
			setTimeout(
				dojo.hitch(this,
					function() {
						var args = {
							actionname	: this.alternativeLoginMf,
							error		: dojo.hitch(this, this.errorHandler),
							applyto: 'none'
						};
						mx.xas.action(args);
					}
				)
			, 2000);
			
			this.loaded();
			this.actRendered();
        
			return;
		}
		
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
		}
		else {
			// show default login
			dojo.byId("fulllogin").style.display = "block";

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
			
			var username = dojo.byId("username").value.trim();
			
			if(this.lowerCaseInput)
				username = username.toLowerCase();
			
			var password = dojo.byId("password").value;
			var shortcode = dojo.byId("inlog5").value;
			
			

			dojo.rawXhrPost({
				url			: this.hostname+"/registerAppDevice/",
				mimetype	: 'application/json',
				contentType	: 'application/json',
				handleAs	: 'json',
				headers     : {
					'csrfToken' : mx.session.getCSRFToken()
				},
				
				postData	: dojo.toJson({
					
						username	: username,
						password	: password,
						shortcode	: shortcode

				}),
				handle		: dojo.hitch(this, this.succesHandler)
			});
						

		}
	},
	
	 submitQuickLogin : function(){
		if(this.inputChecker("q")){
			this.blocker();
			
			this.removeError();
			var shortcode = dojo.byId("qinlog5").value;
			
			dojo.rawXhrPost({
				url			: this.hostname+"/loginAppDevice/",
				mimetype	: 'application/json',
				contentType	: 'application/json',
				handleAs	: 'json',
				headers     : {
					'csrfToken' : mx.session.getCSRFToken()
				},
				postData	: dojo.toJson({
					
						device		: this.guid,
						shortcode	: shortcode,
						cordova 	: this.isCordova

				}),
				handle		: dojo.hitch(this, this.succesHandlerQuickLogin)
			});
			
			
		}
	},
	callSuccesMf : function  () {
		
		var args = {
			actionname	: this.homeMf,
			error		: dojo.hitch(this, this.errorHandler),
			applyto: 'none'
		};
		mx.xas.action(args);
	},

	 succesHandler : function(response, ioArgs){
		if(ioArgs.xhr.status == 200) {
			 window.localStorage.setItem("devicecode", response.device);
			
			this.callSuccesMf();
			
		}
		else this.errorHandler();
		
	},
	  succesHandlerQuickLogin:  function(response, ioArgs){
		
		if(ioArgs.xhr.status == 200) {
			
			this.callSuccesMf();
			
		}
		else this.errorHandler();
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