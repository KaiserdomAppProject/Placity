var ImpressumPopup = function(data) {
    
    this.initialize = function(data) {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
        this.data = data;
    };
    
    this.render = function() {
        this.el.html(ImpressumPopup.template(this.data));
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", ".popup-close", function(){app.closePopup();});
    };
    
    this.initialize(data);
}
    
ImpressumPopup.template = Handlebars.compile($("#impressum-tpl").html());