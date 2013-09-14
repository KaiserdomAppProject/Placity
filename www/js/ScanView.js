var ScanView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.basePosition = "center";
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(ScanView.template());
        if (app.network == "none") {
            this.el.find(".STATUS_BAR").html("Keine Internetverbindung!");
            this.el.find(".STATUS_BAR").addClass("ALERT");
            this.el.find(".STATUS_BAR").show();
        } else if (app.network != "wifi" && app.network != "ethernet") {
            this.el.find(".STATUS_BAR").html("Mobile Datenverbindung!");
            this.el.find(".STATUS_BAR").addClass("WARNING");
            this.el.find(".STATUS_BAR").show();
        }
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#start", function(){window.location.hash = "#"});
        this.el.on("click", "#list", function(){window.location.hash = "#list"});
        
        if (navigator.notification) {
            this.el.on("click", "#game_request", function(){
                var scanner = cordova.require("cordova/plugin/BarcodeScanner");
                scanner.scan(
                    function (result) {
                        if (result.text.lastIndexOf("?") != -1 && result.text.indexOf("www.kaiserdom-app.de/startgame") != -1) {
                            if (app.network == "none") {
                                app.showAlert("Keine Internetverbindung verfügbar!", "FEHLER");   
                            } else {
                                var id = result.text.slice(result.text.lastIndexOf("?")+1);
                                //app.showAlert("Checkpoint 1: "+result.text);
                                app.openPopup("#download", {id:id});
                            }
                        } else {
                            app.showAlert("Kein Placity-Code!","ERROR");       
                        }
                    }, 
                    function (error) {
                        app.showAlert("Scanning failed: " + error, "ERROR");
                    }
                );
            });
        } else {
            this.el.on("click", "#game_request", function(){if (app.network != "none") {app.openPopup("#download", {id:11});
                                                                                       } else {
                                                                                            app.showAlert("Keine Internetverbindung verfügbar!", "FEHLER");   
                                                                                       }
                                                           });   
        }
    };
    
    this.initialize();
}

ScanView.template = Handlebars.compile($("#scan-tpl").html());
/*if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    app.showAlert(message);
};
console.error = console.debug = console.info =  console.log; */ 