var MenuView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.basePosition = "left";
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(MenuView.template());
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#menu_close", function(){history.back()});     
    };
    
    this.initialize();
}
    
MenuView.template = Handlebars.compile($("#menu-tpl").html());
