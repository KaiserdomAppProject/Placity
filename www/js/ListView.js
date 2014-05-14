var ListView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.basePosition = "right";
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(ListView.template());
        this.renderList();
        return this;
    };
    
    this.setScroll = function() {
        if (this.myscroll) {
            alert("refresh");
            setTimeout(function(){this.myscroll.refresh();}, 0);
        } else {
            setTimeout(function(){this.myscroll = new IScroll($('.SCROLL_FRAME', this.el)[0]);}, 0);
        }  
    };
    
    this.renderList = function() {
        var self = this;
        app.dataInterface.getGamelist(function(games){
            for (i=0;i<games.length;i++){
                $("#gamelist").append(ListView.litemplate(games[i]));   
            }
            
            if (games.length == 0) $(".SCROLL_FRAME").html("<p class='list-nogame'><h1>Keine Spiele heruntergeladen!</h1><br><button class='button rect' id='demo'>Demo Spiel</button></p>");
            self.setScroll();
        }); 
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#scan-btn", function(){window.location.hash = "#scan"});
        this.el.on("click", "#demo", function(){if (app.network != "none") {app.openPopup("#download", {id:132});
                                                                                       } else {
                                                                                            app.showAlert("Keine Internetverbindung verfügbar!", "FEHLER");   
                                                                                       }
                                                           });
    };
    
    this.initialize();
}
    
ListView.template = Handlebars.compile($("#list-tpl").html());
ListView.litemplate = Handlebars.compile($("#list-li-tpl").html());
