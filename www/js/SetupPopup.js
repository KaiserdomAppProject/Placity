var SetupPopup = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(SetupPopup.template());
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", ".popup-close", function(){app.closePopup();});
    };
    
    this.initialize();
}
    
SetupPopup.template = Handlebars.compile($("#setup-tpl").html());