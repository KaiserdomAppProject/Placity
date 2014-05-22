var InfoView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(InfoView.template());
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#help_info", function(){app.openPopup("#help", {page:"info"});}); 
        this.el.on("click", "#start", function(){window.location.hash = "#"});   
    };
    
    this.initialize();
}
    
InfoView.template = Handlebars.compile($("#info-tpl").html());