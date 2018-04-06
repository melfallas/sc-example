var username = "testuser5"
var password = "12345"

//START Side Panel script
//$(document).ready(function(){
var chatModule = function(){
	console.log("chatModule");
	initJabberChat();
	
//	$('.username').val(username);
//	$('.password').val(password);

	$('.username').val("testuser5");
	$('.password').val("12345");
	
	console.log($('.username').val());
	console.log($('.password').val());
	
	
}
//});
//END Side Panel script

//Change these values to match the user, domain and BOSH URL for your system
//these values will be used to establish the connection to the server
var demo_config = {
    domain: "datasys.la", //the domain specified for your CUP server
    httpBindingURL: "http://172.31.251.68:7335/httpbinding", //the BOSH url for your server
    unsecureAllowed: true //unsecureAllowed should be true if plaintext authentication is allowed over unencrypted or unsecured HTTP channels

}

//set these config values for connection to your server
jabberwerx._config.unsecureAllowed = demo_config.unsecureAllowed;
jabberwerx._config.httpBindingURL = demo_config.httpBindingURL;

//create an object to hold our tabbed view
sample = {};

//setup up our view
sample.IntroView = jabberwerx.ui.JWView.extend({
    init: function() {
        this._super();
    },
    destroy: function() {
        this._super();
    },

    createDOM: function(doc) {
        var data = $("<div/>", doc).addClass("jabberwerx intro");

        $("<h2/>").appendTo(data).
                text("Bienvenido al chat de Jabber, haz click en un contacto para comenzar a hablar");

        return data;
    },

    setTabControl: function(tab) {
        this._super(tab);

        if (tab) {
            tab.label("Bienvenido");
        }
    }
}, "sample.IntroView");

sample.IntroView.mixin(jabberwerx.ui.Tabbable);

client = null;

//$(document).ready(function(){
function initJabberChat(){

    //*****create controllers and views ***********************************************

    //create new client
    client = new jabberwerx.Client('sampleclient');

    //creates roster controller
    var roster = client.controllers.roster || new jabberwerx.RosterController(client);

    //creates chat controller
    var chat = client.controllers.chat || new jabberwerx.ChatController(client);

    //create authentication view
    var auth = new jabberwerx.ui.AuthenticationView(client, demo_config.domain);
    auth.allowAtSymbol = demo_config.atSymbolAllowed;
    auth.render().appendTo("div.my_auth");


    //create view of your own presence
    var prsView = new jabberwerx.ui.SelfPresenceView(client);

    //set presence choices
    prsView.allowUnavailable = true;
    prsView.setStatusChoices(
            "available",
            prsView.getStatusChoices("available"));

    prsView.setStatusChoices(
            "away",
            prsView.getStatusChoices("away"));

    //append to container div for my presence
    $(prsView.render()["0"].children).addClass("form-control");
    prsView.render().appendTo(".my_presence");
    prsView.update();


    //create roster view
    var rosterView = new jabberwerx.ui.RosterView(client.entitySet,jabberwerx.ui.RosterView.groupmode_expanded );
    rosterView.setDefaultGroupingName("Contactos");
    rosterView.render().prependTo("div.my_roster");
    rosterView.height(160);


    //create tabbed view
    var tabbedView = new jabberwerx.ui.TabbedView();
    tabbedView.render().appendTo("div.my_tabs");
    tabbedView.dimensions({width: 660, height:300});
    tabbedView.addTab("introview", new sample.IntroView());


    //********************bind to events ***********************************************


    /*Triggered when a client's status changes. The status codes are one of:
     status_disconnected
     status_connecting
     status_connected
     status_disconnecting
     take actions to hide/show appropriate controls when client is connected or disconnected*/
    client.event("clientStatusChanged").bind(function(evt) {
        if (evt.data.next == jabberwerx.Client.status_connected) {
            auth.hide();
            $(".my_client").show();
            tabbedView.show();

            prsView.update();
            rosterView.update();
            tabbedView.update();
        } else if (evt.data.next == jabberwerx.Client.status_disconnected) {
            jQuery.each(tabbedView.getAllTabs(), function() {
                if (this.id != "introview") {
                    this.destroy();
                } else {
                    this.activate();
                }
            });
            tabbedView.hide();
            auth.show();
            $(".my_client").hide();
        }
    });

    //Triggered when an item  in the roster is selected.
    //opens session with selected contact, the chatSessionOpened handler creates a new tab if no tab is open for the contact
    rosterView.event("rosterItemSelected").bind(function(evt) {
        var item = evt.data.item;
        var entity = item.entity;
        if (entity instanceof jabberwerx.Contact) {
            var id = "chat11:" + entity.jid.getBareJIDString();
            //jabberwerx.ChatController.openSession opens a new session or returns existing session for the passed contact
            var session = chat.openSession(entity.jid);
            var tab = tabbedView.getTab(id);

            if (tab) {
                tab.activate();
            }
        }
        else {
            alert("selected via " + evt.data.type + ": " + evt.data.item.entity);
            return;
        }

    });

    //chatSessionOpened is triggered whenever a chat session is opened
    //check to see if tab for that user already exists, if not add a tab
    chat.event("chatSessionOpened").bind(function(evt) {
        var session = evt.data.chatSession;
        var id = "chat11:" + session.jid;
        var tab = tabbedView.getTab(id);
        if (!tab) {
            tab = tabbedView.addTab(id, new jabberwerx.ui.ChatView(session));
        }
    });


    //bind to event that is triggered when a tab is activated
    //set up the remove contact button to remove the currently selected contact
    tabbedView.event("tabActivated").bind(function(evt) {
        var id = evt.data.id;
        $("input.remove_contact_btn").
                unbind("click").
                attr("disabled", "true").
                val("Remove Contact");


        var session = evt.data.content.session;
        if (session) {
            if (session.getEntity() instanceof jabberwerx.Contact) {
                //activate the remove contact button, add username (remove everything after the @ in the displayname)
                $("input.remove_contact_btn").
                        removeAttr("disabled").
                        val("Remove " + session.getEntity().getDisplayName().split('@')[0]).
                        unbind("click").
                        click(function() {
                            //remove the contact
                            session.getEntity().remove();
                            chat.closeSession(session.jid);
                            $("input.remove_contact_btn").
                                    unbind("click").
                                    attr("disabled", "true").
                                    val("Remove Contact");
                            tabbedView.removeTab(id);
                        });

            }
        }
    });


    //******************define click handler for add contact button *********************************

    //when add input button is clicked add contact to roster
    $("input.add_contact_btn").click(function() {
        var contact = prompt("Enter new contact jid: ", "");
        if (contact) {
            var entity = client.entitySet.entity(contact);

            try {
                roster.addContact(contact);
            } catch(e) {
                alert("A problem occurred while trying to add the contact " + contact +
                        ".\n Details: " + e.message);
            }
        }
    });


    //hide the chat window initially
    $("div.my_client").hide();
}

$( document ).ready(function() {
	console.log("ready")
	chatModule();
});

$(document).ready(function(){
	//open the lateral panel
	
	
	//close the lateral panel
	/*$('.cd-close-btn').click( function(event){
		if( $(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close') ) { 
			$('.cd-panel').removeClass('is-visible');
			event.preventDefault();
		}
		return false;
	});*/
});
//});

//var timerGetMessage = setInterval(getMessage, 300000);
