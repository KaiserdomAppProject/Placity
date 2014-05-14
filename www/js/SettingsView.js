var SettingsView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
    };
    
    this.onLeave = function() {
        app.dataInterface.setValue("mobileVideo", $("#mobileVideo").is(":checked"));  
    };
    
    this.render = function() {
        this.el.html(SettingsView.template());
        this.el.find("#mobileVideo").attr("checked", app.dataInterface.getSyncValue("mobileVideo") == "true");
        this.renderList();
        return this;
    };
    
    this.renderList = function() {
        var self = this;
        $("#settings_gamelist").html("");
        app.dataInterface.getGamelist(function(games){
            if (games.length == 0) {
                $("#settings_gamelist").html("Keine Spiele installiert!");
            } else {
                for (i=0;i<games.length;i++){
                    $("#settings_gamelist").append(SettingsView.litemplate(games[i]));
                }
            }
            self.setScroll();
        }); 
    };
    
    this.setScroll = function() {
        var self = this;
        if (self.myscroll) {
            setTimeout(function(){self.myscroll.refresh();}, 0);
        } else {
            setTimeout(function(){self.myscroll = new IScroll($('#settingsframe', self.el)[0], {
                useTransform: true,
                zoom: false,
                onBeforeScrollStart: function (e) {
                var target = e.target;
                while (target.nodeType != 1) target = target.parentNode;
                
                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
                }
            });}, 0);
        }  
    };
    this.registerEvents = function() {
        this.el.on("click", "#help_settings", function(){app.openPopup("#help", {page:"settings"});}); 
        this.el.on("click", "#start", function(){window.location.hash = "#"});  
        //this.el.on("click", "#setName", function(){app.dataInterface.setValue("username", $("#usernameIn").val(), function() {app.showAlert("Username geändert!")})});  
        
        this.el.on("click", "#dropAll", function(){app.showDialog("Alle Spiele werden gelöscht! Dieser Schritt ist irreversibel!", function(code){if (code != 1) {app.dataInterface.dropTables(function() {app.showAlert("Games gelöscht!", "Fertig!")});app.dataInterface.createTables();}}, "Sicher?", ["Abbrechen", "Löschen"])}); 
    };
    
    this.initialize();
}
    
SettingsView.template = Handlebars.compile($("#settings-tpl").html());
SettingsView.litemplate = Handlebars.compile($("#settings-li-tpl").html());