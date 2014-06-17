var app = {
    
    initialize: function () {
        var self = this;
        this.registerEvents();
        this.checkNetworkConnection();
        this.history = [];        
        this.currentPage = {};
        new FastClick(document.body);
        this.dataInterface = new MemoryStore(function() {
            app.show(new StartView().render());
            if (self.dataInterface.firstStart()) {
                app.openPopup("#start_setup");  
            };
        }); 
        
        Handlebars.registerHelper('breaklines', function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.toString();
            text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
            return new Handlebars.SafeString(text);
           });
        
        Handlebars.registerHelper('typeof', function(input) {
            return (/^\d+$/.test(input)) ? "number" : "text";
           });
        
        Handlebars.registerHelper('insert_img', function(src, id) {
            var tmp = new Image();
            var win = ($(window).width()<640)?$(window):$(".SCROLL_FRAME");
            tmp.onload = function(){
                var ratio = Math.min(0.9*win.width() / tmp.width, 0.4*win.height() / tmp.height);
                tmp.height = tmp.height*ratio;
                tmp.width = tmp.width*ratio;
                $("#"+id).find(".image_ph").append(tmp);
            };
            tmp.src=src;
           });
        
        Handlebars.registerHelper('check', function(txt) {
            if (txt.toLowerCase() == "text angeben") {
                return new Handlebars.SafeString("");
            } else {
                var ntxt;
                var dateobj = new Date();
                var time = dateobj.toLocaleTimeString("de-DE", {hour:"2-digit",minute:"2-digit"});
                var date = dateobj.toLocaleDateString("de-DE");
                var day = dateobj.toLocaleDateString("de-DE", {weekday: "long"});
                var month = dateobj.toLocaleDateString("de-DE", {month: "long"});
                ntxt = txt.replace(/#qe\(0\)(?!#[1-9])/g, "&");
                ntxt = ntxt.replace(/#qe\(0\)#39;/g, "'");
                ntxt = ntxt.replace(/#qe\(1\)/g, "+");
                ntxt = ntxt.replace(/\!\!Uhrzeit/g, time);
                ntxt = ntxt.replace(/\!\!Datum/g, date);
                ntxt = ntxt.replace(/\!\!Tag/g, day);
                ntxt = ntxt.replace(/\!\!Monat/g, month);
                ntxt = ntxt.replace(/\!\!Seite/g, (app.currentPage.state+1));
                ntxt = ntxt.replace(/\!\!Punkte/g, app.currentPage.points);
                ntxt = ntxt.replace(/\!\!Name/g, app.dataInterface.getSyncValue("userName"));
                return new Handlebars.SafeString(ntxt);
            };
           });
    },
    
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    },
    
    showDialog: function (message, confirmCallback, title, labels) {
        if (navigator.notification) {
            navigator.notification.confirm(message, confirmCallback, title, labels);
        } else {
            if (window.confirm(title + ": " + message)) {
                confirmCallback(2);                   
            } else {
                confirmCallback(1);
            }
        }
    },
    
    checkNetworkConnection: function() {
        if (navigator.connection) {
            this.network = navigator.connection.type;   
        } else {
            this.network = "ethernet";
        }
    },
    
    registerEvents: function() {        
        $(window).on("hashchange", $.proxy(this.route, this));
        
        $(document).on("online", $.proxy(this.checkNetworkConnection, this));
        $(document).on("offline", $.proxy(this.checkNetworkConnection, this));
        
        if (document.documentElement.hasOwnProperty('ontouchstart')) {
        // ... if yes: register touch event listener to change the "selected" state of the item
        $('body').on('touchstart', '.button', function(event) {
            $(event.target).addClass('tappable-active');
        });
        $('body').on('touchend', '.button', function(event) {
            $(event.target).removeClass('tappable-active');
        });
        } else {
        // ... if not: register mouse events instead
        $('body').on('mousedown', 'button, .button', function(event) {
            $(event.target).addClass('tappable-active');
        });
        $('body').on('mouseup', 'button, .button', function(event) {
            $(event.target).removeClass('tappable-active');
        });
    }
    },
    
    route: function() {
        var hash = window.location.hash;
        
        if (this.currentPage.onLeave) this.currentPage.onLeave();
        
        switch (hash) {
            case "#info":
                this.slide(new InfoView().render());
                break;
        
            case "#settings":
                this.slide(new SettingsView().render());
                break;
            
            case "#scan":
                this.slide(new ScanView().render());
                break;
                
            case "#radar":
                this.slide(new RadarView().render());
                break;
            
            case "#list":
                this.slide(new ListView().render());
                break;
            
            case "#map":
                this.slide(new MapView().render());
                break;
                
            case "#menu":
                this.slideFrom(new MenuView().render(), "left");
                break;
                
            default:
                var match = hash.match(/^#ingame(\d{1,})/);
                if (match) {
                    this.slide(new IngameView(Number(match[1])).render());
                } else {
                    this.slide(new StartView().render());
                }
                break;
        }
        return;
    },
    
    openPopup: function(hash, data) {
        //app.showAlert("App Popup: "+hash);
        switch (hash) {
            case "#chg_acc":
                this.insert(new AccountPopup().render());
                break;
                
            case "#start_setup":
                this.insert(new SetupPopup().render());
                break;
                
            case "#download":
                this.insert(new DownloadPopup(data).render());
                break;
                
            case "#help":
                this.insert(new HelpPopup(data).render());
                break;
                
                case "#impressum":
                this.insert(new ImpressumPopup(data).render());
                break;
        }
    },
    
    closePopup: function() {
        $(".popup").remove();
        if (this.currentPage.update) this.currentPage.update();
    },
    
    insert: function(page) {
        $(page.el).attr("class", "popup start");
        $(".page").append(page.el);
        
        setTimeout(function() {
            $(page.el).attr("class", "popup transition end");   
        });
    },
    
    show: function(page) {
        $(page.el).attr("class", "page center");
        $("body").html(page.el);
        this.history.push(window.location.hash);
        this.currentPage = page;
    },
    
    slide: function(page) {
        var state = window.location.hash;
        if (state === this.history[this.history.length-2]) {
            this.history.pop();
            this.slideFrom(page, "left");   
        } else {
            this.history.push(state);
            this.slideFrom(page, "right");   
        }
    },
    
    slideFrom: function(page, from) {        
        var self = this;
        
        $(page.el).attr("class", "page " + from);
        $("body").append(page.el);
        
        $(this.currentPage.el).one("webkitTransitionEnd", function(e) {
            $(e.target).remove();
            if (app.currentPage.setScroll) app.currentPage.setScroll();
        });
        
        $(page.el).offset().left; //No meaning, just any value-request to force reflow
        
        setTimeout( function() {
            $(self.currentPage.el).attr("class", "page transition " + (from === "left" ? "right" : "left"));
            $(page.el).attr("class", "page transition center");
            app.currentPage = page;
        });
    },
        
};

if (window.isPhoneGap) {
    document.addEventListener("deviceready", function() {window.location.hash = "#";app.initialize();}, false);
} else {
    window.location.hash = "#";
    app.initialize();
}
