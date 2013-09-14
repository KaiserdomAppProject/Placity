var HelpPopup = function(data) {
    
    this.initialize = function(data) {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
        this.data = data;
    };
    
    this.render = function() {
        var input = HelpPopup.helptxts[this.data.page];
        this.el.html(HelpPopup.template(input));
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", ".popup-close", function(){app.closePopup();});
    };
    
    this.initialize(data);
}
    
HelpPopup.template = Handlebars.compile($("#help-tpl").html());
HelpPopup.helptxts = {
    start:{txt:"Du befindest dich jetzt im Hauptmenü. \n Hier hast du die Möglichkeiten, ein Spiel zu beginnen („Start“), \n Einstellungen zu verändern („Optionen“) oder dich über das Projekt selbst zu informieren („Info“)."},
    settings:{txt:"Du befindest dich bei den Optionen. \n Unter Speicherplatz kannst du den Speicher löschen, um Platz für neue Spiele zu schaffen. \n Unter „Netzwerk“ kannst du auswählen, ob Videos während dem Spiel heruntergeladen werden dürfen (Achtung: ggf. große Datenmengen). Über den „Start“-Button kommst du zum Hauptmenü zurück."},
    info:{txt:"Du befindest dich bei den Infos über das Projekt. Hier siehst du alle Teammitglieder und Projektpartner. Über den „Start“-Button kommst du zum Hauptmenü zurück."}
};