var StartView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.basePosition = "center";
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(StartView.template());
        this.update();
        return this;
    };
    
    this.update = function() {
        app.dataInterface.getValue("userName", function(value){
            $(".username").html(value);
        });
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#scan", function(){window.location.hash = "#scan"}); 
        this.el.on("click", "#settings", function(){window.location.hash = "#settings"}); 
        this.el.on("click", "#info", function(){window.location.hash = "#info"}); 
        this.el.on("click", "#chg_acc", function(){app.openPopup("#chg_acc");}); 
        this.el.on("click", "#help_start", function(){app.openPopup("#help", {page:"start"});}); 
    };
    
    this.initialize();
}
    
StartView.template = Handlebars.compile($("#start-tpl").html());
